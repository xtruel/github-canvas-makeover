#!/usr/bin/env npx ts-node
/**
 * Match update script for fetching and updating Roma matches
 * Supports both daily and live update modes
 */

import * as dotenv from 'dotenv';
import { getApiFootball } from '../src/lib/apiFootball';
import { normalizeFixtures, extractUniqueTeams, extractUniqueCompetitions } from '../src/lib/matches/normalize';
import { createMatchDataUpsert } from '../src/lib/matches/upsert';

// Load environment variables
dotenv.config();

interface ScriptConfig {
  romaTeamId: number;
  season: number;
  apiFootballKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  maxRetries: number;
  requestTimeout: number;
}

type UpdateMode = 'daily' | 'live';

async function loadConfig(): Promise<ScriptConfig> {
  const config: ScriptConfig = {
    romaTeamId: parseInt(process.env.ROMA_TEAM_ID || '497'),
    season: parseInt(process.env.SEASON || new Date().getFullYear().toString()),
    apiFootballKey: process.env.API_FOOTBALL_KEY!,
    supabaseUrl: process.env.VITE_SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'),
  };

  // Validate required config
  const requiredFields = ['apiFootballKey', 'supabaseUrl', 'supabaseServiceKey'];
  const missing = requiredFields.filter(field => !config[field as keyof ScriptConfig]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return config;
}

async function determineUpdateMode(): Promise<UpdateMode> {
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--live')) {
    return 'live';
  }
  if (args.includes('--daily')) {
    return 'daily';
  }

  // Determine mode based on current time (UTC)
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  // Live mode: 12:00-22:00 UTC (usually match hours)
  // Daily mode: other times
  if (currentHour >= 12 && currentHour <= 22) {
    return 'live';
  } else {
    return 'daily';
  }
}

async function runDailyUpdate(config: ScriptConfig): Promise<void> {
  console.log('🔄 Running daily update...');
  
  const apiFootball = getApiFootball();
  const upsert = createMatchDataUpsert();

  try {
    // Fetch all Roma fixtures for the season
    console.log(`📅 Fetching Roma fixtures for season ${config.season}...`);
    const fixtures = await apiFootball.getTeamFixtures(config.romaTeamId, config.season);
    
    console.log(`📊 Found ${fixtures.length} fixtures`);

    if (fixtures.length === 0) {
      console.log('ℹ️  No fixtures found, exiting');
      return;
    }

    // Normalize fixtures
    const normalizedMatches = normalizeFixtures(fixtures);
    const uniqueTeams = extractUniqueTeams(normalizedMatches);
    const uniqueCompetitions = extractUniqueCompetitions(normalizedMatches);

    console.log(`🏟️  Processing ${uniqueTeams.length} teams, ${uniqueCompetitions.length} competitions, ${normalizedMatches.length} matches`);

    // Upsert teams
    console.log('👥 Upserting teams...');
    const teamsResult = await upsert.upsertTeams(uniqueTeams);
    if (!teamsResult.success) {
      throw new Error(`Failed to upsert teams: ${teamsResult.error}`);
    }
    console.log(`✅ Teams: ${teamsResult.insertedCount} inserted, ${teamsResult.updatedCount} updated`);

    // Upsert competitions
    console.log('🏆 Upserting competitions...');
    const competitionsResult = await upsert.upsertCompetitions(uniqueCompetitions);
    if (!competitionsResult.success) {
      throw new Error(`Failed to upsert competitions: ${competitionsResult.error}`);
    }
    console.log(`✅ Competitions: ${competitionsResult.insertedCount} inserted, ${competitionsResult.updatedCount} updated`);

    // Upsert matches
    console.log('⚽ Upserting matches...');
    const matchesResult = await upsert.upsertMatches(normalizedMatches, 'daily');
    if (!matchesResult.success) {
      throw new Error(`Failed to upsert matches: ${matchesResult.error}`);
    }
    console.log(`✅ Matches: ${matchesResult.insertedCount} inserted, ${matchesResult.updatedCount} updated`);

    console.log('🎉 Daily update completed successfully!');
  } catch (error) {
    console.error('❌ Daily update failed:', error);
    throw error;
  }
}

async function runLiveUpdate(config: ScriptConfig): Promise<void> {
  console.log('⚡ Running live update...');
  
  const apiFootball = getApiFootball();
  const upsert = createMatchDataUpsert();

  try {
    // Fetch live fixtures for Roma
    console.log('🔴 Fetching live Roma fixtures...');
    const liveFixtures = await apiFootball.getLiveFixtures(config.romaTeamId);
    
    console.log(`📊 Found ${liveFixtures.length} live fixtures`);

    if (liveFixtures.length === 0) {
      console.log('ℹ️  No live fixtures found');
      
      // Also check for fixtures in the next few hours
      const now = new Date();
      const inThreeHours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      
      const from = now.toISOString().split('T')[0];
      const to = inThreeHours.toISOString().split('T')[0];
      
      console.log(`📅 Checking for upcoming fixtures between ${from} and ${to}...`);
      const upcomingFixtures = await apiFootball.getFixturesByDateRange(from, to, config.romaTeamId);
      
      if (upcomingFixtures.length > 0) {
        console.log(`📊 Found ${upcomingFixtures.length} upcoming fixtures`);
        const normalizedMatches = normalizeFixtures(upcomingFixtures);
        
        const matchesResult = await upsert.upsertMatches(normalizedMatches, 'live');
        if (!matchesResult.success) {
          throw new Error(`Failed to upsert upcoming matches: ${matchesResult.error}`);
        }
        console.log(`✅ Upcoming matches: ${matchesResult.insertedCount} inserted, ${matchesResult.updatedCount} updated`);
      } else {
        console.log('ℹ️  No upcoming fixtures in the next 3 hours');
      }
      
      return;
    }

    // Process live fixtures
    const normalizedMatches = normalizeFixtures(liveFixtures);
    
    // We only need to upsert matches for live updates (teams and competitions should already exist)
    const matchesResult = await upsert.upsertMatches(normalizedMatches, 'live');
    if (!matchesResult.success) {
      throw new Error(`Failed to upsert live matches: ${matchesResult.error}`);
    }
    console.log(`✅ Live matches: ${matchesResult.insertedCount} inserted, ${matchesResult.updatedCount} updated`);

    console.log('🎉 Live update completed successfully!');
  } catch (error) {
    console.error('❌ Live update failed:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Roma matches update script...');
  
  try {
    // Load configuration
    const config = await loadConfig();
    console.log(`⚙️  Configuration loaded for team ID ${config.romaTeamId}, season ${config.season}`);

    // Determine update mode
    const mode = await determineUpdateMode();
    console.log(`📋 Update mode: ${mode}`);

    // Run appropriate update
    if (mode === 'daily') {
      await runDailyUpdate(config);
    } else {
      await runLiveUpdate(config);
    }

    console.log('✨ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}
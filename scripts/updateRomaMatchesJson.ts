/**
 * Update roma-matches.json with latest fixture data from API-Football
 * 
 * This script:
 * 1. Fetches current Roma fixtures from API-Football
 * 2. Loads existing JSON file
 * 3. Compares content using hash
 * 4. Updates file only if content has changed
 * 
 * Environment variables:
 * - API_FOOTBALL_KEY: Required API key from api-football.com
 * - ROMA_TEAM_ID: Team ID (default: 497)
 * - SEASON: Season year (default: current year)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fetchRomaMatches, type RomaMatchesData } from './fetchRomaMatches.js';

const DATA_FILE_PATH = path.resolve(process.cwd(), 'data/roma-matches.json');

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function loadExistingData(): RomaMatchesData | null {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return null;
    }
    const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load existing data:', error);
    return null;
  }
}

function saveData(data: RomaMatchesData): void {
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(DATA_FILE_PATH, content, 'utf-8');
}

async function main() {
  try {
    console.log('🏟️  Fetching Roma matches from API-Football...');
    
    // Check if API key is available
    if (!process.env.API_FOOTBALL_KEY) {
      console.log('⚠️  API_FOOTBALL_KEY not found. Skipping update.');
      console.log('📝 To enable automatic updates, set the API_FOOTBALL_KEY secret in your repository settings.');
      process.exit(0);
    }

    // Fetch new data
    const newData = await fetchRomaMatches();
    console.log(`✅ Fetched ${newData.fixtures.length} fixtures for season ${newData.season}`);

    // Load existing data
    const existingData = loadExistingData();
    
    // Compare content using hash
    const newContent = JSON.stringify(newData, null, 2);
    const existingContent = existingData ? JSON.stringify(existingData, null, 2) : '';
    
    const newHash = hashContent(newContent);
    const existingHash = hashContent(existingContent);

    if (newHash === existingHash) {
      console.log('📊 No changes detected. File already up to date.');
      return;
    }

    // Save updated data
    saveData(newData);
    console.log('💾 Updated roma-matches.json with latest fixture data');
    console.log(`🔄 Last updated: ${newData.lastUpdated}`);
    
    // Set output for GitHub Actions
    if (process.env.GITHUB_ACTIONS) {
      console.log('::set-output name=updated::true');
    }

  } catch (error) {
    console.error('❌ Error updating Roma matches:', error);
    
    // In GitHub Actions, we want to fail the workflow on errors
    if (process.env.GITHUB_ACTIONS) {
      process.exit(1);
    }
  }
}

// Run the script
main().catch(console.error);
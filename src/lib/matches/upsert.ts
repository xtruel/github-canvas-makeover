/**
 * Database upsert operations for teams, competitions, and matches
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  NormalizedMatch, 
  NormalizedTeam, 
  NormalizedCompetition 
} from './normalize';

export interface UpsertResult {
  success: boolean;
  error?: string;
  updatedCount: number;
  insertedCount: number;
}

export interface MatchUpdateLog {
  match_id: number;
  update_type: 'daily' | 'live' | 'manual';
  previous_status?: string;
  new_status: string;
  previous_home_score?: number;
  new_home_score?: number;
  previous_away_score?: number;
  new_away_score?: number;
  api_response_data?: unknown;
  error_message?: string;
}

class MatchDataUpsert {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Upsert teams data
   */
  async upsertTeams(teams: NormalizedTeam[]): Promise<UpsertResult> {
    try {
      let insertedCount = 0;
      let updatedCount = 0;

      for (const team of teams) {
        const { data: existingTeam, error: fetchError } = await this.supabase
          .from('teams')
          .select('id, name, logo_url')
          .eq('api_football_id', team.api_football_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw fetchError;
        }

        if (existingTeam) {
          // Update existing team if data has changed
          const hasChanges = 
            existingTeam.name !== team.name ||
            existingTeam.logo_url !== team.logo_url;

          if (hasChanges) {
            const { error: updateError } = await this.supabase
              .from('teams')
              .update({
                name: team.name,
                logo_url: team.logo_url,
                country: team.country,
                founded: team.founded,
                venue_name: team.venue_name,
                venue_city: team.venue_city,
              })
              .eq('api_football_id', team.api_football_id);

            if (updateError) throw updateError;
            updatedCount++;
          }
        } else {
          // Insert new team
          const { error: insertError } = await this.supabase
            .from('teams')
            .insert({
              api_football_id: team.api_football_id,
              name: team.name,
              logo_url: team.logo_url,
              country: team.country,
              founded: team.founded,
              venue_name: team.venue_name,
              venue_city: team.venue_city,
            });

          if (insertError) throw insertError;
          insertedCount++;
        }
      }

      return { success: true, updatedCount, insertedCount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedCount: 0,
        insertedCount: 0
      };
    }
  }

  /**
   * Upsert competitions data
   */
  async upsertCompetitions(competitions: NormalizedCompetition[]): Promise<UpsertResult> {
    try {
      let insertedCount = 0;
      let updatedCount = 0;

      for (const competition of competitions) {
        const { data: existingComp, error: fetchError } = await this.supabase
          .from('competitions')
          .select('id, name, logo_url, season')
          .eq('api_football_id', competition.api_football_id)
          .eq('season', competition.season)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingComp) {
          // Update existing competition if data has changed
          const hasChanges = 
            existingComp.name !== competition.name ||
            existingComp.logo_url !== competition.logo_url;

          if (hasChanges) {
            const { error: updateError } = await this.supabase
              .from('competitions')
              .update({
                name: competition.name,
                country: competition.country,
                logo_url: competition.logo_url,
                type: competition.type,
              })
              .eq('api_football_id', competition.api_football_id)
              .eq('season', competition.season);

            if (updateError) throw updateError;
            updatedCount++;
          }
        } else {
          // Insert new competition
          const { error: insertError } = await this.supabase
            .from('competitions')
            .insert({
              api_football_id: competition.api_football_id,
              name: competition.name,
              country: competition.country,
              logo_url: competition.logo_url,
              type: competition.type,
              season: competition.season,
            });

          if (insertError) throw insertError;
          insertedCount++;
        }
      }

      return { success: true, updatedCount, insertedCount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedCount: 0,
        insertedCount: 0
      };
    }
  }

  /**
   * Get database IDs for teams and competitions
   */
  private async getEntityIds(matches: NormalizedMatch[]): Promise<{
    teamIds: Map<number, number>;
    competitionIds: Map<string, number>;
  }> {
    const teamApiIds = Array.from(new Set([
      ...matches.map(m => m.home_team.api_football_id),
      ...matches.map(m => m.away_team.api_football_id)
    ]));

    const competitionKeys = Array.from(new Set(
      matches.map(m => `${m.competition.api_football_id}-${m.competition.season}`)
    ));

    // Get team IDs
    const { data: teams } = await this.supabase
      .from('teams')
      .select('id, api_football_id')
      .in('api_football_id', teamApiIds);

    const teamIds = new Map<number, number>();
    teams?.forEach(team => {
      teamIds.set(team.api_football_id, team.id);
    });

    // Get competition IDs
    const competitionPromises = competitionKeys.map(async (key) => {
      const [apiId, season] = key.split('-');
      const { data } = await this.supabase
        .from('competitions')
        .select('id, api_football_id, season')
        .eq('api_football_id', parseInt(apiId))
        .eq('season', parseInt(season))
        .single();
      
      return { key, id: data?.id };
    });

    const competitionResults = await Promise.all(competitionPromises);
    const competitionIds = new Map<string, number>();
    competitionResults.forEach(result => {
      if (result.id) {
        competitionIds.set(result.key, result.id);
      }
    });

    return { teamIds, competitionIds };
  }

  /**
   * Upsert matches data
   */
  async upsertMatches(matches: NormalizedMatch[], updateType: 'daily' | 'live' | 'manual' = 'daily'): Promise<UpsertResult> {
    try {
      const { teamIds, competitionIds } = await this.getEntityIds(matches);
      let insertedCount = 0;
      let updatedCount = 0;

      for (const match of matches) {
        const homeTeamId = teamIds.get(match.home_team.api_football_id);
        const awayTeamId = teamIds.get(match.away_team.api_football_id);
        const competitionId = competitionIds.get(`${match.competition.api_football_id}-${match.competition.season}`);

        if (!homeTeamId || !awayTeamId || !competitionId) {
          console.warn(`Missing entity IDs for match ${match.api_football_id}`);
          continue;
        }

        const { data: existingMatch, error: fetchError } = await this.supabase
          .from('matches')
          .select('id, status, home_score, away_score')
          .eq('api_football_id', match.api_football_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        const matchData = {
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          competition_id: competitionId,
          match_date: match.match_date,
          venue: match.venue,
          status: match.status,
          home_score: match.home_score,
          away_score: match.away_score,
          elapsed_time: match.elapsed_time,
          referee: match.referee,
          season: match.season,
          round: match.round,
        };

        if (existingMatch) {
          // Check if match data has changed
          const hasChanges = 
            existingMatch.status !== match.status ||
            existingMatch.home_score !== match.home_score ||
            existingMatch.away_score !== match.away_score;

          if (hasChanges) {
            const { error: updateError } = await this.supabase
              .from('matches')
              .update(matchData)
              .eq('api_football_id', match.api_football_id);

            if (updateError) throw updateError;

            // Log the update
            await this.logMatchUpdate({
              match_id: existingMatch.id,
              update_type: updateType,
              previous_status: existingMatch.status,
              new_status: match.status,
              previous_home_score: existingMatch.home_score,
              new_home_score: match.home_score,
              previous_away_score: existingMatch.away_score,
              new_away_score: match.away_score,
            });

            updatedCount++;
          }
        } else {
          // Insert new match
          const { data: insertedMatch, error: insertError } = await this.supabase
            .from('matches')
            .insert({
              api_football_id: match.api_football_id,
              ...matchData,
            })
            .select('id')
            .single();

          if (insertError) throw insertError;

          // Log the insert
          if (insertedMatch) {
            await this.logMatchUpdate({
              match_id: insertedMatch.id,
              update_type: updateType,
              new_status: match.status,
              new_home_score: match.home_score,
              new_away_score: match.away_score,
            });
          }

          insertedCount++;
        }
      }

      return { success: true, updatedCount, insertedCount };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedCount: 0,
        insertedCount: 0
      };
    }
  }

  /**
   * Log match update
   */
  private async logMatchUpdate(log: MatchUpdateLog): Promise<void> {
    await this.supabase
      .from('match_updates_log')
      .insert(log);
  }
}

// Factory function to create upsert instance
export function createMatchDataUpsert(): MatchDataUpsert {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  }

  return new MatchDataUpsert(supabaseUrl, serviceRoleKey);
}

export { MatchDataUpsert };
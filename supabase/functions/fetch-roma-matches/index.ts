import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY');
    if (!apiKey) {
      console.error('FOOTBALL_DATA_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Roma's team ID in Football-Data.org API is 100
    const romaTeamId = 100;
    const currentDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Next 60 days

    console.log(`Fetching Roma matches from ${currentDate} to ${endDate}`);

    // Fetch upcoming matches for Roma
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${romaTeamId}/matches?dateFrom=${currentDate}&dateTo=${endDate}&status=SCHEDULED`,
      {
        headers: {
          'X-Auth-Token': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`Football-Data API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return new Response(
        JSON.stringify({ error: `API request failed: ${response.status}` }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.matches?.length || 0} upcoming matches`);

    // Transform the data to match our needs
    const matches = data.matches?.map((match: any) => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      competition: match.competition.name,
      eventDate: match.utcDate,
      venue: match.venue || 'TBD',
      status: match.status.toLowerCase(),
      homeScore: match.score?.fullTime?.home || null,
      awayScore: match.score?.fullTime?.away || null,
    })) || [];

    // For now, we'll return both men's and women's matches
    // In a real scenario, you might need different endpoints or filtering
    const menMatches = matches.filter((match: any) => 
      !match.competition.toLowerCase().includes('women') && 
      !match.competition.toLowerCase().includes('femminile')
    );

    // Mock some women's matches for demonstration
    const womenMatches = [
      {
        id: 'w1',
        homeTeam: 'AS Roma Women',
        awayTeam: 'Juventus Women',
        competition: 'Serie A Femminile',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Centro Sportivo Fulvio Bernardini',
        status: 'scheduled'
      },
      {
        id: 'w2',
        homeTeam: 'Milan Women',
        awayTeam: 'AS Roma Women',
        competition: 'Serie A Femminile',
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'PUMA House of Football',
        status: 'scheduled'
      }
    ];

    return new Response(
      JSON.stringify({
        menMatches: menMatches.slice(0, 5), // Limit to next 5 matches
        womenMatches: womenMatches.slice(0, 3), // Limit to next 3 matches
        totalMatches: matches.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-roma-matches function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
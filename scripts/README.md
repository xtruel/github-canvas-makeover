# Roma Matches Scripts

This directory contains TypeScript scripts for automatically fetching and updating AS Roma fixture data from API-Football.

## Files

- **fetchRomaMatches.ts**: Core script for fetching Roma fixtures from API-Football API
- **updateRomaMatchesJson.ts**: Orchestrator script that fetches data, compares with existing file, and updates if changed

## Environment Variables

The scripts require the following environment variables:

- `API_FOOTBALL_KEY` (required): Your API key from api-football.com
- `ROMA_TEAM_ID` (optional): AS Roma's team ID, defaults to 497
- `SEASON` (optional): Season year, defaults to current year

## Usage

### Manual execution

```bash
# Install dependencies
npm install

# Set environment variables (example)
export API_FOOTBALL_KEY="your-api-key-here"
export ROMA_TEAM_ID=497
export SEASON=2025

# Run the update script
npm run update-roma-matches
```

### Automated execution

The scripts are designed to run automatically via GitHub Actions workflow (`.github/workflows/roma-matches-json.yml`):

- Daily refresh at 6:00 AM UTC
- More frequent updates (every 30 minutes) during European evening hours (18:00-22:00 UTC)
- Manual triggering via workflow_dispatch

## Output

The scripts update:
- `data/roma-matches.json`: Primary data file
- `public/data/roma-matches.json`: Copy for build distribution

## Error Handling

- Graceful fallback when API_FOOTBALL_KEY is missing (logs message and exits 0)
- Hash comparison to avoid unnecessary commits when data hasn't changed
- Comprehensive error logging for debugging

## API Rate Limiting

The scripts are designed with conservative rate limiting in mind:
- Maximum 2 calls per hour during peak times
- Daily refresh during low-traffic hours
- Suitable for free tier API limits
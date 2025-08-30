import { promises as fs } from 'fs';
import { join } from 'path';
import { parseSerieAText, convertToUIFormat } from './openfootball/parseSerieA';

/**
 * Fetch Serie A data from OpenFootball GitHub repository
 */
async function fetchSerieAData(): Promise<string> {
  const url = 'https://raw.githubusercontent.com/openfootball/italy/master/2024-25/1-seriea.txt';
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`HTTP ${response.status}: Unable to fetch data from OpenFootball. Exiting gracefully.`);
      process.exit(0); // Exit gracefully as specified in requirements
    }
    
    return await response.text();
  } catch (error) {
    console.log(`Network error fetching OpenFootball data: ${error}. Exiting gracefully.`);
    process.exit(0);
  }
}

/**
 * Check if file content has changed before writing
 */
async function hasFileChanged(filePath: string, newContent: string): Promise<boolean> {
  try {
    const existingContent = await fs.readFile(filePath, 'utf-8');
    return existingContent !== newContent;
  } catch (error) {
    // File doesn't exist, so it has "changed"
    return true;
  }
}

/**
 * Main function to update Roma matches from OpenFootball
 */
async function updateRomaMatches(): Promise<void> {
  console.log('🏈 Updating Roma matches from OpenFootball...');
  
  try {
    // Fetch the Serie A data
    const serieAContent = await fetchSerieAData();
    console.log('✅ Successfully fetched Serie A data from OpenFootball');
    
    // Parse the content
    const matches = parseSerieAText(serieAContent);
    console.log(`📊 Parsed ${matches.length} Roma matches from Serie A data`);
    
    // Convert to UI format
    const romaData = convertToUIFormat(matches);
    
    // Prepare output file path
    const outputPath = join(process.cwd(), 'data', 'roma-matches.json');
    const jsonContent = JSON.stringify(romaData, null, 2);
    
    // Check if content has changed
    const hasChanged = await hasFileChanged(outputPath, jsonContent);
    
    if (hasChanged) {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
      
      // Write the file
      await fs.writeFile(outputPath, jsonContent, 'utf-8');
      console.log(`✅ Updated ${outputPath} with ${matches.length} Roma matches`);
      console.log(`📅 Last updated: ${romaData.lastUpdated}`);
      
      if (matches.length > 0) {
        const upcoming = matches.filter(m => m.status === 'SCHEDULED').length;
        const finished = matches.filter(m => m.status === 'FINISHED').length;
        console.log(`📈 ${upcoming} upcoming matches, ${finished} finished matches`);
      }
    } else {
      console.log('ℹ️  No changes detected in Roma matches data. Skipping update.');
    }
    
  } catch (error) {
    console.error('❌ Error updating Roma matches:', error);
    process.exit(1);
  }
}

// Run the script
updateRomaMatches();
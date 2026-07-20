import axios from 'axios';
import * as cheerio from 'cheerio';
import { getDatabase } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'https://www.sarkariresult.com';
const JOBS_PAGE = `${BASE_URL}/latestjob.php`;

// User-Agent to avoid blocking
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

/**
 * Scrape government jobs from SarkariResult
 */
export async function scrapeSarkariResult() {
  try {
    console.log('🔍 Scraping SarkariResult...');
    const response = await axios.get(JOBS_PAGE, { headers });
    const $ = cheerio.load(response.data);
    
    const jobs = [];
    
    // Parse job listings - adjust selectors based on actual HTML structure
    $('div.box, article, .job-item, tr.job-row').each((index, element) => {
      const $elem = $(element);
      
      const title = $elem.find('a, h3, .job-title').first().text().trim();
      const link = $elem.find('a').first().attr('href') || '';
      const details = $elem.text();
      
      // Extract department from text
      const deptMatch = details.match(/(?:Ministry|Department|Board)\s*[:-]?\s*([^\n]*)/i);
      const department = deptMatch ? deptMatch[1].trim() : 'Government of India';
      
      // Extract deadline
      const deadlineMatch = details.match(/(?:Last Date|Deadline|Apply By)[:-]?\s*([^\n]*)/i);
      const lastDate = deadlineMatch ? deadlineMatch[1].trim() : '';
      
      if (title) {
        jobs.push({
          id: uuidv4(),
          title,
          department,
          description: details.substring(0, 500),
          job_url: link.startsWith('http') ? link : BASE_URL + link,
          application_deadline: parseDate(lastDate),
          source: 'sarkariresult.com',
          scraped_at: new Date()
        });
      }
    });
    
    console.log(`✅ Found ${jobs.length} jobs from SarkariResult`);
    return jobs;
  } catch (error) {
    console.error('❌ Error scraping SarkariResult:', error.message);
    return [];
  }
}

/**
 * Save scraped jobs to database
 */
export async function saveJobsToDB(jobs) {
  const db = getDatabase();
  let saved = 0;
  
  for (const job of jobs) {
    try {
      await db.run(
        `INSERT OR IGNORE INTO government_jobs 
         (id, title, department, description, job_url, application_deadline, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          job.id,
          job.title,
          job.department,
          job.description || '',
          job.job_url,
          job.application_deadline,
          new Date()
        ]
      );
      saved++;
    } catch (error) {
      console.error(`Failed to save job ${job.title}:`, error.message);
    }
  }
  
  console.log(`💾 Saved ${saved}/${jobs.length} jobs to database`);
  return saved;
}

/**
 * Parse date strings to ISO format
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle various date formats
  const formats = [
    /\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
    /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
    /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i // D Month YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      try {
        return new Date(match[0]).toISOString();
      } catch (e) {
        // Continue to next format
      }
    }
  }
  
  return null;
}

export default { scrapeSarkariResult, saveJobsToDB };

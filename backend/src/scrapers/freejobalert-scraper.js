import axios from 'axios';
import * as cheerio from 'cheerio';
import { getDatabase } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'https://www.freejobalert.com';
const JOBS_PAGE = `${BASE_URL}/latest-government-jobs/`;

// User-Agent to avoid blocking
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

/**
 * Scrape government jobs from FreeJobAlert
 */
export async function scrapeFreelJobAlert() {
  try {
    console.log('🔍 Scraping FreeJobAlert...');
    const response = await axios.get(JOBS_PAGE, { headers });
    const $ = cheerio.load(response.data);
    
    const jobs = [];
    
    // Parse job listings - adjust selectors based on actual HTML structure
    $('article, .post-item, .job-listing').each((index, element) => {
      const $elem = $(element);
      
      const title = $elem.find('h2, h3, .job-title').text().trim();
      const department = $elem.find('.department, .ministry').text().trim();
      const description = $elem.find('p, .job-description').first().text().trim();
      const link = $elem.find('a').first().attr('href') || '';
      const lastDate = $elem.find('.last-date, .deadline').text().trim();
      
      if (title && department) {
        jobs.push({
          id: uuidv4(),
          title,
          department,
          description: description.substring(0, 500),
          job_url: link.startsWith('http') ? link : BASE_URL + link,
          application_deadline: parseDate(lastDate),
          source: 'freejobalert.com',
          scraped_at: new Date()
        });
      }
    });
    
    console.log(`✅ Found ${jobs.length} jobs from FreeJobAlert`);
    return jobs;
  } catch (error) {
    console.error('❌ Error scraping FreeJobAlert:', error.message);
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
    /\d{4}-\d{2}-\d{2}/ // YYYY-MM-DD
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

export default { scrapeFreelJobAlert, saveJobsToDB };

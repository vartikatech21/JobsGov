import express from 'express';
import { scrapeFreelJobAlert } from '../scrapers/freejobalert-scraper.js';
import { scrapeSarkariResult } from '../scrapers/sarkariresult-scraper.js';
import { saveJobsToDB as saveFreejobAlert } from '../scrapers/freejobalert-scraper.js';
import { saveJobsToDB as saveSarkariresult } from '../scrapers/sarkariresult-scraper.js';

const router = express.Router();

/**
 * POST /api/scraper/fetch-all
 * Fetch government jobs from all sources
 */
router.post('/fetch-all', async (req, res, next) => {
  try {
    res.json({
      status: 'started',
      message: 'Scraping jobs from all sources',
      timestamp: new Date()
    });

    // Run scraping in background (non-blocking)
    (async () => {
      try {
        console.log('\n=== Starting Government Job Scraping ===');
        
        // Scrape from FreeJobAlert
        const freelobalertJobs = await scrapeFreelJobAlert();
        const savedFreejob = await saveFreejobAlert(freelobalertJobs);
        
        // Add delay to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Scrape from SarkariResult
        const sarkariJobs = await scrapeSarkariResult();
        const savedSarkari = await saveSarkariresult(sarkariJobs);
        
        console.log('\n=== Scraping Complete ===');
        console.log(`Total jobs saved: ${savedFreejob + savedSarkari}`);
      } catch (error) {
        console.error('Background scraping error:', error);
      }
    })();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/scraper/fetch-freejobalert
 * Fetch only from FreeJobAlert
 */
router.post('/fetch-freejobalert', async (req, res, next) => {
  try {
    const jobs = await scrapeFreelJobAlert();
    const saved = await saveFreejobAlert(jobs);
    
    res.json({
      source: 'freejobalert.com',
      jobsFound: jobs.length,
      jobsSaved: saved,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/scraper/fetch-sarkariresult
 * Fetch only from SarkariResult
 */
router.post('/fetch-sarkariresult', async (req, res, next) => {
  try {
    const jobs = await scrapeSarkariResult();
    const saved = await saveSarkariresult(jobs);
    
    res.json({
      source: 'sarkariresult.com',
      jobsFound: jobs.length,
      jobsSaved: saved,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

export default router;

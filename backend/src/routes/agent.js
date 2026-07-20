import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import JobMatchingAgent from '../agent/jobMatchingAgent.js';
import { getDatabase } from '../db/database.js';

const router = express.Router();
const agent = new JobMatchingAgent();

/**
 * POST /api/agent/analyze
 * Analyze user profile and get job recommendations
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { field, experienceLevel, education, interests } = req.body;

    if (!field) {
      return res.status(400).json({ error: 'Field is required' });
    }

    // Create or update user profile
    const userId = uuidv4();
    const db = getDatabase();
    
    await db.run(
      `INSERT INTO users (id, field, experience_level, education, interests) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, field, experienceLevel || 'entry', education || '', interests || '']
    );

    // Get recommendations
    const recommendations = await agent.analyzeProfile({
      field,
      experienceLevel: experienceLevel || 'entry',
      education: education || '',
      interests: interests || ''
    });

    // Store recommendations
    for (const rec of recommendations.slice(0, 10)) {
      await db.run(
        `INSERT INTO recommendations (id, user_id, job_id, match_score, guidance)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), userId, rec.id, rec.matchScore, rec.guidance]
      );
    }

    res.json({
      userId,
      profile: { field, experienceLevel, education, interests },
      recommendations: recommendations.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/agent/faq
 * Get frequently asked questions
 */
router.get('/faq', async (req, res, next) => {
  try {
    const faq = await agent.getFAQ();
    res.json(faq);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/agent/guidance/:jobId
 * Get detailed guidance for a specific job
 */
router.post('/guidance/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { field, experienceLevel, education, interests } = req.body;

    if (!field) {
      return res.status(400).json({ error: 'Field is required' });
    }

    const db = getDatabase();
    const job = await db.get(
      'SELECT * FROM government_jobs WHERE id = ?',
      [jobId]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const userProfile = { field, experienceLevel, education, interests };
    const guidance = agent.generateGuidance(userProfile, job);
    const matchScore = agent.calculateMatchScore(userProfile, job);

    res.json({
      jobId,
      job,
      matchScore,
      guidance
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/users/:userId
 * Get user profile
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:userId/recommendations
 * Get user's recommendations
 */
router.get('/:userId/recommendations', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const recommendations = await db.all(
      `SELECT r.*, j.* FROM recommendations r
       JOIN government_jobs j ON r.job_id = j.id
       WHERE r.user_id = ?
       ORDER BY r.match_score DESC`,
      [userId]
    );

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:userId/applications
 * Get user's applications
 */
router.get('/:userId/applications', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const applications = await db.all(
      `SELECT a.*, j.* FROM applications a
       JOIN government_jobs j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json(applications);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/:userId/applications
 * Track job application
 */
router.post('/:userId/applications', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { jobId } = req.body;
    const db = getDatabase();

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const applicationId = uuidv4();

    await db.run(
      `INSERT INTO applications (id, user_id, job_id, status, applied_at)
       VALUES (?, ?, ?, 'applied', CURRENT_TIMESTAMP)`,
      [applicationId, userId, jobId]
    );

    res.status(201).json({
      id: applicationId,
      userId,
      jobId,
      status: 'applied',
      appliedAt: new Date()
    });
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import { getDatabase } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/jobs
 * List all government jobs
 */
router.get('/', async (req, res, next) => {
  try {
    const { department, field, limit = 20 } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM government_jobs WHERE 1=1';
    const params = [];

    if (department) {
      query += ' AND department LIKE ?';
      params.push(`%${department}%`);
    }

    if (field) {
      query += ' AND required_fields LIKE ?';
      params.push(`%${field}%`);
    }

    query += ' LIMIT ?';
    params.push(parseInt(limit));

    const jobs = await db.all(query, params);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/jobs/:id
 * Get job details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const job = await db.get(
      'SELECT * FROM government_jobs WHERE id = ?',
      [id]
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/jobs/departments
 * Get list of departments with open positions
 */
router.get('/departments', async (req, res, next) => {
  try {
    const db = getDatabase();
    const departments = await db.all(
      'SELECT DISTINCT department FROM government_jobs ORDER BY department'
    );

    res.json(departments);
  } catch (error) {
    next(error);
  }
});

export default router;

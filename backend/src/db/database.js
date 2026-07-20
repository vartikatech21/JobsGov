import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/jobsgov.db');

let db;

export async function initializeDatabase() {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await createTables();
  console.log('✅ Database initialized');
}

async function createTables() {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      field TEXT NOT NULL,
      experience_level TEXT,
      education TEXT,
      interests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Government jobs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS government_jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT,
      required_fields TEXT,
      experience_required TEXT,
      education_required TEXT,
      salary_range TEXT,
      application_deadline DATETIME,
      job_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User recommendations table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      match_score REAL,
      guidance TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(job_id) REFERENCES government_jobs(id)
    )
  `);

  // Application tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_id TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      applied_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(job_id) REFERENCES government_jobs(id)
    )
  `);
}

export function getDatabase() {
  return db;
}

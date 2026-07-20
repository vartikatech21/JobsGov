import { getDatabase, initializeDatabase } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const SAMPLE_JOBS = [
  {
    title: 'Senior Software Engineer',
    department: 'Ministry of Information Technology',
    description: 'Develop and maintain critical government software systems. Work with cloud technologies and microservices architecture.',
    required_fields: 'Software Engineering, Computer Science, IT',
    experience_required: 'Senior (10+ years)',
    education_required: 'Bachelor\'s Degree',
    salary_range: '₹15-20 LPA',
    job_url: 'https://www.freejobalert.com/'
  },
  {
    title: 'Civil Engineer',
    department: 'Ministry of Road Transport',
    description: 'Plan, design, and supervise construction of highways and infrastructure projects.',
    required_fields: 'Civil Engineering',
    experience_required: 'Mid Level (5-10 years)',
    education_required: 'Bachelor\'s Degree',
    salary_range: '₹12-16 LPA',
    job_url: 'https://www.sarkariresult.com/'
  },
  {
    title: 'Teacher',
    department: 'Ministry of Education',
    description: 'Teach students and help develop their academic and personal skills.',
    required_fields: 'Education, Teaching',
    experience_required: 'Junior (2-5 years)',
    education_required: 'Master\'s Degree',
    salary_range: '₹8-12 LPA',
    job_url: 'https://www.freejobalert.com/'
  },
  {
    title: 'Data Analyst',
    department: 'Ministry of Finance',
    description: 'Analyze government financial data and provide insights for policy making.',
    required_fields: 'Data Science, Analytics, Statistics',
    experience_required: 'Junior (2-5 years)',
    education_required: 'Bachelor\'s Degree',
    salary_range: '₹10-14 LPA',
    job_url: 'https://www.sarkariresult.com/'
  },
  {
    title: 'Doctor',
    department: 'Ministry of Health',
    description: 'Provide healthcare services at AIIMS hospitals across the country.',
    required_fields: 'Medicine, Healthcare',
    experience_required: 'Entry Level (0-2 years)',
    education_required: 'Bachelor\'s Degree',
    salary_range: '₹9-13 LPA',
    job_url: 'https://www.freejobalert.com/'
  }
];

/**
 * Seed database with sample government jobs
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    const db = getDatabase();
    let inserted = 0;
    
    for (const job of SAMPLE_JOBS) {
      await db.run(
        `INSERT OR IGNORE INTO government_jobs 
         (id, title, department, description, required_fields, experience_required, 
          education_required, salary_range, job_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          job.title,
          job.department,
          job.description,
          job.required_fields,
          job.experience_required,
          job.education_required,
          job.salary_range,
          job.job_url,
          new Date()
        ]
      );
      inserted++;
    }
    
    console.log(`✅ Seeded ${inserted} sample jobs`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

/**
 * Run seed on startup
 */
async function run() {
  await initializeDatabase();
  await seedDatabase();
  console.log('✨ Database ready!');
  process.exit(0);
}

run().catch(error => {
  console.error('Failed to seed:', error);
  process.exit(1);
});

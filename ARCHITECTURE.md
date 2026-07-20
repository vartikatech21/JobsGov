# JobsGov Architecture

## System Overview

JobsGov is an AI-powered government job guidance system with two main components:

### Frontend (React + Vite)
- Interactive user interface for job profile input
- Real-time job recommendations display
- Application tracking interface
- Responsive design for mobile and desktop

### Backend (Node.js + Express)
- RESTful API for job recommendations
- Web scraping system for government job data
- SQLite database for persistence
- Job matching algorithm using AI/ML

## Data Flow

```
User Profile Input → Frontend → Backend API → JobMatchingAgent → Database Queries → Recommendations
```

## Core Components

### 1. JobMatchingAgent (`backend/src/agent/jobMatchingAgent.js`)
- Analyzes user profiles (field, experience, education, interests)
- Calculates match scores for each job (0-100%)
- Generates personalized guidance for each recommendation
- Provides FAQ content

### 2. Web Scrapers
- **FreeJobAlert Scraper** (`backend/src/scrapers/freejobalert-scraper.js`)
  - Scrapes government job listings
  - Extracts title, department, deadline, description
- **SarkariResult Scraper** (`backend/src/scrapers/sarkariresult-scraper.js`)
  - Scrapes sarkari (government) job notifications
  - Parses structured job data

### 3. Database Schema

#### Users Table
```sql
users {
  id: UUID,
  field: string,
  experience_level: enum(entry, junior, mid, senior),
  education: string,
  interests: string,
  created_at, updated_at
}
```

#### Government Jobs Table
```sql
government_jobs {
  id: UUID,
  title: string,
  department: string,
  description: text,
  required_fields: string,
  experience_required: string,
  education_required: string,
  salary_range: string,
  application_deadline: datetime,
  job_url: string
}
```

#### Recommendations Table
```sql
recommendations {
  id: UUID,
  user_id: UUID,
  job_id: UUID,
  match_score: float (0-100),
  guidance: text,
  created_at
}
```

#### Applications Table
```sql
applications {
  id: UUID,
  user_id: UUID,
  job_id: UUID,
  status: enum(draft, applied, rejected, accepted),
  applied_at: datetime,
  created_at
}
```

## API Endpoints

### Agent Analysis
- `POST /api/agent/analyze` - Get job recommendations for a profile
- `GET /api/agent/faq` - Get frequently asked questions
- `POST /api/agent/guidance/:jobId` - Get detailed guidance for a specific job

### Jobs Management
- `GET /api/jobs` - List all jobs with optional filters
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/departments` - Get list of departments

### User Management
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/recommendations` - Get user's recommendations
- `GET /api/users/:userId/applications` - Get user's applications
- `POST /api/users/:userId/applications` - Track new application

### Web Scraping
- `POST /api/scraper/fetch-all` - Scrape from all sources
- `POST /api/scraper/fetch-freejobalert` - Scrape from FreeJobAlert
- `POST /api/scraper/fetch-sarkariresult` - Scrape from SarkariResult

## Matching Algorithm

The JobMatchingAgent calculates match scores using weighted criteria:

1. **Field Match (40%)** - Does user's field align with job requirements?
2. **Experience Match (30%)** - Is user's experience level sufficient?
3. **Education Match (20%)** - Does user meet education requirements?
4. **Interest Alignment (10%)** - Do user's interests match job description?

Final Score = (Field × 0.4 + Experience × 0.3 + Education × 0.2 + Interests × 0.1) × 100

Jobs with score ≥ 40% are recommended.

## Security Considerations

- CORS enabled for frontend-backend communication
- Input validation on all API endpoints
- UUID generation for user identification
- Environment variables for sensitive config
- SQL injection prevention via parameterized queries
- Respectful web scraping with User-Agent headers and delays

## Future Enhancements

1. **LLM Integration** - Use ChatGPT/Claude for advanced guidance
2. **Machine Learning** - Train model on application outcomes
3. **Email Notifications** - Alert users about new matching jobs
4. **Resume Upload** - Automatic skill extraction
5. **Interview Prep** - AI-generated interview questions
6. **Admin Dashboard** - Job posting management

# JobsGov Setup Guide

## Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/vartikatech21/JobsGov.git
cd JobsGov
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create data directory
mkdir -p data

# Copy environment file
cp .env.example .env

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Accessing the Application

Open your browser and navigate to: `http://localhost:5173`

## Database Initialization

The database is automatically initialized on first backend startup. To seed sample data:

```bash
cd backend
node src/scripts/seed-data.js
```

## Web Scraping

To populate the database with government jobs from FreeJobAlert and SarkariResult:

```bash
# Using the API endpoint
curl -X POST http://localhost:3001/api/scraper/fetch-all
```

## Development

### File Structure
```
JobsGov/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server entry point
│   │   ├── agent/                 # Job matching logic
│   │   ├── db/                    # Database initialization
│   │   ├── routes/                # API endpoints
│   │   ├── scrapers/              # Web scraping modules
│   │   └── scripts/               # Utility scripts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main component
│   │   ├── App.css                # Styling
│   │   ├── components/            # React components
│   │   └── main.jsx               # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── ARCHITECTURE.md
```

## Troubleshooting

### Backend won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3001 is available
- Review `.env` file configuration

### Frontend won't connect to backend
- Verify backend is running on `http://localhost:3001`
- Check CORS settings in `backend/src/server.js`
- Ensure proxy is configured in `frontend/vite.config.js`

### Database errors
- Delete `backend/data/jobsgov.db` and restart to reinitialize
- Check file permissions on data directory

## API Testing

### Get Job Recommendations
```bash
curl -X POST http://localhost:3001/api/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "field": "Software Engineer",
    "experienceLevel": "junior",
    "education": "bachelor",
    "interests": "technology, infrastructure"
  }'
```

### List All Jobs
```bash
curl http://localhost:3001/api/jobs
```

### Trigger Web Scraping
```bash
curl -X POST http://localhost:3001/api/scraper/fetch-all
```

## Performance Tips

1. **Indexing**: Add database indexes on frequently queried fields
2. **Caching**: Implement Redis caching for job listings
3. **Pagination**: Use pagination for large result sets
4. **Lazy Loading**: Load recommendations progressively on frontend

## Deployment

### Backend Deployment (Heroku example)
```bash
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Vercel example)
```bash
npm install -g vercel
vercel
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

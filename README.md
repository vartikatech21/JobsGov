# JobsGov - Government Job Guidance Agent

An intelligent agent that guides people toward suitable government jobs based on their field, qualifications, and experience.

## Features

- **Intelligent Matching**: AI-powered agent analyzes user's field and recommends relevant government positions
- **Personalized Guidance**: Tailored application tips and requirements for different government departments
- **Job Database**: Comprehensive database of government job positions
- **Progress Tracking**: Track application status and career progression

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI/Agent**: LLM integration for intelligent recommendations
- **Database**: SQLite (development) / PostgreSQL (production)

## Project Structure

```
JobsGov/
├── backend/          # Node.js/Express API server
├── frontend/         # React application
├── data/             # Government job datasets
├── docs/             # Documentation
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## How It Works

1. User provides their field/qualification
2. AI agent analyzes profile against government job database
3. Agent recommends matching positions
4. Provides application guidance and tips
5. Tracks user progress

## Contributing

Pull requests are welcome!

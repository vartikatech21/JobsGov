import { useState } from 'react'
import axios from 'axios'
import ProfileForm from './components/ProfileForm'
import RecommendationsList from './components/RecommendationsList'
import './App.css'

function App() {
  const [userId, setUserId] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleProfileSubmit = async (profileData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post('/api/agent/analyze', profileData)
      setUserId(response.data.userId)
      setRecommendations(response.data.recommendations)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🇮🇳 JobsGov</h1>
        <p>Your AI-Powered Government Job Guidance Agent</p>
      </header>

      <main className="container">
        {!userId ? (
          <ProfileForm onSubmit={handleProfileSubmit} loading={loading} />
        ) : (
          <div className="results">
            <div className="results-header">
              <h2>Personalized Job Recommendations</h2>
              <button onClick={() => setUserId(null)} className="btn-reset">
                Start Over
              </button>
            </div>
            
            {error && <div className="error">{error}</div>}
            {loading && <div className="loading">Analyzing...</div>}
            
            <RecommendationsList 
              recommendations={recommendations}
              userId={userId}
            />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2024 JobsGov. Guided by AI, Powered by Data.</p>
      </footer>
    </div>
  )
}

export default App

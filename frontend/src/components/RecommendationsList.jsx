import { useState } from 'react'
import JobCard from './JobCard'

function RecommendationsList({ recommendations, userId }) {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="recommendations">
      {recommendations.length === 0 ? (
        <div className="no-results">
          <p>No matching jobs found. Try updating your profile.</p>
        </div>
      ) : (
        <div>
          <p className="results-count">
            Found {recommendations.length} matching government positions
          </p>
          <div className="jobs-grid">
            {recommendations.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                userId={userId}
                isExpanded={expandedId === job.id}
                onToggleExpand={() => 
                  setExpandedId(expandedId === job.id ? null : job.id)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RecommendationsList

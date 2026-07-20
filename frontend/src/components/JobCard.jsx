import { useState } from 'react'
import axios from 'axios'

function JobCard({ job, index, userId, isExpanded, onToggleExpand }) {
  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    try {
      await axios.post(`/api/users/${userId}/applications`, {
        jobId: job.id
      })
      setApplied(true)
      setTimeout(() => setApplied(false), 3000)
    } catch (error) {
      console.error('Failed to apply:', error)
    }
  }

  const matchPercentage = Math.round(job.matchScore || 0)
  const matchColor = matchPercentage >= 80 ? '#10b981' : matchPercentage >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div>
          <span className="job-rank">#{index + 1}</span>
          <h3>{job.title}</h3>
          <p className="department">{job.department}</p>
        </div>
        <div className="match-badge" style={{ backgroundColor: matchColor }}>
          {matchPercentage}%<br/>
          <small>Match</small>
        </div>
      </div>

      <div className="job-card-body">
        {job.description && (
          <p className="description">{job.description.substring(0, 150)}...</p>
        )}
        
        <div className="job-meta">
          {job.experience_required && (
            <span className="meta-tag">📅 {job.experience_required}</span>
          )}
          {job.education_required && (
            <span className="meta-tag">🎓 {job.education_required}</span>
          )}
          {job.salary_range && (
            <span className="meta-tag">💰 {job.salary_range}</span>
          )}
        </div>
      </div>

      <div className="job-card-footer">
        <button onClick={onToggleExpand} className="btn btn-secondary">
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
        <button onClick={handleApply} className="btn btn-success">
          {applied ? '✓ Applied' : 'Apply Now'}
        </button>
      </div>

      {isExpanded && job.guidance && (
        <div className="job-guidance">
          <div className="guidance-text">
            {job.guidance.split('\n').map((line, i) => (
              <div key={i} className="guidance-line">
                {line}
              </div>
            ))}
          </div>
          {job.job_url && (
            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="external-link">
              View on Official Portal →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default JobCard

import { useState } from 'react'

function ProfileForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    field: '',
    experienceLevel: 'entry',
    education: '',
    interests: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.field.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label htmlFor="field">Professional Field/Qualification *</label>
        <input
          type="text"
          id="field"
          name="field"
          placeholder="e.g., Software Engineer, Civil Engineer, Teacher"
          value={formData.field}
          onChange={handleChange}
          required
          className="input"
        />
        <small>What field are you qualified in?</small>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="experienceLevel">Experience Level</label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className="input"
          >
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="junior">Junior (2-5 years)</option>
            <option value="mid">Mid Level (5-10 years)</option>
            <option value="senior">Senior (10+ years)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="education">Highest Education</label>
          <select
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select...</option>
            <option value="high school">High School</option>
            <option value="diploma">Diploma</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="interests">Areas of Interest</label>
        <input
          type="text"
          id="interests"
          name="interests"
          placeholder="e.g., infrastructure, education, technology (comma separated)"
          value={formData.interests}
          onChange={handleChange}
          className="input"
        />
        <small>What sectors or areas interest you most?</small>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Analyzing...' : 'Find My Jobs'}
      </button>
    </form>
  )
}

export default ProfileForm

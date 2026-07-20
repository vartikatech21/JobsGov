import { getDatabase } from '../db/database.js';

class JobMatchingAgent {
  /**
   * Analyze user profile and get job recommendations
   */
  async analyzeProfile(userProfile) {
    const db = getDatabase();
    
    // Get all jobs from database
    const jobs = await db.all('SELECT * FROM government_jobs LIMIT 50');
    
    // If no jobs in database, return sample recommendations
    if (jobs.length === 0) {
      return this.getSampleRecommendations(userProfile);
    }

    // Calculate match scores for each job
    const recommendations = jobs
      .map(job => ({
        ...job,
        matchScore: this.calculateMatchScore(userProfile, job),
        guidance: this.generateGuidance(userProfile, job)
      }))
      .filter(job => job.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return recommendations;
  }

  /**
   * Calculate match score between user profile and job
   */
  calculateMatchScore(userProfile, job) {
    let score = 0;
    let weights = {
      field: 0.4,
      experience: 0.3,
      education: 0.2,
      interests: 0.1
    };

    // Field matching (40%)
    const fieldMatch = this.calculateFieldMatch(userProfile.field, job.required_fields || '');
    score += fieldMatch * weights.field;

    // Experience matching (30%)
    const experienceMatch = this.calculateExperienceMatch(
      userProfile.experienceLevel,
      job.experience_required || ''
    );
    score += experienceMatch * weights.experience;

    // Education matching (20%)
    const educationMatch = this.calculateEducationMatch(
      userProfile.education,
      job.education_required || ''
    );
    score += educationMatch * weights.education;

    // Interest alignment (10%)
    const interestMatch = this.calculateInterestMatch(
      userProfile.interests || '',
      job.description || ''
    );
    score += interestMatch * weights.interests;

    return Math.round(score * 100);
  }

  /**
   * Calculate field match score (0-1)
   */
  calculateFieldMatch(userField, jobFields) {
    if (!jobFields) return 0.5;
    
    const userFieldLower = userField.toLowerCase();
    const jobFieldsLower = jobFields.toLowerCase();
    
    // Exact match
    if (jobFieldsLower.includes(userFieldLower)) return 1.0;
    
    // Partial match
    const userWords = userFieldLower.split(/\s+/);
    const jobWords = jobFieldsLower.split(/\s+/);
    
    const matches = userWords.filter(word => jobWords.some(jw => jw.includes(word)));
    return matches.length > 0 ? 0.7 : 0.3;
  }

  /**
   * Calculate experience match score (0-1)
   */
  calculateExperienceMatch(userLevel, jobLevel) {
    if (!jobLevel) return 0.7;

    const levels = { entry: 0, junior: 1, mid: 2, senior: 3 };
    const userLevelNum = levels[userLevel] || 0;
    
    const jobLevelLower = jobLevel.toLowerCase();
    let jobLevelNum = 0;
    
    if (jobLevelLower.includes('entry') || jobLevelLower.includes('fresher')) jobLevelNum = 0;
    else if (jobLevelLower.includes('junior') || jobLevelLower.includes('2-5')) jobLevelNum = 1;
    else if (jobLevelLower.includes('mid') || jobLevelLower.includes('5-10')) jobLevelNum = 2;
    else if (jobLevelLower.includes('senior') || jobLevelLower.includes('10+')) jobLevelNum = 3;

    // User meets or exceeds requirement
    if (userLevelNum >= jobLevelNum) return 1.0;
    
    // User is one level below
    if (userLevelNum === jobLevelNum - 1) return 0.7;
    
    // User is significantly below
    return 0.3;
  }

  /**
   * Calculate education match score (0-1)
   */
  calculateEducationMatch(userEducation, jobEducation) {
    if (!jobEducation) return 0.7;

    const educationLevels = {
      'high school': 0,
      'diploma': 1,
      'bachelor': 2,
      'master': 3,
      'phd': 4
    };

    const userLevel = educationLevels[userEducation?.toLowerCase()] || 2;
    const jobEducationLower = jobEducation.toLowerCase();
    
    let requiredLevel = 2;
    if (jobEducationLower.includes('phd')) requiredLevel = 4;
    else if (jobEducationLower.includes('master')) requiredLevel = 3;
    else if (jobEducationLower.includes('bachelor')) requiredLevel = 2;
    else if (jobEducationLower.includes('diploma')) requiredLevel = 1;
    else if (jobEducationLower.includes('high school')) requiredLevel = 0;

    if (userLevel >= requiredLevel) return 1.0;
    if (userLevel === requiredLevel - 1) return 0.7;
    return 0.3;
  }

  /**
   * Calculate interest alignment score (0-1)
   */
  calculateInterestMatch(userInterests, jobDescription) {
    if (!userInterests || !jobDescription) return 0.5;

    const userInterestsList = userInterests.split(',').map(i => i.trim().toLowerCase());
    const jobDescLower = jobDescription.toLowerCase();

    const matches = userInterestsList.filter(interest => 
      jobDescLower.includes(interest)
    ).length;

    return Math.min(matches / userInterestsList.length, 1.0);
  }

  /**
   * Generate personalized guidance for a job
   */
  generateGuidance(userProfile, job) {
    const matchScore = this.calculateMatchScore(userProfile, job);
    const fieldMatch = this.calculateFieldMatch(userProfile.field, job.required_fields || '');
    const experienceMatch = this.calculateExperienceMatch(
      userProfile.experienceLevel,
      job.experience_required || ''
    );

    let guidance = `This position matches ${matchScore}% of your profile.\n\n`;

    if (matchScore >= 80) {
      guidance += `✅ EXCELLENT MATCH! You are well-suited for this position.\n`;
    } else if (matchScore >= 60) {
      guidance += `✅ GOOD MATCH! You meet most requirements.\n`;
    } else if (matchScore >= 40) {
      guidance += `⚠️ MODERATE MATCH! Some requirements need attention.\n`;
    }

    guidance += `\n📋 Your Profile:\n`;
    guidance += `• Field: ${userProfile.field}\n`;
    guidance += `• Experience: ${userProfile.experienceLevel || 'Not specified'}\n`;
    guidance += `• Education: ${userProfile.education || 'Not specified'}\n`;

    guidance += `\n🎯 Job Requirements:\n`;
    guidance += `• Field: ${job.required_fields || 'Not specified'}\n`;
    guidance += `• Experience: ${job.experience_required || 'Not specified'}\n`;
    guidance += `• Education: ${job.education_required || 'Not specified'}\n`;
    guidance += `• Salary: ${job.salary_range || 'Not disclosed'}\n`;

    guidance += `\n💡 Recommendation:\n`;
    
    if (fieldMatch < 0.7) {
      guidance += `• Consider upskilling in the required domain\n`;
    }
    
    if (experienceMatch < 1.0) {
      guidance += `• Gain more experience in your current role\n`;
    }
    
    guidance += `• Review the full job description on the official portal\n`;
    guidance += `• Prepare your resume highlighting relevant skills\n`;

    if (matchScore >= 60) {
      guidance += `• Apply immediately - you're a strong candidate!\n`;
    }

    return guidance;
  }

  /**
   * Get sample recommendations when database is empty
   */
  getSampleRecommendations(userProfile) {
    const sampleJobs = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        department: 'Ministry of Information Technology',
        required_fields: 'Software Engineering, Computer Science',
        experience_required: 'Senior (10+ years)',
        education_required: 'Bachelor\'s Degree',
        salary_range: '₹15-20 LPA',
        description: 'Develop critical government software systems using cloud technologies'
      },
      {
        id: '2',
        title: 'Civil Engineer',
        department: 'Ministry of Road Transport',
        required_fields: 'Civil Engineering',
        experience_required: 'Mid Level (5-10 years)',
        education_required: 'Bachelor\'s Degree',
        salary_range: '₹12-16 LPA',
        description: 'Plan and supervise highway and infrastructure projects'
      },
      {
        id: '3',
        title: 'Data Analyst',
        department: 'Ministry of Finance',
        required_fields: 'Data Science, Analytics',
        experience_required: 'Junior (2-5 years)',
        education_required: 'Bachelor\'s Degree',
        salary_range: '₹10-14 LPA',
        description: 'Analyze government financial data and provide insights'
      }
    ];

    return sampleJobs
      .map(job => ({
        ...job,
        matchScore: this.calculateMatchScore(userProfile, job),
        guidance: this.generateGuidance(userProfile, job)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  /**
   * Get FAQ content
   */
  async getFAQ() {
    return [
      {
        question: 'How is the match score calculated?',
        answer: 'The match score is based on your field (40%), experience level (30%), education (20%), and interests (10%). A score of 60%+ indicates a good match.'
      },
      {
        question: 'Can I apply for jobs below my experience level?',
        answer: 'Yes! However, your application may be at a disadvantage. Consider highlighting transferable skills and enthusiasm for learning.'
      },
      {
        question: 'How often are job listings updated?',
        answer: 'Job listings are updated daily from government job portals. New positions appear automatically in your recommendations.'
      },
      {
        question: 'What if I don\'t have the exact qualifications?',
        answer: 'Many government jobs value relevant experience and skills. Apply if you meet 70%+ of requirements and highlight your achievements.'
      },
      {
        question: 'How can I improve my match score?',
        answer: 'Update your profile with additional skills, certifications, and education. The system will recalculate and show better matches.'
      }
    ];
  }
}

export default JobMatchingAgent;

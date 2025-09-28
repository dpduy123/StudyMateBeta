import { UserProfile } from '@/components/profile/types'

export interface MatchScore {
  userId: string
  score: number
  breakdown: {
    universityMatch: number
    majorMatch: number
    yearCompatibility: number
    interestsMatch: number
    skillsMatch: number
    studyTimeMatch: number
    languageMatch: number
  }
}

export interface MatchingUser extends UserProfile {
  matchScore: number
  distance?: string
  isOnline?: boolean
}

export class AIMatchingEngine {

  /**
   * Calculate compatibility score between two users
   */
  static calculateMatchScore(currentUser: UserProfile, targetUser: UserProfile): MatchScore {
    const breakdown = {
      universityMatch: this.calculateUniversityMatch(currentUser, targetUser),
      majorMatch: this.calculateMajorMatch(currentUser, targetUser),
      yearCompatibility: this.calculateYearCompatibility(currentUser, targetUser),
      interestsMatch: this.calculateInterestsMatch(currentUser, targetUser),
      skillsMatch: this.calculateSkillsMatch(currentUser, targetUser),
      studyTimeMatch: this.calculateStudyTimeMatch(currentUser, targetUser),
      languageMatch: this.calculateLanguageMatch(currentUser, targetUser)
    }

    // Weighted average - adjust weights based on importance
    const weights = {
      universityMatch: 0.15,      // Same university is important
      majorMatch: 0.20,           // Same/related major is very important
      yearCompatibility: 0.10,    // Year difference matters but not critical
      interestsMatch: 0.20,       // Shared interests are crucial
      skillsMatch: 0.15,          // Complementary skills are valuable
      studyTimeMatch: 0.15,       // Compatible study times are important
      languageMatch: 0.05         // Language match is nice to have
    }

    const totalScore = Object.entries(breakdown).reduce((sum, [key, value]) => {
      return sum + (value * weights[key as keyof typeof weights])
    }, 0)

    return {
      userId: targetUser.id,
      score: Math.round(totalScore * 100), // Convert to percentage
      breakdown
    }
  }

  /**
   * Calculate university compatibility
   */
  private static calculateUniversityMatch(user1: UserProfile, user2: UserProfile): number {
    if (user1.university === user2.university) return 1.0

    // You could add logic here for sister universities or nearby universities
    // For now, different universities get 0.3
    return 0.3
  }

  /**
   * Calculate major compatibility
   */
  private static calculateMajorMatch(user1: UserProfile, user2: UserProfile): number {
    if (user1.major === user2.major) return 1.0

    // Related majors get higher scores
    const relatedMajors: Record<string, string[]> = {
      'Computer Science': ['Software Engineering', 'Information Technology', 'Data Science'],
      'Software Engineering': ['Computer Science', 'Information Technology'],
      'Mathematics': ['Physics', 'Computer Science', 'Statistics'],
      'Physics': ['Mathematics', 'Engineering'],
      'Business': ['Economics', 'Marketing', 'Finance'],
      'Marketing': ['Business', 'Communications'],
      'Economics': ['Business', 'Finance', 'Mathematics']
    }

    const user1Related = relatedMajors[user1.major] || []
    const user2Related = relatedMajors[user2.major] || []

    if (user1Related.includes(user2.major) || user2Related.includes(user1.major)) {
      return 0.7
    }

    return 0.2 // Different unrelated majors
  }

  /**
   * Calculate year compatibility (closer years are better)
   */
  private static calculateYearCompatibility(user1: UserProfile, user2: UserProfile): number {
    const yearDiff = Math.abs(user1.year - user2.year)

    if (yearDiff === 0) return 1.0      // Same year
    if (yearDiff === 1) return 0.8      // Adjacent years
    if (yearDiff === 2) return 0.5      // 2 years apart
    return 0.2                          // 3+ years apart
  }

  /**
   * Calculate interests overlap
   */
  private static calculateInterestsMatch(user1: UserProfile, user2: UserProfile): number {
    if (user1.interests.length === 0 || user2.interests.length === 0) return 0.3

    const commonInterests = user1.interests.filter(interest =>
      user2.interests.includes(interest)
    ).length

    const totalInterests = new Set([...user1.interests, ...user2.interests]).size

    return commonInterests / Math.min(user1.interests.length, user2.interests.length)
  }

  /**
   * Calculate skills compatibility (both overlap and complementary)
   */
  private static calculateSkillsMatch(user1: UserProfile, user2: UserProfile): number {
    if (user1.skills.length === 0 || user2.skills.length === 0) return 0.3

    const commonSkills = user1.skills.filter(skill =>
      user2.skills.includes(skill)
    ).length

    // Both overlapping skills and complementary skills are valuable
    const overlapScore = commonSkills / Math.min(user1.skills.length, user2.skills.length)

    // Complementary skills (if one has frontend skills, other has backend, etc.)
    const complementaryScore = this.calculateComplementarySkills(user1.skills, user2.skills)

    return Math.max(overlapScore, complementaryScore * 0.8)
  }

  /**
   * Calculate complementary skills
   */
  private static calculateComplementarySkills(skills1: string[], skills2: string[]): number {
    const complementaryPairs: Record<string, string[]> = {
      'Frontend': ['Backend', 'Database', 'API'],
      'Backend': ['Frontend', 'Mobile', 'UI/UX'],
      'Design': ['Development', 'Frontend'],
      'Marketing': ['Analytics', 'Data Science'],
      'Writing': ['Research', 'Analysis']
    }

    let complementaryCount = 0
    let totalPairs = 0

    skills1.forEach(skill1 => {
      const complements = complementaryPairs[skill1] || []
      complements.forEach(complement => {
        totalPairs++
        if (skills2.includes(complement)) {
          complementaryCount++
        }
      })
    })

    return totalPairs > 0 ? complementaryCount / totalPairs : 0
  }

  /**
   * Calculate study time compatibility
   */
  private static calculateStudyTimeMatch(user1: UserProfile, user2: UserProfile): number {
    if (user1.preferredStudyTime.length === 0 || user2.preferredStudyTime.length === 0) return 0.5

    const commonTimes = user1.preferredStudyTime.filter(time =>
      user2.preferredStudyTime.includes(time)
    ).length

    return commonTimes / Math.min(user1.preferredStudyTime.length, user2.preferredStudyTime.length)
  }

  /**
   * Calculate language compatibility
   */
  private static calculateLanguageMatch(user1: UserProfile, user2: UserProfile): number {
    if (user1.languages.length === 0 || user2.languages.length === 0) return 0.5

    const commonLanguages = user1.languages.filter(lang =>
      user2.languages.includes(lang)
    ).length

    return commonLanguages > 0 ? 1.0 : 0.3
  }

  /**
   * Get recommended matches for a user
   */
  static getRecommendedMatches(
    currentUser: UserProfile,
    allUsers: UserProfile[],
    excludeUserIds: string[] = [],
    limit: number = 10
  ): MatchingUser[] {

    // Filter out current user and excluded users
    const candidateUsers = allUsers.filter(user =>
      user.id !== currentUser.id &&
      !excludeUserIds.includes(user.id)
    )

    // Calculate match scores
    const scoredUsers = candidateUsers.map(user => {
      const matchData = this.calculateMatchScore(currentUser, user)
      return {
        ...user,
        matchScore: matchData.score,
        distance: this.calculateDistance(currentUser, user), // Placeholder
        isOnline: Math.random() > 0.5 // Placeholder - should come from real data
      }
    })

    // Sort by match score and return top matches
    return scoredUsers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
  }

  /**
   * Placeholder for distance calculation
   */
  private static calculateDistance(user1: UserProfile, user2: UserProfile): string {
    // This would integrate with a real geolocation service
    const distances = ['1.2 km', '2.1 km', '3.5 km', '5.8 km', '7.2 km']
    return distances[Math.floor(Math.random() * distances.length)]
  }
}
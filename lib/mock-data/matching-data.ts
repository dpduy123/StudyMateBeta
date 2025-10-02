import { prisma } from '@/lib/prisma'
import { getUniversityById, getMajorById } from '@/lib/data/universities'

/**
 * Mock data for matching system testing
 */

// Sample user data for matching
export const mockUsers = [
  {
    email: 'alice.johnson@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    university: 'hcmus',
    major: 'computer-science',
    year: 3,
    gpa: 3.8,
    bio: 'Passionate about AI and machine learning. Looking for study partners for advanced algorithms course.',
    interests: ['Machine Learning', 'Data Science', 'Python', 'Statistics', 'Research'],
    skills: ['Python', 'TensorFlow', 'SQL', 'R', 'Git'],
    studyGoals: ['Master ML algorithms', 'Publish research paper', 'Get internship at tech company'],
    preferredStudyTime: ['evening', 'weekend'],
    languages: ['English', 'Vietnamese'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'bob.smith@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    university: 'hcmus',
    major: 'computer-science',
    year: 2,
    gpa: 3.5,
    bio: 'Web development enthusiast. Love building full-stack applications and learning new technologies.',
    interests: ['Web Development', 'JavaScript', 'React', 'Node.js', 'Database Design'],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'CSS'],
    studyGoals: ['Build portfolio website', 'Learn advanced React', 'Get web dev job'],
    preferredStudyTime: ['morning', 'afternoon'],
    languages: ['English', 'Vietnamese'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'charlie.brown@example.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    university: 'hcmute',
    major: 'software-engineering',
    year: 4,
    gpa: 3.9,
    bio: 'Final year student focusing on software architecture and system design. Open to mentoring junior students.',
    interests: ['Software Architecture', 'System Design', 'DevOps', 'Cloud Computing', 'Leadership'],
    skills: ['Java', 'Spring Boot', 'Docker', 'AWS', 'System Design'],
    studyGoals: ['Get senior developer role', 'Mentor junior developers', 'Contribute to open source'],
    preferredStudyTime: ['morning', 'evening'],
    languages: ['English', 'Vietnamese', 'Japanese'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'diana.prince@example.com',
    firstName: 'Diana',
    lastName: 'Prince',
    university: 'hcmui',
    major: 'data-science',
    year: 2,
    gpa: 3.7,
    bio: 'Data science student with passion for analytics and visualization. Love working with big data and creating insights.',
    interests: ['Data Analysis', 'Statistics', 'Visualization', 'Business Intelligence', 'Research'],
    skills: ['Python', 'R', 'Tableau', 'SQL', 'Statistics'],
    studyGoals: ['Master data visualization', 'Work on real-world projects', 'Get data scientist role'],
    preferredStudyTime: ['afternoon', 'evening'],
    languages: ['English', 'Vietnamese', 'French'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'eve.adams@example.com',
    firstName: 'Eve',
    lastName: 'Adams',
    university: 'hcmus',
    major: 'cybersecurity',
    year: 3,
    gpa: 3.6,
    bio: 'Cybersecurity enthusiast. Passionate about ethical hacking and security research. Looking for study groups.',
    interests: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Cryptography', 'Digital Forensics'],
    skills: ['Python', 'Linux', 'Wireshark', 'Metasploit', 'Network Security'],
    studyGoals: ['Get security certifications', 'Participate in CTF competitions', 'Work in cybersecurity'],
    preferredStudyTime: ['evening', 'weekend'],
    languages: ['English', 'Vietnamese'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'frank.miller@example.com',
    firstName: 'Frank',
    lastName: 'Miller',
    university: 'hcmute',
    major: 'computer-science',
    year: 1,
    gpa: 3.2,
    bio: 'First year CS student. Eager to learn and make connections. Looking for study partners and mentors.',
    interests: ['Programming', 'Algorithms', 'Web Development', 'Mobile Apps', 'Gaming'],
    skills: ['C++', 'HTML', 'CSS', 'JavaScript', 'Problem Solving'],
    studyGoals: ['Master programming fundamentals', 'Build first app', 'Join coding club'],
    preferredStudyTime: ['afternoon', 'evening'],
    languages: ['English', 'Vietnamese'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'grace.lee@example.com',
    firstName: 'Grace',
    lastName: 'Lee',
    university: 'hcmui',
    major: 'artificial-intelligence',
    year: 4,
    gpa: 3.9,
    bio: 'AI research student working on NLP and computer vision. Published papers and looking for research collaborators.',
    interests: ['Natural Language Processing', 'Computer Vision', 'Deep Learning', 'Research', 'Academic Writing'],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Research'],
    studyGoals: ['Publish more papers', 'Get PhD admission', 'Contribute to AI research'],
    preferredStudyTime: ['morning', 'afternoon'],
    languages: ['English', 'Vietnamese', 'Chinese'],
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'henry.wilson@example.com',
    firstName: 'Henry',
    lastName: 'Wilson',
    university: 'hcmus',
    major: 'computer-science',
    year: 2,
    gpa: 3.4,
    bio: 'Mobile app developer. Love creating iOS and Android apps. Looking for team members for hackathons.',
    interests: ['Mobile Development', 'iOS', 'Android', 'UI/UX Design', 'Startups'],
    skills: ['Swift', 'Kotlin', 'React Native', 'Figma', 'Git'],
    studyGoals: ['Launch app on App Store', 'Start tech company', 'Learn advanced mobile dev'],
    preferredStudyTime: ['evening', 'weekend'],
    languages: ['English', 'Vietnamese'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'iris.chen@example.com',
    firstName: 'Iris',
    lastName: 'Chen',
    university: 'hcmute',
    major: 'software-engineering',
    year: 3,
    gpa: 3.8,
    bio: 'Full-stack developer with focus on backend systems. Love working with databases and APIs.',
    interests: ['Backend Development', 'Database Design', 'API Development', 'Microservices', 'DevOps'],
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs'],
    studyGoals: ['Master backend architecture', 'Learn cloud technologies', 'Get senior developer role'],
    preferredStudyTime: ['morning', 'afternoon'],
    languages: ['English', 'Vietnamese', 'Chinese'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'jack.davis@example.com',
    firstName: 'Jack',
    lastName: 'Davis',
    university: 'hcmus',
    major: 'computer-science',
    year: 1,
    gpa: 3.1,
    bio: 'New to programming but very motivated. Looking for study partners and mentors to help me learn.',
    interests: ['Programming Basics', 'Web Development', 'Gaming', 'Learning', 'Collaboration'],
    skills: ['HTML', 'CSS', 'JavaScript', 'Problem Solving', 'Teamwork'],
    studyGoals: ['Learn programming fundamentals', 'Build first website', 'Join study groups'],
    preferredStudyTime: ['afternoon', 'evening'],
    languages: ['English', 'Vietnamese'],
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face'
  }
]

// Sample matches data
export const mockMatches = [
  {
    senderId: 1, // Alice
    receiverId: 2, // Bob
    status: 'ACCEPTED',
    message: 'Hi Bob! I saw you\'re also into web development. Would love to study together!'
  },
  {
    senderId: 1, // Alice
    receiverId: 3, // Charlie
    status: 'PENDING',
    message: 'Your software architecture experience is impressive. Could you mentor me?'
  },
  {
    senderId: 2, // Bob
    receiverId: 4, // Diana
    status: 'ACCEPTED',
    message: 'Love your data science work! Let\'s collaborate on a project.'
  },
  {
    senderId: 3, // Charlie
    receiverId: 5, // Eve
    status: 'ACCEPTED',
    message: 'Cybersecurity is fascinating. Would love to learn from you.'
  },
  {
    senderId: 4, // Diana
    receiverId: 6, // Frank
    status: 'PENDING',
    message: 'I can help you with programming fundamentals. Let\'s study together!'
  },
  {
    senderId: 5, // Eve
    receiverId: 7, // Grace
    status: 'ACCEPTED',
    message: 'Your AI research is amazing! Let\'s discuss security in AI systems.'
  },
  {
    senderId: 6, // Frank
    receiverId: 8, // Henry
    status: 'PENDING',
    message: 'Mobile development sounds cool! Can you teach me?'
  },
  {
    senderId: 7, // Grace
    receiverId: 9, // Iris
    status: 'ACCEPTED',
    message: 'Your backend skills would be perfect for our AI project.'
  },
  {
    senderId: 8, // Henry
    receiverId: 10, // Jack
    status: 'PENDING',
    message: 'I can help you learn programming! Let\'s start with the basics.'
  },
  {
    senderId: 9, // Iris
    receiverId: 1, // Alice
    status: 'ACCEPTED',
    message: 'Your ML knowledge would be great for our backend optimization project.'
  }
]

// Sample messages data
export const mockMessages = [
  {
    senderId: 1,
    receiverId: 2,
    content: 'Hey Bob! Thanks for accepting my match request. I\'d love to study web development together.',
    type: 'TEXT'
  },
  {
    senderId: 2,
    receiverId: 1,
    content: 'Hi Alice! Absolutely, I\'m working on a React project right now. Would love to collaborate!',
    type: 'TEXT'
  },
  {
    senderId: 1,
    receiverId: 2,
    content: 'Perfect! I\'m learning React too. When are you usually free to study?',
    type: 'TEXT'
  },
  {
    senderId: 2,
    receiverId: 1,
    content: 'I\'m free most evenings. How about we start with a study session this weekend?',
    type: 'TEXT'
  },
  {
    senderId: 3,
    receiverId: 5,
    content: 'Hi Eve! Your cybersecurity background is impressive. I\'d love to learn about security best practices.',
    type: 'TEXT'
  },
  {
    senderId: 5,
    receiverId: 3,
    content: 'Thanks Charlie! I\'d be happy to share my knowledge. Security is crucial in software development.',
    type: 'TEXT'
  }
]

// Sample rooms data
export const mockRooms = [
  {
    name: 'CS Study Group',
    description: 'General computer science study group for all CS students',
    type: 'STUDY_GROUP',
    topic: 'Computer Science',
    maxMembers: 20,
    isPrivate: false,
    ownerId: 1
  },
  {
    name: 'Web Development Workshop',
    description: 'Advanced web development techniques and best practices',
    type: 'STUDY_GROUP',
    topic: 'Web Development',
    maxMembers: 15,
    isPrivate: false,
    ownerId: 2
  },
  {
    name: 'AI Research Discussion',
    description: 'Discussion group for AI research and machine learning',
    type: 'DISCUSSION',
    topic: 'Artificial Intelligence',
    maxMembers: 10,
    isPrivate: false,
    ownerId: 7
  },
  {
    name: 'Cybersecurity Help Session',
    description: 'Help session for cybersecurity concepts and practices',
    type: 'HELP_SESSION',
    topic: 'Cybersecurity',
    maxMembers: 12,
    isPrivate: false,
    ownerId: 5
  }
]

// Sample badges data
export const mockBadges = [
  {
    name: 'First Match',
    description: 'Sent your first match request',
    type: 'NETWORK_PRO',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    requirement: 'Send your first match request to another user'
  },
  {
    name: 'Study Buddy',
    description: 'Successfully matched with 5 study partners',
    type: 'STUDY_INFLUENCER',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    requirement: 'Have 5 or more successful matches'
  },
  {
    name: 'Chat Master',
    description: 'Sent 100 messages',
    type: 'CHAT_MASTER',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    requirement: 'Send 100 messages to other users'
  },
  {
    name: 'Mentor',
    description: 'Helped 3 or more junior students',
    type: 'MENTOR',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    requirement: 'Help 3 or more junior students with their studies'
  },
  {
    name: 'Early Adopter',
    description: 'Joined the platform in the first month',
    type: 'EARLY_ADOPTER',
    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    requirement: 'Join the platform within the first month of launch'
  }
]

// Sample achievements data
export const mockAchievements = [
  {
    name: 'Social Butterfly',
    description: 'Connect with 10 different users',
    category: 'SOCIAL',
    points: 100,
    requirement: '{"type": "connections", "count": 10}'
  },
  {
    name: 'Study Marathon',
    description: 'Study for 50 hours with matched partners',
    category: 'ACADEMIC',
    points: 200,
    requirement: '{"type": "study_hours", "hours": 50}'
  },
  {
    name: 'Helpful Mentor',
    description: 'Help 5 students with their studies',
    category: 'LEADERSHIP',
    points: 150,
    requirement: '{"type": "mentoring", "students": 5}'
  },
  {
    name: 'Active Participant',
    description: 'Participate in 20 study sessions',
    category: 'ENGAGEMENT',
    points: 120,
    requirement: '{"type": "study_sessions", "count": 20}'
  }
]

// Sample ratings data
export const mockRatings = [
  {
    giverId: 2,
    receiverId: 1,
    rating: 5,
    comment: 'Alice is an amazing study partner! Very knowledgeable and patient.',
    context: 'study_session'
  },
  {
    giverId: 1,
    receiverId: 2,
    rating: 4,
    comment: 'Bob is great at explaining concepts. Very helpful!',
    context: 'study_session'
  },
  {
    giverId: 5,
    receiverId: 3,
    rating: 5,
    comment: 'Charlie is an excellent mentor. Learned a lot from him.',
    context: 'mentoring'
  },
  {
    giverId: 3,
    receiverId: 5,
    rating: 5,
    comment: 'Eve is incredibly knowledgeable about cybersecurity. Great teacher!',
    context: 'study_session'
  }
]

/**
 * Create mock data for testing matching system
 */
export async function createMockMatchingData() {
  console.log('🎭 Creating mock matching data...')

  try {
    // Create users
    console.log('👥 Creating mock users...')
    const createdUsers = []
    
    for (const userData of mockUsers) {
      const user = await prisma.user.create({
        data: {
          ...userData,
          // Set some random metrics for realistic data
          responseRate: Math.random() * 0.4 + 0.6, // 60-100%
          averageRating: Math.random() * 1 + 4, // 4-5 stars
          totalMatches: Math.floor(Math.random() * 20) + 5, // 5-25 matches
          successfulMatches: Math.floor(Math.random() * 15) + 3, // 3-18 successful
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      })
      createdUsers.push(user)
    }

    console.log(`✅ Created ${createdUsers.length} users`)

    // Create matches
    console.log('💕 Creating mock matches...')
    const createdMatches = []
    
    for (const matchData of mockMatches) {
      const sender = createdUsers[matchData.senderId - 1]
      const receiver = createdUsers[matchData.receiverId - 1]
      
      if (sender && receiver) {
        const match = await prisma.match.create({
          data: {
            senderId: sender.id,
            receiverId: receiver.id,
            status: matchData.status as any,
            message: matchData.message,
            respondedAt: matchData.status === 'ACCEPTED' ? new Date() : null
          }
        })
        createdMatches.push(match)
      }
    }

    console.log(`✅ Created ${createdMatches.length} matches`)

    // Create messages
    console.log('💬 Creating mock messages...')
    const createdMessages = []
    
    for (const messageData of mockMessages) {
      const sender = createdUsers[messageData.senderId - 1]
      const receiver = createdUsers[messageData.receiverId - 1]
      
      if (sender && receiver) {
        const message = await prisma.message.create({
          data: {
            senderId: sender.id,
            receiverId: receiver.id,
            content: messageData.content,
            type: messageData.type as any,
            isRead: Math.random() > 0.3 // 70% chance of being read
          }
        })
        createdMessages.push(message)
      }
    }

    console.log(`✅ Created ${createdMessages.length} messages`)

    // Create rooms
    console.log('🏠 Creating mock rooms...')
    const createdRooms = []
    
    for (const roomData of mockRooms) {
      const owner = createdUsers[roomData.ownerId - 1]
      
      if (owner) {
        const room = await prisma.room.create({
          data: {
            ...roomData,
            type: roomData.type as any, // Cast to enum type
            ownerId: owner.id,
            lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours
          }
        })
        createdRooms.push(room)
      }
    }

    console.log(`✅ Created ${createdRooms.length} rooms`)

    // Create badges
    console.log('🏆 Creating mock badges...')
    const createdBadges = []
    
    for (const badgeData of mockBadges) {
      const badge = await prisma.badge.create({
        data: {
          ...badgeData,
          type: badgeData.type as any // Cast to enum type
        }
      })
      createdBadges.push(badge)
    }

    console.log(`✅ Created ${createdBadges.length} badges`)

    // Create achievements
    console.log('🎯 Creating mock achievements...')
    const createdAchievements = []
    
    for (const achievementData of mockAchievements) {
      const achievement = await prisma.achievement.create({
        data: {
          ...achievementData,
          category: achievementData.category as any // Cast to enum type
        }
      })
      createdAchievements.push(achievement)
    }

    console.log(`✅ Created ${createdAchievements.length} achievements`)

    // Create ratings
    console.log('⭐ Creating mock ratings...')
    const createdRatings = []
    
    for (const ratingData of mockRatings) {
      const giver = createdUsers[ratingData.giverId - 1]
      const receiver = createdUsers[ratingData.receiverId - 1]
      
      if (giver && receiver) {
        const rating = await prisma.rating.create({
          data: {
            giverId: giver.id,
            receiverId: receiver.id,
            rating: ratingData.rating,
            comment: ratingData.comment,
            context: ratingData.context
          }
        })
        createdRatings.push(rating)
      }
    }

    console.log(`✅ Created ${createdRatings.length} ratings`)

    // Create user activities
    console.log('📊 Creating mock user activities...')
    const activities = [
      'login', 'match_sent', 'match_received', 'message_sent', 'room_joined',
      'profile_updated', 'study_session_started', 'study_session_completed'
    ]
    
    for (let i = 0; i < 50; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      const activity = activities[Math.floor(Math.random() * activities.length)]
      
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: activity,
          metadata: {
            timestamp: new Date(),
            additionalInfo: `Mock activity ${i + 1}`
          }
        }
      })
    }

    console.log('✅ Created 50 user activities')

    // Create daily metrics
    console.log('📈 Creating mock daily metrics...')
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    await prisma.dailyMetrics.create({
      data: {
        date: yesterday,
        totalUsers: createdUsers.length,
        activeUsers: Math.floor(createdUsers.length * 0.8),
        newUsers: Math.floor(createdUsers.length * 0.1),
        totalMatches: createdMatches.length,
        successfulMatches: createdMatches.filter(m => m.status === 'ACCEPTED').length,
        totalMessages: createdMessages.length,
        totalRooms: createdRooms.length,
        activeRooms: Math.floor(createdRooms.length * 0.7)
      }
    })

    console.log('✅ Created daily metrics')

    console.log('\n🎉 Mock matching data created successfully!')
    console.log(`📊 Summary:`)
    console.log(`   👥 Users: ${createdUsers.length}`)
    console.log(`   💕 Matches: ${createdMatches.length}`)
    console.log(`   💬 Messages: ${createdMessages.length}`)
    console.log(`   🏠 Rooms: ${createdRooms.length}`)
    console.log(`   🏆 Badges: ${createdBadges.length}`)
    console.log(`   🎯 Achievements: ${createdAchievements.length}`)
    console.log(`   ⭐ Ratings: ${createdRatings.length}`)

    return {
      users: createdUsers,
      matches: createdMatches,
      messages: createdMessages,
      rooms: createdRooms,
      badges: createdBadges,
      achievements: createdAchievements,
      ratings: createdRatings
    }

  } catch (error) {
    console.error('❌ Error creating mock data:', error)
    throw error
  }
}

/**
 * Clear all mock data
 */
export async function clearMockData() {
  console.log('🧹 Clearing mock data...')
  
  try {
    // Delete in reverse order to avoid foreign key constraints
    await prisma.rating.deleteMany()
    await prisma.userAchievement.deleteMany()
    await prisma.userBadge.deleteMany()
    await prisma.roomMessage.deleteMany()
    await prisma.roomMember.deleteMany()
    await prisma.message.deleteMany()
    await prisma.match.deleteMany()
    await prisma.userActivity.deleteMany()
    await prisma.dailyMetrics.deleteMany()
    await prisma.room.deleteMany()
    await prisma.achievement.deleteMany()
    await prisma.badge.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Mock data cleared successfully')
  } catch (error) {
    console.error('❌ Error clearing mock data:', error)
    throw error
  }
}

# 🎭 **Mock Data Guide for Matching System**

Hướng dẫn sử dụng mock data để test tính năng matching trong StudyMate.

## 🚀 **Quick Start**

### **1. Via API (Recommended)**
```bash
# Create mock data
POST /api/seed/matching-data?action=create

# Clear existing data first, then create
POST /api/seed/matching-data?action=create&clear=true

# Clear all mock data
POST /api/seed/matching-data?action=clear

# Check current data counts
GET /api/seed/matching-data
```

### **2. Via Admin Dashboard**
- Navigate to Admin Panel
- Go to "Mock Data Manager"
- Click "Create Mock Data" or "Clear & Create New"
- Monitor data counts in real-time

### **3. Via Command Line**
```bash
# Create mock data
npx tsx scripts/seed-matching-data.ts

# Clear existing data first, then create
npx tsx scripts/seed-matching-data.ts --clear
```

## 📊 **Mock Data Overview**

### **Users (10 Profiles)**
Diverse student profiles with realistic academic backgrounds:

#### **Computer Science Students**
- **Alice Johnson** (HCMUS, Year 3, GPA 3.8)
  - Interests: Machine Learning, Data Science, Python
  - Skills: Python, TensorFlow, SQL, R, Git
  - Goals: Master ML algorithms, Publish research paper

- **Bob Smith** (HCMUS, Year 2, GPA 3.5)
  - Interests: Web Development, JavaScript, React
  - Skills: JavaScript, React, Node.js, MongoDB, CSS
  - Goals: Build portfolio website, Learn advanced React

- **Charlie Brown** (HCMUTE, Year 4, GPA 3.9)
  - Interests: Software Architecture, System Design, DevOps
  - Skills: Java, Spring Boot, Docker, AWS, System Design
  - Goals: Get senior developer role, Mentor junior developers

#### **Data Science Students**
- **Diana Prince** (HCMUI, Year 2, GPA 3.7)
  - Interests: Data Analysis, Statistics, Visualization
  - Skills: Python, R, Tableau, SQL, Statistics
  - Goals: Master data visualization, Work on real-world projects

#### **Cybersecurity Students**
- **Eve Adams** (HCMUS, Year 3, GPA 3.6)
  - Interests: Cybersecurity, Ethical Hacking, Network Security
  - Skills: Python, Linux, Wireshark, Metasploit, Network Security
  - Goals: Get security certifications, Participate in CTF competitions

#### **AI Research Students**
- **Grace Lee** (HCMUI, Year 4, GPA 3.9)
  - Interests: NLP, Computer Vision, Deep Learning, Research
  - Skills: Python, TensorFlow, PyTorch, NLP, Research
  - Goals: Publish more papers, Get PhD admission

#### **Mobile Development Students**
- **Henry Wilson** (HCMUS, Year 2, GPA 3.4)
  - Interests: Mobile Development, iOS, Android, UI/UX Design
  - Skills: Swift, Kotlin, React Native, Figma, Git
  - Goals: Launch app on App Store, Start tech company

#### **Backend Development Students**
- **Iris Chen** (HCMUTE, Year 3, GPA 3.8)
  - Interests: Backend Development, Database Design, API Development
  - Skills: Node.js, PostgreSQL, Redis, Docker, REST APIs
  - Goals: Master backend architecture, Learn cloud technologies

#### **Beginner Students**
- **Frank Miller** (HCMUTE, Year 1, GPA 3.2)
  - Interests: Programming, Algorithms, Web Development
  - Skills: C++, HTML, CSS, JavaScript, Problem Solving
  - Goals: Master programming fundamentals, Build first app

- **Jack Davis** (HCMUS, Year 1, GPA 3.1)
  - Interests: Programming Basics, Web Development, Gaming
  - Skills: HTML, CSS, JavaScript, Problem Solving, Teamwork
  - Goals: Learn programming fundamentals, Build first website

### **Matches (10 Connections)**
Realistic match scenarios with different statuses:

#### **Accepted Matches**
- Alice ↔ Bob (Web Development collaboration)
- Bob ↔ Diana (Data Science project)
- Charlie ↔ Eve (Cybersecurity mentoring)
- Eve ↔ Grace (AI Security discussion)
- Grace ↔ Iris (Backend AI project)

#### **Pending Matches**
- Alice → Charlie (Software architecture mentoring)
- Diana → Frank (Programming fundamentals help)
- Henry → Jack (Mobile development teaching)

#### **Cross-University Connections**
- HCMUS ↔ HCMUTE ↔ HCMUI connections
- Mentor-mentee relationships
- Study group formations

### **Messages (6 Conversations)**
Natural conversation flows:

#### **Alice ↔ Bob**
- Web development collaboration discussion
- Study session planning
- Technology sharing

#### **Charlie ↔ Eve**
- Cybersecurity knowledge exchange
- Security best practices discussion
- Mentoring relationship

#### **Additional Conversations**
- Study group invitations
- Project collaboration requests
- Knowledge sharing discussions

### **Study Rooms (4 Rooms)**
Diverse study environments:

#### **CS Study Group**
- General computer science topics
- 20 member capacity
- Open to all CS students

#### **Web Development Workshop**
- Advanced web development techniques
- 15 member capacity
- Led by experienced developers

#### **AI Research Discussion**
- AI research and machine learning
- 10 member capacity
- Research-focused discussions

#### **Cybersecurity Help Session**
- Cybersecurity concepts and practices
- 12 member capacity
- Help and mentoring focused

### **Achievement System**
Comprehensive gamification:

#### **Badges (5 Types)**
- **First Match**: Send first match request
- **Study Buddy**: 5+ successful matches
- **Chat Master**: 100+ messages sent
- **Mentor**: Help 3+ junior students
- **Early Adopter**: Join in first month

#### **Achievements (4 Categories)**
- **Social**: Connect with 10+ users
- **Academic**: Study 50+ hours with partners
- **Leadership**: Help 5+ students
- **Engagement**: Participate in 20+ study sessions

### **Rating System (4 Ratings)**
Quality feedback system:
- Alice ↔ Bob: 5-star study partnership
- Bob ↔ Alice: 4-star helpful collaboration
- Charlie ↔ Eve: 5-star mentoring relationship
- Eve ↔ Charlie: 5-star knowledge sharing

## 🎯 **Testing Scenarios**

### **1. Basic Matching Flow**
1. User logs in as Alice
2. Navigate to Discover page
3. See Bob, Charlie, Diana as potential matches
4. Send match request to Bob
5. Bob accepts the match
6. Start conversation

### **2. Cross-University Matching**
1. Test matching between HCMUS, HCMUTE, HCMUI students
2. Verify university diversity in suggestions
3. Check matching algorithm preferences

### **3. Study Room Participation**
1. Join "CS Study Group" room
2. Participate in discussions
3. Test room messaging system
4. Verify member management

### **4. Achievement Progression**
1. Send first match (First Match badge)
2. Get 5 successful matches (Study Buddy badge)
3. Send 100 messages (Chat Master badge)
4. Help junior students (Mentor badge)

### **5. Rating System**
1. Complete study session with match
2. Rate the experience
3. Verify rating appears in profiles
4. Check rating impact on matching

## 🔧 **Data Management**

### **Create Fresh Data**
```typescript
import { createMockMatchingData } from '@/lib/mock-data/matching-data'

const mockData = await createMockMatchingData()
console.log('Created:', mockData)
```

### **Clear All Data**
```typescript
import { clearMockData } from '@/lib/mock-data/matching-data'

await clearMockData()
console.log('All mock data cleared')
```

### **Check Data Counts**
```typescript
import { prisma } from '@/lib/prisma'

const counts = {
  users: await prisma.user.count(),
  matches: await prisma.match.count(),
  messages: await prisma.message.count(),
  rooms: await prisma.room.count()
}
```

## 📈 **Analytics & Insights**

### **User Activity Patterns**
- Login frequency
- Match sending behavior
- Message engagement
- Room participation

### **Matching Success Rates**
- Match acceptance rates
- Conversation initiation
- Study session completion
- Long-term partnerships

### **Academic Focus Areas**
- Most popular study topics
- Cross-university collaboration
- Skill development patterns
- Career goal alignment

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Data Not Appearing**
```bash
# Check if data was created
GET /api/seed/matching-data

# Recreate if needed
POST /api/seed/matching-data?action=create&clear=true
```

#### **2. Foreign Key Errors**
```bash
# Clear all data and recreate
POST /api/seed/matching-data?action=clear
POST /api/seed/matching-data?action=create
```

#### **3. Performance Issues**
- Mock data includes 10 users, 10 matches, 6 messages
- Should not impact production performance
- Clear data when not needed

### **Data Validation**
```typescript
// Verify data integrity
const users = await prisma.user.findMany({
  include: {
    sentMatches: true,
    receivedMatches: true,
    sentMessages: true,
    receivedMessages: true
  }
})

console.log('Users with relationships:', users.length)
```

## 🎯 **Best Practices**

### **Development**
- Use mock data for local development
- Clear data between test runs
- Verify data relationships

### **Testing**
- Test with different user profiles
- Verify matching algorithm accuracy
- Check cross-university connections

### **Production**
- Never use mock data in production
- Clear mock data before deployment
- Use real user data for analytics

---

**🎭 Mock Data System is ready for testing!**

The system provides comprehensive, realistic data for testing all aspects of the matching system including user profiles, matches, conversations, study rooms, achievements, and ratings. 🚀

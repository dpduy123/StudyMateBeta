# 🎭 **Mock Data System for StudyMate Matching**

Comprehensive mock data system for testing the StudyMate matching functionality with realistic user profiles, matches, conversations, and study rooms.

## 🚀 **Quick Start**

### **1. Admin Dashboard (Recommended)**
1. Navigate to Admin Panel
2. Go to "Mock Data Manager"
3. Click "Create Mock Data"
4. Wait for completion
5. Start testing matching system

### **2. API Endpoints**
```bash
# Create mock data
POST /api/seed/matching-data?action=create

# Clear and create fresh data
POST /api/seed/matching-data?action=create&clear=true

# Clear all mock data
POST /api/seed/matching-data?action=clear

# Check data counts
GET /api/seed/matching-data
```

### **3. Command Line**
```bash
# Create mock data
npx tsx scripts/seed-matching-data.ts

# Clear existing data first, then create
npx tsx scripts/seed-matching-data.ts --clear

# Test mock data system
npx tsx scripts/test-mock-data.ts

# Run performance test
npx tsx scripts/test-mock-data.ts --performance
```

## 📊 **Mock Data Overview**

### **10 User Profiles**
Diverse student profiles with realistic academic backgrounds:

| Name | University | Major | Year | GPA | Focus Area |
|------|------------|-------|------|-----|------------|
| Alice Johnson | HCMUS | CS | 3 | 3.8 | ML/Data Science |
| Bob Smith | HCMUS | CS | 2 | 3.5 | Web Development |
| Charlie Brown | HCMUTE | SE | 4 | 3.9 | Software Architecture |
| Diana Prince | HCMUI | DS | 2 | 3.7 | Data Science |
| Eve Adams | HCMUS | CS | 3 | 3.6 | Cybersecurity |
| Frank Miller | HCMUTE | CS | 1 | 3.2 | Beginner Programmer |
| Grace Lee | HCMUI | AI | 4 | 3.9 | AI Research |
| Henry Wilson | HCMUS | CS | 2 | 3.4 | Mobile Development |
| Iris Chen | HCMUTE | SE | 3 | 3.8 | Backend Development |
| Jack Davis | HCMUS | CS | 1 | 3.1 | Beginner Programmer |

### **10 Match Connections**
- **5 Accepted matches** with collaboration discussions
- **3 Pending matches** with mentoring requests
- **2 Cross-university connections** (HCMUS ↔ HCMUTE ↔ HCMUI)
- **Realistic match messages** and conversation starters

### **6 Conversation Threads**
Natural message flows including:
- Study session planning
- Technology knowledge sharing
- Collaboration invitations
- Mentoring discussions

### **4 Study Rooms**
- **CS Study Group** (20 members, General CS topics)
- **Web Development Workshop** (15 members, Advanced techniques)
- **AI Research Discussion** (10 members, Research-focused)
- **Cybersecurity Help Session** (12 members, Help and mentoring)

### **Achievement System**
- **5 Badges**: First Match, Study Buddy, Chat Master, Mentor, Early Adopter
- **4 Achievement Categories**: Social, Academic, Leadership, Engagement
- **4 User Ratings**: Quality feedback system with comments

## 🎯 **Testing Scenarios**

### **Basic Matching Flow**
1. Login as Alice (alice.johnson@example.com)
2. Navigate to Discover page
3. See Bob, Charlie, Diana as potential matches
4. Send match request to Bob
5. Bob accepts → Start conversation

### **Cross-University Matching**
1. Test matching between HCMUS, HCMUTE, HCMUI students
2. Verify university diversity in suggestions
3. Check matching algorithm preferences

### **Study Room Participation**
1. Join "CS Study Group" room
2. Participate in discussions
3. Test messaging system
4. Verify member management

### **Achievement Progression**
1. Send first match → "First Match" badge
2. Get 5 successful matches → "Study Buddy" badge
3. Send 100 messages → "Chat Master" badge
4. Help junior students → "Mentor" badge

## 🔧 **Data Management**

### **Create Mock Data**
```typescript
import { createMockMatchingData } from '@/lib/mock-data'

const mockData = await createMockMatchingData()
console.log('Created:', mockData)
```

### **Clear Mock Data**
```typescript
import { clearMockData } from '@/lib/mock-data'

await clearMockData()
console.log('All mock data cleared')
```

### **Test Mock Data**
```typescript
import { quickMockDataTest } from '@/lib/mock-data'

const results = await quickMockDataTest()
console.log('Test results:', results)
```

## 📈 **Analytics & Insights**

### **User Activity Patterns**
- Login frequency tracking
- Match sending behavior
- Message engagement rates
- Room participation metrics

### **Matching Success Rates**
- Match acceptance rates by user
- Conversation initiation success
- Study session completion rates
- Long-term partnership formation

### **Academic Focus Areas**
- Most popular study topics
- Cross-university collaboration patterns
- Skill development trajectories
- Career goal alignment analysis

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Data Not Appearing**
```bash
# Check if data was created
curl "http://localhost:3000/api/seed/matching-data"

# Recreate if needed
curl -X POST "http://localhost:3000/api/seed/matching-data?action=create&clear=true"
```

#### **Foreign Key Errors**
```bash
# Clear all data and recreate
curl -X POST "http://localhost:3000/api/seed/matching-data?action=clear"
curl -X POST "http://localhost:3000/api/seed/matching-data?action=create"
```

#### **Performance Issues**
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

## 📁 **File Structure**

```
lib/mock-data/
├── matching-data.ts          # Core mock data generator
├── test-mock-data.ts         # Test utilities
└── index.ts                 # Exports

app/api/seed/matching-data/
└── route.ts                 # API endpoints

components/admin/
└── MockDataManager.tsx      # Admin dashboard

scripts/
├── seed-matching-data.ts    # CLI script
└── test-mock-data.ts        # Test script

docs/
├── MOCK_DATA_GUIDE.md       # Complete guide
└── MOCK_DATA_QUICK_START.md # Quick start guide
```

## 🚀 **Next Steps**

1. **Create mock data** using your preferred method
2. **Test matching flow** with different user profiles
3. **Verify cross-university** connections work
4. **Test study rooms** and messaging
5. **Check achievement** progression
6. **Analyze matching** algorithm performance
7. **Clear data** when done testing

## 📊 **Data Summary**

| Data Type | Count | Description |
|-----------|-------|-------------|
| Users | 10 | Diverse academic profiles |
| Matches | 10 | Various connection statuses |
| Messages | 6 | Natural conversation flows |
| Rooms | 4 | Different study topics |
| Badges | 5 | Achievement types |
| Achievements | 4 | Progress categories |
| Ratings | 4 | Quality feedback |
| Activities | 50 | User behavior tracking |

---

**🎭 Mock Data System is ready for testing!**

The system provides comprehensive, realistic data for testing all aspects of the matching system including user profiles, matches, conversations, study rooms, achievements, and ratings. 🚀

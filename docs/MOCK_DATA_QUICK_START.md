# 🚀 **Quick Start - Mock Data for Matching**

Hướng dẫn nhanh để sử dụng mock data cho testing matching system.

## ⚡ **1. Quick Setup**

### **Via Admin Dashboard (Easiest)**
1. Navigate to Admin Panel
2. Go to "Mock Data Manager"
3. Click "Create Mock Data"
4. Wait for completion
5. Check data counts in dashboard

### **Via API**
```bash
# Create mock data
curl -X POST "http://localhost:3000/api/seed/matching-data?action=create"

# Clear and create fresh data
curl -X POST "http://localhost:3000/api/seed/matching-data?action=create&clear=true"

# Clear all mock data
curl -X POST "http://localhost:3000/api/seed/matching-data?action=clear"
```

### **Via Command Line**
```bash
# Create mock data
npx tsx scripts/seed-matching-data.ts

# Clear existing data first, then create
npx tsx scripts/seed-matching-data.ts --clear
```

## 📊 **2. What You Get**

### **10 User Profiles**
- **Alice Johnson** (HCMUS, CS, Year 3) - ML/Data Science
- **Bob Smith** (HCMUS, CS, Year 2) - Web Development
- **Charlie Brown** (HCMUTE, SE, Year 4) - Software Architecture
- **Diana Prince** (HCMUI, DS, Year 2) - Data Science
- **Eve Adams** (HCMUS, CS, Year 3) - Cybersecurity
- **Frank Miller** (HCMUTE, CS, Year 1) - Beginner Programmer
- **Grace Lee** (HCMUI, AI, Year 4) - AI Research
- **Henry Wilson** (HCMUS, CS, Year 2) - Mobile Development
- **Iris Chen** (HCMUTE, SE, Year 3) - Backend Development
- **Jack Davis** (HCMUS, CS, Year 1) - Beginner Programmer

### **10 Match Connections**
- 5 **Accepted** matches
- 3 **Pending** matches
- 2 **Cross-university** connections
- Realistic match messages

### **6 Conversation Threads**
- Alice ↔ Bob (Web Development)
- Charlie ↔ Eve (Cybersecurity)
- Diana ↔ Frank (Programming Help)
- Grace ↔ Iris (AI Project)
- Henry ↔ Jack (Mobile Development)
- Study session planning discussions

### **4 Study Rooms**
- **CS Study Group** (20 members, General CS)
- **Web Development Workshop** (15 members, Advanced Web)
- **AI Research Discussion** (10 members, AI Research)
- **Cybersecurity Help Session** (12 members, Security Help)

### **Achievement System**
- **5 Badges**: First Match, Study Buddy, Chat Master, Mentor, Early Adopter
- **4 Achievement Categories**: Social, Academic, Leadership, Engagement
- **4 User Ratings**: Quality feedback system

## 🎯 **3. Testing Scenarios**

### **Basic Matching Flow**
1. Login as Alice (alice.johnson@example.com)
2. Go to Discover page
3. See Bob, Charlie, Diana as potential matches
4. Send match request to Bob
5. Bob accepts → Start conversation

### **Cross-University Matching**
1. Test matching between HCMUS, HCMUTE, HCMUI students
2. Verify university diversity in suggestions
3. Check algorithm preferences

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

## 🔧 **4. Data Management**

### **Check Current Data**
```bash
# Get data counts
curl "http://localhost:3000/api/seed/matching-data"
```

### **Clear All Data**
```bash
# Clear mock data
curl -X POST "http://localhost:3000/api/seed/matching-data?action=clear"
```

### **Programmatic Access**
```typescript
import { createMockMatchingData, clearMockData } from '@/lib/mock-data'

// Create mock data
const mockData = await createMockMatchingData()

// Clear mock data
await clearMockData()
```

## 📈 **5. Analytics & Insights**

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
- Cross-university collaboration
- Skill development patterns
- Career goal alignment

## 🚨 **6. Troubleshooting**

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

## 🎯 **7. Best Practices**

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

## 📊 **8. Data Summary**

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

## 🚀 **9. Next Steps**

1. **Create mock data** using your preferred method
2. **Test matching flow** with different user profiles
3. **Verify cross-university** connections work
4. **Test study rooms** and messaging
5. **Check achievement** progression
6. **Analyze matching** algorithm performance
7. **Clear data** when done testing

---

**🎭 Mock Data System is ready for testing!**

Start with the admin dashboard for the easiest setup, then explore the matching system with realistic data. 🚀

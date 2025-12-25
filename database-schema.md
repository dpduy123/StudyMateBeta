# StudyMate Database Schema Overview

## Entity Relationship Diagram

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'36px', 'fontFamily':'arial'}}}%%
erDiagram
    User ||--o{ Match : "sends/receives"
    User ||--o{ Message : "sends/receives"
    User ||--o{ RoomMessage : "sends"
    User ||--o{ Room : "owns"
    User ||--o{ RoomMember : "joins"
    User ||--o{ UserBadge : "earns"
    User ||--o{ UserAchievement : "achieves"
    User ||--o{ Rating : "gives/receives"
    User ||--o{ Notification : "receives"
    User ||--o{ MessageReaction : "reacts"
    User ||--o{ RoomMessageReaction : "reacts"

    Room ||--o{ RoomMember : "has"
    Room ||--o{ RoomMessage : "contains"

    Message ||--o{ MessageReaction : "has"
    Message ||--o| Message : "replies-to"

    RoomMessage ||--o{ RoomMessageReaction : "has"
    RoomMessage ||--o| RoomMessage : "replies-to"

    Badge ||--o{ UserBadge : "awarded"
    Achievement ||--o{ UserAchievement : "tracked"

    User {
        string id PK
        string email UK
        string username UK
        string firstName
        string lastName
        string avatar
        string bio
        string university
        string major
        int year
        float gpa
        enum status
        enum subscriptionTier
        array interests
        array skills
        array studyGoals
        array preferredStudyTime
        array languages
        boolean isProfilePublic
        boolean allowMessages
        boolean allowCalls
        boolean profileCompleted
        float responseRate
        float averageRating
        int totalMatches
        int successfulMatches
        datetime createdAt
        datetime updatedAt
        datetime lastActive
    }

    Match {
        string id PK
        string senderId FK
        string receiverId FK
        enum status
        string message
        datetime createdAt
        datetime updatedAt
        datetime respondedAt
    }

    Message {
        string id PK
        string senderId FK
        string receiverId FK
        enum type
        string content
        string fileUrl
        string fileName
        int fileSize
        string replyToId FK
        boolean isEdited
        datetime editedAt
        boolean isRead
        datetime createdAt
        datetime updatedAt
        datetime readAt
    }

    MessageReaction {
        string id PK
        string messageId FK
        string userId FK
        string emoji
        datetime createdAt
    }

    Room {
        string id PK
        string name
        string description
        enum type
        string topic
        int maxMembers
        boolean isPrivate
        string password
        string ownerId FK
        boolean allowVideo
        boolean allowVoice
        boolean allowText
        boolean allowScreenShare
        datetime createdAt
        datetime updatedAt
        datetime lastActivity
    }

    RoomMember {
        string id PK
        string roomId FK
        string userId FK
        datetime joinedAt
        datetime leftAt
        boolean isMuted
        boolean isBanned
    }

    RoomMessage {
        string id PK
        string roomId FK
        string senderId FK
        enum type
        string content
        string fileUrl
        string fileName
        int fileSize
        string replyToId FK
        boolean isEdited
        datetime editedAt
        datetime createdAt
        datetime updatedAt
    }

    RoomMessageReaction {
        string id PK
        string messageId FK
        string userId FK
        string emoji
        datetime createdAt
    }

    Badge {
        string id PK
        string name UK
        string description
        enum type
        string icon
        string requirement
        boolean isActive
        datetime createdAt
    }

    UserBadge {
        string id PK
        string userId FK
        string badgeId FK
        datetime earnedAt
    }

    Achievement {
        string id PK
        string name UK
        string description
        enum category
        int points
        string requirement
        boolean isActive
        datetime createdAt
    }

    UserAchievement {
        string id PK
        string userId FK
        string achievementId FK
        float progress
        datetime completedAt
    }

    Rating {
        string id PK
        string giverId FK
        string receiverId FK
        int rating
        string comment
        string context
        datetime createdAt
    }

    Notification {
        string id PK
        string userId FK
        enum type
        string title
        string message
        boolean isRead
        string relatedUserId
        string relatedMatchId
        string relatedMessageId
        string relatedRoomId
        json metadata
        datetime createdAt
        datetime readAt
    }

    UserActivity {
        string id PK
        string userId
        string activityType
        json metadata
        datetime createdAt
    }

    DailyMetrics {
        string id PK
        date date UK
        int totalUsers
        int activeUsers
        int newUsers
        int totalMatches
        int successfulMatches
        int totalMessages
        int totalRooms
        int activeRooms
        datetime createdAt
        datetime updatedAt
    }
```

## Enums

### UserStatus
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`

### SubscriptionTier
- `BASIC`
- `PREMIUM`
- `ELITE`

### MatchStatus
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `BLOCKED`

### MessageType
- `TEXT`
- `FILE`
- `VOICE`
- `VIDEO`

### RoomType
- `STUDY_GROUP`
- `DISCUSSION`
- `HELP_SESSION`
- `CASUAL`

### BadgeType
- `NETWORK_PRO`
- `CHAT_MASTER`
- `STUDY_INFLUENCER`
- `MENTOR`
- `EARLY_ADOPTER`

### AchievementCategory
- `SOCIAL`
- `ACADEMIC`
- `ENGAGEMENT`
- `LEADERSHIP`

### NotificationType
- `MATCH_REQUEST`
- `MATCH_ACCEPTED`
- `NEW_MESSAGE`
- `ROOM_INVITE`
- `BADGE_EARNED`
- `ACHIEVEMENT_UNLOCKED`

## Table Groups

### 🧑‍🎓 User Management
- **User**: Core user profiles and settings
- **UserActivity**: Activity tracking and logging
- **DailyMetrics**: Platform-wide analytics

### 🤝 Matching System
- **Match**: Student-to-student connections
- **Rating**: Peer rating system

### 💬 Messaging System
- **Message**: Direct 1-on-1 messaging
- **MessageReaction**: Emoji reactions on direct messages

### 🏛️ Study Room System
- **Room**: Virtual study rooms
- **RoomMember**: Room membership tracking
- **RoomMessage**: Group chat messages
- **RoomMessageReaction**: Emoji reactions on room messages

### 🏆 Gamification System
- **Badge**: Predefined badges
- **UserBadge**: User-earned badges
- **Achievement**: Achievement definitions
- **UserAchievement**: User achievement progress

### 🔔 Notification System
- **Notification**: Real-time notifications

## Key Relationships

1. **User → Match**: Users can send and receive match requests (many-to-many)
2. **User → Message**: Users can send and receive direct messages (many-to-many)
3. **User → Room**: Users can own and join study rooms (one-to-many, many-to-many)
4. **Room → RoomMember**: Rooms have multiple members (one-to-many)
5. **Room → RoomMessage**: Rooms contain multiple messages (one-to-many)
6. **User → Badge/Achievement**: Users earn badges and unlock achievements (many-to-many)
7. **Message/RoomMessage → Reactions**: Messages can have multiple emoji reactions (one-to-many)
8. **Message/RoomMessage → Self**: Messages support threading via reply-to (self-referencing)

## Database Features

### Performance Optimizations
- Indexed fields for fast queries (user status, university, major, lastActive)
- Composite indexes for common query patterns
- Optimized message and notification queries

### Data Integrity
- Cascade deletion for user-related data
- Unique constraints on email, username, and relationships
- Foreign key constraints for referential integrity

### Scalability Features
- JSON metadata fields for flexible extensibility
- Array fields for multi-value attributes
- Separate analytics tables (UserActivity, DailyMetrics)
- Message reaction system supports unlimited emojis

### Real-time Capabilities
- Notification system with read status
- Message read receipts
- Room activity tracking
- Last active timestamps

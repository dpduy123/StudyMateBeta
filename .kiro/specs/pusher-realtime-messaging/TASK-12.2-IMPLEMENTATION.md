# Task 12.2 Implementation: Fix Conversation List Not Updating

## Date: 26/10/2025

## Problem Summary

Conversation list (danh sách tin nhắn bên trái) không update real-time khi có tin nhắn mới:
- Last message preview không thay đổi
- Unread count không tăng
- Conversation không di chuyển lên đầu list
- Phải refresh page để thấy tin nhắn mới

## Root Cause

### 1. No Real API Implementation
`ConversationsList` component chỉ có mock data:
- Không fetch conversations từ database
- Fallback về mock data khi API fails
- Không có real data để update

### 2. No Pusher Subscription
Component không subscribe Pusher events:
- Không listen for conversation updates
- Không có real-time mechanism
- Chỉ fetch một lần khi mount

### 3. No Event Triggers
Message API không trigger conversation events:
- Chỉ trigger `new-message` event
- Không update conversation list của sender/receiver
- Conversation list không biết có tin nhắn mới

## Solution Implemented

### 1. Created Conversations API

**File:** `app/api/conversations/route.ts`

**Purpose:**
- Fetch all conversations for current user from database
- Include last message, unread count, other user info
- Sort by last activity (most recent first)

**Implementation:**
```typescript
GET /api/conversations

// Query all messages where user is sender or receiver
const messages = await prisma.message.findMany({
  where: {
    OR: [
      { senderId: user.id },
      { receiverId: user.id }
    ],
    roomId: null // Only private messages
  },
  include: { sender, receiver }
})

// Group by conversation (other user)
// Count unread messages
// Return sorted by last activity
```

**Response Format:**
```json
{
  "conversations": [
    {
      "id": "user-id",
      "otherUser": {
        "id": "user-id",
        "firstName": "Nguyễn",
        "lastName": "Văn A",
        "avatar": "url",
        "lastActive": "2025-10-26T10:00:00Z"
      },
      "lastMessage": {
        "id": "msg-id",
        "content": "Hello",
        "createdAt": "2025-10-26T10:00:00Z",
        "senderId": "user-id"
      },
      "unreadCount": 2,
      "lastActivity": "2025-10-26T10:00:00Z"
    }
  ],
  "count": 5
}
```

### 2. Added Pusher Subscription to ConversationsList

**File:** `components/chat/ConversationsList.tsx`

**Changes:**
```typescript
// Subscribe to conversation updates
usePusher({
  channelName: `private-user-${currentUserId}-conversations`,
  enabled: !!currentUserId,
  events: {
    'conversation-updated': (data) => {
      // Update or add conversation
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === data.otherUserId)
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev]
          updated[existingIndex] = {
            id: data.otherUserId,
            otherUser: data.otherUser,
            lastMessage: data.lastMessage,
            unreadCount: data.unreadCount,
            lastActivity: data.lastActivity
          }
          
          // Re-sort by last activity
          updated.sort((a, b) => 
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
          )
          
          return updated
        } else {
          // Add new conversation at top
          return [newConversation, ...prev]
        }
      })
    }
  }
})
```

**Benefits:**
- Real-time updates when messages sent/received
- Conversation moves to top of list
- Last message preview updates
- Unread count updates

### 3. Trigger Conversation Events in Message API

**File:** `app/api/messages/private/route.ts`

**Added after sending message:**
```typescript
// Trigger for SENDER
const senderConversationData = {
  otherUserId: receiverId,
  otherUser: { ...receiver },
  lastMessage: { ...message },
  unreadCount: 0, // Sender has no unread
  lastActivity: message.createdAt
}

await triggerPusherEvent(
  `private-user-${user.id}-conversations`,
  'conversation-updated',
  senderConversationData
)

// Trigger for RECEIVER
const unreadCount = await prisma.message.count({
  where: {
    senderId: user.id,
    receiverId: receiverId,
    isRead: false
  }
})

const receiverConversationData = {
  otherUserId: user.id,
  otherUser: { ...sender },
  lastMessage: { ...message },
  unreadCount, // Receiver's unread count
  lastActivity: message.createdAt
}

await triggerPusherEvent(
  `private-user-${receiverId}-conversations`,
  'conversation-updated',
  receiverConversationData
)
```

**Benefits:**
- Both sender and receiver get updates
- Unread count accurate for each user
- Conversation list updates immediately

## How It Works Now

### Scenario 1: User A Sends Message to User B

```
1. User A types and sends message
   ↓
2. POST /api/messages/private
   ↓
3. Save message to database
   ↓
4. Trigger 'new-message' event (chat window)
   ↓
5. Trigger 'conversation-updated' for User A
   - otherUserId: B
   - lastMessage: "Hello"
   - unreadCount: 0
   ↓
6. User A's conversation list updates:
   - Conversation with B moves to top
   - Last message: "Bạn: Hello"
   - No unread badge
   ↓
7. Trigger 'conversation-updated' for User B
   - otherUserId: A
   - lastMessage: "Hello"
   - unreadCount: 1 (or more)
   ↓
8. User B's conversation list updates:
   - Conversation with A moves to top
   - Last message: "Hello"
   - Unread badge shows "1"
```

### Scenario 2: User B Opens Chat and Reads Messages

```
1. User B clicks on conversation with User A
   ↓
2. GET /api/messages/private?chatId=A
   ↓
3. Mark messages as read
   ↓
4. Trigger 'message-read' events
   ↓
5. User B's unread count decreases
   ↓
6. Conversation list updates (unread badge disappears)
```

### Scenario 3: New Conversation Started

```
1. User A sends first message to User C
   ↓
2. Trigger 'conversation-updated' for User A
   - New conversation added to list
   ↓
3. Trigger 'conversation-updated' for User C
   - New conversation appears at top
   - Shows unread badge
```

## Channel Naming Convention

**Conversation Updates:**
- Format: `private-user-{userId}-conversations`
- Example: `private-user-123-conversations`
- Each user has their own conversation channel
- Only they can subscribe to it

**Event Name:**
- `conversation-updated`

**Event Data:**
```typescript
{
  otherUserId: string,
  otherUser: {
    id: string,
    firstName: string,
    lastName: string,
    avatar?: string,
    lastActive?: string
  },
  lastMessage: {
    id: string,
    content: string,
    createdAt: string,
    senderId: string
  },
  unreadCount: number,
  lastActivity: string
}
```

## Files Created

1. ✅ `app/api/conversations/route.ts` - API to fetch conversations

## Files Modified

1. ✅ `components/chat/ConversationsList.tsx` - Added Pusher subscription
2. ✅ `app/api/messages/private/route.ts` - Added conversation event triggers

## Testing Checklist

### Manual Testing

**Test 1: Send Message**
- [ ] Open app as User A
- [ ] Send message to User B
- [ ] User A's conversation list updates immediately
- [ ] Conversation with B moves to top
- [ ] Last message shows "Bạn: [message]"

**Test 2: Receive Message**
- [ ] Open app as User B
- [ ] User A sends message to User B
- [ ] User B's conversation list updates immediately
- [ ] Conversation with A moves to top
- [ ] Unread badge appears with count
- [ ] Last message shows message content

**Test 3: Multiple Messages**
- [ ] Send multiple messages back and forth
- [ ] Conversation stays at top
- [ ] Last message always shows latest
- [ ] Unread count updates correctly

**Test 4: New Conversation**
- [ ] User A sends first message to User C
- [ ] New conversation appears in both lists
- [ ] Shows at top of list
- [ ] Unread badge for receiver

**Test 5: Read Messages**
- [ ] User B opens chat with User A
- [ ] Unread badge disappears
- [ ] Unread count becomes 0

### Console Logs to Check

```
📬 Conversation updated: { otherUserId: '...', lastMessage: {...}, unreadCount: 1 }
✅ Pusher event triggered: conversation-updated on private-user-{userId}-conversations
```

### Pusher Dashboard

- Check "Channels" tab
- Should see `private-user-{userId}-conversations` channels
- Should see `conversation-updated` events
- Check event data format

## Expected Behavior After Fix

### ✅ Real-time Updates
- Conversation list updates immediately when message sent/received
- No need to refresh page
- Works for both sender and receiver

### ✅ Correct Ordering
- Most recent conversation always at top
- Conversations re-order automatically
- Sorted by last activity time

### ✅ Accurate Unread Counts
- Unread badge shows correct number
- Updates when messages read
- Different for each user

### ✅ Last Message Preview
- Shows latest message content
- Shows "Bạn: " prefix for own messages
- Truncates long messages

### ✅ New Conversations
- Appear automatically in list
- No need to refresh
- Show at top with unread badge

## Performance Considerations

### Database Queries
- Conversations API groups messages efficiently
- Uses indexes on senderId, receiverId
- Limits to recent conversations

### Pusher Events
- Only trigger for affected users
- Minimal data in events
- No unnecessary broadcasts

### State Management
- Efficient array updates
- Re-sort only when needed
- Prevent duplicate conversations

## Known Limitations

1. **Initial Load**: First load fetches from API, then Pusher enhances
2. **Unread Count**: Calculated on each message send (could be cached)
3. **Large Conversation Lists**: May need pagination for 100+ conversations

## Future Improvements

1. **Pagination**: Load conversations in batches
2. **Caching**: Cache conversation data in localStorage
3. **Optimistic Updates**: Update UI before API response
4. **Typing Indicators**: Show in conversation list
5. **Message Previews**: Show file/image icons for non-text messages

---

**Status:** ✅ IMPLEMENTED - Ready for Testing

**Requirements Met:** 3.3, 4.2, 4.3, 8.1

**Next Task:** 12.3 - Verify and test all real-time features

**Related Tasks:**
- Task 4.1 - Update message API to trigger Pusher events
- Task 5.2 - Handle incoming message events
- Task 12.1 - Fix offline status display issue

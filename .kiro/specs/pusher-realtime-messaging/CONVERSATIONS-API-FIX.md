# Conversations API Fix

## Date: 26/10/2025

## Error

```
Failed to fetch conversations
ConversationsList.tsx (111:17)
```

## Root Cause

### 1. Schema Mismatch
API code assumed Message model had `roomId` field:
```typescript
where: {
  roomId: null  // ❌ This field doesn't exist
}
```

But actual schema:
```prisma
model Message {
  id          String
  senderId    String
  receiverId  String
  // No roomId field!
}
```

### 2. Include Syntax
Used select inside include:
```typescript
include: {
  sender: {
    select: { ... }  // ❌ Redundant
  }
}
```

Should be:
```typescript
include: {
  sender: true  // ✅ Include all fields
}
```

## Fix Applied

### File: `app/api/conversations/route.ts`

**Before:**
```typescript
const messages = await prisma.message.findMany({
  where: {
    OR: [
      { senderId: user.id },
      { receiverId: user.id }
    ],
    roomId: null  // ❌ Error
  },
  include: {
    sender: {
      select: { ... }  // ❌ Redundant
    },
    receiver: {
      select: { ... }
    }
  }
})
```

**After:**
```typescript
const messages = await prisma.message.findMany({
  where: {
    OR: [
      { senderId: user.id },
      { receiverId: user.id }
    ]
    // ✅ Removed roomId check
  },
  include: {
    sender: true,    // ✅ Simplified
    receiver: true
  }
})
```

### File: `components/chat/ConversationsList.tsx`

**Improved error handling:**
```typescript
// Added detailed error logging
const errorData = await response.json().catch(() => ({}))
console.error('API error:', response.status, errorData)

// Show error details
throw new Error(errorData.details || errorData.error || 'Failed to fetch conversations')

// Log success
console.log('✅ Fetched conversations:', data.count)
```

## Why This Happened

The API was written assuming a different schema structure:
- Expected `Message` to have `roomId` (like `RoomMessage` model)
- But `Message` is for private 1-1 messages only
- `RoomMessage` is a separate model for group chats

## Correct Schema Understanding

### Message Model (Private 1-1)
```prisma
model Message {
  id          String
  senderId    String
  receiverId  String
  // Direct message between 2 users
  // No room involved
}
```

### RoomMessage Model (Group Chat)
```prisma
model RoomMessage {
  id          String
  roomId      String
  senderId    String
  // Message in a group chat room
}
```

## Testing

After fix, API should:
- ✅ Return all private conversations
- ✅ Include sender and receiver info
- ✅ Group by other user
- ✅ Count unread messages
- ✅ Sort by last activity

## Console Logs to Check

**Success:**
```
✅ Fetched conversations: 5
```

**Error (if still occurs):**
```
API error: 500 { error: '...', details: '...' }
Error fetching conversations: ...
⚠️ Using mock data as fallback
```

---

**Status:** ✅ FIXED

**Files Modified:**
1. `app/api/conversations/route.ts` - Fixed schema mismatch
2. `components/chat/ConversationsList.tsx` - Improved error handling

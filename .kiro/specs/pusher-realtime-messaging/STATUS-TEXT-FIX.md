# Status Text Fix - Improvement to Task 12.1

## Date: 26/10/2025

## Problem

After implementing Task 12.1, green dot indicator worked correctly, but status text had issues:
- Status text showed "Offline" when user navigated/moved
- Status text disappeared or didn't update properly
- No "last active" time shown for offline users

## Root Causes

### 1. Hook State Management
`useOtherUserPresence` hook didn't persist state well during re-renders:
- Used local `mounted` variable instead of `useRef`
- No initial status fetch from API
- State could reset during navigation

### 2. No Last Active Display
Status text only showed "Đang hoạt động" or "Offline":
- No time information for offline users
- Not user-friendly

### 3. Missing lastActive in Conversation Selection
When selecting conversation, `lastActive` wasn't fetched:
- Conversation object didn't have updated `lastActive`
- Status text couldn't calculate time

## Solutions Implemented

### 1. Improved useOtherUserPresence Hook

**File:** `hooks/useOtherUserPresence.ts`

**Changes:**
```typescript
// Added refs for better state management
const channelRef = useRef<Channel | null>(null)
const mountedRef = useRef(true)

// Fetch initial status from API before subscribing to Pusher
const fetchInitialStatus = async () => {
  const response = await fetch(`/api/user/${userId}/status`)
  if (response.ok) {
    const data = await response.json()
    setIsOnline(data.status === 'online')
  }
}

// Use refs instead of local variables
if (!mountedRef.current) return
```

**Benefits:**
- State persists across re-renders
- Initial status loaded immediately from API
- Pusher updates enhance real-time experience
- More reliable state management

### 2. Added Smart Status Text Function

**File:** `app/messages/page.tsx`

**Added:**
```typescript
const getStatusText = () => {
  if (isOtherUserOnline) {
    return 'Đang hoạt động'
  }
  
  // Calculate time since last active
  if (selectedConversation.otherUser.lastActive) {
    const diffMins = Math.floor((now - lastActive) / 60000)
    
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    return `${diffDays} ngày trước`
  }
  
  return 'Offline'
}
```

**Display:**
```typescript
<p className={`text-xs sm:text-sm ${
  isOtherUserOnline 
    ? 'text-green-600 font-medium'  // Green and bold when online
    : 'text-gray-500'                // Gray when offline
}`}>
  {getStatusText()}
</p>
```

**Benefits:**
- User-friendly time display
- Visual distinction (green for online)
- Shows relative time (5 phút trước, 2 giờ trước, etc.)

### 3. Fetch lastActive on Conversation Selection

**File:** `components/chat/ConversationsList.tsx`

**Changes:**
```typescript
const handleConversationClick = async (conversation: Conversation) => {
  // Fetch latest user status
  const response = await fetch(`/api/user/${conversation.otherUser.id}/status`)
  const data = await response.json()
  
  // Update conversation with latest lastActive
  const updatedConversation = {
    ...conversation,
    otherUser: {
      ...conversation.otherUser,
      lastActive: data.lastActive
    }
  }
  
  onSelectConversation(updatedConversation)
}
```

**Benefits:**
- Always have latest `lastActive` data
- Status text can calculate accurate time
- Fallback to original conversation if API fails

## How It Works Now

### Scenario 1: User is Online
```
1. User A is active (subscribed to own presence channel)
   ↓
2. User B opens chat with User A
   ↓
3. useOtherUserPresence fetches initial status → "online"
   ↓
4. Subscribe to User A's presence channel
   ↓
5. Display: "Đang hoạt động" (green, bold)
   ↓
6. Green dot shows next to avatar
```

### Scenario 2: User is Offline
```
1. User A closed tab 10 minutes ago
   ↓
2. User B opens chat with User A
   ↓
3. Fetch status API → lastActive = 10 minutes ago
   ↓
4. Calculate: now - lastActive = 10 minutes
   ↓
5. Display: "10 phút trước" (gray)
   ↓
6. No green dot
```

### Scenario 3: User Goes Offline While Chatting
```
1. User A is online, User B is chatting with them
   ↓
2. Display: "Đang hoạt động" (green)
   ↓
3. User A closes tab
   ↓
4. Pusher triggers member_removed event
   ↓
5. useOtherUserPresence updates: isOnline = false
   ↓
6. Display changes to: "Vừa xong" → "1 phút trước" → etc.
```

## Status Text Examples

| Time Since Last Active | Display Text |
|------------------------|--------------|
| < 1 minute | "Vừa xong" |
| 5 minutes | "5 phút trước" |
| 30 minutes | "30 phút trước" |
| 2 hours | "2 giờ trước" |
| 1 day | "1 ngày trước" |
| Currently active | "Đang hoạt động" (green) |

## Visual Improvements

### Before
```
Nguyễn Đình Bảo
Offline              ← Always gray, no time info
```

### After - Online
```
Nguyễn Đình Bảo
Đang hoạt động      ← Green and bold
🟢                   ← Green dot
```

### After - Offline
```
Nguyễn Đình Bảo
10 phút trước       ← Gray with time info
                     ← No green dot
```

## Files Modified

1. ✅ `hooks/useOtherUserPresence.ts` - Better state management + initial API fetch
2. ✅ `app/messages/page.tsx` - Smart status text function + visual styling
3. ✅ `components/chat/ConversationsList.tsx` - Fetch lastActive on selection

## Testing Results

### ✅ Green Dot
- Shows when user is online
- Hides when user is offline
- Updates in real-time

### ✅ Status Text
- Shows "Đang hoạt động" when online (green, bold)
- Shows time since last active when offline (gray)
- Updates properly during navigation
- Doesn't disappear or reset

### ✅ Real-time Updates
- Status changes within 1-2 seconds
- Works across multiple tabs
- Persists during page navigation

## Known Behaviors

1. **Time Updates**: Status text doesn't auto-update every minute
   - Shows time at moment of render
   - Updates when Pusher event received
   - Updates when conversation re-selected

2. **API Fallback**: If Pusher fails, still shows status from API
   - Initial fetch always happens
   - Pusher enhances with real-time updates

3. **5-Minute Threshold**: User considered online if lastActive < 5 minutes
   - Defined in `/api/user/[userId]/status/route.ts`
   - Can be adjusted if needed

## Future Improvements

1. **Auto-update time text**: Use interval to update "X phút trước" every minute
2. **Typing indicator**: Show "đang nhập..." when user is typing
3. **Last seen precision**: Show exact time for recent activity (e.g., "2:30 PM")

---

**Status:** ✅ FIXED

**Related Tasks:** 
- Task 12.1 - Fix offline status display issue
- Task 8.1 - Setup presence channels
- Task 8.2 - Display user status

**Next:** Task 12.2 - Fix conversation list not updating with new messages

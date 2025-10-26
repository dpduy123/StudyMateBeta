# Task 12.1 Implementation: Fix Offline Status Display Issue

## Date: 26/10/2025

## Problem Summary

Users were always showing as "Offline" despite Pusher presence implementation because:
- Users were NOT subscribing to their OWN presence channels
- Only code to "observe" others' presence existed
- No mechanism to broadcast own online status

## Root Cause

**Pusher Presence Channels Work Like This:**
1. User A subscribes to `presence-user-A` (their own channel) → broadcasts "I'm online"
2. User B subscribes to `presence-user-A` (to observe) → sees User A is online
3. If User A never subscribes to their own channel, nobody can see them online

**What Was Missing:**
- No hook for users to subscribe to their own presence channel
- No heartbeat mechanism to keep `lastActive` updated in database

## Solution Implemented

### 1. Created `useMyPresence` Hook

**File:** `hooks/useMyPresence.ts`

**Purpose:** 
- User subscribes to their OWN presence channel
- Broadcasts online status to observers
- Sends periodic heartbeat to update database

**Key Features:**
```typescript
// Subscribe to own presence channel
const channel = pusher.subscribe(`presence-user-${userId}`)

// Send heartbeat every 60 seconds
setInterval(sendHeartbeat, 60000)

// Handle page visibility changes
document.addEventListener('visibilitychange', handleVisibilityChange)
```

**Lifecycle:**
- Subscribes when user logs in
- Sends heartbeat every 60 seconds
- Sends heartbeat when tab becomes visible
- Unsubscribes on logout/unmount

### 2. Created Heartbeat API Endpoint

**File:** `app/api/user/presence/heartbeat/route.ts`

**Purpose:**
- Update user's `lastActive` timestamp in database
- Called by `useMyPresence` hook every 60 seconds

**Implementation:**
```typescript
POST /api/user/presence/heartbeat

// Updates:
await prisma.user.update({
  where: { id: user.id },
  data: { lastActive: new Date() }
})
```

**Security:**
- Requires Bearer token authentication
- Verifies user with Supabase
- Only updates own lastActive

### 3. Integrated into Providers

**File:** `components/providers/Providers.tsx`

**Changes:**
```typescript
import { useMyPresence } from '@/hooks/useMyPresence'

export function Providers({ children }) {
  const [user, setUser] = useState<User | null>(null)
  
  // Subscribe to own presence channel
  useMyPresence(user?.id)
  
  return (...)
}
```

**Why in Providers:**
- Runs globally for all authenticated users
- Automatically starts when user logs in
- Automatically stops when user logs out
- Single subscription per user session

## How It Works Now

### User Login Flow
```
1. User logs in
   ↓
2. Providers component renders
   ↓
3. useMyPresence(user.id) executes
   ↓
4. Subscribe to presence-user-{userId}
   ↓
5. Send initial heartbeat → Update lastActive
   ↓
6. Start 60s interval → Keep sending heartbeats
   ↓
7. User appears ONLINE to others watching
```

### Other Users Observing
```
1. User B opens chat with User A
   ↓
2. useOtherUserPresence(userA.id) executes
   ↓
3. Subscribe to presence-user-{userA.id}
   ↓
4. Pusher checks: Is User A subscribed to their own channel?
   ↓
5. YES → User B sees User A as ONLINE ✅
   ↓
6. Listen for member_added/removed events
```

### User Logout/Close Tab
```
1. User closes tab or logs out
   ↓
2. useMyPresence cleanup runs
   ↓
3. Clear heartbeat interval
   ↓
4. Unsubscribe from presence channel
   ↓
5. Pusher broadcasts member_removed event
   ↓
6. Others see user as OFFLINE
```

## Files Created

1. ✅ `hooks/useMyPresence.ts` - Hook to subscribe to own presence
2. ✅ `app/api/user/presence/heartbeat/route.ts` - API to update lastActive

## Files Modified

1. ✅ `components/providers/Providers.tsx` - Added useMyPresence integration

## Testing Checklist

### Manual Testing
- [ ] Open app in Browser 1 as User A
- [ ] Open app in Browser 2 as User B
- [ ] User B should see User A as "Đang hoạt động" (Online)
- [ ] User A closes tab
- [ ] User B should see User A as "Offline"
- [ ] Check Pusher dashboard for presence channel subscriptions
- [ ] Check database - User A's lastActive should update every 60s

### Console Logs to Check
```
✅ Pusher connected
👤 Subscribing to own presence channel: presence-user-{userId}
✅ Successfully joined own presence channel. Members count: 1
```

### Database Verification
```sql
-- Check lastActive is being updated
SELECT id, firstName, lastName, lastActive 
FROM User 
WHERE id = 'user-id'
ORDER BY lastActive DESC;

-- Should update every ~60 seconds while user is active
```

### Pusher Dashboard
- Check "Channels" tab
- Should see `presence-user-{userId}` channels
- Should see member count = 1 (the user themselves)
- Should see connection events

## Expected Behavior After Fix

### ✅ Online Status
- User appears online immediately after login
- Green dot indicator shows next to avatar
- "Đang hoạt động" text displays in chat header
- Status updates in conversation list

### ✅ Offline Status
- User appears offline after closing tab/logout
- Green dot disappears
- "Offline" text displays
- Last active time shows (e.g., "5 phút trước")

### ✅ Real-time Updates
- Status changes propagate within 1-2 seconds
- Works across multiple browser tabs
- Works for multiple users simultaneously

## Known Limitations

1. **5-minute threshold**: User is considered online if lastActive < 5 minutes ago
2. **Heartbeat interval**: 60 seconds between updates (can be adjusted)
3. **Network issues**: If heartbeat fails, user may appear offline temporarily
4. **Browser background**: Some browsers throttle timers in background tabs

## Next Steps

After verifying Task 12.1 works:
1. Move to Task 12.2 - Fix conversation list updates
2. Implement real-time conversation updates
3. Test all features together in Task 12.3

## Rollback Plan

If issues occur:
1. Remove `useMyPresence(user?.id)` from Providers.tsx
2. Delete `hooks/useMyPresence.ts`
3. Delete `app/api/user/presence/heartbeat/route.ts`
4. System will fall back to previous behavior (always offline)

## References

- [Pusher Presence Channels Docs](https://pusher.com/docs/channels/using_channels/presence-channels/)
- Task 8.1 - Original presence implementation
- CURRENT-ISSUES-ANALYSIS.md - Problem analysis

---

**Status:** ✅ IMPLEMENTED - Ready for Testing

**Requirements Met:** 7.1, 7.2, 7.3, 7.4

**Next Task:** 12.2 - Fix conversation list not updating with new messages

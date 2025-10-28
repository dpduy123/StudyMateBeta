# User Presence System Guide

This guide explains how to use the Pusher-based user presence system to track and display online/offline status.

## Overview

The presence system uses Pusher presence channels to track user online/offline status in real-time. It automatically:
- Updates user's `lastActive` timestamp every 30 seconds
- Marks users as offline when they close the browser
- Broadcasts status changes to other users via Pusher events
- Provides React hooks and UI components for easy integration

## Architecture

```
User Browser
    ↓
useUserPresence Hook
    ↓
Pusher Presence Channel (presence-user-{userId})
    ↓
/api/user/presence (updates lastActive in DB)
    ↓
Pusher Event (user-status-change)
    ↓
Other Users' Browsers (via useUserStatus hook)
```

## Setup

### 1. Add PresenceProvider to your app layout

```tsx
// app/layout.tsx
import { PresenceProvider } from '@/components/providers/PresenceProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <PresenceProvider>
            {children}
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

This automatically initializes presence tracking for logged-in users.

### 2. Display user status in your UI

#### Option A: Use UserStatusIndicator component

```tsx
import { UserStatusIndicator } from '@/components/ui/UserStatusIndicator'

function UserCard({ userId, name }) {
  return (
    <div className="flex items-center gap-2">
      <span>{name}</span>
      <UserStatusIndicator 
        userId={userId}
        showLabel={true}
        showLastActive={true}
      />
    </div>
  )
}
```

#### Option B: Use UserStatusAvatar component

```tsx
import { UserStatusAvatar } from '@/components/ui/UserStatusIndicator'

function ChatHeader({ userId, name, avatarUrl }) {
  return (
    <div className="flex items-center gap-3">
      <UserStatusAvatar
        userId={userId}
        avatarUrl={avatarUrl}
        name={name}
        size="lg"
      />
      <span>{name}</span>
    </div>
  )
}
```

#### Option C: Use useUserStatus hook for custom UI

```tsx
import { useUserStatus } from '@/hooks/useUserStatus'

function CustomStatusDisplay({ userId }) {
  const { status, isLoading } = useUserStatus({ userId })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <p>Status: {status?.status}</p>
      {status?.status === 'offline' && (
        <p>Last active: {status.lastActive.toLocaleString()}</p>
      )}
    </div>
  )
}
```

### 3. Track multiple users' status

```tsx
import { useMultipleUserStatus } from '@/hooks/useUserStatus'

function UserList({ userIds }) {
  const statuses = useMultipleUserStatus(userIds)

  return (
    <div>
      {userIds.map(userId => (
        <div key={userId}>
          User {userId}: {statuses[userId]?.status || 'unknown'}
        </div>
      ))}
    </div>
  )
}
```

## API Endpoints

### POST /api/user/presence

Update user's online status and lastActive timestamp.

**Request:**
```json
{
  "status": "online" | "offline"
}
```

**Response:**
```json
{
  "success": true,
  "status": "online",
  "lastActive": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/user/[userId]/status

Get a user's current online/offline status.

**Response:**
```json
{
  "userId": "user-123",
  "status": "online",
  "lastActive": "2024-01-15T10:30:00.000Z",
  "user": {
    "id": "user-123",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  }
}
```

### POST /api/user/status/batch

Get multiple users' status at once (max 50 users).

**Request:**
```json
{
  "userIds": ["user-1", "user-2", "user-3"]
}
```

**Response:**
```json
{
  "statuses": [
    {
      "userId": "user-1",
      "status": "online",
      "lastActive": "2024-01-15T10:30:00.000Z",
      "user": { ... }
    },
    ...
  ]
}
```

## Pusher Events

### user-status-change

Triggered when a user's status changes (online/offline).

**Channel:** `presence-user-{userId}`

**Event Data:**
```json
{
  "userId": "user-123",
  "status": "online",
  "lastActive": "2024-01-15T10:30:00.000Z",
  "user": {
    "id": "user-123",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  }
}
```

## How It Works

### Online Status Detection

A user is considered "online" if their `lastActive` timestamp is within the last 5 minutes.

### Automatic Updates

- **Heartbeat:** Updates `lastActive` every 30 seconds while user is active
- **Visibility Change:** Updates when user returns to the tab
- **Page Unload:** Marks user as offline when closing browser/tab

### Presence Channels

Each user has their own presence channel: `presence-user-{userId}`

- Users subscribe to their own channel when logged in
- Other users can subscribe to track their status
- Pusher automatically handles member tracking

## Best Practices

### 1. Use PresenceProvider at the root level

Place it in your main layout to ensure presence is tracked throughout the app.

### 2. Batch status requests

When displaying a list of users, use `useMultipleUserStatus` instead of multiple `useUserStatus` calls.

### 3. Handle loading states

Always check `isLoading` before displaying status to avoid flickering.

### 4. Respect privacy

Only show online status for users who have opted in (check user settings).

### 5. Optimize subscriptions

Don't subscribe to presence channels for users not currently visible on screen.

## Troubleshooting

### Status not updating

1. Check Pusher connection: Open browser console and look for Pusher logs
2. Verify environment variables are set correctly
3. Check `/api/pusher/auth` endpoint is working
4. Ensure user is authenticated

### "Not authorized" errors

1. Verify Supabase token is valid
2. Check user ID matches the presence channel
3. Ensure `/api/pusher/auth` is handling presence channels correctly

### High Pusher usage

1. Reduce heartbeat frequency (currently 30 seconds)
2. Unsubscribe from channels when components unmount
3. Use batch status requests instead of individual subscriptions

## Performance Considerations

### Connection Limits

- Pusher free tier: 100 concurrent connections
- Each user = 1 connection
- Monitor usage in Pusher dashboard

### Message Limits

- Free tier: 200,000 messages/day
- Heartbeat every 30s = ~2,880 messages/user/day
- ~70 active users max on free tier

### Optimization Tips

1. **Increase heartbeat interval** for lower usage
2. **Use batch endpoints** to reduce API calls
3. **Lazy load status** only when needed
4. **Cache status** locally for short periods

## Example: Complete Integration

```tsx
// app/layout.tsx
import { PresenceProvider } from '@/components/providers/PresenceProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <PresenceProvider>
            {children}
          </PresenceProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

// app/messages/[userId]/page.tsx
import { UserStatusAvatar, formatLastActive } from '@/components/ui/UserStatusIndicator'
import { useUserStatus } from '@/hooks/useUserStatus'

export default function ChatPage({ params }) {
  const { status } = useUserStatus({ userId: params.userId })
  
  return (
    <div>
      <UserStatusAvatar
        userId={params.userId}
        avatarUrl={user.avatar}
        name={user.name}
      />
      <div>
        {status?.status === 'online' ? (
          <span>Online now</span>
        ) : (
          <span>Last active: {formatLastActive(status?.lastActive)}</span>
        )}
      </div>
    </div>
  )
}
```

## Related Documentation

- [Pusher Setup Guide](./PUSHER-SETUP.md)
- [Real-time Messaging Guide](./REALTIME-MESSAGING-IMPLEMENTATION.md)
- [Pusher Authentication](./PUSHER-AUTH-TEST.md)

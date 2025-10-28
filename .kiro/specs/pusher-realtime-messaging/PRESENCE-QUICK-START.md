# User Presence - Quick Start Guide

Get user online/offline status working in 5 minutes.

## Step 1: Add PresenceProvider (1 minute)

Add to your root layout to enable presence tracking:

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

That's it! Users are now tracked automatically when they log in.

## Step 2: Display Status (2 minutes)

### Option A: Simple Status Dot

```tsx
import { UserStatusIndicator } from '@/components/ui/UserStatusIndicator'

<UserStatusIndicator 
  userId={userId}
  showLabel={true}
/>
```

Result: `🟢 Online` or `⚫ Offline`

### Option B: Avatar with Status

```tsx
import { UserStatusAvatar } from '@/components/ui/UserStatusIndicator'

<UserStatusAvatar
  userId={userId}
  avatarUrl={user.avatar}
  name={user.name}
  size="md"
/>
```

Result: Avatar with status indicator overlay

### Option C: Custom UI

```tsx
import { useUserStatus } from '@/hooks/useUserStatus'

function MyComponent({ userId }) {
  const { status } = useUserStatus({ userId })
  
  return (
    <div>
      {status?.status === 'online' ? '🟢' : '⚫'}
      {status?.status === 'online' ? 'Online' : 'Offline'}
    </div>
  )
}
```

## Step 3: Test (2 minutes)

1. Open your app in two browsers
2. Log in as different users
3. Check if status shows as online
4. Close one browser
5. Wait 5 minutes - status should show offline

## Common Use Cases

### Chat Header

```tsx
// app/messages/[userId]/page.tsx
import { UserStatusAvatar, formatLastActive } from '@/components/ui/UserStatusIndicator'
import { useUserStatus } from '@/hooks/useUserStatus'

export default function ChatPage({ params }) {
  const { status } = useUserStatus({ userId: params.userId })
  
  return (
    <div className="chat-header">
      <UserStatusAvatar
        userId={params.userId}
        avatarUrl={user.avatar}
        name={user.name}
      />
      <div>
        <h2>{user.name}</h2>
        <p>
          {status?.status === 'online' 
            ? 'Online now' 
            : `Last active ${formatLastActive(status?.lastActive)}`
          }
        </p>
      </div>
    </div>
  )
}
```

### User List

```tsx
import { useMultipleUserStatus } from '@/hooks/useUserStatus'

function UserList({ users }) {
  const statuses = useMultipleUserStatus(users.map(u => u.id))
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <UserStatusAvatar
            userId={user.id}
            avatarUrl={user.avatar}
            name={user.name}
          />
          <span>{user.name}</span>
          {statuses[user.id]?.status === 'online' && (
            <span className="text-green-500">Online</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Profile Page

```tsx
import { UserStatusIndicator } from '@/components/ui/UserStatusIndicator'

function ProfilePage({ userId }) {
  return (
    <div>
      <img src={user.avatar} />
      <h1>{user.name}</h1>
      <UserStatusIndicator 
        userId={userId}
        showLabel={true}
        showLastActive={true}
      />
    </div>
  )
}
```

## API Endpoints

### Get Single User Status

```typescript
GET /api/user/[userId]/status

Response:
{
  "userId": "user-123",
  "status": "online",
  "lastActive": "2024-01-15T10:30:00.000Z",
  "user": { ... }
}
```

### Get Multiple Users Status

```typescript
POST /api/user/status/batch
Body: { "userIds": ["user-1", "user-2"] }

Response:
{
  "statuses": [
    { "userId": "user-1", "status": "online", ... },
    { "userId": "user-2", "status": "offline", ... }
  ]
}
```

## Customization

### Change Online Threshold

Default: 5 minutes. To change, edit:

```typescript
// app/api/user/[userId]/status/route.ts
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
// Change to 10 minutes:
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
```

### Change Heartbeat Interval

Default: 30 seconds. To change, edit:

```typescript
// hooks/useUserPresence.ts
heartbeatInterval = setInterval(() => {
  updateLastActive()
}, 30000) // Change to 60000 for 1 minute
```

### Custom Status Colors

```tsx
// components/ui/UserStatusIndicator.tsx
const statusColors = {
  online: 'bg-green-500',    // Change to your color
  offline: 'bg-gray-400',    // Change to your color
  away: 'bg-yellow-500'      // Change to your color
}
```

## Troubleshooting

### Status not updating?

1. Check browser console for Pusher errors
2. Verify Pusher credentials in `.env`
3. Check `/api/pusher/auth` is working
4. Ensure user is authenticated

### "Not authorized" error?

1. Check Supabase token is valid
2. Verify user ID matches presence channel
3. Check `/api/pusher/auth` logs

### High Pusher usage?

1. Increase heartbeat interval (30s → 60s)
2. Use batch status endpoint for lists
3. Unsubscribe when components unmount

## What's Happening Behind the Scenes?

1. **User logs in** → `useUserPresence` subscribes to `presence-user-{userId}`
2. **Every 30 seconds** → Updates `lastActive` in database
3. **Status changes** → Pusher broadcasts to all subscribers
4. **Other users** → Receive update via `useUserStatus` hook
5. **UI updates** → Status indicator changes automatically

## Performance

- **Heartbeat:** 30 seconds (configurable)
- **Online threshold:** 5 minutes (configurable)
- **Pusher messages:** ~2,880 per user per day
- **Free tier:** Supports ~70 active users

## Next Steps

- Read full guide: `docs/USER_PRESENCE_GUIDE.md`
- View architecture: `PRESENCE-SYSTEM-DIAGRAM.md`
- Check implementation: `TASK-8-IMPLEMENTATION-SUMMARY.md`

## Need Help?

Common issues and solutions in `docs/USER_PRESENCE_GUIDE.md` → Troubleshooting section.

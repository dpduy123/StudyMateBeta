# Socket.IO to Pusher Migration Guide

## Overview

This guide documents the migration from Socket.IO to Pusher for real-time messaging in StudyMate. The migration was completed to improve deployment compatibility (especially with Vercel), reduce infrastructure complexity, and provide a more reliable real-time messaging experience.

## Why We Migrated

### Problems with Socket.IO
1. **Custom Server Required**: Socket.IO required a custom Node.js server (`server.js`), which prevented deployment on serverless platforms like Vercel
2. **Deployment Complexity**: Required maintaining separate server infrastructure
3. **Connection Issues**: Frequent disconnections and reconnection problems
4. **Scaling Challenges**: Difficult to scale horizontally without additional infrastructure (Redis adapter)

### Benefits of Pusher
1. **Serverless Compatible**: Works perfectly with Next.js App Router and Vercel
2. **Managed Infrastructure**: No need to maintain WebSocket servers
3. **Reliable**: Built-in reconnection, fallback to HTTP, and high availability
4. **Easy to Scale**: Automatic scaling handled by Pusher
5. **Better DX**: Simpler API and better documentation

## What Changed

### Removed Components

#### 1. Custom Server (`server.js`)
- **Before**: Custom Node.js server with Socket.IO integration
- **After**: Standard Next.js server (no custom server needed)

#### 2. Socket.IO Dependencies
- **Removed**: `socket.io` and `socket.io-client` packages
- **Added**: `pusher` (server) and `pusher-js` (client) packages

#### 3. Socket.IO Code
- **Removed**: `lib/socket/server.ts`
- **Removed**: `app/api/socket/io/route.ts`
- **Added**: `lib/pusher/server.ts` and `lib/pusher/client.ts`

### New Components

#### 1. Pusher Server Instance (`lib/pusher/server.ts`)
Singleton instance for triggering events from API routes:
```typescript
import Pusher from 'pusher'

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})
```

#### 2. Pusher Client Instance (`lib/pusher/client.ts`)
Singleton client for browser-side subscriptions:
```typescript
import PusherClient from 'pusher-js'

export function getPusherClient(): PusherClient {
  // Returns singleton instance with auth configuration
}
```

#### 3. Authentication Endpoint (`app/api/pusher/auth/route.ts`)
Handles private channel authentication:
```typescript
export async function POST(req: Request) {
  // Verify user token
  // Return Pusher auth signature
}
```

#### 4. Updated Hooks
- `hooks/usePusher.ts`: Generic hook for Pusher subscriptions
- `hooks/useRealtimeMessages.ts`: Updated to use Pusher
- `hooks/useUserPresence.ts`: User online/offline status with Pusher

## Migration Steps for Developers

### 1. Update Environment Variables

Add Pusher credentials to your `.env.local`:

```env
# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

**Get Pusher Credentials:**
1. Sign up at [https://dashboard.pusher.com/](https://dashboard.pusher.com/)
2. Create a new Channels app
3. Copy the credentials from the "App Keys" section

### 2. Install Dependencies

```bash
# Remove old dependencies
npm uninstall socket.io socket.io-client

# Install new dependencies (already in package.json)
npm install
```

### 3. Update Development Scripts

The `package.json` scripts have been updated:

**Before:**
```json
{
  "dev": "node server.js",
  "start": "NODE_ENV=production node server.js"
}
```

**After:**
```json
{
  "dev": "next dev",
  "start": "next start"
}
```

### 4. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## API Changes

### Sending Messages

**Before (Socket.IO):**
```typescript
socket.emit('send-message', {
  receiverId: 'user-123',
  content: 'Hello!'
})
```

**After (Pusher):**
```typescript
// Client sends via API
const response = await fetch('/api/messages/private', {
  method: 'POST',
  body: JSON.stringify({
    receiverId: 'user-123',
    content: 'Hello!'
  })
})

// Server triggers Pusher event
await pusherServer.trigger(
  `private-chat-${chatId}`,
  'new-message',
  message
)
```

### Receiving Messages

**Before (Socket.IO):**
```typescript
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message])
})
```

**After (Pusher):**
```typescript
usePusher({
  channelName: `private-chat-${chatId}`,
  events: {
    'new-message': (message) => {
      setMessages(prev => [...prev, message])
    }
  }
})
```

### Channel Naming Convention

**Private Chats:**
- Format: `private-chat-{userId1}-{userId2}` (user IDs sorted alphabetically)
- Example: `private-chat-abc123-xyz789`

**User Presence:**
- Format: `presence-user-{userId}`
- Example: `presence-user-abc123`

**Notifications:**
- Format: `private-notifications-{userId}`
- Example: `private-notifications-abc123`

## Event Types

### Message Events
- `new-message`: New message received
- `message-read`: Message marked as read
- `typing-start`: User started typing
- `typing-stop`: User stopped typing

### Presence Events
- `user-status-change`: User went online/offline
- `pusher:subscription_succeeded`: Successfully subscribed to presence channel
- `pusher:member_added`: New member joined presence channel
- `pusher:member_removed`: Member left presence channel

### Notification Events
- `message-notification`: New message notification (when user not viewing chat)

## Error Handling

### Connection Errors

Pusher automatically handles:
- Reconnection on network loss
- Fallback to HTTP when WebSocket fails
- Connection state management

Monitor connection state:
```typescript
pusherClient.connection.bind('state_change', (states) => {
  console.log(`Pusher: ${states.previous} → ${states.current}`)
})

pusherClient.connection.bind('error', (err) => {
  console.error('Pusher error:', err)
})
```

### API Fallback

If Pusher fails, the app falls back to API polling:
```typescript
// Automatically polls every 5 seconds if Pusher disconnected
if (!isConnected) {
  startPolling()
}
```

## Deployment

### Vercel (Recommended)

1. **Add Environment Variables** in Vercel dashboard:
   - `PUSHER_APP_ID`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

2. **Deploy**:
   ```bash
   vercel deploy
   ```

3. **No additional configuration needed** - works out of the box!

### Railway / Render

1. Add environment variables in platform settings
2. Deploy with standard Next.js build
3. No custom server configuration needed

### VPS / Self-Hosted

1. Set environment variables in `.env.production`
2. Build and start:
   ```bash
   npm run build
   npm start
   ```

## Performance Considerations

### Pusher Free Tier Limits
- **100 concurrent connections**
- **200,000 messages/day** (~2.3 messages/second)
- **10 channels per connection**

### Optimization Tips
1. **Single Client Instance**: Use singleton pattern (already implemented)
2. **Unsubscribe on Unmount**: Clean up subscriptions (already implemented)
3. **Debounce Events**: Typing indicators limited to 1/second (already implemented)
4. **Lazy Subscription**: Only subscribe when needed (already implemented)

### Upgrade Path
When exceeding free tier:
- **Startup Plan ($49/month)**: 500 connections, 1M messages/day
- **Professional Plan ($299/month)**: 2000 connections, 5M messages/day

## Testing

### Test Pusher Connection
```bash
npm run test:pusher:core
```

### Test Error Handling
```bash
npm run test:pusher:errors
```

### Test Performance
```bash
npm run test:pusher:perf
```

### Manual Testing Checklist
- [ ] Send message between two users
- [ ] Receive message in real-time
- [ ] Typing indicators work
- [ ] Read receipts update
- [ ] Online/offline status changes
- [ ] Reconnection after network loss
- [ ] Multiple tabs/windows sync
- [ ] Mobile browser compatibility

## Monitoring

### Pusher Dashboard
Monitor your app at [https://dashboard.pusher.com/](https://dashboard.pusher.com/):
- Connection count
- Message volume
- Error rates
- API usage

### Application Logs
Check browser console for:
- Connection state changes
- Event delivery
- Authentication success/failure
- Errors and warnings

## Troubleshooting

### Issue: "Authentication failed"
**Solution**: Check that:
1. Pusher credentials are correct in `.env.local`
2. User is authenticated with Supabase
3. `/api/pusher/auth` endpoint is accessible

### Issue: "Messages not received in real-time"
**Solution**: Check that:
1. Pusher client is connected (check browser console)
2. User is subscribed to correct channel
3. Channel name format is correct
4. Pusher dashboard shows events being sent

### Issue: "Connection keeps dropping"
**Solution**:
1. Check network stability
2. Verify Pusher credentials
3. Check browser console for errors
4. App will automatically fall back to polling

## Rollback Plan

If you need to rollback to Socket.IO:

1. **Restore Socket.IO code** from git history:
   ```bash
   git checkout <commit-before-migration> -- server.js
   git checkout <commit-before-migration> -- lib/socket/
   ```

2. **Reinstall Socket.IO**:
   ```bash
   npm install socket.io socket.io-client
   ```

3. **Update package.json scripts**:
   ```json
   {
     "dev": "node server.js",
     "start": "NODE_ENV=production node server.js"
   }
   ```

4. **Redeploy**

## Support

### Documentation
- [Pusher Channels Docs](https://pusher.com/docs/channels/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [StudyMate Docs](./README.md)

### Issues
If you encounter issues:
1. Check this migration guide
2. Review Pusher dashboard for errors
3. Check browser console logs
4. Contact team lead or create an issue

## Summary

The migration from Socket.IO to Pusher provides:
- ✅ Serverless deployment compatibility
- ✅ Simplified infrastructure
- ✅ Better reliability and uptime
- ✅ Easier scaling
- ✅ Improved developer experience

The application now runs on standard Next.js without custom server requirements, making it deployable on any platform including Vercel.

# Design Document: Pusher Real-time Messaging

## Overview

This design document outlines the technical implementation of real-time messaging using Pusher as a replacement for Socket.IO. The solution leverages Pusher's hosted infrastructure to provide reliable, scalable real-time communication that works seamlessly with Next.js App Router and can be deployed on serverless platforms like Vercel.

### Key Design Decisions

1. **Pusher over Socket.IO**: Eliminates need for custom server, better compatibility with serverless
2. **Private Channels**: All messaging channels require authentication for security
3. **Hybrid Approach**: Combine Pusher events with API calls for reliability
4. **Singleton Pattern**: Single Pusher client instance to avoid connection overhead
5. **Graceful Degradation**: Fall back to API polling if Pusher fails

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Messages Page  │  │ usePusher    │  │ Pusher Client   │ │
│  │                │→ │ Hook         │→ │ (pusher-js)     │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
                    WebSocket / HTTP Fallback
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      Pusher Service                          │
│              (Hosted by Pusher - pusher.com)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         HTTP API Calls
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ /api/pusher/auth │  │ /api/messages│  │ Pusher Server│  │
│  │ (Authentication) │  │ (CRUD)       │  │ (lib/pusher) │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         Database Queries
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                      (via Prisma)                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

#### Sending a Message
```
User types message
    ↓
1. POST /api/messages/private
    ↓
2. Save to database (Prisma)
    ↓
3. Trigger Pusher event
    ↓
4. Pusher broadcasts to channel
    ↓
5. Receiver's client receives event
    ↓
6. Update UI with new message
```

#### Subscribing to a Channel
```
User opens chat
    ↓
1. usePusher hook initializes
    ↓
2. Subscribe to private-chat-{chatId}
    ↓
3. Pusher requests auth from /api/pusher/auth
    ↓
4. Server verifies user token
    ↓
5. Return auth signature
    ↓
6. Pusher completes subscription
    ↓
7. Listen for events
```

## Components and Interfaces

### 1. Pusher Server Instance (`lib/pusher/server.ts`)

**Purpose**: Singleton Pusher server instance for triggering events from API routes

```typescript
import Pusher from 'pusher'

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})

// Helper function to trigger events
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
): Promise<void>

// Helper function to authenticate private channels
export function authenticateChannel(
  socketId: string,
  channel: string,
  userId: string
): { auth: string }
```

### 2. Pusher Client Instance (`lib/pusher/client.ts`)

**Purpose**: Singleton Pusher client instance for browser

```typescript
import PusherClient from 'pusher-js'

let pusherClient: PusherClient | null = null

export function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            // Add auth token from Supabase
          }
        }
      }
    )
  }
  return pusherClient
}

export function disconnectPusher(): void
```

### 3. Pusher Authentication API (`app/api/pusher/auth/route.ts`)

**Purpose**: Authenticate users for private channel subscriptions

```typescript
export async function POST(req: Request): Promise<Response> {
  // 1. Get socket_id and channel_name from request
  // 2. Verify user authentication (Supabase)
  // 3. Verify user has access to this channel
  // 4. Return Pusher auth signature
}
```

**Channel Naming Convention**:
- Private chats: `private-chat-{userId1}-{userId2}` (sorted alphabetically)
- User presence: `presence-user-{userId}`
- Notifications: `private-notifications-{userId}`

### 4. usePusher Hook (`hooks/usePusher.ts`)

**Purpose**: React hook for managing Pusher subscriptions and events

```typescript
interface UsePusherOptions {
  channelName: string
  events: {
    [eventName: string]: (data: any) => void
  }
}

export function usePusher({ channelName, events }: UsePusherOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // 1. Get Pusher client
    // 2. Subscribe to channel
    // 3. Bind event listeners
    // 4. Cleanup on unmount
  }, [channelName])
  
  return { isConnected, error }
}
```

### 5. useRealtimeMessages Hook (Updated)

**Purpose**: Manage real-time messages using Pusher

```typescript
export function useRealtimeMessages({ chatId, chatType, userId }) {
  const [messages, setMessages] = useState<Message[]>([])
  
  // Subscribe to Pusher channel
  usePusher({
    channelName: `private-chat-${getChatId(userId, chatId)}`,
    events: {
      'new-message': (message: Message) => {
        setMessages(prev => [...prev, message])
      },
      'message-read': (data: { messageId: string }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true }
            : msg
        ))
      },
      'typing-start': (data: { userId: string }) => {
        // Handle typing indicator
      },
      'typing-stop': (data: { userId: string }) => {
        // Handle typing indicator
      }
    }
  })
  
  const sendMessage = async (content: string) => {
    // 1. POST to /api/messages/private
    // 2. API saves to DB and triggers Pusher event
    // 3. Optimistically update local state
  }
  
  return { messages, sendMessage, ... }
}
```

### 6. Updated Message API (`app/api/messages/private/route.ts`)

**Purpose**: Handle message CRUD and trigger Pusher events

```typescript
export async function POST(req: Request): Promise<Response> {
  // 1. Verify authentication
  // 2. Validate request data
  // 3. Save message to database
  // 4. Trigger Pusher event
  // 5. Return saved message
  
  const message = await prisma.message.create({ ... })
  
  // Trigger Pusher event
  await pusherServer.trigger(
    `private-chat-${chatId}`,
    'new-message',
    message
  )
  
  return Response.json({ message })
}
```

## Data Models

### Pusher Event Payloads

#### new-message Event
```typescript
{
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'TEXT' | 'FILE'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}
```

#### message-read Event
```typescript
{
  messageId: string
  readBy: string
  readAt: string
}
```

#### typing-start / typing-stop Event
```typescript
{
  userId: string
  userName: string
  chatId: string
}
```

#### user-status-change Event
```typescript
{
  userId: string
  status: 'online' | 'offline' | 'away'
  lastActive: string
}
```

### Database Schema (No Changes Required)

The existing Prisma schema for messages remains unchanged:

```prisma
model Message {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String?
  roomId     String?
  content    String
  type       MessageType @default(TEXT)
  fileUrl    String?
  fileName   String?
  fileSize   Int?
  isRead     Boolean  @default(false)
  readAt     DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  sender     User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver   User?    @relation("ReceivedMessages", fields: [receiverId], references: [id])
  room       Room?    @relation(fields: [roomId], references: [id])
}
```

## Error Handling

### Pusher Connection Errors

```typescript
pusherClient.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err)
  // Fall back to API polling
  startPolling()
})

pusherClient.connection.bind('disconnected', () => {
  console.log('Pusher disconnected')
  setIsConnected(false)
})

pusherClient.connection.bind('connected', () => {
  console.log('Pusher connected')
  setIsConnected(true)
  stopPolling()
})
```

### API Fallback Strategy

```typescript
const sendMessage = async (content: string) => {
  try {
    // Always save via API
    const response = await fetch('/api/messages/private', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content })
    })
    
    if (!response.ok) throw new Error('Failed to send')
    
    const data = await response.json()
    
    // Pusher event is triggered server-side
    // If Pusher fails, message is still saved
    
    return data.message
  } catch (error) {
    // Show error to user
    throw error
  }
}
```

### Polling Fallback

```typescript
function startPolling() {
  if (pollingInterval) return
  
  pollingInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/messages/private?chatId=${chatId}`)
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, 5000) // Poll every 5 seconds
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}
```

## Testing Strategy

### Unit Tests

1. **Pusher Server Helper Functions**
   - Test `triggerPusherEvent` with valid/invalid data
   - Test `authenticateChannel` with authorized/unauthorized users
   - Mock Pusher API responses

2. **Pusher Client Singleton**
   - Test singleton pattern (only one instance)
   - Test connection/disconnection
   - Test event binding/unbinding

3. **usePusher Hook**
   - Test channel subscription
   - Test event handling
   - Test cleanup on unmount

### Integration Tests

1. **End-to-End Message Flow**
   - User A sends message
   - User B receives message in real-time
   - Message appears in both UIs
   - Message saved in database

2. **Authentication Flow**
   - Unauthorized user cannot subscribe to private channel
   - Authorized user can subscribe
   - Auth token expiration handling

3. **Error Scenarios**
   - Pusher service unavailable
   - Network disconnection
   - Invalid channel names
   - Concurrent message sending

### Manual Testing Checklist

- [ ] Send message between two users
- [ ] Receive message in real-time
- [ ] Typing indicators work
- [ ] Read receipts update
- [ ] Online/offline status changes
- [ ] Reconnection after network loss
- [ ] Multiple tabs/windows sync
- [ ] Mobile browser compatibility

## Performance Considerations

### Connection Management

- **Single Pusher Instance**: Use singleton pattern to avoid multiple connections
- **Lazy Subscription**: Only subscribe to channels when needed
- **Unsubscribe on Unmount**: Clean up subscriptions to prevent memory leaks

### Event Optimization

- **Debounce Typing Events**: Send typing events max once per second
- **Batch Read Receipts**: Mark multiple messages as read in single API call
- **Optimistic Updates**: Update UI immediately, sync with server in background

### Pusher Limits (Free Tier)

- **100 concurrent connections**: Sufficient for development and small deployments
- **200,000 messages/day**: ~2.3 messages per second average
- **10 channels per connection**: Enough for typical user (1 chat + 1 presence + notifications)

### Upgrade Path

When exceeding free tier limits:
- **Startup Plan ($49/month)**: 500 connections, 1M messages/day
- **Professional Plan ($299/month)**: 2000 connections, 5M messages/day

## Security Considerations

### Channel Authentication

- All private channels require authentication via `/api/pusher/auth`
- Server verifies user has permission to access channel
- Auth signatures expire and cannot be reused

### Data Validation

- Validate all message content on server before saving
- Sanitize HTML/XSS in message content
- Limit message size (e.g., 10KB max)

### Rate Limiting

- Implement rate limiting on message sending (e.g., 10 messages/minute)
- Prevent spam via typing indicators
- Throttle presence updates

## Deployment Configuration

### Environment Variables

```env
# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Public (exposed to browser)
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

### Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Deploy normally with `vercel deploy`
3. No custom server configuration needed
4. Serverless functions handle API routes

### Railway/Render Deployment

1. Add environment variables in platform settings
2. Deploy with standard Next.js build
3. No special configuration needed

## Migration Plan

### Phase 1: Setup Pusher (Parallel with Socket.IO)

1. Install Pusher dependencies
2. Create Pusher server/client instances
3. Create authentication endpoint
4. Test basic connection

### Phase 2: Implement Core Features

1. Migrate message sending/receiving
2. Add typing indicators
3. Add read receipts
4. Test thoroughly

### Phase 3: Remove Socket.IO

1. Remove Socket.IO dependencies
2. Delete `server.js` custom server
3. Delete `lib/socket/` directory
4. Update `package.json` scripts
5. Update documentation

### Phase 4: Production Deployment

1. Test on staging environment
2. Monitor Pusher dashboard for errors
3. Deploy to production
4. Monitor performance and errors

## Rollback Plan

If Pusher implementation fails:

1. **Keep Socket.IO code**: Don't delete until Pusher is proven stable
2. **Feature flag**: Use environment variable to switch between Socket.IO and Pusher
3. **Database unchanged**: No schema changes, easy to rollback
4. **Quick revert**: Change environment variables and redeploy

```typescript
// Feature flag example
const USE_PUSHER = process.env.NEXT_PUBLIC_USE_PUSHER === 'true'

if (USE_PUSHER) {
  // Use Pusher
} else {
  // Use Socket.IO
}
```

## Monitoring and Observability

### Pusher Dashboard

- Monitor connection count
- Track message volume
- View error rates
- Check API usage

### Application Logging

```typescript
// Log Pusher events
pusherClient.connection.bind('state_change', (states: any) => {
  console.log(`Pusher state: ${states.previous} → ${states.current}`)
})

// Log errors
pusherClient.connection.bind('error', (err: any) => {
  console.error('Pusher error:', err)
  // Send to error tracking service (e.g., Sentry)
})
```

### Metrics to Track

- Message delivery latency
- Connection success rate
- API response times
- Error rates by type
- User engagement (messages sent/received)

---

## Summary

This design provides a robust, scalable real-time messaging solution using Pusher that:

- ✅ Works with Next.js App Router
- ✅ Deploys on Vercel/serverless platforms
- ✅ Provides reliable real-time communication
- ✅ Gracefully degrades when Pusher is unavailable
- ✅ Maintains security through authentication
- ✅ Scales from free tier to enterprise
- ✅ Easy to implement and maintain

The hybrid approach (Pusher + API) ensures messages are always delivered, even if real-time features fail.

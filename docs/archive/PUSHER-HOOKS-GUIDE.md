# 🎣 Pusher Hooks Usage Guide

## Overview

Hai hooks chính để sử dụng Pusher trong React components:

1. **usePusher** - Basic Pusher subscription
2. **usePusherWithFallback** - Pusher với automatic polling fallback

## usePusher Hook

### Basic Usage

```tsx
import { usePusher } from '@/hooks/usePusher'

function ChatComponent({ chatId, userId }) {
  const [messages, setMessages] = useState([])

  const { isConnected, isSubscribed, error } = usePusher({
    channelName: `private-chat-${userId}-${chatId}`,
    events: {
      'new-message': (message) => {
        setMessages(prev => [...prev, message])
      },
      'message-read': (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true }
            : msg
        ))
      }
    }
  })

  return (
    <div>
      {!isConnected && <div>Connecting...</div>}
      {error && <div>Error: {error}</div>}
      {/* Render messages */}
    </div>
  )
}
```

### Multiple Events

```tsx
const { isSubscribed } = usePusher({
  channelName: 'private-notifications-user123',
  events: {
    'new-message': handleNewMessage,
    'friend-request': handleFriendRequest,
    'match-found': handleMatchFound,
    'system-notification': handleSystemNotification
  }
})
```

### Conditional Subscription

```tsx
const { isConnected } = usePusher({
  channelName: `private-chat-${chatId}`,
  events: { 'new-message': handleMessage },
  enabled: !!chatId && isOpen // Only subscribe when chat is open
})
```

## usePusherWithFallback Hook

### With Polling Fallback

```tsx
import { usePusherWithFallback } from '@/hooks/usePusherWithFallback'

function MessagesPage({ chatId }) {
  const [messages, setMessages] = useState([])

  const { connectionStatus, isPolling } = usePusherWithFallback({
    channelName: `private-chat-${chatId}`,
    events: {
      'new-message': (message) => {
        setMessages(prev => [...prev, message])
      }
    },
    pollingInterval: 5000, // Poll every 5 seconds if Pusher fails
    onPoll: async () => {
      // Fetch latest messages from API
      const response = await fetch(`/api/messages/private?chatId=${chatId}`)
      const data = await response.json()
      setMessages(data.messages)
    }
  })

  return (
    <div>
      <ConnectionStatus status={connectionStatus} />
      {isPolling && <div>⚠️ Using polling mode</div>}
      {/* Render messages */}
    </div>
  )
}
```

### Connection Status Indicator

```tsx
function ConnectionStatus({ status }) {
  const statusConfig = {
    connected: { icon: '🟢', text: 'Connected', color: 'green' },
    disconnected: { icon: '🔴', text: 'Disconnected', color: 'red' },
    polling: { icon: '🟡', text: 'Polling', color: 'yellow' },
    error: { icon: '❌', text: 'Error', color: 'red' }
  }

  const config = statusConfig[status]

  return (
    <div style={{ color: config.color }}>
      {config.icon} {config.text}
    </div>
  )
}
```

## Best Practices

### 1. Memoize Event Handlers

```tsx
const handleNewMessage = useCallback((message) => {
  setMessages(prev => [...prev, message])
}, [])

usePusher({
  channelName: 'private-chat-123',
  events: { 'new-message': handleNewMessage }
})
```

### 2. Cleanup on Unmount

Hooks tự động cleanup khi component unmount. Không cần manual cleanup!

### 3. Handle Errors Gracefully

```tsx
const { error } = usePusher({ ... })

useEffect(() => {
  if (error) {
    toast.error(`Connection error: ${error}`)
  }
}, [error])
```

### 4. Show Loading States

```tsx
const { isConnected, isSubscribed } = usePusher({ ... })

if (!isConnected) {
  return <LoadingSpinner text="Connecting..." />
}

if (!isSubscribed) {
  return <LoadingSpinner text="Subscribing..." />
}

return <ChatInterface />
```

## Common Patterns

### Pattern 1: Chat Messages

```tsx
function ChatRoom({ chatId, userId, receiverId }) {
  const [messages, setMessages] = useState([])
  const channelName = [userId, receiverId].sort().join('-')

  usePusher({
    channelName: `private-chat-${channelName}`,
    events: {
      'new-message': (msg) => setMessages(prev => [...prev, msg]),
      'message-read': (data) => updateMessageReadStatus(data),
      'typing-start': (data) => setTypingUsers(prev => [...prev, data.userId]),
      'typing-stop': (data) => setTypingUsers(prev => prev.filter(id => id !== data.userId))
    }
  })
}
```

### Pattern 2: Notifications

```tsx
function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  usePusher({
    channelName: `private-notifications-${userId}`,
    events: {
      'new-notification': (notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        showBrowserNotification(notification)
      }
    }
  })
}
```

### Pattern 3: Presence (Online/Offline)

```tsx
function UserPresence({ userId }) {
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  usePusher({
    channelName: `presence-user-${userId}`,
    events: {
      'pusher:member_added': (member) => {
        setOnlineUsers(prev => new Set([...prev, member.id]))
      },
      'pusher:member_removed': (member) => {
        setOnlineUsers(prev => {
          const next = new Set(prev)
          next.delete(member.id)
          return next
        })
      }
    }
  })
}
```

## Troubleshooting

### Hook not subscribing

**Check:**
1. User is authenticated
2. Channel name is correct
3. `enabled` prop is true
4. Pusher credentials in `.env`

### Events not firing

**Check:**
1. Event name matches exactly (case-sensitive)
2. Server is triggering events correctly
3. Channel is subscribed (check `isSubscribed`)
4. Event handler is defined

### Memory leaks

**Solution:** Hooks automatically cleanup. If you see leaks:
1. Don't create new event handlers on every render
2. Use `useCallback` for event handlers
3. Check for circular dependencies

## Performance Tips

1. **Limit subscriptions**: Only subscribe to channels you need
2. **Unsubscribe when not needed**: Use `enabled` prop
3. **Batch updates**: Use `setState` with updater function
4. **Debounce events**: For high-frequency events like typing

---

**Next:** Implement messaging with these hooks! 🚀

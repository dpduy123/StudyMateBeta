# Browser Notifications System

This directory contains the implementation of browser notifications for real-time messaging using the Web Notifications API and Pusher.

## Components

### `useNotifications` Hook

A React hook that manages browser notifications for the current user.

**Features:**
- Checks browser notification support
- Requests notification permission from user
- Listens for notification events via Pusher
- Shows browser notifications with sender info and message preview
- Navigates to chat when notification is clicked
- Respects user preferences (only shows when page is hidden/unfocused)

**Usage:**
```tsx
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const { permission, isSupported, requestPermission } = useNotifications({
    userId: 'user-123',
    enabled: true
  })

  return (
    <button onClick={requestPermission}>
      Enable Notifications
    </button>
  )
}
```

### `NotificationSettings` Component

A settings panel that displays the current notification permission status and allows users to enable notifications.

**Features:**
- Shows different UI based on permission state (default, granted, denied)
- Provides clear instructions for each state
- Handles browser compatibility issues
- Vietnamese language support

**Usage:**
```tsx
import { NotificationSettings } from '@/components/notifications'

<NotificationSettings userId={currentUser.id} />
```

### `NotificationBanner` Component

A dismissible banner that prompts users to enable notifications.

**Features:**
- Only shows when permission is 'default' (not yet requested)
- Can be dismissed (stores preference in localStorage)
- Auto-hides after permission is granted
- Responsive design
- Vietnamese language support

**Usage:**
```tsx
import { NotificationBanner } from '@/components/notifications'

<NotificationBanner userId={currentUser.id} />
```

## How It Works

### 1. Notification Event Flow

```
User A sends message to User B
    ↓
API checks if User B is viewing the chat
    ↓
If NOT viewing, trigger 'message-notification' event
    ↓
Pusher broadcasts to User B's notification channel
    ↓
useNotifications hook receives event
    ↓
Check if page is hidden/unfocused
    ↓
Show browser notification
    ↓
User clicks notification → Navigate to chat
```

### 2. Permission States

- **default**: User hasn't been asked yet (show banner/prompt)
- **granted**: User allowed notifications (show notifications)
- **denied**: User blocked notifications (show instructions to re-enable)

### 3. Smart Notification Logic

Notifications are only shown when:
- Browser supports notifications
- User has granted permission
- Page is hidden (`document.hidden === true`) OR
- Page is not focused (`document.hasFocus() === false`)

This prevents duplicate notifications when the user is already viewing the chat.

## API Integration

### Message API (`/api/messages/private`)

The message API accepts an optional `isReceiverViewing` parameter:

```typescript
POST /api/messages/private
{
  "receiverId": "user-123",
  "content": "Hello!",
  "isReceiverViewing": false  // Only send notification if false
}
```

When `isReceiverViewing` is `false`, the API triggers a notification event:

```typescript
await triggerPusherEvent(
  `private-notifications-${receiverId}`,
  'message-notification',
  {
    senderId: user.id,
    senderName: "John Doe",
    senderAvatar: "https://...",
    content: "Hello!",
    messageId: "msg-123",
    chatId: user.id,
    timestamp: "2024-01-01T00:00:00Z"
  }
)
```

## Pusher Channels

### Notification Channel

Each user has a private notification channel:
- Channel name: `private-notifications-{userId}`
- Requires authentication
- Events: `message-notification`

### Event Payload

```typescript
interface NotificationData {
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string        // Message preview (max 100 chars)
  messageId: string
  chatId: string        // ID to navigate to
  timestamp: string
}
```

## Browser Compatibility

The notification system gracefully handles browsers that don't support notifications:

- **Supported**: Chrome, Firefox, Safari, Edge (desktop and mobile)
- **Not Supported**: Older browsers, some mobile browsers

When not supported, the UI shows an appropriate message.

## User Experience

### First Time User Flow

1. User opens messages page
2. Banner appears: "Bật thông báo để không bỏ lỡ tin nhắn quan trọng"
3. User clicks "Bật ngay"
4. Browser shows permission dialog
5. If granted: Banner disappears, notifications enabled
6. If denied: Banner shows instructions to re-enable

### Notification Appearance

- **Title**: Sender's full name
- **Body**: Message content (truncated to 100 chars)
- **Icon**: Sender's avatar or app logo
- **Action**: Click to navigate to chat
- **Auto-close**: After 5 seconds

## Testing

### Manual Testing Checklist

- [ ] Request notification permission
- [ ] Receive notification when page is hidden
- [ ] Click notification navigates to correct chat
- [ ] No notification when viewing the chat
- [ ] Banner dismisses and stays dismissed
- [ ] Settings show correct permission state
- [ ] Works on mobile browsers
- [ ] Handles denied permission gracefully

### Testing in Development

1. Open messages page in two browser windows
2. Log in as different users in each window
3. Minimize or switch away from one window
4. Send message from the other window
5. Notification should appear in the minimized window

## Troubleshooting

### Notifications Not Showing

1. Check browser console for errors
2. Verify permission is granted: `Notification.permission`
3. Check Pusher connection in network tab
4. Verify user is subscribed to notification channel
5. Ensure page is hidden/unfocused when testing

### Permission Denied

Users must manually re-enable in browser settings:
- **Chrome**: Settings → Privacy → Site Settings → Notifications
- **Firefox**: Settings → Privacy → Permissions → Notifications
- **Safari**: Preferences → Websites → Notifications

## Future Enhancements

- [ ] Notification sound
- [ ] Notification grouping (multiple messages)
- [ ] Rich notifications with actions (Reply, Mark as Read)
- [ ] Push notifications for mobile apps
- [ ] Notification preferences (mute specific chats)
- [ ] Do Not Disturb mode
- [ ] Notification history

## Related Files

- `hooks/useNotifications.ts` - Main notification hook
- `hooks/usePusher.ts` - Pusher subscription hook
- `app/api/messages/private/route.ts` - Message API with notification trigger
- `lib/pusher/server.ts` - Pusher server utilities
- `.kiro/specs/pusher-realtime-messaging/` - Full specification

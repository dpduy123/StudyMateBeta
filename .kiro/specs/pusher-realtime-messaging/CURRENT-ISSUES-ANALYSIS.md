# Phân Tích Các Vấn Đề Hiện Tại - Pusher Real-time Messaging

## Ngày: 26/10/2025

## Tổng Quan

Sau khi hoàn thành việc migrate từ Socket.IO sang Pusher và remove toàn bộ Socket.IO code, hệ thống đang gặp 2 vấn đề chính:

1. **Luôn hiển thị trạng thái Offline** - Mặc dù đã implement Pusher presence channels
2. **Danh sách tin nhắn không cập nhật real-time** - Conversation list không update khi có tin nhắn mới

## Vấn Đề 1: Trạng Thái Luôn Hiển thị Offline

### Triệu Chứng
- Tất cả users trong conversation list đều hiển thị "Offline"
- Trong chat header cũng hiển thị "Offline" 
- Không có green dot indicator cho online users
- Presence tracking không hoạt động

### Phân Tích Nguyên Nhân

#### 1. Presence Channel Authentication
**File:** `app/api/pusher/auth/route.ts`

Cần kiểm tra:
- [ ] Presence channel có đang được authenticate đúng không?
- [ ] User info có được trả về trong auth response không?
- [ ] Channel name format có đúng không? (`presence-user-{userId}`)

#### 2. User Presence Subscription
**Files:** 
- `hooks/useOtherUserPresence.ts`
- `hooks/useMultipleUsersPresence.ts`

Vấn đề tiềm ẩn:
- Hook đang subscribe đến presence channel của OTHER users
- Nhưng để presence channel hoạt động, chính USER ĐÓ phải subscribe vào channel của họ
- **Root cause:** User không tự subscribe vào presence channel của chính họ

**Ví dụ:**
```typescript
// ❌ SAI: User A subscribe vào presence-user-B để xem B online
// Nhưng User B chưa subscribe vào presence-user-B của chính họ

// ✅ ĐÚNG: 
// - User B phải subscribe vào presence-user-B (của chính họ)
// - User A subscribe vào presence-user-B để observe
```

#### 3. Database lastActive Tracking
**File:** `app/api/user/[userId]/status/route.ts`

Logic hiện tại:
```typescript
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
const isOnline = user.lastActive > fiveMinutesAgo
```

Vấn đề:
- [ ] `lastActive` có được update khi user login không?
- [ ] Có mechanism nào update `lastActive` định kỳ không?
- [ ] Khi user disconnect, `lastActive` có được update không?

#### 4. Presence Event Triggers
**Thiếu:** Không có code trigger presence events khi:
- User login/logout
- User active/inactive
- Browser tab focus/blur
- Network reconnect

### Giải Pháp Đề Xuất

#### A. Tạo Hook để User Subscribe vào Presence Channel của Chính Họ
```typescript
// hooks/useMyPresence.ts
export function useMyPresence(userId: string) {
  useEffect(() => {
    // Subscribe to own presence channel
    const channel = pusher.subscribe(`presence-user-${userId}`)
    
    // Update lastActive in database periodically
    const interval = setInterval(() => {
      fetch('/api/user/presence/heartbeat', { method: 'POST' })
    }, 60000) // Every minute
    
    return () => {
      clearInterval(interval)
      channel.unsubscribe()
    }
  }, [userId])
}
```

#### B. Tạo API Endpoint để Update Presence
```typescript
// app/api/user/presence/heartbeat/route.ts
export async function POST(req: Request) {
  // Update user's lastActive timestamp
  // Trigger presence event
}
```

#### C. Sử dụng Hook trong Layout/Provider
```typescript
// components/providers/Providers.tsx
export function Providers({ children }) {
  const { user } = useAuth()
  
  // Subscribe to own presence
  useMyPresence(user?.id)
  
  return <>{children}</>
}
```

## Vấn Đề 2: Conversation List Không Update Real-time

### Triệu Chứng
- Khi gửi tin nhắn mới, conversation list không update
- Last message preview không thay đổi
- Unread count không tăng
- Conversation không di chuyển lên đầu list

### Phân Tích Nguyên Nhân

#### 1. ConversationsList Component Không Subscribe Pusher Events
**File:** `components/chat/ConversationsList.tsx`

Hiện tại:
```typescript
// ❌ Component chỉ fetch conversations một lần khi mount
useEffect(() => {
  fetchConversations()
}, [currentUserId])

// Không có Pusher subscription để listen new messages
```

Cần:
```typescript
// ✅ Subscribe to message events for all conversations
usePusher({
  channelName: `private-user-${currentUserId}-conversations`,
  events: {
    'conversation-updated': (data) => {
      // Update conversation in list
    }
  }
})
```

#### 2. API Không Trigger Conversation Update Events
**File:** `app/api/messages/private/route.ts`

Hiện tại:
```typescript
// Chỉ trigger 'new-message' event trên chat channel
await pusherServer.trigger(
  `private-chat-${chatId}`,
  'new-message',
  message
)
```

Cần thêm:
```typescript
// Trigger conversation update cho cả sender và receiver
await pusherServer.trigger(
  `private-user-${senderId}-conversations`,
  'conversation-updated',
  conversationData
)

await pusherServer.trigger(
  `private-user-${receiverId}-conversations`,
  'conversation-updated',
  conversationData
)
```

#### 3. Không Có API Endpoint để Fetch Conversations
**File:** `app/api/conversations/route.ts`

Hiện tại:
- Component fallback về mock data
- Không có real API implementation

Cần:
- Implement API để fetch conversations từ database
- Include last message, unread count, last activity

### Giải Pháp Đề Xuất

#### A. Implement Conversations API
```typescript
// app/api/conversations/route.ts
export async function GET(req: Request) {
  // 1. Get current user from auth
  // 2. Query messages where user is sender or receiver
  // 3. Group by conversation (other user)
  // 4. Get last message for each conversation
  // 5. Count unread messages
  // 6. Sort by last activity
  // 7. Return conversations array
}
```

#### B. Subscribe to Conversation Updates in ConversationsList
```typescript
// components/chat/ConversationsList.tsx
usePusher({
  channelName: `private-user-${currentUserId}-conversations`,
  events: {
    'conversation-updated': (data) => {
      setConversations(prev => {
        // Update or add conversation
        // Re-sort by last activity
        // Update unread count
      })
    }
  }
})
```

#### C. Trigger Conversation Events When Sending Messages
```typescript
// app/api/messages/private/route.ts
// After saving message and triggering new-message event

// Get conversation data
const conversationData = {
  id: receiverId,
  lastMessage: message,
  lastActivity: message.createdAt,
  unreadCount: await getUnreadCount(receiverId, senderId)
}

// Trigger for sender (update their conversation list)
await pusherServer.trigger(
  `private-user-${senderId}-conversations`,
  'conversation-updated',
  conversationData
)

// Trigger for receiver (update their conversation list)
await pusherServer.trigger(
  `private-user-${receiverId}-conversations`,
  'conversation-updated',
  { ...conversationData, unreadCount: conversationData.unreadCount + 1 }
)
```

## Kế Hoạch Thực Hiện

### Phase 1: Fix Presence Status (Task 12.1)
1. Tạo `useMyPresence` hook
2. Tạo `/api/user/presence/heartbeat` endpoint
3. Integrate hook vào Providers
4. Test presence tracking

### Phase 2: Fix Conversation List Updates (Task 12.2)
1. Implement `/api/conversations` endpoint
2. Add Pusher subscription trong ConversationsList
3. Trigger conversation events khi send message
4. Test real-time updates

### Phase 3: Testing & Verification (Task 12.3)
1. Test với multiple users
2. Test với multiple browser tabs
3. Verify tất cả real-time features
4. Monitor Pusher dashboard

## Checklist Kiểm Tra

### Presence Status
- [ ] User subscribe vào presence channel của chính họ khi login
- [ ] lastActive được update định kỳ (heartbeat)
- [ ] Presence events được trigger khi connect/disconnect
- [ ] Other users có thể observe presence status
- [ ] Green dot indicator hiển thị đúng
- [ ] "Đang hoạt động" / "Offline" text hiển thị đúng

### Conversation List
- [ ] API `/api/conversations` trả về đúng data
- [ ] Conversation list subscribe Pusher events
- [ ] Last message preview update khi có tin nhắn mới
- [ ] Unread count tăng khi nhận tin nhắn
- [ ] Conversation di chuyển lên đầu khi có activity
- [ ] Works với cả sender và receiver

## Tài Liệu Tham Khảo

- [Pusher Presence Channels](https://pusher.com/docs/channels/using_channels/presence-channels/)
- [Pusher Private Channels](https://pusher.com/docs/channels/using_channels/private-channels/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Ghi Chú

- Presence channels yêu cầu user phải subscribe vào channel của CHÍNH HỌ, không phải channel của người khác
- Conversation updates cần trigger events cho CẢ sender VÀ receiver
- Cần implement proper cleanup khi component unmount để tránh memory leaks
- Monitor Pusher dashboard để debug connection và event issues

---

**Status:** 🔴 Issues Identified - Ready for Implementation

**Next Step:** Start implementing Task 12.1 - Fix offline status display issue

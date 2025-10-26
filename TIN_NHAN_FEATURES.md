# 📱 Tính năng Tin nhắn StudyMate - Phân tích chi tiết

## 🎯 Tổng quan
StudyMate hiện tại có hệ thống tin nhắn cơ bản với khả năng chat 1-1 và chat nhóm trong phòng học. Dự án đang sử dụng Supabase Realtime để đồng bộ tin nhắn theo thời gian thực.

---

## 📋 Tính năng hiện có

### 1. **Tin nhắn riêng tư (Private Messages)**

#### ✅ Đã có:
- **Chat 1-1**: Tin nhắn giữa 2 người dùng đã match
- **Giao diện responsive**: Tối ưu cho mobile và desktop
- **Hiển thị trạng thái online/offline**: Dựa trên `lastActive`
- **Nhóm tin nhắn**: Gộp tin nhắn liên tiếp từ cùng người gửi
- **Timestamp**: Hiển thị thời gian gửi tin nhắn
- **Avatar**: Hiển thị ảnh đại diện người gửi
- **Danh sách cuộc trò chuyện**: Với tin nhắn cuối và số tin chưa đọc
- **Tìm kiếm cuộc trò chuyện**: Tìm theo tên người dùng

#### 🔧 Các component chính:
```typescript
// Components
- ConversationsList.tsx    // Danh sách cuộc trò chuyện
- ChatContainer.tsx        // Container chính cho chat
- MessageList.tsx          // Danh sách tin nhắn
- MessageBubble.tsx        // Bubble tin nhắn đơn lẻ
- MessageInput.tsx         // Input gửi tin nhắn

// Hooks
- useRealtimeMessages.ts   // Hook quản lý realtime messages

// API Routes
- /api/conversations       // Lấy danh sách cuộc trò chuyện
- /api/messages/private    // CRUD tin nhắn riêng tư
```

#### 📊 Database Schema:
```sql
-- Bảng messages cho tin nhắn riêng tư
model Message {
  id          String      @id @default(cuid())
  senderId    String
  receiverId  String
  type        MessageType @default(TEXT)
  content     String
  fileUrl     String?     // Cho file đính kèm
  fileName    String?
  fileSize    Int?
  isRead      Boolean     @default(false)
  createdAt   DateTime    @default(now())
  readAt      DateTime?
  
  // Relations
  sender      User        @relation("MessageSender")
  receiver    User        @relation("MessageReceiver")
}
```

### 2. **Tin nhắn nhóm (Room Messages)**

#### ✅ Đã có:
- **Chat trong phòng học**: Tin nhắn trong các phòng voice/video
- **Reply tin nhắn**: Trả lời tin nhắn cụ thể
- **Chỉnh sửa tin nhắn**: Edit tin nhắn đã gửi
- **Xóa tin nhắn**: Delete tin nhắn (với xác nhận)
- **Hiển thị trạng thái chỉnh sửa**: Đánh dấu tin nhắn đã edit

#### 📊 Database Schema:
```sql
-- Bảng room_messages cho tin nhắn nhóm
model RoomMessage {
  id          String      @id @default(cuid())
  roomId      String
  senderId    String
  type        MessageType @default(TEXT)
  content     String
  fileUrl     String?
  replyToId   String?     // Cho reply
  isEdited    Boolean     @default(false)
  editedAt    DateTime?
  
  // Relations
  room        Room        @relation(fields: [roomId])
  sender      User        @relation("RoomMessageSender")
  replyTo     RoomMessage? @relation("MessageReply")
  replies     RoomMessage[] @relation("MessageReply")
}
```

### 3. **Realtime Features**

#### ✅ Đã có:
- **Supabase Realtime**: Đồng bộ tin nhắn theo thời gian thực
- **Auto-scroll**: Tự động cuộn xuống tin nhắn mới
- **Typing indicators**: Cơ bản (trong code)
- **Message status**: Đã gửi/đã đọc cho tin nhắn riêng tư

#### 🔧 Realtime Implementation:
```typescript
// Subscription cho tin nhắn mới
const channel = supabase
  .channel(`messages_${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiverId=eq.${chatId}`
  }, handleNewMessage)
  .subscribe()
```

### 4. **UI/UX Features**

#### ✅ Đã có:
- **Responsive design**: Mobile-first approach
- **Dark/Light theme ready**: Sử dụng Tailwind CSS
- **Animations**: Framer Motion cho smooth transitions
- **Loading states**: Spinner và skeleton loading
- **Error handling**: Hiển thị lỗi khi không tải được tin nhắn
- **Empty states**: Hiển thị khi chưa có tin nhắn
- **Scroll to bottom**: Button để cuộn xuống tin nhắn mới nhất

---

## ❌ Tính năng còn thiếu

### 1. **Socket.IO Integration**
- ❌ Chưa có Socket.IO server
- ❌ Chưa có real-time typing indicators
- ❌ Chưa có presence system (ai đang online)
- ❌ Chưa có real-time notifications

### 2. **File Sharing**
- ❌ Upload và chia sẻ file
- ❌ Image preview trong chat
- ❌ File download
- ❌ File size limits và validation

### 3. **Voice & Video Messages**
- ❌ Ghi âm voice messages
- ❌ Video messages
- ❌ Audio player trong chat

### 4. **Advanced Features**
- ❌ Message reactions (emoji)
- ❌ Message forwarding
- ❌ Message search trong conversation
- ❌ Message encryption
- ❌ Bulk message operations

### 5. **Notifications**
- ❌ Push notifications cho tin nhắn mới
- ❌ Email notifications
- ❌ In-app notifications
- ❌ Notification settings

### 6. **Group Chat Management**
- ❌ Tạo group chat riêng (ngoài rooms)
- ❌ Add/remove members
- ❌ Group admin features
- ❌ Group settings

### 7. **Message Analytics**
- ❌ Message delivery status
- ❌ Read receipts chi tiết
- ❌ Response time analytics
- ❌ Chat activity metrics

---

## 🚀 Plan triển khai Socket.IO

### Phase 1: Setup Socket.IO Server

#### 1.1 Cài đặt dependencies
```bash
npm install socket.io @types/socket.io
npm install socket.io-client # Đã có
```

#### 1.2 Tạo Socket.IO server
```typescript
// lib/socket/server.ts
import { Server } from 'socket.io'
import { createServer } from 'http'

export function initSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"]
    }
  })

  // Middleware xác thực
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    // Verify JWT token
    next()
  })

  return io
}
```

#### 1.3 Tích hợp với Next.js
```typescript
// pages/api/socket.ts (hoặc app/api/socket/route.ts)
import { NextApiRequest, NextApiResponse } from 'next'
import { initSocketServer } from '@/lib/socket/server'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket.server.io) {
    const httpServer = res.socket.server
    const io = initSocketServer(httpServer)
    res.socket.server.io = io
  }
  res.end()
}
```

### Phase 2: Real-time Messaging

#### 2.1 Socket events cho tin nhắn
```typescript
// lib/socket/events.ts
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Messages
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  
  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  
  // Rooms
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_MESSAGE: 'room_message'
}
```

#### 2.2 Message handlers
```typescript
// lib/socket/messageHandlers.ts
import { Server, Socket } from 'socket.io'
import { prisma } from '@/lib/prisma'

export function setupMessageHandlers(io: Server, socket: Socket) {
  // Gửi tin nhắn riêng tư
  socket.on('send_private_message', async (data) => {
    const { receiverId, content, type } = data
    
    // Lưu vào database
    const message = await prisma.message.create({
      data: {
        senderId: socket.userId,
        receiverId,
        content,
        type
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Gửi đến người nhận
    socket.to(`user_${receiverId}`).emit('receive_message', message)
    
    // Confirm đến người gửi
    socket.emit('message_sent', message)
  })

  // Đánh dấu đã đọc
  socket.on('mark_as_read', async (data) => {
    const { messageId } = data
    
    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() }
    })

    // Thông báo đến người gửi
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })
    
    if (message) {
      socket.to(`user_${message.senderId}`).emit('message_read', {
        messageId,
        readAt: new Date()
      })
    }
  })
}
```

### Phase 3: Typing Indicators

#### 3.1 Client-side typing detection
```typescript
// hooks/useTypingIndicator.ts
import { useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'

export function useTypingIndicator(chatId: string, chatType: 'private' | 'room') {
  const socket = useSocket()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const startTyping = () => {
    if (chatType === 'private') {
      socket?.emit('typing_start', { receiverId: chatId })
    } else {
      socket?.emit('room_typing_start', { roomId: chatId })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const stopTyping = () => {
    if (chatType === 'private') {
      socket?.emit('typing_stop', { receiverId: chatId })
    } else {
      socket?.emit('room_typing_stop', { roomId: chatId })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  return { startTyping, stopTyping }
}
```

#### 3.2 Typing indicator component
```typescript
// components/chat/TypingIndicator.tsx
import { useEffect, useState } from 'react'
import { useSocket } from '@/hooks/useSocket'

interface TypingIndicatorProps {
  chatId: string
  chatType: 'private' | 'room'
}

export function TypingIndicator({ chatId, chatType }: TypingIndicatorProps) {
  const socket = useSocket()
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    if (!socket) return

    const handleTypingStart = (data: any) => {
      setTypingUsers(prev => [...prev, data.userId])
    }

    const handleTypingStop = (data: any) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId))
    }

    socket.on('user_typing_start', handleTypingStart)
    socket.on('user_typing_stop', handleTypingStop)

    return () => {
      socket.off('user_typing_start', handleTypingStart)
      socket.off('user_typing_stop', handleTypingStop)
    }
  }, [socket])

  if (typingUsers.length === 0) return null

  return (
    <div className="px-4 py-2 text-sm text-gray-500">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span>
          {typingUsers.length === 1 
            ? 'Đang nhập...' 
            : `${typingUsers.length} người đang nhập...`
          }
        </span>
      </div>
    </div>
  )
}
```

### Phase 4: Presence System

#### 4.1 User presence tracking
```typescript
// lib/socket/presenceHandlers.ts
export function setupPresenceHandlers(io: Server, socket: Socket) {
  // User joins
  socket.on('user_online', async (userId: string) => {
    socket.userId = userId
    socket.join(`user_${userId}`)
    
    // Update last active
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    })

    // Notify friends
    const friends = await getFriendsList(userId)
    friends.forEach(friendId => {
      socket.to(`user_${friendId}`).emit('friend_online', {
        userId,
        lastActive: new Date()
      })
    })
  })

  // User disconnects
  socket.on('disconnect', async () => {
    if (socket.userId) {
      // Update last active
      await prisma.user.update({
        where: { id: socket.userId },
        data: { lastActive: new Date() }
      })

      // Notify friends
      const friends = await getFriendsList(socket.userId)
      friends.forEach(friendId => {
        socket.to(`user_${friendId}`).emit('friend_offline', {
          userId: socket.userId,
          lastActive: new Date()
        })
      })
    }
  })
}
```

### Phase 5: File Sharing

#### 5.1 File upload với Socket.IO
```typescript
// lib/socket/fileHandlers.ts
export function setupFileHandlers(io: Server, socket: Socket) {
  socket.on('upload_file', async (data) => {
    const { receiverId, file, fileName, fileType } = data
    
    // Upload file to storage (Supabase Storage)
    const fileUrl = await uploadFileToStorage(file, fileName)
    
    // Create message with file
    const message = await prisma.message.create({
      data: {
        senderId: socket.userId,
        receiverId,
        type: 'FILE',
        content: fileName,
        fileUrl,
        fileName,
        fileSize: file.size
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Send to receiver
    socket.to(`user_${receiverId}`).emit('receive_message', message)
    socket.emit('message_sent', message)
  })
}
```

### Phase 6: Push Notifications

#### 6.1 Web Push Notifications
```typescript
// lib/notifications/webPush.ts
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  subscription: any,
  payload: {
    title: string
    body: string
    icon?: string
    badge?: string
    data?: any
  }
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}
```

---

## 📊 Timeline triển khai

### Week 1-2: Socket.IO Setup
- [ ] Cài đặt Socket.IO server
- [ ] Tích hợp với Next.js
- [ ] Setup authentication middleware
- [ ] Test basic connection

### Week 3-4: Real-time Messaging
- [ ] Implement message handlers
- [ ] Update client-side hooks
- [ ] Test message delivery
- [ ] Add message status tracking

### Week 5-6: Advanced Features
- [ ] Typing indicators
- [ ] Presence system
- [ ] File sharing
- [ ] Voice messages

### Week 7-8: Notifications & Polish
- [ ] Push notifications
- [ ] Email notifications
- [ ] Performance optimization
- [ ] Testing & bug fixes

---

## 🔧 Technical Considerations

### Performance
- **Message pagination**: Load tin nhắn theo batch
- **Connection pooling**: Quản lý Socket.IO connections
- **Redis adapter**: Scale Socket.IO với Redis
- **Database indexing**: Index cho queries tin nhắn

### Security
- **JWT authentication**: Xác thực Socket.IO connections
- **Rate limiting**: Giới hạn số tin nhắn/phút
- **Input validation**: Validate tin nhắn trước khi lưu
- **File upload security**: Scan malware, giới hạn file types

### Scalability
- **Horizontal scaling**: Multiple Socket.IO instances
- **Database sharding**: Chia database theo user
- **CDN**: Serve static files qua CDN
- **Caching**: Cache conversations và messages

---

## 📈 Metrics cần theo dõi

### User Engagement
- Số tin nhắn gửi/ngày
- Thời gian phản hồi trung bình
- Tỷ lệ tin nhắn được đọc
- Số cuộc trò chuyện active

### Technical Metrics
- Socket.IO connection count
- Message delivery latency
- File upload success rate
- Error rates

### Business Metrics
- User retention qua messaging
- Conversion từ message sang video call
- Premium feature usage
- Support ticket reduction

---

*Tài liệu này sẽ được cập nhật theo tiến độ phát triển dự án.*
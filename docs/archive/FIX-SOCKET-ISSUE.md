# 🔧 Sửa lỗi Socket.IO: "transport close"

## ❌ Vấn đề:
```
Socket disconnected: transport close
Failed to send message via socket
```

Socket.IO không thể kết nối và liên tục bị ngắt.

## 🔍 Nguyên nhân có thể:

### 1. Socket.IO server chưa chạy đúng
Next.js App Router không tự động khởi động Socket.IO server như Pages Router.

### 2. Endpoint `/api/socket/io` không hoạt động
File `pages/api/socket/io.ts` có thể không được Next.js nhận diện.

### 3. CORS hoặc authentication issues
Token không hợp lệ hoặc CORS chặn kết nối.

## ✅ GIẢI PHÁP:

### Bước 1: Kiểm tra Socket.IO server có chạy không

Mở browser và truy cập:
```
http://localhost:3000/api/socket/io
```

**Nếu thấy lỗi 404** → Socket.IO server chưa chạy
**Nếu thấy "Bad Request" hoặc response khác** → Server đang chạy

### Bước 2: Tạo lại Socket.IO endpoint cho App Router

Socket.IO cần được khởi tạo khác với App Router. Tạo file mới:

**File: `app/api/socket/io/route.ts`**

```typescript
import { NextRequest } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

// Lưu Socket.IO server instance
let io: SocketIOServer | null = null

export async function GET(req: NextRequest) {
  if (!io) {
    // Khởi tạo Socket.IO server
    const httpServer = (req as any).socket?.server
    
    if (!httpServer) {
      return new Response('Socket.IO server not available', { status: 500 })
    }

    io = new SocketIOServer(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        
        if (!token) {
          return next(new Error('Authentication error'))
        }

        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll() { return [] },
              setAll() {}
            }
          }
        )

        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error || !user) {
          return next(new Error('Authentication error'))
        }

        const userDetails = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        })

        if (!userDetails) {
          return next(new Error('User not found'))
        }

        ;(socket as any).userId = user.id
        ;(socket as any).user = userDetails

        next()
      } catch (error) {
        console.error('Socket authentication error:', error)
        next(new Error('Authentication error'))
      }
    })

    // Socket event handlers
    io.on('connection', (socket) => {
      const userId = (socket as any).userId
      console.log(`✅ User ${userId} connected`)

      socket.join(`user:${userId}`)

      socket.on('join-chat', (chatId: string) => {
        socket.join(`chat:${chatId}`)
        console.log(`User ${userId} joined chat:${chatId}`)
      })

      socket.on('send-message', async (data: {
        receiverId: string
        content: string
        type?: 'TEXT' | 'FILE'
        fileUrl?: string
        fileName?: string
        fileSize?: number
      }) => {
        try {
          const message = await prisma.message.create({
            data: {
              senderId: userId,
              receiverId: data.receiverId,
              content: data.content,
              type: data.type || 'TEXT',
              fileUrl: data.fileUrl,
              fileName: data.fileName,
              fileSize: data.fileSize
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

          const chatId = [userId, data.receiverId].sort().join('-')
          io?.to(`chat:${chatId}`).emit('new-message', message)
          io?.to(`user:${data.receiverId}`).emit('message-notification', {
            senderId: userId,
            content: data.content,
            messageId: message.id
          })

        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('message-error', { error: 'Failed to send message' })
        }
      })

      socket.on('disconnect', () => {
        console.log(`❌ User ${userId} disconnected`)
      })
    })

    console.log('✅ Socket.IO server initialized')
  }

  return new Response('Socket.IO server running', { status: 200 })
}

export const dynamic = 'force-dynamic'
```

### Bước 3: HOẶC sử dụng giải pháp đơn giản hơn - Fallback to API

Nếu Socket.IO quá phức tạp, hãy sửa code để dùng API thay vì Socket:

**File: `hooks/useRealtimeMessages.ts`**

Sửa hàm `sendMessage`:

```typescript
const sendMessage = async (content: string, type: 'TEXT' | 'FILE' = 'TEXT', fileData?: any) => {
  try {
    // Thử dùng Socket trước
    if (chatType === 'private' && isConnected) {
      const success = socketSendMessage(chatId, content, type, fileData)
      if (success) {
        return // Gửi thành công qua Socket
      }
    }
    
    // Fallback to API nếu Socket không hoạt động
    console.log('Socket not available, using API fallback')
    const response = await fetch('/api/messages/private', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: chatId,
        content,
        type,
        ...fileData
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message via API')
    }

    const data = await response.json()
    
    // Thêm message vào state local
    setMessages(prev => [...prev, data.message])
    
    return data.message
  } catch (err) {
    throw err
  }
}
```

### Bước 4: Restart server

```bash
# Dừng server (Ctrl+C)
# Xóa cache
rm -rf .next

# Chạy lại
npm run dev
```

## 🎯 Giải pháp NHANH NHẤT (Khuyến nghị):

**Dùng API thay vì Socket.IO cho đơn giản:**

1. Sửa `sendMessage` để fallback to API (như Bước 3)
2. Restart server
3. Test gửi tin nhắn

Socket.IO có thể setup sau khi app đã chạy ổn định.

## 📝 Kiểm tra sau khi sửa:

1. ✅ Không còn lỗi "transport close"
2. ✅ Gửi tin nhắn thành công
3. ✅ Tin nhắn hiển thị trong chat
4. ✅ Database có record mới

---

**Lưu ý:** Socket.IO với Next.js App Router khá phức tạp. Nếu chỉ cần messaging cơ bản, dùng API + polling hoặc Server-Sent Events đơn giản hơn nhiều!

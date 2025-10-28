# 🔧 GIẢI PHÁP CUỐI CÙNG CHO SOCKET.IO

## 🎯 VẤN ĐỀ THỰC SỰ:

Socket.IO **ĐANG HOẠT ĐỘNG** nhưng bị **disconnect/reconnect liên tục** do:

1. **React re-renders** - Component mount/unmount nhiều lần
2. **useEffect cleanup** - Disconnect socket mỗi khi cleanup
3. **useChatSocket** - Join/leave chat liên tục

## ✅ GIẢI PHÁP ĐƠN GIẢN NHẤT:

### Tạm thời BỎ QUA Socket.IO, dùng API + Polling

Vì Socket.IO với Next.js App Router quá phức tạp và không ổn định trong development, hãy dùng giải pháp đơn giản hơn:

**API + Polling** - Đã hoạt động tốt!

### Tại sao nên dùng API + Polling?

1. ✅ **Đã hoạt động** - Messaging đang dùng API fallback và hoạt động tốt
2. ✅ **Đơn giản** - Không cần custom server, không cần Socket.IO
3. ✅ **Ổn định** - Không bị disconnect/reconnect
4. ✅ **Deploy dễ dàng** - Vercel, Railway đều support
5. ✅ **Đủ tốt** - Delay 2-3 giây là chấp nhận được cho messaging

### Cách implement:

#### 1. Tắt Socket.IO trong useRealtimeMessages:

```typescript
// hooks/useRealtimeMessages.ts
const sendMessage = async (content: string, type: 'TEXT' | 'FILE' = 'TEXT', fileData?: any) => {
  try {
    // LUÔN DÙNG API (bỏ Socket.IO)
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
      throw new Error('Failed to send message')
    }

    const data = await response.json()
    setMessages(prev => [...prev, data.message])
    return data.message
  } catch (err) {
    throw err
  }
}
```

#### 2. Thêm polling để check tin nhắn mới:

```typescript
// hooks/useRealtimeMessages.ts
useEffect(() => {
  if (!chatId) return

  // Poll messages mỗi 3 giây
  const interval = setInterval(async () => {
    try {
      const endpoint = chatType === 'private' 
        ? `/api/messages/private?chatId=${chatId}`
        : `/api/messages/room?roomId=${chatId}`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('Failed to poll messages:', err)
    }
  }, 3000) // Poll mỗi 3 giây

  return () => clearInterval(interval)
}, [chatId, chatType])
```

## 🚀 HOẶC: SỬA SOCKET.IO ĐỂ HOẠT ĐỘNG ỔN ĐỊNH

Nếu bạn vẫn muốn dùng Socket.IO, cần sửa như sau:

### 1. Tạo singleton Socket instance:

```typescript
// lib/socket/client-singleton.ts
import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

export function getSocketInstance(token: string): Socket {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io('http://localhost:3000', {
      path: '/api/socket/io',
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    })
  }
  return socketInstance
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
```

### 2. Sửa useSocket để dùng singleton:

```typescript
// hooks/useSocket.ts
import { getSocketInstance, disconnectSocket } from '@/lib/socket/client-singleton'

export function useSocket(): UseSocketReturn {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!user) {
      disconnectSocket()
      setSocket(null)
      setIsConnected(false)
      return
    }

    const initSocket = async () => {
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const socketInstance = getSocketInstance(session.access_token)
      
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id)
        setIsConnected(true)
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
      })

      setSocket(socketInstance)
    }

    initSocket()

    // KHÔNG cleanup socket khi unmount (để singleton tồn tại)
    return () => {
      // Chỉ cleanup event listeners, không disconnect
      console.log('Component unmounted, keeping socket alive')
    }
  }, [user])

  return { socket, isConnected, error: null }
}
```

## 📊 SO SÁNH GIẢI PHÁP:

| Giải pháp | Độ phức tạp | Real-time | Ổn định | Deploy |
|-----------|-------------|-----------|---------|--------|
| **API + Polling** | ⭐ Rất đơn giản | ⚠️ Delay 3s | ✅ Rất ổn định | ✅ Mọi nơi |
| **Socket.IO + Singleton** | ⭐⭐⭐ Phức tạp | ✅ Thực sự | ⚠️ Cần test kỹ | ⚠️ Cần custom server |
| **Pusher/Ably** | ⭐⭐ Trung bình | ✅ Thực sự | ✅ Rất ổn định | ✅ Mọi nơi |

## 🎯 KHUYẾN NGHỊ:

### Cho Development (ngay bây giờ):
**Dùng API + Polling**
- Đơn giản, hoạt động ngay
- Không cần debug Socket.IO
- Focus vào tính năng khác

### Cho Production (sau này):
**Dùng Pusher hoặc Ably**
- Professional, scalable
- Real-time thực sự
- Không cần maintain Socket.IO server

## 🔧 HÀNH ĐỘNG TIẾP THEO:

### Option 1: Dùng API + Polling (Khuyến nghị)
1. Bỏ Socket.IO khỏi useRealtimeMessages
2. Thêm polling interval
3. Test messaging
4. ✅ Xong!

### Option 2: Fix Socket.IO
1. Tạo singleton socket instance
2. Sửa useSocket
3. Test kỹ
4. Debug thêm nếu cần

### Option 3: Chuyển sang Pusher
1. Đăng ký Pusher account (free)
2. Install pusher-js
3. Replace Socket.IO code
4. Test và deploy

---

**KẾT LUẬN:** Socket.IO với Next.js App Router quá phức tạp cho một tính năng messaging đơn giản. API + Polling hoặc Pusher là giải pháp tốt hơn nhiều! 🚀

# 🤔 TẠI SAO PHẢI DÙNG CUSTOM SERVER?

## ❓ CÂU HỎI CỦA BẠN:

> "Tại sao không code trong folder `app/api/` mà lại code `pages/api/` riêng?"

**Câu trả lời ngắn gọn:** Vì Socket.IO **KHÔNG THỂ** hoạt động trực tiếp với Next.js App Router Route Handlers!

## 🔍 GIẢI THÍCH CHI TIẾT:

### 1. Next.js App Router vs Pages Router

#### Pages Router (cũ):
```typescript
// pages/api/socket/io.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const io = new Server(res.socket.server) // ✅ CÓ res.socket.server
  // ...
}
```

**Đặc điểm:**
- ✅ Có access trực tiếp đến HTTP server
- ✅ Có `res.socket.server` để attach Socket.IO
- ✅ Socket.IO hoạt động tốt

#### App Router (mới):
```typescript
// app/api/socket/io/route.ts
export async function GET(req: NextRequest) {
  const io = new Server(???) // ❌ KHÔNG CÓ HTTP SERVER
  return NextResponse.json({})
}
```

**Đặc điểm:**
- ❌ KHÔNG có access đến HTTP server
- ❌ KHÔNG có `res.socket.server`
- ❌ Chỉ có `NextRequest` và `NextResponse` objects
- ❌ Socket.IO KHÔNG THỂ attach vào đâu cả

### 2. Tại sao App Router không có HTTP server?

Next.js App Router được thiết kế để:
- Chạy trên Edge Runtime (Vercel Edge, Cloudflare Workers)
- Serverless functions
- Không phụ thuộc vào Node.js HTTP server

**Vấn đề:** Socket.IO cần một **long-lived HTTP server** để duy trì WebSocket connections.

### 3. So sánh kiến trúc:

#### Không có Custom Server (App Router thuần):
```
Client Request
    ↓
Next.js App Router
    ↓
Route Handler (app/api/xxx/route.ts)
    ↓
Return Response
    ↓
Connection đóng ngay ❌
```

**Vấn đề:** Không thể duy trì WebSocket connection!

#### Có Custom Server:
```
Client Request
    ↓
Custom HTTP Server (server.js)
    ↓
Socket.IO attached to HTTP Server ✅
    ↓
WebSocket connection duy trì mãi mãi ✅
    ↓
Next.js App Router xử lý các request khác
```

**Giải pháp:** HTTP server luôn chạy, Socket.IO có nơi để attach!

## 📊 TẠI SAO TRƯỚC ĐÂY CODE TRONG `pages/api/`?

### Lịch sử:
1. **Ban đầu:** Project dùng Pages Router → Socket.IO hoạt động tốt
2. **Sau đó:** Migrate sang App Router → Quên không migrate Socket.IO
3. **Kết quả:** Socket.IO vẫn nằm trong `pages/api/` nhưng không được khởi động

### Vấn đề:
```
📁 app/                    ← App Router (ưu tiên cao)
📁 pages/api/socket/io.ts  ← Socket.IO ở đây (ưu tiên thấp)
```

Next.js ưu tiên App Router, nên:
- Endpoint `/api/socket/io` không bao giờ gọi đến `pages/api/socket/io.ts`
- Socket.IO server không bao giờ được khởi động
- Client không thể kết nối

## 🎯 GIẢI PHÁP: CUSTOM SERVER

### Tại sao cần Custom Server?

**1. Cung cấp HTTP Server cho Socket.IO:**
```javascript
const httpServer = createServer(async (req, res) => {
  await handle(req, res) // Next.js xử lý request
})

const io = new Server(httpServer) // ✅ Socket.IO có nơi attach
```

**2. Duy trì WebSocket connections:**
```javascript
httpServer.listen(3000) // ✅ Server luôn chạy
// WebSocket connections không bị đóng
```

**3. Tích hợp với Next.js:**
```javascript
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Next.js vẫn xử lý tất cả routes trong app/
// Socket.IO chỉ xử lý WebSocket connections
```

## 🔄 LUỒNG HOẠT ĐỘNG:

### Request thông thường (HTTP):
```
Browser → http://localhost:3000/discover
    ↓
Custom Server (server.js)
    ↓
Next.js App Router
    ↓
app/discover/page.tsx
    ↓
Return HTML
```

### WebSocket connection:
```
Browser → ws://localhost:3000/api/socket/io
    ↓
Custom Server (server.js)
    ↓
Socket.IO Server
    ↓
Maintain connection ✅
    ↓
Real-time events
```

## 🆚 CÁC GIẢI PHÁP KHÁC:

### 1. Custom Server (Đã chọn)
**Ưu điểm:**
- ✅ Full control
- ✅ Không phụ thuộc bên thứ 3
- ✅ Free
- ✅ Real-time thực sự

**Nhược điểm:**
- ⚠️ Không deploy được lên Vercel
- ⚠️ Cần VPS hoặc Railway/Render
- ⚠️ Phức tạp hơn một chút

### 2. Pusher/Ably (Alternative)
**Ưu điểm:**
- ✅ Hoạt động với App Router thuần
- ✅ Deploy lên Vercel được
- ✅ Dễ setup

**Nhược điểm:**
- ❌ Phụ thuộc bên thứ 3
- ❌ Có giới hạn free tier
- ❌ Phải trả tiền khi scale

### 3. Polling (Fallback hiện tại)
**Ưu điểm:**
- ✅ Cực kỳ đơn giản
- ✅ Hoạt động mọi nơi

**Nhược điểm:**
- ❌ Không real-time thực sự
- ❌ Tốn bandwidth
- ❌ Delay 2-5 giây

## 📝 KẾT LUẬN:

### Tại sao không code trong `app/api/`?
→ Vì App Router Route Handlers **KHÔNG HỖ TRỢ** Socket.IO!

### Tại sao code trong `pages/api/`?
→ Vì Pages Router có `res.socket.server`, nhưng **KHÔNG ĐƯỢC KHỞI ĐỘNG** khi dùng App Router!

### Giải pháp đúng?
→ **Custom Server** để cung cấp HTTP server cho Socket.IO, đồng thời vẫn dùng App Router cho các routes khác!

## 🎓 BÀI HỌC:

1. **App Router ≠ Pages Router** - Không thể dùng code Pages Router trực tiếp
2. **Socket.IO cần HTTP server** - Không thể chạy trong serverless environment
3. **Custom Server là cần thiết** - Khi cần WebSocket với App Router
4. **Hoặc dùng service bên thứ 3** - Nếu muốn deploy lên Vercel

---

**TÓM LẠI:** Bạn hỏi đúng! Không nên code riêng `pages/api/`. Nhưng để Socket.IO hoạt động với App Router, phải dùng Custom Server. Đó là lý do tôi tạo file `server.js`! 🚀

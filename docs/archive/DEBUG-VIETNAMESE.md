# 🔍 Hướng dẫn Debug lỗi "Failed to fetch messages"

## Vấn đề bạn đang gặp:

### 1. Socket.IO không kết nối được
**Triệu chứng:**
- Console hiển thị: `Socket disconnected: transport close`
- Kết nối bị ngắt liên tục

**Nguyên nhân có thể:**
- Server Socket.IO chưa được khởi động đúng cách
- Token xác thực Supabase không hợp lệ
- Next.js App Router không xử lý được endpoint Socket.IO

### 2. API trả về lỗi 500
**Triệu chứng:**
- `GET /api/messages/private?chatId=xxx` trả về 500
- Lỗi: "Failed to fetch messages"

**Nguyên nhân có thể:**
- Database không kết nối được
- User chưa đăng nhập hoặc session hết hạn
- Thiếu dữ liệu trong database

## 🔧 Cách kiểm tra và sửa:

### Bước 1: Kiểm tra Server Console
Mở terminal nơi bạn chạy `npm run dev` và tìm:
```
❌ Lỗi kết nối database
❌ Lỗi authentication
❌ Lỗi từ Prisma
```

### Bước 2: Kiểm tra file .env
Đảm bảo các biến môi trường sau tồn tại và đúng:
```env
SUPABASE_CONNECTION_STRING=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Bước 3: Kiểm tra xác thực người dùng
Mở Browser Console và chạy:
```javascript
// Kiểm tra user đã đăng nhập chưa
const { createBrowserClient } = await import('@supabase/ssr')
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Kiểm tra session token
const { data: { session } } = await supabase.auth.getSession()
console.log('Has token:', !!session?.access_token)
```

### Bước 4: Kiểm tra Socket.IO server
File `pages/api/socket/io.ts` phải tồn tại và có nội dung:
```typescript
import SocketHandler from '@/lib/socket/server'

export default SocketHandler
export { config } from '@/lib/socket/server'
```

### Bước 5: Test API trực tiếp
Mở Browser Console và test:
```javascript
// Test API messages
const response = await fetch('/api/messages/private?chatId=USER_ID_HERE')
console.log('Status:', response.status)
const data = await response.json()
console.log('Data:', data)
```

## 🎯 Giải pháp nhanh:

### Nếu lỗi do authentication:
1. Đăng xuất và đăng nhập lại
2. Xóa cookies và cache trình duyệt
3. Restart dev server

### Nếu lỗi do database:
1. Kiểm tra Supabase dashboard xem database có online không
2. Chạy lại migrations: `npx prisma migrate dev`
3. Kiểm tra connection string trong .env

### Nếu lỗi do Socket.IO:
1. Restart dev server: `npm run dev`
2. Kiểm tra port 3000 có bị chiếm không
3. Thử clear `.next` folder: `rm -rf .next` rồi `npm run dev`

## 📝 Thông tin cần cung cấp để debug:

Nếu vẫn lỗi, hãy cung cấp:
1. **Server console logs** - Copy toàn bộ lỗi từ terminal
2. **Browser console errors** - Copy lỗi từ DevTools
3. **Network tab** - Screenshot request/response của API bị lỗi
4. **File .env** - Chỉ cần confirm các biến có tồn tại (KHÔNG gửi giá trị thật)

## 🚀 Các bước tiếp theo:

1. ✅ Lỗi TypeScript đã được sửa
2. ⏳ Cần kiểm tra runtime errors (lỗi khi chạy)
3. ⏳ Cần xác định nguyên nhân chính xác của lỗi 500
4. ⏳ Cần fix Socket.IO connection

---

**Lưu ý:** Lỗi "Failed to fetch messages" là lỗi runtime (khi chạy), không phải lỗi compile. Code của bạn đã compile thành công rồi, giờ cần tìm lỗi trong quá trình chạy.

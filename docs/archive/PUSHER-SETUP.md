# 🚀 Pusher Setup Guide

## Bước 1: Tạo Pusher Account

1. Truy cập https://dashboard.pusher.com/
2. Đăng ký tài khoản miễn phí (hoặc đăng nhập nếu đã có)
3. Click "Create app" để tạo app mới

## Bước 2: Cấu hình Pusher App

### Thông tin cần điền:

- **App name**: `StudyMate` (hoặc tên bạn muốn)
- **Cluster**: Chọn cluster gần nhất (ví dụ: `ap1` cho Asia Pacific)
- **Tech stack**: 
  - Frontend: `React`
  - Backend: `Node.js`

### Sau khi tạo app:

Bạn sẽ thấy màn hình "App Keys" với các thông tin:

```
app_id: 1234567
key: abcdef123456
secret: xyz789secret
cluster: ap1
```

## Bước 3: Cập nhật Environment Variables

Mở file `.env` và cập nhật các giá trị Pusher:

```env
# Pusher Configuration
PUSHER_APP_ID=1234567
PUSHER_SECRET=xyz789secret
NEXT_PUBLIC_PUSHER_KEY=abcdef123456
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

⚠️ **Lưu ý**: 
- `PUSHER_SECRET` là **bí mật**, không được commit lên Git
- Chỉ có `NEXT_PUBLIC_PUSHER_KEY` và `NEXT_PUBLIC_PUSHER_CLUSTER` được expose ra browser
- File `.env` đã được thêm vào `.gitignore`

## Bước 4: Verify Setup

### Test Pusher Server Instance:

Tạo file test `test-pusher.ts`:

```typescript
import { pusherServer, triggerPusherEvent } from './lib/pusher/server'

async function testPusher() {
  try {
    await triggerPusherEvent('test-channel', 'test-event', { message: 'Hello Pusher!' })
    console.log('✅ Pusher server working!')
  } catch (error) {
    console.error('❌ Pusher server error:', error)
  }
}

testPusher()
```

Chạy test:
```bash
npx tsx test-pusher.ts
```

### Test Pusher Client Instance:

Mở browser console và chạy:

```javascript
// Trong một React component
import { getPusherClient } from '@/lib/pusher/client'

const pusher = getPusherClient()
console.log('Pusher state:', pusher.connection.state)
// Should log: "connecting" → "connected"
```

## Bước 5: Monitor Pusher Dashboard

1. Truy cập https://dashboard.pusher.com/
2. Chọn app của bạn
3. Vào tab "Debug Console"
4. Bạn sẽ thấy real-time events khi app hoạt động

### Các metrics quan trọng:

- **Connections**: Số lượng users đang kết nối
- **Messages**: Số lượng messages đã gửi
- **Channels**: Số lượng channels đang active

## Pusher Free Tier Limits

- ✅ **100 concurrent connections**
- ✅ **200,000 messages/day**
- ✅ **Unlimited channels**
- ✅ **SSL encryption**
- ✅ **Presence channels**
- ✅ **Private channels**

Đủ cho development và small-scale production!

## Troubleshooting

### Lỗi: "Invalid credentials"

**Nguyên nhân**: Sai `PUSHER_APP_ID`, `PUSHER_KEY`, hoặc `PUSHER_SECRET`

**Giải pháp**: 
1. Kiểm tra lại credentials trong Pusher dashboard
2. Copy chính xác vào `.env`
3. Restart dev server

### Lỗi: "Cluster not found"

**Nguyên nhân**: Sai `PUSHER_CLUSTER`

**Giải pháp**:
1. Kiểm tra cluster trong Pusher dashboard (ví dụ: `ap1`, `us2`, `eu`)
2. Cập nhật `NEXT_PUBLIC_PUSHER_CLUSTER` trong `.env`

### Lỗi: "Connection timeout"

**Nguyên nhân**: Network issues hoặc firewall

**Giải pháp**:
1. Kiểm tra internet connection
2. Thử cluster khác
3. Check firewall settings

### Lỗi: "Environment variable not found"

**Nguyên nhân**: Chưa set environment variables

**Giải pháp**:
1. Đảm bảo file `.env` tồn tại
2. Restart dev server sau khi thay đổi `.env`
3. Verify variables với `console.log(process.env.NEXT_PUBLIC_PUSHER_KEY)`

## Next Steps

Sau khi setup xong Pusher:

1. ✅ Task 1 hoàn thành - Pusher infrastructure ready
2. ⏭️ Task 2 - Implement authentication endpoint
3. ⏭️ Task 3 - Create usePusher hook
4. ⏭️ Task 4-5 - Migrate messaging

## Useful Links

- 📚 [Pusher Documentation](https://pusher.com/docs/)
- 🎮 [Pusher Dashboard](https://dashboard.pusher.com/)
- 💬 [Pusher Support](https://support.pusher.com/)
- 🔧 [Pusher Channels API](https://pusher.com/docs/channels/library_auth_reference/rest-api/)

---

**Lưu ý**: Pusher credentials là **bí mật**! Không share public hoặc commit lên Git!

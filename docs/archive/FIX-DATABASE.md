# 🔧 Sửa lỗi: Thiếu cột `updatedAt` trong database

## ❌ Lỗi hiện tại:
```
The column `messages.updatedAt` does not exist in the current database.
```

## ✅ Giải pháp:

### Cách 1: Chạy Migration (Khuyến nghị)

Mở terminal và chạy lệnh sau:

```bash
npx prisma migrate dev --name add-updated-at-to-messages
```

Lệnh này sẽ:
1. Tạo migration mới
2. Thêm cột `updatedAt` vào bảng `messages`
3. Cập nhật database

### Cách 2: Reset Database (Nếu cách 1 không work)

**⚠️ CẢNH BÁO: Cách này sẽ XÓA TẤT CẢ DỮ LIỆU!**

```bash
# Xóa và tạo lại database
npx prisma migrate reset

# Sau đó chạy lại migrations
npx prisma migrate dev
```

### Cách 3: Push Schema trực tiếp (Nhanh nhất cho development)

```bash
npx prisma db push
```

Lệnh này sẽ đồng bộ schema với database mà không cần tạo migration file.

## 🎯 Sau khi chạy xong:

1. **Restart dev server:**
   ```bash
   # Dừng server (Ctrl+C)
   # Chạy lại
   npm run dev
   ```

2. **Kiểm tra lại:**
   - Mở trang messages
   - Thử gửi tin nhắn
   - Kiểm tra console không còn lỗi

## 📝 Giải thích:

**Tại sao lỗi này xảy ra?**
- File `prisma/schema.prisma` có định nghĩa `updatedAt`
- Nhưng database thực tế chưa có cột này
- Có thể do:
  - Chưa chạy migration sau khi thêm field mới
  - Database được tạo từ schema cũ
  - Migration bị lỗi hoặc không hoàn thành

**Prisma schema có gì?**
```prisma
model Message {
  id          String      @id @default(cuid())
  senderId    String
  receiverId  String
  type        MessageType @default(TEXT)
  content     String
  
  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt  ← CỘT NÀY ĐANG THIẾU
  readAt      DateTime?
  
  // ... các field khác
}
```

## 🚀 Lệnh nên chạy:

**Cho development (đang code):**
```bash
npx prisma db push
```

**Cho production (khi deploy):**
```bash
npx prisma migrate deploy
```

---

**Sau khi fix xong, lỗi "Failed to fetch messages" sẽ biến mất!** ✨

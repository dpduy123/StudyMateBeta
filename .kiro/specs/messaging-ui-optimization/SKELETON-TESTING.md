# Hướng Dẫn Test Skeleton Loaders

## Tại sao không thấy Skeleton?

Skeleton loaders được thiết kế để **chỉ hiển thị khi không có dữ liệu cached** (theo Requirement 1). 

Ứng dụng sử dụng chiến lược **cache-first loading**:
1. Khi load trang, dữ liệu từ IndexedDB cache được hiển thị ngay lập tức
2. Sau đó, API được gọi ở background để cập nhật dữ liệu
3. Skeleton chỉ hiển thị khi:
   - Lần đầu tiên user vào (chưa có cache)
   - Cache đã bị xóa
   - Đang ở chế độ incognito/private browsing

## Cách 1: Xem Skeleton trong Test Page

Truy cập: **http://localhost:3000/test-skeleton**

Trang này hiển thị preview của cả 2 skeleton loaders:
- Conversation List Skeleton
- Message List Skeleton

## Cách 2: Test Skeleton trong App Thực

### Bước 1: Xóa Cache
Mở browser console (F12) và chạy:

```javascript
await window.clearCache()
```

### Bước 2: Refresh Trang
Sau khi xóa cache, refresh trang (F5 hoặc Ctrl+R)

### Bước 3: Quan sát
Bạn sẽ thấy skeleton loaders hiển thị trong vài giây trước khi dữ liệu từ API được load.

## Cách 3: Sử dụng Incognito Mode

1. Mở browser ở chế độ Incognito/Private
2. Truy cập ứng dụng
3. Skeleton sẽ hiển thị vì không có cache

## Cách 4: Throttle Network (Slow 3G)

1. Mở DevTools (F12)
2. Chuyển sang tab Network
3. Chọn "Slow 3G" hoặc "Fast 3G" từ dropdown
4. Xóa cache: `await window.clearCache()`
5. Refresh trang

Skeleton sẽ hiển thị lâu hơn do network chậm.

## Cách 5: Clear IndexedDB Manually

1. Mở DevTools (F12)
2. Chuyển sang tab Application
3. Trong sidebar, tìm "Storage" > "IndexedDB"
4. Xóa database "studymate-cache"
5. Refresh trang

## Kiểm Tra Implementation

### Conversation List Skeleton
- File: `components/ui/SkeletonLoader.tsx`
- Hiển thị: 8 conversation cards với avatar và text placeholders
- Trigger: `isLoading && conversations.length === 0`

### Message List Skeleton  
- File: `components/ui/SkeletonLoader.tsx`
- Hiển thị: 6 message bubbles với avatar và content placeholders
- Trigger: `loading && messages.length === 0`

## Expected Behavior

✅ **Đúng**: Skeleton hiển thị khi không có cached data
✅ **Đúng**: Cached data hiển thị ngay lập tức (không có skeleton)
✅ **Đúng**: Skeleton có animation pulse mượt mà
✅ **Đúng**: Skeleton match với layout của component thực

❌ **Sai**: Skeleton hiển thị mỗi lần refresh (khi đã có cache)
❌ **Sai**: Skeleton hiển thị quá lâu (> 3 giây)
❌ **Sai**: Layout shift khi chuyển từ skeleton sang data thực

## Performance Metrics

- **First Contentful Paint**: < 1s (với cached data)
- **Skeleton Duration**: 0.5s - 2s (tùy network)
- **Animation FPS**: 60 FPS
- **Layout Shift**: 0 (no CLS)

## Troubleshooting

### Vấn đề: Không bao giờ thấy skeleton
**Nguyên nhân**: Đã có cached data
**Giải pháp**: Xóa cache bằng `window.clearCache()`

### Vấn đề: Skeleton hiển thị mãi không mất
**Nguyên nhân**: API không trả về data hoặc lỗi network
**Giải pháp**: Kiểm tra console log và network tab

### Vấn đề: Layout shift khi load data
**Nguyên nhân**: Skeleton không match với component thực
**Giải pháp**: Cập nhật skeleton để match với layout

## Code References

```typescript
// ConversationsList.tsx
if (isLoading && conversations.length === 0) {
  return <ConversationListSkeleton />
}

// MessageList.tsx
if (loading && messages.length === 0) {
  return <MessageListSkeleton />
}

// ChatContainer.tsx - Dynamic import fallback
const MessageList = dynamic(
  () => import('./MessageList').then(mod => ({ default: mod.MessageList })),
  {
    loading: () => <MessageListSkeleton />,
    ssr: false
  }
)
```

## Notes

- Skeleton loaders sử dụng CSS animations (không dùng JavaScript)
- Hardware-accelerated với `transform: translateZ(0)`
- Hỗ trợ `prefers-reduced-motion` cho accessibility
- Minimal bundle size impact (~2KB CSS)

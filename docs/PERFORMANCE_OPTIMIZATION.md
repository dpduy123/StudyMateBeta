# Performance Optimization Guide

## Vấn đề đã phát hiện (Issues Found)

### 1. **Heartbeat Endpoint - Quá tải database (1.5-5.4s)**
- **Vấn đề**: Update `lastActive` mỗi 30 giây cho mọi user online
- **Tác động**: Hàng trăm UPDATE queries mỗi phút, gây tải cao cho database
- **Giải pháp**: Throttling với in-memory cache, chỉ update DB mỗi 60 giây

### 2. **Notifications API - Thiếu indexes (3-4s)**
- **Vấn đề**: Query `findMany` + `count` chạy tuần tự, không có index tối ưu
- **Tác động**: Mỗi request mất 3-4 giây, gọi liên tục mỗi vài giây
- **Giải pháp**: 
  - Thêm composite indexes
  - Chạy queries song song với Promise.all
  - Cache kết quả 30 giây

### 3. **Dashboard API - N+1 queries (13s!)**
- **Vấn đề**: Nhiều queries tuần tự, fetch quá nhiều relations không cần
- **Tác động**: Dashboard load cực chậm, trải nghiệm người dùng kém
- **Giải pháp**:
  - Chạy tất cả queries song song
  - Chỉ select fields cần thiết
  - Loại bỏ nested includes không dùng

### 4. **Database Connection - Không tối ưu cho PgBouncer**
- **Vấn đề**: Transaction timeout quá cao (20s), không có connection pooling config
- **Tác động**: Connections bị giữ lâu, gây nghẽn pool
- **Giải pháp**: Giảm timeout xuống 10s, thêm maxWait config

## Các thay đổi đã thực hiện (Changes Made)

### 1. Database Schema - Thêm Indexes

```prisma
// Users table
@@index([lastActive])
@@index([university, major])
@@index([status, subscriptionTier])

// Matches table
@@index([senderId, status])
@@index([receiverId, status])
@@index([status, createdAt])

// Notifications table
@@index([userId])
@@index([userId, isRead])
@@index([userId, createdAt])
@@index([userId, isRead, createdAt])

// RoomMembers table
@@index([userId, leftAt])
@@index([roomId, leftAt, isBanned])
```

### 2. Prisma Client Configuration

```typescript
// lib/prisma.ts
transactionOptions: {
  timeout: 10000,      // Giảm từ 20s xuống 10s
  maxWait: 5000,       // Thêm max wait time
}
```

### 3. Heartbeat Endpoint - Throttling

```typescript
// app/api/user/presence/heartbeat/route.ts
const THROTTLE_INTERVAL = 60000 // Chỉ update DB mỗi 60s
const lastUpdateCache = new Map<string, number>()

// Chỉ update DB khi đủ thời gian
if (now - lastUpdate >= THROTTLE_INTERVAL) {
  await prisma.user.update(...)
}
```

### 4. Notifications API - Parallel Queries + Cache

```typescript
// app/api/notifications/route.ts
// 1. Check cache trước
const cached = simpleCache.get(cacheKey)
if (cached) return NextResponse.json(cached)

// 2. Chạy queries song song
const [notifications, unreadCount] = await Promise.all([...])

// 3. Cache kết quả 30 giây
simpleCache.set(cacheKey, result, 30000)
```

### 5. Dashboard API - Parallel Queries

```typescript
// app/api/dashboard/route.ts
// Chạy TẤT CẢ queries song song
const [profile, recentMatches, recentActivity, allStudyActivities, badgeCount, userRooms] 
  = await Promise.all([...])
```

### 6. Simple Cache Implementation

```typescript
// lib/cache/simple-cache.ts
- In-memory cache với TTL
- Auto cleanup khi đạt maxSize
- Pattern-based invalidation
- Cache stats tracking
```

## Kết quả dự kiến (Expected Results)

### Trước tối ưu (Before):
- Heartbeat: 1.5-5.4s mỗi request
- Notifications: 3-4s mỗi request
- Dashboard: 13s load time
- Database load: Rất cao với hàng trăm queries/phút

### Sau tối ưu (After):
- Heartbeat: <100ms (cached), ~500ms (DB update)
- Notifications: <50ms (cached), ~800ms (DB query)
- Dashboard: 2-3s load time
- Database load: Giảm 70-80%

## Các bước triển khai (Deployment Steps)

### 1. Apply Database Indexes

```bash
# Generate Prisma migration
npx prisma migrate dev --name add_performance_indexes

# Or push directly to database
npx prisma db push
```

### 2. Test Performance

```bash
# Run performance tests
npm run test:performance

# Monitor database queries
npm run monitoring:debug
```

### 3. Monitor Production

- Theo dõi response times trong logs
- Check database connection pool usage
- Monitor cache hit rates
- Track memory usage

## Best Practices đã áp dụng

### ✅ Database Optimization
- Composite indexes cho common queries
- Select only needed fields
- Parallel query execution
- Connection pooling optimization

### ✅ API Optimization
- Request throttling
- Response caching
- Parallel data fetching
- Minimal data transfer

### ✅ Code Quality
- Type-safe cache implementation
- Memory leak prevention
- Error handling
- Performance monitoring

## Monitoring & Debugging

### Check Cache Stats
```typescript
import { simpleCache } from '@/lib/cache/simple-cache'
console.log(simpleCache.getStats())
```

### Clear Cache
```typescript
// Clear specific key
simpleCache.invalidate('notifications:user123:false:20')

// Clear pattern
simpleCache.invalidatePattern('notifications:user123:')

// Clear all
simpleCache.clear()
```

### Database Query Monitoring
```bash
# Check slow queries
[DB ✅] update User - 🐌 1925ms  # Slow!
[DB ✅] findMany Notification - ⚡ 45ms  # Fast!
```

## Tối ưu thêm trong tương lai (Future Optimizations)

### 1. Redis Cache
- Thay thế in-memory cache bằng Redis
- Shared cache giữa các instances
- Persistent cache across restarts

### 2. Database Read Replicas
- Tách read/write operations
- Load balancing cho read queries
- Giảm tải primary database

### 3. CDN & Edge Caching
- Cache static data ở edge
- Reduce latency cho users
- Offload server resources

### 4. Query Optimization
- Materialized views cho complex queries
- Denormalization cho hot data
- Batch operations

### 5. Real-time Optimization
- WebSocket connection pooling
- Message queue cho notifications
- Event-driven architecture

## Lưu ý quan trọng (Important Notes)

⚠️ **Cache Invalidation**: Luôn invalidate cache khi data thay đổi
⚠️ **Memory Management**: Monitor cache size để tránh memory leaks
⚠️ **Index Maintenance**: Indexes tăng write time, cân nhắc trade-offs
⚠️ **Connection Pooling**: Đảm bảo không vượt quá pool size của Supabase

## Liên hệ & Hỗ trợ

Nếu gặp vấn đề về performance:
1. Check logs để xác định slow queries
2. Review cache hit rates
3. Monitor database connection pool
4. Contact team nếu cần hỗ trợ thêm

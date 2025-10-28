# API Response Caching

This directory contains the API response caching layer for the StudyMate messaging system.

## Overview

The caching system provides:
- **In-memory cache** for development (no setup required)
- **Redis cache** for production (optional, requires Redis setup)
- **Automatic cache invalidation** on data changes
- **TTL management** for automatic expiration

## Architecture

```
┌─────────────────────────────────────────┐
│         API Endpoints                    │
│  /api/conversations                      │
│  /api/messages/private                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      ApiCacheManager                     │
│  - get(key)                              │
│  - set(key, data, ttl)                   │
│  - invalidate(pattern)                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ InMemoryCache│    │  RedisCache  │
│  (default)   │    │  (optional)  │
└──────────────┘    └──────────────┘
```

## Usage

### Basic Usage

```typescript
import { apiCache } from '@/lib/cache/ApiCache'

// Cache data
await apiCache.set('key', data, 60) // 60 seconds TTL

// Get cached data
const data = await apiCache.get('key')

// Delete cached data
await apiCache.delete('key')

// Delete by pattern
await apiCache.deletePattern('messages:*')
```

### Conversation Caching

```typescript
// Cache conversations
await apiCache.cacheConversations(userId, conversationsData)

// Get cached conversations
const cached = await apiCache.getCachedConversations(userId)

// Invalidate on new message
await apiCache.invalidateConversations(userId)
```

### Message Caching

```typescript
// Cache messages
await apiCache.cacheMessages(userId, chatId, page, messagesData)

// Get cached messages
const cached = await apiCache.getCachedMessages(userId, chatId, page)

// Invalidate on new message
await apiCache.invalidateMessages(userId, chatId)
```

## Configuration

### In-Memory Cache (Default)

No configuration required. Works out of the box.

**Pros:**
- No setup required
- Fast for development
- No external dependencies

**Cons:**
- Data lost on server restart
- Not shared across multiple server instances
- Limited by server memory

### Redis Cache (Production)

Set the `REDIS_URL` environment variable:

```bash
# .env
REDIS_URL=redis://localhost:6379
# or for Redis Cloud
REDIS_URL=redis://username:password@host:port
```

**Pros:**
- Persistent across restarts
- Shared across multiple server instances
- Scalable for production

**Cons:**
- Requires Redis setup
- Additional infrastructure cost

## Cache Strategy

### Conversations API
- **TTL:** 60 seconds
- **Invalidation:** On new message sent/received
- **Cache Key:** `conversations:{userId}`

### Messages API
- **TTL:** 30 seconds
- **Invalidation:** On new message sent/received
- **Cache Key:** `messages:{userId}:{chatId}:{page}`
- **Note:** Only first page is cached

## Cache Headers

All cached responses include HTTP cache headers:

```
Cache-Control: private, max-age=60, stale-while-revalidate=300
X-Cache: HIT | MISS
```

- `max-age`: Browser can use cached response for this duration
- `stale-while-revalidate`: Browser can use stale cache while fetching fresh data
- `X-Cache`: Indicates if response came from cache (HIT) or database (MISS)

## Performance Impact

Expected performance improvements:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Conversation list load | 200-500ms | 10-50ms | 80-90% faster |
| Message list load | 150-300ms | 10-40ms | 85-95% faster |
| API response size | Full data | Optimized | 30-40% smaller |

## Monitoring

### Cache Hit Rate

Monitor cache effectiveness:

```typescript
// Check cache headers in response
const response = await fetch('/api/conversations')
const cacheStatus = response.headers.get('X-Cache') // 'HIT' or 'MISS'
```

### Cache Size (In-Memory)

The in-memory cache automatically cleans up expired entries every minute.

### Redis Monitoring

Use Redis CLI to monitor:

```bash
# Connect to Redis
redis-cli

# Check memory usage
INFO memory

# List all keys
KEYS *

# Get TTL for a key
TTL conversations:user123

# Monitor commands in real-time
MONITOR
```

## Troubleshooting

### Cache Not Working

1. Check if Redis is connected (production):
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Check environment variables:
   ```bash
   echo $REDIS_URL
   ```

3. Check server logs for cache errors

### Stale Data

If you see stale data:

1. Clear cache manually:
   ```typescript
   await apiCache.clear()
   ```

2. Check cache invalidation is working on message send

3. Reduce TTL values if needed

### High Memory Usage

For in-memory cache:

1. Reduce TTL values
2. Implement size limits
3. Switch to Redis for production

## Best Practices

1. **Always invalidate cache** when data changes
2. **Use appropriate TTL** values (shorter for frequently changing data)
3. **Monitor cache hit rates** to ensure effectiveness
4. **Use Redis in production** for better scalability
5. **Include cache headers** for browser caching
6. **Handle cache failures gracefully** (fallback to database)

## Future Improvements

- [ ] Add cache size limits for in-memory cache
- [ ] Implement cache warming on server start
- [ ] Add cache analytics dashboard
- [ ] Implement distributed cache invalidation
- [ ] Add cache compression for large responses
- [ ] Implement cache versioning for schema changes

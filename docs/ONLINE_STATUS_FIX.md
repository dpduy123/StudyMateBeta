# Online Status Logic - Fixed

## 🔴 Vấn đề trước đây

### 1. Inconsistent Status Sources
```typescript
// API trả về isOnline
const isOnline = lastActive > fiveMinutesAgo

// Frontend check Pusher presence
const isOnline = onlineUsers.has(userId)

// 2 sources khác nhau → Không consistent!
```

### 2. Pusher Presence Không Reliable
- Subscription mất thời gian (1-2s)
- Member events có thể miss
- Network issues → Không update
- Không có fallback

### 3. Frontend Không Broadcast Own Presence
```typescript
// TRƯỚC: Chỉ track others
const { onlineUsers } = usePresence(undefined, userIds)

// Others không thấy mình online!
```

### 4. Status Text Không Rõ Ràng
```
"Vừa xong"     // Không rõ là gì
"Offline"      // Quá chung chung
"5 phút trước" // Không biết online hay offline
```

## ✅ Giải pháp

### 1. Hybrid Approach: Pusher + API Fallback

```typescript
// Check Pusher first (real-time)
if (onlineUsers.has(userId)) {
  return true
}

// Fallback: Check lastActive from API
const lastActive = new Date(conversation.otherUser.lastActive)
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
return lastActive > fiveMinutesAgo
```

**Lợi ích**:
- ✅ Real-time khi Pusher hoạt động
- ✅ Fallback khi Pusher chậm/lỗi
- ✅ Consistent với API logic

### 2. Broadcast Own Presence

```typescript
// SAU: Broadcast own presence
const { onlineUsers } = usePresence(currentUserId, userIds)
```

**Lợi ích**:
- ✅ Others thấy mình online
- ✅ Presence channel hoạt động đúng
- ✅ Real-time updates work

### 3. Periodic Status Check

```typescript
// Fetch initial status
fetchInitialStatus()

// Periodically check as fallback (every 30s)
statusCheckIntervalRef.current = setInterval(fetchInitialStatus, 30000)
```

**Lợi ích**:
- ✅ Backup khi Pusher fail
- ✅ Sync với database
- ✅ Reliable status

### 4. Better Status Text

```typescript
// TRƯỚC
if (diffMins < 1) return 'Vừa xong'
return 'Offline'

// SAU
if (diffMins < 5) return 'Đang hoạt động'
if (diffMins < 60) return 'Hoạt động 5 phút trước'
if (diffDays === 1) return 'Hoạt động hôm qua'
if (diffDays < 7) return 'Hoạt động 3 ngày trước'
return 'Không hoạt động gần đây'
```

**Lợi ích**:
- ✅ Rõ ràng hơn
- ✅ Context tốt hơn
- ✅ User-friendly

## 📊 Logic Flow

### ConversationsList

```
┌─────────────────────────────────────┐
│ usePresence(currentUserId, userIds) │
│ - Broadcast own presence            │
│ - Track others via Pusher           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ isOnline(userId)                    │
│ 1. Check Pusher: onlineUsers.has()  │
│ 2. Fallback: lastActive < 5min      │
└─────────────────────────────────────┘
```

### Messages Page

```
┌─────────────────────────────────────┐
│ useOtherUserPresence(selectedUserId)│
│ - Fetch initial status from API     │
│ - Subscribe to Pusher presence      │
│ - Periodic check every 30s          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ getStatusText()                     │
│ 1. Check Pusher: isOnline           │
│ 2. Check lastActive < 5min          │
│ 3. Show relative time               │
└─────────────────────────────────────┘
```

## 🎯 Status Rules

### Online (Green Dot)
- Pusher presence: User in channel
- OR lastActive < 5 minutes
- Text: "Đang hoạt động"

### Recently Active (No Dot)
- lastActive 5-60 minutes
- Text: "Hoạt động 15 phút trước"

### Inactive (No Dot)
- lastActive > 1 hour
- Text: "Hoạt động 3 giờ trước"
- Text: "Hoạt động hôm qua"
- Text: "Hoạt động 3 ngày trước"

### Very Inactive (No Dot)
- lastActive > 7 days or null
- Text: "Không hoạt động gần đây"

## 🔧 Implementation

### Files Changed

1. **components/chat/ConversationsList.tsx**
   - Broadcast own presence
   - Hybrid online check (Pusher + API)

2. **app/messages/page.tsx**
   - Better status text
   - 5-minute online threshold

3. **hooks/useOtherUserPresence.ts**
   - Periodic status check
   - Better initial status logic

## 📈 Benefits

### Reliability
- ✅ Pusher + API fallback
- ✅ Periodic sync
- ✅ Network resilient

### Accuracy
- ✅ Consistent 5-minute threshold
- ✅ Real-time when possible
- ✅ Fallback when needed

### UX
- ✅ Clear status text
- ✅ Relative time
- ✅ Context-aware

## 🧪 Testing

### Test Cases

1. **User A opens messages**
   - ✅ Should see User B online (if active < 5min)
   - ✅ Should see green dot

2. **User B closes tab**
   - ✅ User A should see offline within 30s
   - ✅ Green dot disappears

3. **Network issues**
   - ✅ Fallback to API status
   - ✅ Periodic check updates status

4. **User B active 3 minutes ago**
   - ✅ Shows "Đang hoạt động"
   - ✅ Green dot visible

5. **User B active 10 minutes ago**
   - ✅ Shows "Hoạt động 10 phút trước"
   - ✅ No green dot

### Manual Testing

```bash
# 1. Open /messages in 2 browsers
# 2. Login as different users
# 3. Check online status appears
# 4. Close one browser
# 5. Check status updates to offline
# 6. Check status text is clear
```

## 🚀 Future Improvements

### 1. WebSocket Heartbeat
```typescript
// More reliable than Pusher presence
socket.on('heartbeat', (userId) => {
  updateOnlineStatus(userId, true)
})
```

### 2. Optimistic Updates
```typescript
// Assume online immediately
setIsOnline(true)
// Verify in background
verifyStatus()
```

### 3. Status History
```typescript
// Track status changes
const statusHistory = [
  { timestamp: '2024-01-01 10:00', status: 'online' },
  { timestamp: '2024-01-01 10:30', status: 'offline' }
]
```

## ⚠️ Known Limitations

1. **5-minute threshold**: User might be offline but still show online
2. **Pusher delays**: Can take 1-2s to update
3. **API polling**: 30s interval might miss quick changes

## 🎉 Kết luận

Đã fix logic online status:
- ✅ Hybrid approach (Pusher + API)
- ✅ Broadcast own presence
- ✅ Periodic fallback check
- ✅ Clear status text
- ✅ Reliable và accurate

Status hiện giờ hoạt động tốt và consistent! 🚀

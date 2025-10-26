# Pusher Real-time Messaging Test Guide

## Overview

This guide provides comprehensive testing procedures for the Pusher real-time messaging implementation. Follow these tests to verify all functionality works correctly.

---

## 10.1 Core Messaging Functionality Tests

### Test 1: Send Message Between Two Users

**Objective**: Verify messages can be sent and received between two users in real-time.

**Prerequisites**:
- Two browser windows/tabs (or use incognito mode)
- Two different user accounts logged in

**Steps**:
1. Open browser window A, log in as User A
2. Open browser window B, log in as User B
3. In window A, navigate to messages and start a chat with User B
4. In window B, navigate to messages and open the chat with User A
5. In window A, type a message and send it
6. Observe window B

**Expected Results**:
- ✅ Message appears in window A immediately after sending
- ✅ Message appears in window B within 500ms without page refresh
- ✅ Message content matches what was sent
- ✅ Sender information (name, avatar) displays correctly
- ✅ Timestamp is accurate

**Verification**:
```javascript
// Open browser console in window B and check for:
// "📨 Event received: new-message"
// Message object should contain: id, senderId, receiverId, content, createdAt, sender
```

---

### Test 2: Message Persistence in Database

**Objective**: Verify messages are saved to the database correctly.

**Steps**:
1. Send a message from User A to User B
2. Close both browser windows
3. Reopen browser and log in as User B
4. Navigate to the chat with User A

**Expected Results**:
- ✅ Previously sent message is visible
- ✅ Message content is intact
- ✅ Sender information is correct
- ✅ Timestamp is preserved
- ✅ Messages are in chronological order

**Database Verification**:
```sql
-- Run this query to verify message was saved
SELECT id, "senderId", "receiverId", content, "createdAt", "isRead"
FROM "Message"
WHERE "senderId" = 'user-a-id' AND "receiverId" = 'user-b-id'
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

### Test 3: UI Updates Correctly

**Objective**: Verify the UI updates properly when messages are sent and received.

**Steps**:
1. Open chat between User A and User B in both windows
2. Send multiple messages from User A
3. Observe UI in both windows

**Expected Results**:
- ✅ Message input clears after sending
- ✅ New message appears at bottom of chat
- ✅ Chat scrolls to show new message
- ✅ Message bubble has correct styling (sent vs received)
- ✅ Avatar displays for received messages
- ✅ No duplicate messages appear
- ✅ Loading states work correctly

**UI Elements to Check**:
- Message bubbles (alignment, color, spacing)
- Timestamps (format, position)
- Avatars (size, position, fallback)
- Scroll behavior (auto-scroll to bottom)
- Input field (clear after send, focus management)

---

### Test 4: Multiple Messages in Sequence

**Objective**: Verify rapid message sending works correctly.

**Steps**:
1. Open chat between User A and User B
2. Quickly send 5 messages in succession from User A
3. Observe both windows

**Expected Results**:
- ✅ All 5 messages appear in correct order
- ✅ No messages are lost
- ✅ No duplicate messages
- ✅ Each message has unique ID
- ✅ Timestamps are sequential

---

### Test 5: Bidirectional Communication

**Objective**: Verify both users can send and receive messages.

**Steps**:
1. User A sends message to User B
2. User B sends message to User A
3. User A sends another message
4. User B sends another message

**Expected Results**:
- ✅ All messages appear in both windows
- ✅ Messages are in correct chronological order
- ✅ Sent messages align right, received messages align left
- ✅ Each user sees their own messages as "sent"
- ✅ Each user sees other's messages as "received"

---

### Test 6: Long Message Content

**Objective**: Verify long messages are handled correctly.

**Steps**:
1. Send a message with 500+ characters
2. Send a message with special characters (emoji, unicode)
3. Send a message with line breaks

**Expected Results**:
- ✅ Long messages display without truncation
- ✅ Message bubble wraps text correctly
- ✅ Special characters display properly
- ✅ Line breaks are preserved
- ✅ No layout breaking

---

### Test 7: Empty Chat State

**Objective**: Verify UI handles empty chat correctly.

**Steps**:
1. Open a new chat with a user you haven't messaged
2. Observe the UI

**Expected Results**:
- ✅ Empty state message displays
- ✅ Input field is available
- ✅ No error messages
- ✅ Can send first message successfully

---

## Test Results Template

Use this template to record test results:

```markdown
### Test Run: [Date/Time]
**Tester**: [Name]
**Environment**: [Development/Staging/Production]

| Test | Status | Notes |
|------|--------|-------|
| Send Message Between Users | ✅/❌ | |
| Message Persistence | ✅/❌ | |
| UI Updates | ✅/❌ | |
| Multiple Messages | ✅/❌ | |
| Bidirectional Communication | ✅/❌ | |
| Long Message Content | ✅/❌ | |
| Empty Chat State | ✅/❌ | |

**Issues Found**:
1. [Description]
2. [Description]

**Browser/Device**:
- Browser: [Chrome/Firefox/Safari]
- Version: [Version number]
- OS: [Windows/Mac/Linux]
```

---

## Automated Test Script

For automated testing, use this script in the browser console:

```javascript
// Test Script for Core Messaging Functionality
async function testCoreMessaging() {
  console.log('🧪 Starting Core Messaging Tests...')
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }
  
  // Test 1: Check Pusher connection
  console.log('\n📡 Test 1: Pusher Connection')
  try {
    const pusherState = window.pusherClient?.connection?.state
    if (pusherState === 'connected') {
      console.log('✅ Pusher is connected')
      results.passed++
      results.tests.push({ name: 'Pusher Connection', status: 'PASS' })
    } else {
      console.log(`❌ Pusher state: ${pusherState}`)
      results.failed++
      results.tests.push({ name: 'Pusher Connection', status: 'FAIL', error: `State: ${pusherState}` })
    }
  } catch (error) {
    console.log('❌ Error checking Pusher:', error)
    results.failed++
    results.tests.push({ name: 'Pusher Connection', status: 'FAIL', error: error.message })
  }
  
  // Test 2: Send test message
  console.log('\n📤 Test 2: Send Message')
  try {
    const testMessage = `Test message ${Date.now()}`
    // This assumes you have access to the sendMessage function
    // You'll need to adapt this based on your actual implementation
    console.log('⚠️  Manual verification required: Send a message and check if it appears')
    results.tests.push({ name: 'Send Message', status: 'MANUAL' })
  } catch (error) {
    console.log('❌ Error sending message:', error)
    results.failed++
    results.tests.push({ name: 'Send Message', status: 'FAIL', error: error.message })
  }
  
  // Test 3: Check message persistence
  console.log('\n💾 Test 3: Message Persistence')
  try {
    const response = await fetch('/api/messages/private?chatId=test-user')
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Retrieved ${data.messages?.length || 0} messages`)
      results.passed++
      results.tests.push({ name: 'Message Persistence', status: 'PASS' })
    } else {
      console.log('❌ Failed to fetch messages')
      results.failed++
      results.tests.push({ name: 'Message Persistence', status: 'FAIL' })
    }
  } catch (error) {
    console.log('❌ Error fetching messages:', error)
    results.failed++
    results.tests.push({ name: 'Message Persistence', status: 'FAIL', error: error.message })
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total Tests: ${results.tests.length}`)
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log('\nDetailed Results:')
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${test.name}: ${test.status}`)
    if (test.error) console.log(`   Error: ${test.error}`)
  })
  
  return results
}

// Run the tests
testCoreMessaging()
```

---

## Performance Benchmarks

### Message Delivery Latency

**Requirement**: Messages should be delivered within 500ms

**Measurement Method**:
1. Open browser console in both windows
2. Add timestamp logging:
```javascript
// In sender window
const sendTime = Date.now()
console.log('Message sent at:', sendTime)

// In receiver window (add to message handler)
const receiveTime = Date.now()
console.log('Message received at:', receiveTime)
console.log('Latency:', receiveTime - sendTime, 'ms')
```

**Expected Result**: Latency < 500ms

---

## Next Steps

After completing these tests:
1. Document any failures or issues
2. Verify fixes for any issues found
3. Proceed to Test 10.2 (Error Scenarios)
4. Proceed to Test 10.3 (Performance Testing)


---

## 10.2 Error Scenario Tests

### Test 1: Pusher Service Unavailable

**Objective**: Verify the application continues to function when Pusher is unavailable.

**Steps**:
1. Temporarily set invalid Pusher credentials in `.env`
2. Restart the development server
3. Try to send a message
4. Check browser console for errors

**Expected Results**:
- ✅ Message is saved to database
- ✅ API returns success response
- ✅ Error is logged but not shown to user
- ✅ Application continues to function
- ✅ Fallback polling mechanism activates (if implemented)

**Verification**:
```javascript
// Check console for graceful error handling
// Should see: "❌ Failed to trigger Pusher event"
// But no user-facing errors
```

---

### Test 2: Network Disconnection

**Objective**: Verify reconnection behavior after network loss.

**Steps**:
1. Open chat with active Pusher connection
2. Open browser DevTools → Network tab
3. Set network to "Offline"
4. Wait 5 seconds
5. Set network back to "Online"
6. Send a message

**Expected Results**:
- ✅ Connection status indicator shows "disconnected"
- ✅ Pusher automatically attempts reconnection
- ✅ Connection status shows "connected" after network restored
- ✅ Messages sent during offline period are queued
- ✅ Queued messages are sent when reconnected

**Browser Console Verification**:
```javascript
// Should see state transitions:
// "Pusher state: connected → disconnected"
// "Pusher state: disconnected → connecting"
// "Pusher state: connecting → connected"
```

---

### Test 3: Invalid Authentication

**Objective**: Verify unauthorized users cannot access private channels.

**Steps**:
1. Log in as User A
2. Try to subscribe to a chat channel between User B and User C
3. Check browser console

**Expected Results**:
- ✅ Subscription fails with 403 Forbidden
- ✅ Error message: "Not authorized for this channel"
- ✅ No messages from that channel are received
- ✅ User A's own channels still work

**API Test**:
```bash
# Test unauthorized channel access
curl -X POST http://localhost:3000/api/pusher/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-a-token>" \
  -d '{
    "socket_id": "1234.5678",
    "channel_name": "private-chat-userB-userC"
  }'

# Expected: 403 Forbidden
```

---

### Test 4: Expired Authentication Token

**Objective**: Verify behavior when auth token expires.

**Steps**:
1. Log in and establish Pusher connection
2. Wait for token to expire (or manually invalidate)
3. Try to send a message

**Expected Results**:
- ✅ API returns 401 Unauthorized
- ✅ User is prompted to log in again
- ✅ After re-login, connection is re-established
- ✅ Messages can be sent again

---

### Test 5: Concurrent Connection Limit

**Objective**: Verify behavior when connection limit is reached.

**Steps**:
1. Open 100+ browser tabs with the application (Pusher free tier limit)
2. Try to open one more connection
3. Observe behavior

**Expected Results**:
- ✅ Error message about connection limit
- ✅ Graceful degradation to polling
- ✅ Application still functions
- ✅ User is notified of limited functionality

---

### Test 6: Message Send Failure

**Objective**: Verify error handling when message API fails.

**Steps**:
1. Open browser DevTools → Network tab
2. Block requests to `/api/messages/private`
3. Try to send a message
4. Observe UI

**Expected Results**:
- ✅ Error message displayed to user
- ✅ Message not added to UI
- ✅ Send button re-enabled
- ✅ User can retry sending
- ✅ No duplicate messages created

---

### Test 7: Malformed Message Data

**Objective**: Verify validation of message content.

**Steps**:
1. Open browser console
2. Try to send message with invalid data:
```javascript
fetch('/api/messages/private', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    receiverId: null, // Invalid
    content: '', // Empty
    type: 'INVALID_TYPE' // Invalid type
  })
})
```

**Expected Results**:
- ✅ API returns 400 Bad Request
- ✅ Validation error message returned
- ✅ No message created in database
- ✅ Pusher event not triggered

---

### Test 8: Database Connection Loss

**Objective**: Verify behavior when database is unavailable.

**Steps**:
1. Temporarily stop the database
2. Try to send a message
3. Restart database
4. Try again

**Expected Results**:
- ✅ API returns 500 Internal Server Error
- ✅ Error logged on server
- ✅ User sees error message
- ✅ After database restart, functionality restored
- ✅ No data corruption

---

## Automated Error Testing

Run the automated error scenario tests:

```bash
npx tsx scripts/test-pusher-errors.ts
```

This script tests:
- Pusher configuration validation
- Graceful degradation when Pusher fails
- Channel authentication (valid and invalid)
- Notification channel authorization
- Database constraint validation
- Duplicate message prevention
- Empty content handling

---

## Error Monitoring Checklist

### Server-Side Errors to Monitor

- [ ] Pusher API errors (rate limits, invalid credentials)
- [ ] Database connection errors
- [ ] Authentication failures
- [ ] Message validation errors
- [ ] File upload errors (if applicable)

### Client-Side Errors to Monitor

- [ ] Pusher connection failures
- [ ] Subscription errors
- [ ] Network timeouts
- [ ] Invalid message format
- [ ] Browser compatibility issues

### Error Logging

Ensure all errors are logged with:
- Timestamp
- User ID (if available)
- Error type and message
- Stack trace
- Request context

```typescript
// Example error logging
console.error('Pusher error:', {
  timestamp: new Date().toISOString(),
  userId: user?.id,
  error: error.message,
  channel: channelName,
  event: eventName
})
```

---

## Recovery Procedures

### If Pusher is Down

1. Check Pusher status page: https://status.pusher.com/
2. Verify environment variables are correct
3. Check Pusher dashboard for quota limits
4. Enable polling fallback if not already active
5. Monitor error rates

### If Messages Not Delivering

1. Check Pusher connection state in browser console
2. Verify user authentication is valid
3. Check channel name format is correct
4. Verify Pusher events are being triggered (server logs)
5. Check database for message persistence

### If Authentication Failing

1. Verify Supabase token is valid
2. Check `/api/pusher/auth` endpoint is accessible
3. Verify user has permission for the channel
4. Check CORS settings if cross-origin
5. Verify Pusher secret is correct



---

## 10.3 Performance Tests

### Test 1: Message Delivery Latency

**Objective**: Verify messages are delivered within 500ms.

**Automated Test**:
```bash
npx tsx scripts/test-pusher-performance.ts
```

**Manual Test Steps**:
1. Open browser console in two windows (User A and User B)
2. In User A window, add timing code:
```javascript
const sendTime = Date.now()
console.log('Sending message at:', sendTime)
// Send message
```

3. In User B window, add event listener:
```javascript
// This should be in your usePusher hook or message handler
const receiveTime = Date.now()
console.log('Received message at:', receiveTime)
console.log('Latency:', receiveTime - sendTime, 'ms')
```

**Expected Results**:
- ✅ Average latency < 500ms
- ✅ 95th percentile < 1000ms
- ✅ No messages lost
- ✅ Messages arrive in order

**Performance Benchmarks**:
- Excellent: < 200ms
- Good: 200-500ms
- Acceptable: 500-1000ms
- Poor: > 1000ms

---

### Test 2: Concurrent User Handling

**Objective**: Verify system handles multiple concurrent users.

**Test Steps**:
1. Open 10+ browser tabs with different users
2. Have all users send messages simultaneously
3. Monitor Pusher dashboard for connection count
4. Check for any errors or delays

**Expected Results**:
- ✅ All connections established successfully
- ✅ All messages delivered to correct recipients
- ✅ No connection drops
- ✅ Pusher connection count matches active users
- ✅ No performance degradation

**Pusher Dashboard Metrics to Monitor**:
- Active connections
- Messages per second
- API response time
- Error rate

---

### Test 3: Memory Leak Detection

**Objective**: Verify no memory leaks in subscriptions.

**Automated Test**:
```bash
npx tsx scripts/test-pusher-performance.ts
```
(Includes memory usage check)

**Manual Test Steps**:
1. Open browser DevTools → Memory tab
2. Take heap snapshot (Snapshot 1)
3. Open and close 10 different chats
4. Force garbage collection
5. Take another heap snapshot (Snapshot 2)
6. Compare snapshots

**Expected Results**:
- ✅ Heap size returns to baseline after GC
- ✅ No detached DOM nodes
- ✅ Pusher subscriptions properly cleaned up
- ✅ Event listeners removed on unmount
- ✅ Memory increase < 10MB after 100 operations

**Browser Console Check**:
```javascript
// Check for proper cleanup
// Should see unsubscribe logs when leaving chat:
// "🔌 Unsubscribing from private-chat-..."
```

---

### Test 4: Database Query Performance

**Objective**: Verify database queries are optimized.

**Automated Test**:
```bash
npx tsx scripts/test-pusher-performance.ts
```

**Manual Test - Check Query Execution Time**:
```sql
-- Enable query timing in PostgreSQL
\timing on

-- Test message retrieval query
EXPLAIN ANALYZE
SELECT * FROM "Message"
WHERE ("senderId" = 'user1' AND "receiverId" = 'user2')
   OR ("senderId" = 'user2' AND "receiverId" = 'user1')
ORDER BY "createdAt" DESC
LIMIT 50;
```

**Expected Results**:
- ✅ Query execution time < 100ms
- ✅ Proper indexes used
- ✅ No full table scans
- ✅ Efficient JOIN operations

**Optimization Recommendations**:
- Add composite index on (senderId, receiverId, createdAt)
- Add index on createdAt for sorting
- Consider partitioning for large message tables

---

### Test 5: Pusher Connection Management

**Objective**: Monitor Pusher connection count and efficiency.

**Test Steps**:
1. Open Pusher dashboard
2. Monitor "Connections" tab
3. Open multiple browser tabs
4. Close tabs and verify connections are cleaned up

**Expected Results**:
- ✅ Connection count matches active users
- ✅ Connections closed when tabs close
- ✅ No orphaned connections
- ✅ Reconnection works after network loss
- ✅ Within Pusher tier limits (100 for free tier)

**Pusher Dashboard Checks**:
- Current connections
- Peak connections
- Connection duration
- Reconnection rate

---

### Test 6: API Response Time

**Objective**: Verify API endpoints respond quickly.

**Test with cURL**:
```bash
# Test message sending API
time curl -X POST http://localhost:3000/api/messages/private \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "receiverId": "user2",
    "content": "Test message",
    "type": "TEXT"
  }'

# Test message retrieval API
time curl http://localhost:3000/api/messages/private?chatId=user2 \
  -H "Authorization: Bearer <token>"
```

**Expected Results**:
- ✅ POST /api/messages/private: < 1 second
- ✅ GET /api/messages/private: < 500ms
- ✅ POST /api/pusher/auth: < 200ms
- ✅ No timeout errors
- ✅ Consistent response times

---

### Test 7: Load Testing

**Objective**: Test system under high load.

**Using Artillery (Install: `npm install -g artillery`)**:

Create `load-test.yml`:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  
scenarios:
  - name: "Send messages"
    flow:
      - post:
          url: "/api/messages/private"
          headers:
            Content-Type: "application/json"
            Authorization: "Bearer {{token}}"
          json:
            receiverId: "test-user"
            content: "Load test message"
            type: "TEXT"
```

Run: `artillery run load-test.yml`

**Expected Results**:
- ✅ Response time p95 < 2 seconds
- ✅ Error rate < 1%
- ✅ No server crashes
- ✅ Database connections managed properly
- ✅ Pusher rate limits not exceeded

---

## Performance Optimization Checklist

### Database Optimizations
- [ ] Add indexes on frequently queried columns
- [ ] Use connection pooling
- [ ] Implement query result caching
- [ ] Optimize N+1 queries
- [ ] Use database read replicas for scaling

### Pusher Optimizations
- [ ] Batch Pusher events when possible
- [ ] Use presence channels efficiently
- [ ] Implement client-side event throttling
- [ ] Monitor Pusher quota usage
- [ ] Consider upgrading Pusher tier if needed

### Application Optimizations
- [ ] Implement message pagination
- [ ] Use virtual scrolling for long message lists
- [ ] Lazy load images and files
- [ ] Debounce typing indicators
- [ ] Cache user data client-side
- [ ] Use React.memo for message components
- [ ] Implement optimistic UI updates

### Network Optimizations
- [ ] Enable HTTP/2
- [ ] Use CDN for static assets
- [ ] Compress API responses
- [ ] Implement request batching
- [ ] Use WebSocket compression

---

## Performance Monitoring

### Metrics to Track

**Server-Side**:
- API response times (p50, p95, p99)
- Database query times
- Pusher event trigger times
- Error rates
- CPU and memory usage

**Client-Side**:
- Time to first message
- Message delivery latency
- UI render time
- Memory usage
- Network requests

**Pusher-Specific**:
- Connection count
- Messages per second
- Subscription success rate
- Event delivery rate
- API quota usage

### Monitoring Tools

**Recommended Tools**:
- Pusher Dashboard (built-in metrics)
- Vercel Analytics (if deployed on Vercel)
- Sentry (error tracking)
- LogRocket (session replay)
- New Relic or DataDog (APM)

**Browser Performance API**:
```javascript
// Measure message delivery time
const startTime = performance.now()
// ... send message ...
const endTime = performance.now()
console.log(`Message sent in ${endTime - startTime}ms`)
```

---

## Performance Test Results Template

```markdown
### Performance Test Run: [Date/Time]
**Environment**: [Development/Staging/Production]
**Database**: [PostgreSQL version, location]
**Pusher Tier**: [Free/Startup/Professional]

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Message Delivery Latency (avg) | < 500ms | [X]ms | ✅/❌ |
| API Response Time (p95) | < 1s | [X]ms | ✅/❌ |
| Database Query Time | < 100ms | [X]ms | ✅/❌ |
| Concurrent Users Supported | 100+ | [X] | ✅/❌ |
| Memory Usage (after 1hr) | < 200MB | [X]MB | ✅/❌ |
| Pusher Event Throughput | > 100/s | [X]/s | ✅/❌ |

**Issues Identified**:
1. [Description and severity]
2. [Description and severity]

**Recommendations**:
1. [Optimization suggestion]
2. [Optimization suggestion]
```

---

## Next Steps After Testing

1. ✅ Review all test results
2. ✅ Document any performance issues
3. ✅ Implement optimizations for failed tests
4. ✅ Re-run tests to verify improvements
5. ✅ Update performance baselines
6. ✅ Set up continuous performance monitoring
7. ✅ Proceed to task 11 (Remove Socket.IO)

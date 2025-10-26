# 🔐 Pusher Authentication Testing Guide

## Overview

This guide helps you test Pusher authentication to ensure private channels are secure.

## Test 1: Authentication API Endpoint

### Using curl:

```bash
# Get your Supabase token first (from browser console)
# In browser: localStorage.getItem('supabase.auth.token')

curl -X POST http://localhost:3000/api/pusher/auth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -d '{
    "socket_id": "123.456",
    "channel_name": "private-chat-user1-user2"
  }'
```

### Expected Response:

```json
{
  "auth": "your_app_key:signature_hash"
}
```

## Test 2: Private Channel Subscription

### In Browser Console:

```javascript
import { getPusherClient } from '@/lib/pusher/client'

// Get token from Supabase
const { createBrowserClient } = await import('@supabase/ssr')
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)
const { data: { session } } = await supabase.auth.getSession()

// Initialize Pusher with token
const pusher = getPusherClient(session.access_token)

// Subscribe to private channel
const channel = pusher.subscribe('private-chat-user1-user2')

channel.bind('pusher:subscription_succeeded', () => {
  console.log('✅ Successfully subscribed to private channel')
})

channel.bind('pusher:subscription_error', (error) => {
  console.error('❌ Subscription failed:', error)
})
```

## Test 3: Unauthorized Access

Test that unauthorized users cannot access channels:

```javascript
// Try to subscribe without token
const pusher = getPusherClient() // No token
const channel = pusher.subscribe('private-chat-other-user1-other-user2')

// Should fail with 403 Forbidden
```

## Common Issues

### Issue: "Unauthorized: No token provided"
**Solution**: Pass Supabase token to `getPusherClient(token)`

### Issue: "Forbidden: Not authorized for this private channel"
**Solution**: User is not part of this chat. Check channel name format.

### Issue: "Invalid token"
**Solution**: Token expired. Get new token from Supabase.

## Next Steps

After authentication works:
- ✅ Task 2 complete
- ⏭️ Task 3: Create usePusher hook

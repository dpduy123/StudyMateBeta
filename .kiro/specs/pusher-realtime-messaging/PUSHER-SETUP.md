# Pusher Setup Guide

## Quick Start

This guide will help you set up Pusher for real-time messaging in StudyMate in under 5 minutes.

## Step 1: Create Pusher Account

1. Go to [https://dashboard.pusher.com/](https://dashboard.pusher.com/)
2. Sign up for a free account (no credit card required)
3. Verify your email

## Step 2: Create Channels App

1. Click "Create app" or "Channels apps" → "Create Channels app"
2. Fill in the details:
   - **App name**: `studymate-dev` (or your preferred name)
   - **Cluster**: Choose closest to your users:
     - `us2` - US East (N. Virginia)
     - `us3` - US West (Oregon)
     - `eu` - EU (Ireland)
     - `ap1` - Asia Pacific (Singapore)
     - `ap2` - Asia Pacific (Mumbai)
   - **Tech stack**: Select "React" for frontend and "Node.js" for backend
3. Click "Create app"

## Step 3: Get Your Credentials

1. In your app dashboard, click "App Keys" in the left sidebar
2. You'll see your credentials:
   ```
   app_id: 1234567
   key: a1b2c3d4e5f6g7h8i9j0
   secret: k1l2m3n4o5p6q7r8s9t0
   cluster: ap1
   ```

## Step 4: Add to Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your Pusher credentials:
   ```env
   PUSHER_APP_ID=1234567
   PUSHER_SECRET=k1l2m3n4o5p6q7r8s9t0
   NEXT_PUBLIC_PUSHER_KEY=a1b2c3d4e5f6g7h8i9j0
   NEXT_PUBLIC_PUSHER_CLUSTER=ap1
   ```

   **Important**: 
   - Replace the example values with your actual credentials
   - `NEXT_PUBLIC_*` variables are exposed to the browser (this is safe for the key)
   - Never commit `.env.local` to git

## Step 5: Install Dependencies

```bash
npm install
```

This will install:
- `pusher` - Server-side library
- `pusher-js` - Client-side library

## Step 6: Start Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

## Step 7: Verify Setup

1. Open the app in your browser
2. Open browser console (F12)
3. Look for Pusher connection messages:
   ```
   Pusher: Connecting
   Pusher: Connected
   ```

4. If you see errors, check:
   - Credentials are correct
   - No typos in environment variables
   - `.env.local` file is in the root directory

## Testing Real-time Messaging

### Option 1: Manual Testing

1. Open the app in two different browsers (or incognito mode)
2. Log in as two different users
3. Start a chat between them
4. Send a message from one user
5. Verify it appears instantly in the other browser

### Option 2: Automated Testing

Run the test scripts:

```bash
# Test core messaging
npm run test:pusher:core

# Test error handling
npm run test:pusher:errors

# Test performance
npm run test:pusher:perf

# Run all tests
npm run test:pusher
```

## Pusher Dashboard

Monitor your app in real-time:

1. Go to [https://dashboard.pusher.com/](https://dashboard.pusher.com/)
2. Select your app
3. Click "Debug Console" to see live events
4. Click "Metrics" to see usage statistics

### What to Monitor

- **Connections**: Number of active WebSocket connections
- **Messages**: Number of messages sent
- **Channels**: Active channels
- **Errors**: Failed authentications or trigger errors

## Free Tier Limits

Pusher free tier includes:
- ✅ **100 concurrent connections**
- ✅ **200,000 messages per day**
- ✅ **Unlimited channels**
- ✅ **SSL/TLS encryption**
- ✅ **Presence channels**
- ✅ **Private channels**

This is sufficient for:
- Development and testing
- Small production deployments (<100 users)
- MVP launches

## Upgrading

When you need more capacity:

### Startup Plan ($49/month)
- 500 concurrent connections
- 1M messages/day
- Email support

### Professional Plan ($299/month)
- 2,000 concurrent connections
- 5M messages/day
- Priority support
- 99.9% uptime SLA

## Troubleshooting

### Issue: "Connection failed"

**Possible causes:**
- Wrong credentials
- Network/firewall blocking WebSocket
- Incorrect cluster

**Solution:**
1. Verify credentials in Pusher dashboard
2. Check browser console for specific error
3. Try different cluster if needed

### Issue: "Authentication failed"

**Possible causes:**
- User not logged in
- Invalid Supabase token
- Auth endpoint not working

**Solution:**
1. Verify user is authenticated
2. Check `/api/pusher/auth` endpoint
3. Review server logs

### Issue: "Messages not received"

**Possible causes:**
- Not subscribed to channel
- Wrong channel name
- Pusher not connected

**Solution:**
1. Check Pusher connection status
2. Verify channel name format
3. Check Pusher debug console

## Environment-Specific Setup

### Development
```env
PUSHER_APP_ID=dev_app_id
PUSHER_SECRET=dev_secret
NEXT_PUBLIC_PUSHER_KEY=dev_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

### Staging
```env
PUSHER_APP_ID=staging_app_id
PUSHER_SECRET=staging_secret
NEXT_PUBLIC_PUSHER_KEY=staging_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

### Production
```env
PUSHER_APP_ID=prod_app_id
PUSHER_SECRET=prod_secret
NEXT_PUBLIC_PUSHER_KEY=prod_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

**Tip**: Create separate Pusher apps for each environment to:
- Isolate testing from production
- Track usage separately
- Avoid accidental data mixing

## Security Best Practices

### ✅ Do's
- Use private channels for sensitive data
- Implement authentication for all channels
- Validate user permissions server-side
- Use HTTPS in production
- Rotate secrets periodically

### ❌ Don'ts
- Don't commit `.env.local` to git
- Don't expose `PUSHER_SECRET` to client
- Don't skip authentication
- Don't use public channels for private data
- Don't hardcode credentials

## Next Steps

Now that Pusher is set up:

1. ✅ **Read the Migration Guide**: [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
2. ✅ **Review the Architecture**: [design.md](./design.md)
3. ✅ **Deploy to Production**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
4. ✅ **Monitor Usage**: Check Pusher dashboard regularly

## Support

### Documentation
- [Pusher Channels Docs](https://pusher.com/docs/channels/)
- [Pusher JavaScript Client](https://pusher.com/docs/channels/using_channels/client-api-overview/)
- [Pusher Server API](https://pusher.com/docs/channels/library_auth_reference/rest-api/)

### Community
- [Pusher Community Forum](https://pusher.com/community)
- [Pusher Support](https://support.pusher.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/pusher)

### StudyMate
- Email: support@studymate.vn
- GitHub: [Create Issue](https://github.com/your-repo/issues)

---

**Congratulations!** 🎉 You've successfully set up Pusher for real-time messaging in StudyMate!

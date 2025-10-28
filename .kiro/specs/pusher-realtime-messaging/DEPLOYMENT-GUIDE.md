# Pusher Real-time Messaging - Deployment Guide

## Overview

This guide covers deploying StudyMate with Pusher real-time messaging to various platforms. The application now uses standard Next.js without custom server requirements, making deployment straightforward.

## Prerequisites

Before deploying, ensure you have:

1. **Pusher Account**: Sign up at [https://dashboard.pusher.com/](https://dashboard.pusher.com/)
2. **Pusher Credentials**: App ID, Key, Secret, and Cluster
3. **Supabase Project**: Database and authentication configured
4. **Environment Variables**: All required variables ready

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Pusher (Required for real-time messaging)
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

### Optional Variables

```env
# Redis (Optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

## Platform-Specific Deployment

### 1. Vercel (Recommended)

Vercel is the recommended platform for Next.js applications and works perfectly with Pusher.

#### Step 1: Connect Repository

1. Go to [https://vercel.com/](https://vercel.com/)
2. Click "New Project"
3. Import your GitHub/GitLab/Bitbucket repository
4. Select the repository

#### Step 2: Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

#### Step 3: Add Environment Variables

In the Vercel dashboard, add all environment variables:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
```

**Important**: Variables starting with `NEXT_PUBLIC_` are exposed to the browser.

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

#### Step 5: Verify

1. Open the deployed URL
2. Check browser console for Pusher connection
3. Test sending/receiving messages
4. Monitor Pusher dashboard for events

#### Vercel Configuration File (Optional)

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_PUSHER_KEY": "@pusher-key",
    "NEXT_PUBLIC_PUSHER_CLUSTER": "@pusher-cluster"
  }
}
```

### 2. Railway

Railway provides easy deployment with automatic HTTPS and environment management.

#### Step 1: Create New Project

1. Go to [https://railway.app/](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

#### Step 2: Configure Service

1. Railway auto-detects Next.js
2. No additional configuration needed

#### Step 3: Add Environment Variables

In Railway dashboard:
1. Go to "Variables" tab
2. Add all required environment variables
3. Click "Deploy"

#### Step 4: Custom Domain (Optional)

1. Go to "Settings" tab
2. Add custom domain
3. Configure DNS records

#### Railway Configuration File (Optional)

Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Render

Render offers free tier with automatic deployments.

#### Step 1: Create Web Service

1. Go to [https://render.com/](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your repository

#### Step 2: Configure Service

- **Name**: studymate-app
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free or Starter

#### Step 3: Add Environment Variables

Add all required variables in the "Environment" section.

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment
3. Access your app URL

### 4. Netlify

Netlify supports Next.js with their Next.js Runtime.

#### Step 1: Connect Repository

1. Go to [https://netlify.com/](https://netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your repository

#### Step 2: Configure Build

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: (leave empty)

#### Step 3: Add Environment Variables

Add all required variables in "Site settings" → "Environment variables"

#### Step 4: Deploy

Click "Deploy site" and wait for completion.

#### Netlify Configuration File

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 5. Self-Hosted (VPS)

Deploy on your own server (Ubuntu/Debian example).

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx
```

#### Step 2: Clone and Build

```bash
# Clone repository
git clone <your-repo-url>
cd StudyMateProject

# Install dependencies
npm install

# Create .env.production
nano .env.production
# Add all environment variables

# Build application
npm run build
```

#### Step 3: Start with PM2

```bash
# Start application
pm2 start npm --name "studymate" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/studymate`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/studymate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 6: Auto-Deploy with Git Hooks (Optional)

Create post-receive hook:
```bash
#!/bin/bash
cd /path/to/StudyMateProject
git pull origin main
npm install
npm run build
pm2 restart studymate
```

### 6. Docker Deployment

Deploy using Docker containers.

#### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - PUSHER_APP_ID=${PUSHER_APP_ID}
      - PUSHER_SECRET=${PUSHER_SECRET}
      - NEXT_PUBLIC_PUSHER_KEY=${NEXT_PUBLIC_PUSHER_KEY}
      - NEXT_PUBLIC_PUSHER_CLUSTER=${NEXT_PUBLIC_PUSHER_CLUSTER}
    restart: unless-stopped
```

#### Deploy

```bash
docker-compose up -d
```

## Post-Deployment Checklist

### 1. Verify Pusher Connection

- [ ] Open browser console
- [ ] Check for "Pusher connected" message
- [ ] Verify no authentication errors

### 2. Test Real-time Features

- [ ] Send message between two users
- [ ] Verify message received in real-time
- [ ] Test typing indicators
- [ ] Test read receipts
- [ ] Test online/offline status

### 3. Monitor Pusher Dashboard

- [ ] Check connection count
- [ ] Monitor message volume
- [ ] Review error logs
- [ ] Verify API usage within limits

### 4. Performance Testing

- [ ] Test with multiple concurrent users
- [ ] Check message delivery latency (<500ms)
- [ ] Monitor memory usage
- [ ] Test reconnection after network loss

### 5. Security Verification

- [ ] Verify HTTPS is enabled
- [ ] Check authentication is working
- [ ] Test private channel access control
- [ ] Verify environment variables are secure

## Monitoring and Maintenance

### Pusher Dashboard

Monitor at [https://dashboard.pusher.com/](https://dashboard.pusher.com/):
- **Connections**: Current and peak connections
- **Messages**: Messages sent per day
- **Errors**: Failed authentications, trigger errors
- **Usage**: API calls and bandwidth

### Application Logs

Check logs for:
- Pusher connection errors
- Authentication failures
- Message delivery issues
- Performance bottlenecks

### Alerts Setup

Set up alerts for:
- High error rates
- Connection limit approaching
- Message limit approaching
- API response time degradation

## Scaling Considerations

### Pusher Free Tier Limits
- 100 concurrent connections
- 200,000 messages/day
- 10 channels per connection

### When to Upgrade

Upgrade to paid tier when:
- Approaching 80 concurrent connections
- Sending >150,000 messages/day
- Need more than 10 channels per user
- Require support SLA

### Horizontal Scaling

The application scales horizontally automatically:
- Pusher handles all WebSocket connections
- Next.js API routes are stateless
- No session affinity required
- Database connection pooling via Prisma

## Troubleshooting

### Issue: Build Fails

**Check:**
- All dependencies installed
- Environment variables set
- Prisma schema is valid
- TypeScript compilation succeeds

**Solution:**
```bash
npm install
npx prisma generate
npm run build
```

### Issue: Pusher Not Connecting

**Check:**
- Pusher credentials are correct
- Environment variables are set
- CORS is configured correctly
- Network allows WebSocket connections

**Solution:**
- Verify credentials in Pusher dashboard
- Check browser console for errors
- Test with Pusher debug mode enabled

### Issue: Messages Not Delivered

**Check:**
- Pusher connection is active
- Channel names are correct
- Authentication is successful
- Events are being triggered

**Solution:**
- Check Pusher dashboard for events
- Verify channel subscription
- Test authentication endpoint

### Issue: High Latency

**Check:**
- Pusher cluster location
- Database query performance
- Network latency
- API response times

**Solution:**
- Choose Pusher cluster closest to users
- Optimize database queries
- Enable caching (Redis)
- Use CDN for static assets

## Support

### Documentation
- [Pusher Channels Docs](https://pusher.com/docs/channels/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)

### Community
- [Pusher Community](https://pusher.com/community)
- [Next.js Discord](https://nextjs.org/discord)

### Contact
- Email: support@studymate.vn
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

## Summary

Deploying StudyMate with Pusher is straightforward:

1. ✅ **No custom server required** - Standard Next.js deployment
2. ✅ **Works on any platform** - Vercel, Railway, Render, VPS, Docker
3. ✅ **Easy to scale** - Pusher handles all real-time infrastructure
4. ✅ **Reliable** - Built-in reconnection and fallback mechanisms
5. ✅ **Monitored** - Pusher dashboard provides full visibility

Choose the platform that best fits your needs and follow the steps above for a successful deployment!

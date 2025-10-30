# Technology Stack & Build System

## Core Technologies

### Frontend
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom StudyMate theme
- **Framer Motion** for animations
- **React Hook Form + Zod** for form validation
- **SWR** for data fetching and caching
- **Zustand** for state management

### Backend & Database
- **Supabase** for authentication and PostgreSQL database
- **Prisma ORM** with custom output path (`lib/generated/prisma`)
- **Pusher** for real-time messaging (WebSocket + HTTP fallback)
- **Redis** (optional) for caching and performance optimization

### Testing & Development
- **Vitest** for unit testing with jsdom environment
- **ESLint** for code linting
- **TypeScript** strict mode enabled

## Common Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server

# Testing
npm run test                   # Run tests once
npm run test:watch             # Run tests in watch mode
npm run test:ui                # Run tests with UI

# Database
npx prisma generate            # Generate Prisma client
npx prisma db push             # Push schema changes
npx prisma studio              # Open Prisma Studio

# Matching & Performance
npm run precompute:matches     # Precompute AI matches
npm run redis:check            # Check Redis health
npm run matching:debug         # Debug matching performance

# Real-time Testing
npm run test:pusher            # Test all Pusher functionality
npm run test:pusher:core       # Test core messaging
npm run test:pusher:errors     # Test error handling
npm run test:pusher:perf       # Test performance
npm run test:monitoring        # Test monitoring systems
```

## Environment Setup

Required environment variables:
- Supabase credentials (URL, keys, connection strings)
- Pusher credentials (app ID, key, secret, cluster)
- Redis connection (optional)
- NextAuth configuration

## Performance Optimizations

- Bundle splitting for React, Pusher, and animations
- Image optimization with AVIF/WebP formats
- CSS optimization and package import optimization
- Compression enabled for production builds
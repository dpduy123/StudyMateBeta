# StudyMate

> AI-powered student connection platform for Vietnamese universities

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

StudyMate helps students find compatible study partners through intelligent AI matching, real-time messaging, and virtual study rooms. Exclusively for verified .edu email users.

---

## Features

### Core Platform

| Feature | Description | Status |
|---------|-------------|--------|
| **Smart Matching** | AI algorithm analyzing courses, GPA, learning styles, schedules | Done |
| **Real-time Chat** | Pusher WebSocket messaging with reactions, threads, read receipts | Done |
| **Study Rooms** | Voice/video rooms with screen sharing and moderation | Done |
| **Gamification** | Badges, achievements, leaderboards, peer ratings | Done |
| **Subscriptions** | Basic (free), Premium, Elite tiers | Done |

### AI-Powered Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Match Algorithm** | >85% accuracy based on academic profiles | Done |
| **AI Study Tutor** | Elite feature - personalized tutoring | In Progress |
| **Conversation Facilitator** | Icebreakers and topic suggestions | Planned |
| **Room Moderator** | Auto-moderation and summaries | Planned |

---

## Tech Stack

### Frontend
- **Next.js 15** - App Router, Server Components
- **React 19** - Latest features with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **SWR** - Data fetching and caching

### Backend
- **Next.js API Routes** - 47 endpoints
- **Prisma ORM** - Type-safe database access
- **Supabase** - Auth + PostgreSQL database
- **Pusher** - Real-time WebSocket messaging
- **Redis** - Optional caching layer

### AI & Analytics
- **Google Gemini** - AI matching and tutoring
- **Opik by Comet** - LLM observability (planned)

### Infrastructure
- **Vercel** - Deployment
- **WebRTC** - Video/voice calls via Simple Peer

---

## Project Structure

```
StudyMateBeta/
├── app/                          # Next.js App Router
│   ├── api/                      # 47 API routes
│   ├── auth/                     # Login, register, password reset
│   ├── dashboard/                # Main dashboard
│   ├── discover/                 # Tinder-style matching
│   ├── discover-b2c/             # Partner grid view
│   ├── messages/                 # Direct messaging
│   ├── rooms/                    # Study rooms
│   ├── profile/                  # User profiles
│   ├── achievements/             # Badges & achievements
│   └── admin/                    # Admin dashboard
│
├── components/                   # React components (15 modules)
│   ├── chat/                     # Messaging UI
│   ├── video/                    # Video call components
│   ├── rooms/                    # Study room UI
│   ├── discover/                 # Matching interface
│   └── ui/                       # Shared components
│
├── lib/                          # Business logic
│   ├── matching/                 # Smart matching engine
│   ├── ai/                       # Gemini AI integration
│   ├── pusher/                   # Real-time messaging
│   ├── supabase/                 # Auth & database
│   └── cache/                    # Redis caching
│
├── hooks/                        # 21 React hooks
├── stores/                       # Zustand stores
├── prisma/                       # Database schema
└── docs/                         # Documentation (22 files)
```

---

## Database Schema

```
Users           Matching         Messaging        Gamification
┌─────────┐    ┌─────────┐      ┌─────────┐      ┌─────────┐
│ User    │───▶│ Match   │      │ Message │      │ Badge   │
│ Activity│    │ Rating  │      │ Reaction│      │ Achieve │
│ Metrics │    └─────────┘      └─────────┘      └─────────┘
└─────────┘                           │
                              ┌───────┴───────┐
                              │               │
                         ┌─────────┐    ┌─────────┐
                         │ Room    │    │ RoomMsg │
                         │ Member  │    │ Reaction│
                         └─────────┘    └─────────┘
```

**13 tables** with cascade deletion, indexed queries, and JSON metadata fields.

---

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL (via Supabase)
- Pusher account (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/studymate.git
cd studymate

# Install dependencies
bun install  # or npm install

# Set up environment
cp .env.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Pusher (Real-time)
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# AI
GOOGLE_AI_API_KEY=

# Optional
REDIS_URL=
OPIK_API_KEY=
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with test data (optional)
npx prisma db seed
```

### Run Development Server

```bash
bun dev  # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Subscription Tiers

| Feature | Basic (Free) | Premium (79k/mo) | Elite (149k/mo) |
|---------|:------------:|:----------------:|:---------------:|
| Daily matches | 5 | Unlimited | Unlimited |
| Daily rooms | 5 | Unlimited | Unlimited |
| Advanced filters | - | Yes | Yes |
| Screen sharing | - | Yes | Yes |
| AI Tutor | - | - | Yes |
| Career mentoring | - | - | Yes |
| Exclusive events | - | - | Yes |

---

## Responsive Design

Optimized for all screen sizes:

| Device | Resolution |
|--------|------------|
| Mobile | 375px - 767px |
| Tablet | 768px - 1023px |
| Desktop | 1024px - 1919px |
| 2K | 1920px - 2559px |
| 4K | 2560px+ |
| Ultrawide | 3440px+ (21:9) |

---

## API Overview

47 API endpoints across these categories:

- **Auth** - Email verification, OAuth callbacks
- **Discovery** - Smart matches, user browsing, stats
- **Messages** - Private/room messages, reactions, typing
- **Rooms** - Room management, members, messaging
- **Users** - Profiles, preferences, activity
- **Admin** - Dashboard, monitoring, moderation

---

## Roadmap

### Phase 1: Core Platform (Completed)
- [x] User authentication with .edu verification
- [x] AI-powered matching algorithm
- [x] Real-time messaging with Pusher
- [x] Study rooms with video/voice
- [x] Gamification system
- [x] Subscription tiers

### Phase 2: AI Enhancement (In Progress)
- [x] Smart matching engine optimization
- [ ] AI Study Tutor (Elite feature)
- [ ] Opik integration for LLM observability
- [ ] Conversation facilitator agent
- [ ] Study room moderator agent

### Phase 3: Growth (Planned)
- [ ] Mobile app (React Native)
- [ ] University partnerships
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

## Performance

- **Image optimization** - AVIF, WebP formats
- **Code splitting** - Separate chunks for React, Pusher, animations
- **Tree shaking** - Optimized bundle size
- **Redis caching** - Optional performance layer
- **Virtualized lists** - Efficient rendering for large datasets

---

## Security

- **Email verification** - .edu domains only
- **Rate limiting** - API protection
- **Input sanitization** - XSS prevention
- **CSRF protection** - Token-based security
- **Secure file uploads** - Validated and sandboxed

---

## Documentation

Comprehensive docs available in `/docs`:

- Authentication flows
- API reference
- Database monitoring
- Performance optimization
- Middleware configuration
- Mock data setup

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contact

- **Email**: support@studymate.vn
- **Website**: [studymate.vn](https://studymate.vn)

---

Built with Next.js, React, and AI for Vietnamese students.

# Project Structure & Organization

## Directory Structure

```
├── app/                       # Next.js App Router pages
│   ├── api/                   # API routes
│   ├── auth/                  # Authentication pages
│   ├── dashboard/             # Main dashboard pages
│   ├── discover/              # AI matching pages
│   ├── messages/              # Messaging interface
│   ├── profile/               # User profile pages
│   ├── rooms/                 # Study room pages
│   ├── achievements/          # Achievement system
│   ├── admin/                 # Admin panel
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Landing page
├── components/                # Reusable React components
│   ├── admin/                 # Admin-specific components
│   ├── chat/                  # Chat and messaging components
│   ├── guards/                # Route protection components
│   ├── landing/               # Landing page components
│   ├── layout/                # Layout components (header, nav, etc.)
│   ├── monitoring/            # Performance monitoring components
│   ├── notifications/         # Notification system components
│   ├── profile/               # Profile-related components
│   ├── providers/             # Context providers (auth, theme, etc.)
│   ├── rooms/                 # Study room components
│   ├── ui/                    # Base UI components (buttons, forms, etc.)
│   └── video/                 # Video call components
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries and configurations
│   ├── auth/                  # Authentication utilities
│   ├── cache/                 # Redis caching utilities
│   ├── data/                  # Data fetching utilities
│   ├── generated/             # Generated code (Prisma client)
│   ├── jobs/                  # Background job utilities
│   ├── matching/              # AI matching algorithms
│   ├── mock-data/             # Mock data generators
│   ├── monitoring/            # Performance monitoring
│   ├── optimistic/            # Optimistic UI updates
│   ├── prefetch/              # Data prefetching utilities
│   ├── pusher/                # Real-time messaging setup
│   ├── supabase/              # Supabase client configuration
│   └── swr/                   # SWR configuration
├── stores/                    # Zustand state stores
├── database/                  # Database schema and migrations
├── scripts/                   # Utility scripts for development
├── tests/                     # Test files
│   ├── e2e/                   # End-to-end tests
│   ├── integration/           # Integration tests
│   └── performance/           # Performance tests
└── docs/                      # Documentation
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`, `MessageList.tsx`)
- **Pages**: kebab-case for routes (e.g., `user-profile/page.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useMessages.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)

## Import Path Conventions

- Use `@/` alias for root-level imports
- Relative imports for same-directory files
- Group imports: external libraries → internal utilities → components

## Component Organization

- Each major feature has its own component directory
- Shared UI components in `components/ui/`
- Feature-specific components in respective directories
- Provider components in `components/providers/`

## Database & API

- Prisma schema in `prisma/schema.prisma`
- Generated client in `lib/generated/prisma/`
- API routes follow RESTful conventions
- Real-time features use Pusher channels

## Language Support

- Primary language: Vietnamese (vi_VN)
- Font: Inter with Vietnamese subset support
- All user-facing text should support Vietnamese characters
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint linting
- `pnpm db:generate` - Generate Drizzle migration files
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes directly to database
- `pnpm db:studio` - Open Drizzle Studio for database inspection

## Environment Setup

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key  
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in page URL (/sign-in)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up page URL (/sign-up)
- `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` - Post-login redirect (/dashboard)
- `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` - Post-signup redirect (/dashboard)

## Architecture Overview

This is a Next.js 15 Todo application with Clerk authentication and the following key architectural decisions:

### Authentication Layer
- **Provider**: Clerk (@clerk/nextjs)
- **Middleware**: Protected routes in `middleware.ts`
- **Components**: Built-in Clerk components for SignIn, SignUp, UserProfile
- **Pages**: `/sign-in`, `/sign-up`, `/dashboard`, `/profile`, `/settings`
- **Layout**: `AuthenticatedLayout` with collapsible sidebar (`AppSidebar`)

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Single `todos` table in `src/lib/db/schema.ts` with `userId` field for user association
- **Connection**: Environment-specific drivers in `src/lib/db/index.ts`
  - Production: Neon serverless driver (`@neondatabase/serverless`)
  - Development: Regular postgres driver (`postgres`)
- **Migrations**: Auto-generated in `drizzle/` directory

### API Architecture
- **Pattern**: RESTful API routes using Next.js App Router with Clerk authentication
- **Authentication**: All routes require authenticated user via `auth()` from Clerk
- **Endpoints**: 
  - `GET /api/todos` - List user's todos (filtered by userId, sorted by creation date)
  - `POST /api/todos` - Create new todo (associates with current user)
  - `GET /api/todos/[id]` - Get specific user todo
  - `PUT /api/todos/[id]` - Update user todo
  - `DELETE /api/todos/[id]` - Delete user todo
- **Security**: All operations scoped to authenticated user via `userId` filtering
- **Error Handling**: Consistent JSON error responses with appropriate HTTP status codes

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk hooks (`useUser`, `useClerk`) for auth state
- **Layout**: `AuthenticatedLayout` with `AppSidebar` for authenticated pages
- **Components**: 
  - `TodoApp.tsx` - Main todo interface
  - `AppSidebar.tsx` - Collapsible navigation sidebar
  - `AuthenticatedLayout.tsx` - Layout wrapper for protected pages
- **UI Library**: shadcn/ui components in `components/ui/`
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom blue/orange color theme
- **Navigation**: 4-page app structure (dashboard, todos, profile, settings)

### Environment-Specific Behavior
- **Production**: Uses Neon serverless driver, automatic migrations via postinstall script
- **Development**: Uses regular postgres driver, manual migration running
- **Environment Variables**: Both database and Clerk credentials required
- **Authentication**: Middleware protects routes, redirects to sign-in for unauthenticated users

## Code Patterns

### Database Operations
- Always use Drizzle ORM queries, never raw SQL
- Use type-safe schema imports: `import { todos } from '@/src/lib/db/schema'`
- Leverage TypeScript types: `Todo` (select) and `NewTodo` (insert)
- **Authentication Required**: Always filter by `userId` from Clerk auth

### API Route Structure
- Use proper TypeScript types for Next.js handlers
- **Authentication**: Use `const { userId } = await auth()` from Clerk at route start
- **Authorization**: Return 401 if no userId, filter all DB operations by userId
- Handle async params with `await params` (Next.js 15 requirement)
- Always validate input data and provide meaningful error messages
- Use `.returning()` for insert/update operations to get the modified record
- Use `and(eq(todos.id, id), eq(todos.userId, userId))` for user-scoped operations

### Component Development
- Use shadcn/ui components for consistency
- Follow the established blue/orange color scheme
- **Authentication**: Use Clerk hooks (`useUser`, `useClerk`) for auth state
- **Layout**: Wrap authenticated pages with `AuthenticatedLayout`
- **Navigation**: Use `AppSidebar` for consistent navigation
- Implement proper loading states and error handling
- Use Lucide React icons throughout the application

## Database Schema

The `todos` table contains:
- `id` (serial, primary key)
- `title` (text, required)
- `description` (text, optional)
- `completed` (boolean, default false)
- `priority` (enum: 'low', 'medium', 'high', default 'medium')
- `userId` (text, required) - Clerk user ID for user association
- `createdAt` (timestamp, auto-generated)
- `updatedAt` (timestamp, auto-generated)

## Development Notes

- Package manager: pnpm (not npm/yarn)
- TypeScript strict mode enabled
- **Authentication**: Clerk integration with middleware protection
- **Database**: Multi-user support via userId association
- No test framework currently configured
- Production deployment optimized for Vercel + Neon.com
- Auto-migration in production via `scripts/postinstall.js`

## Getting Started

1. Set up Clerk account and get API keys
2. Configure environment variables in `.env` (copy from `.env.example`)
3. Run `pnpm db:generate && pnpm db:migrate` for database setup
4. Start development with `pnpm dev`
5. Access sign-in at `/sign-in` or main app at `/` (redirects if not authenticated)
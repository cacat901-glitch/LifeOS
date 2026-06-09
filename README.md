# LifeOS

> **One app to run your entire life.**

LifeOS is a production-grade, all-in-one personal operating system — combining journaling, habits, goals, workout tracking, mood tracking, and AI insights into a single premium platform.

![LifeOS](https://img.shields.io/badge/version-1.0.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![Prisma](https://img.shields.io/badge/Prisma-5.22-green)

## Features

- **Smart Journal** — Rich text editor with mood tracking, tags, AI insights, and reflections
- **Habit Tracker** — Streaks, heatmaps, analytics, custom frequencies
- **Task Management** — Priorities, deadlines, categories, focus mode
- **Goals & Milestones** — Long-term, quarterly, monthly goals with progress tracking
- **Gym Tracker** — Sets, reps, weight, RPE, personal records, volume tracking
- **Mood Tracking** — Daily mood scores, emotion selection, factor analysis
- **Life Timeline** — Chronological history of achievements and milestones
- **Life Score** — Daily performance score across all life areas
- **Statistics Hub** — Comprehensive analytics and trend charts
- **Gamification** — XP, levels, achievements (subtle & professional)
- **AI Daily Briefing** — Personalized insights and pattern recognition
- **Dark/Light Mode** — Apple-inspired premium design

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Radix UI |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 (Credentials + Google OAuth) |
| **Payments** | Stripe (Subscriptions) |
| **State** | Zustand |
| **Editor** | Tiptap |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Deployment** | Vercel / Railway |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)
- Google OAuth credentials (for social login)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/lifeos.git
cd lifeos

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your .env with actual values

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database (exercises, achievements)
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required environment variables.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes (with sidebar)
│   │   ├── dashboard/     # Main dashboard
│   │   ├── journal/       # Journal system
│   │   ├── habits/        # Habit tracker
│   │   ├── tasks/         # Task management
│   │   ├── goals/         # Goals & milestones
│   │   ├── workout/       # Gym tracker
│   │   ├── mood/          # Mood tracking
│   │   ├── timeline/      # Life timeline
│   │   ├── statistics/    # Analytics hub
│   │   └── settings/      # User settings
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # App layout (sidebar, header)
│   ├── landing/           # Landing page components
│   └── providers/         # Context providers
├── lib/                   # Utilities & config
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   ├── stripe.ts          # Stripe configuration
│   ├── constants.ts       # App constants
│   ├── gamification.ts    # XP & achievements engine
│   ├── life-score.ts      # Life Score calculator
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## Database Schema

Complete relational schema with 25+ tables:
- Users, Accounts, Sessions
- Journal Entries (with types, moods, tags)
- Habits, Habit Categories, Habit Logs
- Tasks, Task Categories
- Goals, Goal Categories, Goal Milestones
- Exercises, Workout Programs, Templates, Sessions, Sets
- Mood Logs
- Life Scores
- Achievements, User Achievements
- Timeline Events
- Notifications
- Statistics
- AI Reports
- Subscriptions
- User Settings

## Pricing

| Feature | Free | Pro ($9.99/mo) |
|---------|------|----------------|
| Habits | 3 | Unlimited |
| Journal Entries | 30/mo | Unlimited |
| Analytics | Basic | Advanced |
| Life Timeline | ❌ | ✅ |
| AI Insights | ❌ | ✅ |
| Workout Programs | ❌ | ✅ |
| Data Export | ❌ | ✅ |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Railway (Database)

1. Create PostgreSQL instance on Railway
2. Copy connection string to `DATABASE_URL`

## Architecture Decisions

- **Next.js App Router** — Server components for performance, client components for interactivity
- **Prisma** — Type-safe database access with migrations
- **Zustand** — Lightweight client state management
- **NextAuth v5** — JWT sessions for serverless compatibility
- **Stripe** — Industry-standard subscription billing
- **Tailwind CSS** — Utility-first styling with design tokens

## License

MIT

---

Built with ❤️ by the LifeOS team

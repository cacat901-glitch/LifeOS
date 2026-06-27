# Novus — Complete Application Overview

> **Purpose of this document:** an exhaustive, descriptive map of the entire Novus application — its product vision, architecture, data model, every page, every API endpoint, the AI system, design system, and known gaps. It is written so an external reviewer (e.g. ChatGPT) can assess whether the product is "done" or recommend additional features.

---

## 1. Product Vision

**Novus** — tagline: **"Your personal operating system."**

Novus is an AI-native "second brain" / life-management platform. It is **not** a single-purpose habit tracker or to-do app; it is one unified place to run every dimension of a person's life — habits, tasks, goals, journaling, mood, workouts, finance, and projects — tied together by an AI companion ("Novus") that understands the *whole* picture and can both advise and **take real actions** on the user's behalf.

Core differentiators:
- **AI at the center, not bolted on.** Novus reads a user's real data and produces daily briefings, weekly reviews, deep life analysis, pattern detection, goal coaching, and journal insights. The AI can also *execute* actions (create a habit, set a goal, log a mood, reset data) — with confirmation gates on destructive operations.
- **Unified life data.** Every module shares one data model and one "Life Score," so insights are cross-domain (e.g. how workouts correlate with mood).
- **Craft-level design.** A bespoke editorial design system (near-black canvas, single lime accent, display + mono typography, hairline surfaces, purposeful motion).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14.2.20** (App Router) — *not* Next 15 |
| Language | TypeScript (tsconfig target **ES2017**) |
| Styling | Tailwind CSS + custom design tokens (CSS variables) |
| Animation | Framer Motion |
| UI primitives | Radix UI, class-variance-authority, lucide-react icons |
| Fonts | Inter (body), Bricolage Grotesque (display), JetBrains Mono (system) via `next/font` |
| ORM / DB | Prisma 5.22 + PostgreSQL (Neon serverless, EU/London region) |
| Auth | NextAuth v5 (beta) — Credentials + Google OAuth, JWT strategy |
| AI | Provider abstraction: **Groq** (primary, Llama 3.3) / Google Gemini (fallback) / deterministic fallback |
| Email | Resend (transactional) |
| Payments | Stripe (subscriptions) — *migration to Gumroad is on the backlog* |
| Rich text | TipTap (journal editor dependencies present) |
| Hosting | Vercel (auto-deploys from `main`) |

**Key environment variables:** `DATABASE_URL`, `NEXTAUTH_SECRET` (or `AUTH_SECRET`), `NEXTAUTH_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY` (optional), `GOOGLE_CLIENT_ID/SECRET`, `STRIPE_*`, `RESEND_API_KEY`, `EMAIL_FROM` (optional), `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`, `NOVUS_AI_PROVIDER` (optional override).

---

## 3. Directory Structure

```
src/
├── app/
│   ├── (app)/                  # Authenticated app (shared layout: sidebar/header/bottom-nav/command/novus)
│   │   ├── dashboard/          # AI-first home
│   │   ├── journal/            # Journaling + AI insights
│   │   ├── habits/             # Habit tracking
│   │   ├── tasks/              # Task management
│   │   ├── goals/              # Goals + milestones + AI coach
│   │   ├── projects/           # Kanban projects + notes
│   │   ├── finance/            # Accounts, transactions, budgets
│   │   ├── workout/            # Workout sessions + exercise library
│   │   ├── mood/               # Mood logging + trends
│   │   ├── timeline/           # "Your Life" visual life map
│   │   ├── statistics/         # Cross-module analytics
│   │   ├── review/             # AI Weekly Review
│   │   ├── analyst/            # AI "Life Analyst" (flagship)
│   │   └── settings/           # Profile, appearance, notifications, AI, subscription, data, account
│   ├── api/                    # Route handlers (see §6)
│   ├── auth/                   # login / register / forgot-password / reset-password / error
│   ├── layout.tsx              # Root layout (fonts, providers, metadata)
│   └── page.tsx                # Landing entry
├── components/
│   ├── landing/                # Marketing landing page
│   ├── layout/                 # sidebar, header, bottom-nav
│   ├── command/                # ⌘K command palette
│   ├── novus/                  # Novus AI panel + floating button (⌘J)
│   ├── auth/                   # Shared editorial auth shell
│   ├── providers/              # session + theme providers
│   ├── shared/                 # NovusMark/logo, AI status badge, Pro gate
│   └── ui/                     # Button, Card, Input, Badge, Dialog, Progress, Avatar, Toaster
├── hooks/use-store.ts          # Zustand global store (command/novus/notifications/UI state)
├── lib/
│   ├── ai/                     # AI provider abstraction + features (see §5)
│   ├── auth.ts                 # NextAuth config
│   ├── prisma.ts               # Prisma client singleton
│   ├── stripe.ts               # Lazy Stripe client
│   ├── email.ts                # Resend transactional email (lazy)
│   ├── gamification.ts         # XP/levels/achievements
│   ├── life-score.ts           # Weighted Life Score calculation
│   ├── constants.ts            # Nav items, enums, option lists
│   └── utils.ts                # cn(), date formatting helpers
├── middleware.ts               # Route protection (auth gating)
├── styles/globals.css          # Design tokens + utilities
└── types/index.ts              # Shared TS types
prisma/
├── schema.prisma               # Full data model
└── seed.ts                     # Seed (incl. 28 exercises)
```

---

## 4. Data Model (Prisma)

All user-owned records are scoped by `userId` and cascade-delete with the user. Models:

**Auth & user**
- `User` — name, email, password (hashed), image, bio, location, timezone; gamification fields `xp`, `level`, `title`; relations to everything.
- `Account`, `Session`, `VerificationToken` — NextAuth/OAuth.
- `UserSettings` — theme + notification preferences (`emailNotifications`, `habitReminders`, `goalReminders`, `taskReminders`, `workoutReminders`, `weeklyDigest`).
- `Subscription` — `plan` (FREE/PRO/ENTERPRISE), `status`, Stripe fields (`stripeCustomerId`, `stripeSubscriptionId`, etc.).

**Journaling**
- `JournalEntry` — title, content, mood, moodEmoji, tags[], type, wordCount, date.

**Habits**
- `HabitCategory`, `Habit` (name, description, icon, color, frequency, currentStreak, longestStreak, totalCompletions, isArchived), `HabitLog` (date, completed) — unique per habit/day.

**Tasks**
- `TaskCategory`, `Task` (title, description, status TODO/IN_PROGRESS/IN_REVIEW/DONE/CANCELLED, priority, dueDate, completedAt, self-referencing subtasks via `parentId`, isDeleted).

**Goals**
- `GoalCategory`, `Goal` (title, description, type, targetDate, progress, status), `GoalMilestone` (title, order, isCompleted).

**Workouts**
- `Exercise` (28 seeded + user custom), `WorkoutProgram`, `WorkoutTemplate`, `TemplateExercise`, `WorkoutSession` (startTime/endTime), `WorkoutSet` (reps, weight, RPE).

**Mood**
- `MoodLog` — score (1–10), emoji, label, emotions[], factors[], notes, date (unique per user/day).

**Projects**
- `Project` (name, icon, color, status), `ProjectTask` (status TODO/IN_PROGRESS/IN_REVIEW/DONE), `ProjectNote`.

**Finance**
- `FinanceAccount` (name, type, balance), `FinanceTransaction` (title, type income/expense/transfer, amount, category, date, notes), `FinanceBudget`.

**Intelligence & system**
- `LifeScore`, `Statistics`, `TimelineEvent`, `Notification`, `Achievement`, `UserAchievement`.
- `AIReport` — cached AI outputs, `AIReportType` enum: DAILY_BRIEFING, WEEKLY_REVIEW, MONTHLY_INSIGHTS, HABIT_ANALYSIS, MOOD_ANALYSIS, GOAL_PROGRESS, LIFE_ANALYSIS, PATTERN_REPORT, GOAL_COACH, JOURNAL_ANALYSIS, PREDICTIVE_INSIGHT, LIFE_MEMORY.

---

## 5. AI System (`src/lib/ai/`)

The app **never imports a vendor SDK directly**; everything goes through a provider abstraction.

- **`types.ts`** — `AIProvider` interface (`isConfigured()`, `complete(messages, opts)`, `generateBriefing(ctx)`), `NovusContext`, `AIMessage`, `AICompletionOptions` (incl. `jsonMode`).
- **`index.ts`** — `getAIProvider()` factory. Auto-detects: `GROQ_API_KEY` → Groq, else `GEMINI_API_KEY` → Gemini, else deterministic `FallbackProvider`. Honors `NOVUS_AI_PROVIDER` override.
- **`groq.ts`** — pure `fetch` to Groq's OpenAI-compatible endpoint; models `llama-3.3-70b-versatile` → `llama-3.1-8b-instant` fallback; supports JSON mode.
- **`gemini.ts`** — Gemini provider with model fallback list; supports JSON mime type.
- **`prompts.ts`** — Novus persona, briefing prompt, deterministic fallbacks (briefing + context-aware chat reply), life-memory prompt.
- **`context.ts`** — `buildNovusContext(userId)`: lightweight daily snapshot (habits/tasks/goals/mood).
- **`deep-context.ts`** — `buildDeepContext(userId)`: rich multi-dimensional history (30-day habit rates, tasks, goals, mood trends, workouts, journal, finance, pattern correlations).
- **`generators.ts`** — prompt-builder + parser pairs for Weekly Review, Monthly Insights, Life Analysis, Pattern Detection, Goal Coach, Journal Analysis, Predictive Insights (deterministic), Life Memory, and NL action parsing.
- **`actions.ts`** — the **action execution engine** (see below).

### AI Features (surfaced in UI)
- **Daily Briefing** (dashboard) — `GET /api/ai/briefing`.
- **Ask Novus chat with real actions** — `POST /api/ai/chat` (see Novus panel, §7).
- **Weekly Review** — narrative + Biggest Win/Weakness/Lesson/Focus + stats; cached weekly.
- **Life Analyst (flagship)** — Life Analysis (health score, what's working/not, hidden patterns, opportunities, priorities), Pattern detection, Life Memory ("ask anything about your journey").
- **Goal Coach** — full coaching plan for a goal.
- **Journal Insights** — themes/trends/growth.
- **Predictive Insights** — dismissable banners on the dashboard (deterministic).
- **AI Status** — live provider detection + test (settings + dashboard badge).

### Action Execution (`actions.ts`)
The chat decides intent and returns structured JSON (`{ reply, actions[] }`). Supported actions:
`create_habit`, `create_task`, `create_goal` (with milestones), `create_journal_entry`, `log_mood`, `complete_habit`, `complete_task`, plus **destructive** `reset_data` (wipes all content, keeps account) and `delete_account`.
- Safe actions execute immediately and report truthful results.
- Destructive actions require an explicit **confirmation round-trip** before anything is deleted.
- Graceful degradation: with no AI key, chat still replies conversationally but cannot emit actions.
- A `GET /api/ai/chat` diagnostic returns build marker + live provider.

**Why Groq is primary:** Google Gemini's free tier is region-blocked (429/limit 0) in EU/UK without billing; Groq is free, fast, and unrestricted.

---

## 6. API Endpoints (`src/app/api/`)

**AI:** `ai/briefing` (GET), `ai/chat` (GET diagnostic + POST chat/actions/confirm), `ai/weekly-review`, `ai/monthly-insights`*, `ai/analyze`, `ai/patterns`, `ai/insights`, `ai/goal-coach`, `ai/memory`, `ai/action`*, `ai/status`.
*(`monthly-insights` and `action` exist server-side but are not currently surfaced in the UI.)*

**Data CRUD:** `dashboard` (aggregated home data), `habits` (+ toggle/streak recalc + FREE 3-habit cap), `tasks`, `goals`, `journal` (+ `journal/[id]`), `mood`, `workout`, `exercises`, `projects`, `finance`, `notifications`, `user` (GET/PATCH profile+settings+password / DELETE account), `export` (json/markdown/csv).

**Auth/billing:** `auth/[...nextauth]`, `auth/register`, `auth/forgot-password`, `auth/reset-password`, `stripe`, `stripe/webhook`.

All mutating routes authenticate via NextAuth `auth()` and scope queries to the session user.

---

## 7. Pages & Features

### Authenticated shell (wraps all `(app)` pages)
- **Sidebar** (desktop) — wordmark, a prominent **Ask Novus** block, a **Search** (⌘K) trigger, grouped nav (Workspace + Intelligence), and a user/level/XP block.
- **Header** — page title + date, an **Ask Novus** button (⌘J), and a notifications panel (polls `/api/notifications`, mark-read/clear, deep-links).
- **Bottom nav** (mobile) — Home, Habits, center **Novus "N"** button, Goals, and a "More" slide-up sheet with the rest.
- **⌘K Command Center** — Raycast-style palette: Create / Intelligence / Navigate groups + an "Ask Novus" row that opens the Novus panel. Animated, bottom-sheet on mobile.
- **Novus AI Panel (⌘J)** — dedicated slide-in chat drawer (right on desktop, full-screen on mobile): suggestions, full conversation, real action execution + destructive-action confirmation card. Plus a persistent floating **Ask Novus** button on every page.

### Dashboard (`/dashboard`)
AI-first home: predictive insight banners (dismissable), **Novus Briefing** centerpiece, vital stat cards (Life Score, habits today, tasks left, mood), animated **Life Score ring** with category breakdown, today's habits (toggle), focus tasks (toggle), goal trajectory bars, momentum/streaks, and AI shortcuts.

### Journal (`/journal`)
Create/read/delete entries with mood + tags + type; debounced search; **AI Insights** panel (themes/trends/growth).

### Habits (`/habits`)
Create (icon/color/frequency), toggle completion, delete; date-based streak recalculation; today's progress; stats; FREE-plan 3-habit limit enforced server-side + UI banner.

### Tasks (`/tasks`)
Quick-add (Enter), full create dialog (priority + due date), complete/delete, filters; stats (active/completed/rate).

### Goals (`/goals`)
Create with milestone builder; detail dialog; progress update; milestone toggle; **AI Goal Coach** → full coaching plan.

### Projects (`/projects`)
Kanban board + list view; project tasks (4 statuses); notes; project status; stats.

### Finance (`/finance`)
Multiple accounts; income/expense/transfer transactions (atomic balance adjustment); budgets; 6-month chart; top categories; net worth.

### Workout (`/workout`)
Start session; 28-exercise seeded library (+ custom); log sets (reps/weight/RPE); finish session; stats (sessions/this week/volume).

### Mood (`/mood`)
Emoji + emotions + factors + notes; 7-day chart; 30-day history; stats.

### Timeline (`/timeline`)
"Your Life" visual map: month-grouped event nodes on a life-line, built from journal/mood/workout/goal events.

### Statistics (`/statistics`)
Cross-module analytics with mini bar charts (habits/tasks/goals/mood/workout/journal) + a finance section + Life Score hero.

### Weekly Review (`/review`)
AI narrative + Win/Weakness/Lesson/Focus + weekly stats + history; cached in `AIReport`.

### Life Analyst (`/analyst`) — flagship
Three tabs: **Life Analysis** (health score + working/not-working/hidden patterns/opportunities/priorities), **Patterns** (behavioral correlations), **Life Memory** (free-form questions about one's journey).

### Settings (`/settings`)
Tabs: **Profile** (name/bio/location/timezone), **Appearance** (theme), **Notifications** (6 toggles), **Novus AI** (live provider status + setup guide), **Subscription** (plan + Stripe upgrade), **Data & Export** (JSON / Markdown / 3× CSV), **Account** (password change, sign out, delete account).

### Auth (`/auth/*`)
Editorial split-screen shell: login, register, forgot-password, reset-password, error. Credentials + Google sign-in.

### Landing (`/`)
Bespoke marketing page: kinetic hero, bento product showcase (with animated count-ups, cursor-follow spotlight, Life Score ring), editorial feature index, AI/terminal section, how-it-works, pricing (Free vs Pro), FAQ, CTA, footer. Scroll-progress bar, film grain, reduced-motion support.

---

## 8. Gamification & Life Score
- **XP / levels / titles** in `lib/gamification.ts` (`calculateLevel`, XP rewards, default achievements). XP is granted for actions (e.g. journaling, logging mood).
- **Life Score** (`lib/life-score.ts`) — weighted blend of habits/tasks/goals/mood/workout, shown as a radial ring (dashboard) and hero (statistics).

---

## 9. Subscriptions / Plans
- **Free vs Pro** (and an Enterprise tier in the enum). Free is capped at **3 habits** (enforced server-side + UI banner). `ProGate` component wraps Pro-only features.
- Currently **Stripe** checkout + webhook. **Backlog:** migrate to Gumroad (membership product + unsigned ping webhook toggling PRO/FREE).

---

## 10. Design System
- **Tokens** in `globals.css`: neutral near-black canvas, single **lime** accent (`--primary` / `--signal`), hairline borders, refined radii.
- **Typography**: Bricolage Grotesque (display), Inter (body), JetBrains Mono (labels/system).
- **Surfaces**: flat hairline cards (the old glassmorphism utilities were refined to flat). No rainbow gradients, no aurora, real lucide icons (no emoji-as-UI).
- **Motion**: purposeful Framer Motion (entrances, layout transitions, scroll/hover effects on landing), with `prefers-reduced-motion` respect.
- Light + dark themes (dark is the default editorial look).

---

## 11. Security & Data Ownership
- All routes auth-gated; queries scoped to the session user.
- Passwords hashed with bcrypt; sessions signed (JWT).
- Destructive AI actions require explicit confirmation; data reset preserves the account.
- Full data export (JSON/Markdown/CSV) — "your data belongs to you."

---

## 12. Known Gaps / Opportunities (candidates for "what to add next")
These are **not bugs** — they are areas a reviewer might consider for completeness:

1. **Monthly Insights** — backend + generator exist (`/api/ai/monthly-insights`) but there is no UI surface. Could add a monthly view.
2. **NL Action route** (`/api/ai/action`) is superseded by the chat engine and currently unused — could be removed or repurposed.
3. **Payments** — Stripe is wired but a Gumroad migration is planned; no in-app subscription management UI beyond upgrade.
4. **Reminders/notifications** — preference toggles exist and notifications render, but there is no scheduled/push delivery mechanism (e.g. cron, web push, email reminders) described.
5. **Email domain** — transactional email defaults to Resend's shared domain; a verified custom domain is not yet configured.
6. **Native mobile app** — responsive web only; no native app.
7. **Collaboration/sharing** — single-user only; no sharing, teams, or social features.
8. **Calendar / scheduling** — no calendar view or time-blocking.
9. **Integrations** — no third-party imports (Apple Health, Google Fit, bank sync, calendar).
10. **Offline / PWA** — not described as an installable PWA with offline support.
11. **Testing** — no automated test suite is present.
12. **Onboarding** — no guided first-run onboarding flow described.
13. **Tags/search across modules** — global search is command-based; no full-text search across journal/tasks/etc.
14. **AI memory persistence** — AI uses live context per request; no long-term user-specific fine-tuning/memory store beyond cached reports.

---

## 13. Summary
Novus is a feature-complete, single-user AI life-management platform with: 13 functional product modules, a unified data model (35+ Prisma models), a provider-agnostic AI layer that both advises and executes real actions, full auth, subscriptions, data export, gamification, and a bespoke editorial design system across landing, auth, and the entire app. All UI controls are wired to real, implemented endpoints. The most natural directions for further work are scheduled reminders/notifications delivery, monthly insights UI, integrations/imports, collaboration, a calendar layer, onboarding, and a test suite.

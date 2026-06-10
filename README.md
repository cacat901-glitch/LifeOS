# Novus

> **Your personal operating system.**

Novus is an intelligent companion for your entire life — a single, calm command center for your habits, goals, journal, finances, workouts, projects and mood, guided by an AI that understands the bigger picture.

Novus is not a habit tracker. Not a task manager. Not a fitness app. It's a personal operating system: a second brain and digital companion that helps you run every aspect of your life from one place.

![Novus](https://img.shields.io/badge/version-1.0.0-6366f1) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![Prisma](https://img.shields.io/badge/Prisma-5.22-green)

## Experience

- **Novus AI** — A daily AI briefing and companion that feels like a personal life coach, powered by Google Gemini
- **Command Center** — A Raycast-style command palette (⌘K) to do anything instantly
- **Immersive Home** — An AI-driven narrative, not a generic dashboard
- **Life Timeline** — A visual map of your life's milestones and momentum
- Habits, Goals, Tasks, Projects, Finance, Workouts, Journal, Mood, Statistics

## Tech

- Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion
- Prisma + PostgreSQL
- NextAuth (Credentials + Google)
- Google Gemini via a provider abstraction layer (`AIProvider` → `GeminiProvider`)
- Stripe · Resend

## AI Provider Architecture

Novus never depends on a specific AI vendor directly. All AI flows through an abstraction:

```
AIProvider (interface)
 └── GeminiProvider   ← active
 └── OpenAIProvider   ← future
 └── ClaudeProvider   ← future
 └── LocalProvider    ← future
```

Swap providers by changing one factory — the rest of the app is untouched.

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your values (incl. GEMINI_API_KEY)
npx prisma generate
npx prisma db push
npm run dev
```

## Environment Variables

See `.env.example`. The key additions for Novus AI:

- `GEMINI_API_KEY` — from https://aistudio.google.com/app/apikey

---

Novus · Your personal operating system.

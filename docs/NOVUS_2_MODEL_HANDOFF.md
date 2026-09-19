# Novus 2.0 — Model Handoff

## Project

Novus is a personal operating system combining tasks, habits, goals, reflection, projects, finance, training and related life data with an AI companion that can advise and perform real actions. Repository: `cacat901-glitch/LifeOS`. Local workspace for this freeze: `G:\Novus`. Use the existing `main` branch; the user explicitly wants direct commits and pushes, no new branches or manual Git handoff.

Production is Vercel **life-os-bs7c**, https://getlife-os.vercel.app. Do not operate on the separate `life-os` project. A connector being installed does not prove every permission or credential path works; verify the specific operation when needed. Never expose environment secrets in orientation output.

## Current Stage

Stage 1N is a documentation-only visual-system freeze and model switch. The difficult canonical visual work is considered complete, not the entire product. No application styling, renderer, backend or secondary Space implementation changes belong in this stage.

Application baseline: `0b3347741dc98770ccc96777b50fc80882600bff`, Stage 1M, canonical Novus intelligence surface. Earlier locks: `0b6ab547381890368f74b846e3f0b7ae6445d86d` for Stage 1L mobile Now; `4dba5dac17b20efb567bdd5756e36f2e3da26fdf` for Stage 1K desktop optical instruments. The documentation commit follows these and does not alter their output.

At the freeze check on 19 September 2026, production deployment `dpl_G65nDiwDzgVJ8mQVp3p921CqDRLz` was READY at the Stage 1M SHA. Treat this as a snapshot; inspect the remote/deployment again before future publishing. The target project ID is `prj_5mlBNxNIk34EsIvgddtWf7XWA6RU`.

## Canonical Visual Surfaces

**Desktop Now:** a centered 1120px console below top navigation, 265px hero with greeting and Life Score dial, five differentiated metric instruments, and three lower modules: Today, Up Next, Recent Activity. One continuous liquid field connects hero, instruments, local lower graphics and under-console flow. It is not a generic grid surrounding a blue image.

**Mobile Now:** a separate composition below 1024px: greeting, primary score surface, Ask Novus, Attention, two at-a-glance instruments, Today and Goals entry. The five-item bottom navigation is Now, Tasks, Novus Ask, Habits, Spaces. The renderer uses a lighter crest/cradle composition. Do not squeeze the desktop columns onto a phone.

**Desktop Novus AI:** a modal right intelligence layer, up to 600px wide, over a dimmed/diffused Space. Novus header and route label, editorial welcome, optical prompt rows, one content scroller and separate multiline composer. Conversation is structured prose, not speech bubbles. Liquid recedes when reading and responds to actual request/action states.

**Mobile Novus AI:** full width below 768px, safe-area-aware header and composer, 42px welcome heading, 64px prompt rows, and 16px textarea. It follows VisualViewport changes. Opening on touch does not automatically open the keyboard. The underlying bottom navigation is not duplicated inside the modal.

Current source-of-truth order is **implementation → current canonical screenshots → written visual specification → original TARGET mockups**. The old mockup is historical; it no longer overrides the finished liquid identity. Do not reopen pixel-reconstruction arguments from earlier prompts.

Local screenshot references:

- `artifacts/visual-qa/stage1m-final-now-desktop.png`
- `artifacts/visual-qa/stage1m-final-now-390.png`
- `artifacts/visual-qa/stage1m-final-desktop-idle.png`
- `artifacts/visual-qa/stage1m-final-mobile-390.png`

These exist locally but are ignored/untracked, so a fresh clone will not necessarily contain them. Ask for the existing artifacts or capture the real application if they are unavailable; do not substitute an old comparison as current canon. `.golden-reference-desktop-final-comparison.png` is also local/untracked: its left half contains historical TARGET, right half an older implementation.

## Locked Decisions

- Preserve all four canonical compositions and their responsive behavior.
- Preserve black/white/ice, silver-white liquid, pale-blue support and obsidian negative space.
- Preserve optical smoked glass, differentiated instruments and restrained editorial typography.
- Preserve calm continuous material motion; no new torus, blob, smoke or orbit identity.
- Preserve desktop top navigation, mobile bottom navigation, Spaces sheet and Command. No permanent sidebar.
- Preserve truthful data and meaningful empty states; no fake history, timestamps, scores or insights.
- Preserve editorial AI output, explicit confirmations and actual success/failure reporting.
- Preserve readability, reduced-motion fallback, safe areas, focus visibility and touch behavior.

The latest user instruction for a future stage can authorize specific changes, but do not infer permission to redesign these foundations from an ordinary secondary-Space propagation request.

## Most Important Files

| Path | Purpose |
| --- | --- |
| `src/app/(app)/dashboard/page.tsx` | Both locked Now compositions, data selection and page-local helpers |
| `src/components/novus/now-liquid-field.tsx` | Canonical direct-WebGL shader, animation ownership, quality and fallback |
| `src/components/visual-system/optical-surface.tsx` | Reusable `OpticalSurface` and `OpticalLight` presets |
| `src/components/visual-system/metric-instrument.tsx` | `MetricInstrument`; canonical material requires `optical` |
| `src/components/visual-system/instruments.tsx` | `RadialInstrument` and earlier `SignalTrace` |
| `src/components/novus/novus-panel.tsx` | Modal, composer, state machine, chat/action request handling |
| `src/components/novus/intelligence-primitives.tsx` | Liquid wrapper, prompt rows, Markdown prose, confirmation and result surfaces |
| `src/styles/globals.css` | Actual ordered visual cascade; desktop, optical, Stage 1L and Stage 1M rules |
| `src/app/(app)/layout.tsx` | Shell and mounting of navigation, Command and Novus |
| `src/components/layout/operating-dock.tsx` | Current desktop/mobile navigation and Spaces sheet |
| `src/components/layout/header.tsx` | `AppHeader`, notifications and entry controls |
| `src/components/command/command-center.tsx` | Existing Command interface |
| `src/hooks/use-store.ts` | Zustand open/draft state; `openNovusWithPrompt` |
| `src/components/layout/system-atmosphere.tsx` | Secondary-Space atmosphere routing; returns null on Now |
| `src/components/visual-system/ambient-field.tsx` | Earlier Canvas2D environment still used outside Now |
| `src/app/layout.tsx`, `tailwind.config.ts` | Fonts/providers and utility token mappings |

Dashboard `InstrumentSection`, `FocusList`, `ActivityList` and starter/empty helpers are local, not exported primitives. Mobile Now and the AI composer are not standalone component files. Do not invent a clean abstraction layer that does not yet exist.

## Visual System

### Liquid

`NowLiquidField` uses raw WebGL 1 and a fragment shader on a full-screen quad, not Three/R3F. Four existing maps in `public/media` supply density: `novus-hero-liquid.png`, `novus-bottom-flow.png`, `novus-activity-stream.png`, `novus-today-signal.png`. Actual real-time advection, normal differences, caustic/reflection terms and procedural strands create evolving material. It is neither pure asset-free simulation nor a simply moved raster image.

Desktop has authored hero/fork, connecting channel, local Today/Activity and bottom paths. Mobile/intelligence loads only hero/bottom maps and omits desktop silk complexity. Default desktop DPR cap is 1.35; mobile/intelligence uses 1.15. Hidden/out-of-view canonical fields stop their RAF; resources/listeners clean up. Reduced motion, unsupported rendering and context/image failure use static supplied material. Edge fades, masks and a single transparent field avoid visible rectangular seams.

Opening Novus suspends the Now renderer and pauses secondary atmosphere, prioritizing intelligence motion. This is one active canonical loop, not a guarantee that the browser has destroyed every previously allocated context. Intelligence activity is 1 normally, 1.3 focused, 2.1 thinking/executing, smoothed into the material clock. No new per-card rendering contexts should be added casually.

### Glass and typography

`OpticalSurface` provides `upper`, `stream`, `cadence`, `quiet`, `signal` lighting. It combines translucent black gradients, local silver-blue pickup, thin asymmetric edge reflections and shallow backdrop diffusion, generally .8–1.8px, with 12px corners. It has no pointer loop. AI prompts and composer use scoped, deeper treatments. A uniform bright border on an opaque card is not equivalent.

Fonts are Inter, Bricolage Grotesque and JetBrains Mono. Desktop Now greeting actually uses Inter at 49px; mobile Now uses Bricolage 30–38px. Desktop metric values are 36px/weight 350; technical labels are subordinate mono. AI display is Bricolage, prose 14px/1.8, prompts 13px, mobile textarea 16px. Global primary remains cyan-leaning, but canonical surfaces deliberately use silver literals. Do not recolor everything using the primary utility.

### Instrumentation, motion and responsive behavior

Five metric kinds are score, tasks, habits, progress, momentum. Their graphics convey current progress or explicitly decorative dormant structure, not invented history. Habits’ fifteen optical cells are completion today, not a weekly matrix. Momentum is a label derived from current Life Score with “No trend history yet.” `RadialInstrument` animates the arc over .9s; it does not interpolate its displayed number.

Motion hierarchy is primary liquid, secondary bottom flow, tertiary signals, quick local interactions. AI body material fades during reading. Optical row responses are 180ms; AI opens over .32s, underlay .28s; shader motion stays slow. Not every animation shares a central scheduler.

Now/navigation switches at 1024px, AI at 768px. Tablets between them intentionally combine mobile Now/bottom navigation with a desktop-style intelligence width. Safe-area and short-height rules are real code paths, not optional polish. Both Now DOM compositions mount; renderer guards prevent both loops running. Glass/metric styles remain partly scoped to `.now-canonical`, so importing a component elsewhere is not proof the full appearance transfers.

### AI behavior to preserve

The API is non-streaming JSON. `NovusPanel` posts `{messages}` to `/api/ai/chat`, waits, then renders a response with react-markdown/remark-gfm. No fake streaming was added. Raw HTML is skipped, remote images become alt text, links are protected, and code/tables scroll. The route label describes invocation location; it is not a new backend context contract.

Confirmation posts `{confirmActions}` only after explicit confirmation. Cancellation sends no mutation. Actual returned result flags drive success/failure rows. Ambiguous request failures warn users to check current data; uncertain confirmation results are not blindly replayed. Radix Dialog contains/restores focus. Fine-pointer Enter submits, Shift+Enter and touch Enter insert newlines. Preserve these behaviors while reusing intelligence visuals.

## Do Not Change

Do not polish locked Now/AI during propagation, alter shader color/motion to resemble old TARGET, remove density assets as “static leftovers”, or globally replace the CSS cascade. Do not revive `NovusCore`, `AppSidebar`, or the older `BottomNav`: source searches found definitions but no current TSX consumers. Current navigation is `OperatingDock`.

Do not assume all old CSS is dead. New AI retains `novus-panel-input` and `novus-canonical-panel` classes with inherited styles. Earlier material and Canvas2D atmosphere remain active on secondary Spaces. Do not delete experiment-named product modules merely because their names sound provisional.

No Stripe, onboarding, new trackers, calendar/integrations, AI architecture rewrite, database migration or optimization work is implied. Normal frontend verification should avoid `npm run build` without understanding it: that script includes `prisma db push`. Previous visual checks used `npx tsc --noEmit` and `npx next build`.

## Known Issues

Secondary Spaces are not fully propagated. Broad existing card tints and older environment primitives do not make them canonical. CSS is long and layered; exact computed output depends on specificity, order and responsive scope. Renderer coordinates are composition-specific; shared material is cleaner than shared layout.

`SignalTrace` produces a stylized non-flat dormant path for constant input; Statistics uses it. Audit this before adopting it as a precise analytical chart. Current Activity is a small selected record set, not a comprehensive chronological event store. Do not embellish either with fake history.

Stage 1M recorded passing TypeScript/Next build and browser suites for desktop/mobile Now and intelligence, including ten-second shader progression, reduced motion, long content, safe areas, confirmations/results, touch behavior and focus recovery. Relevant scripts are `scripts/now-visual-qa.cjs`, `scripts/mobile-now-qa.cjs`, `scripts/intelligence-qa.cjs`, and `scripts/intelligence-touch-qa.cjs`.

Action tests used intercepted fixtures, not production mutations. Live provider/action quality, physical iPhone/Safari and physical soft keyboard remain unverified. Keyboard-sized Chrome emulation is not physical-device proof. Dependency advisories remain outside this stage. No hardware profiling established specific lag causes; texture sampling, extended canvas/DPR and backdrop filters are future profiling targets. The older ambient RAF still schedules while hidden even though it skips drawing. Do not optimize these during a documentation freeze.

## Next Task

When authorized, propagate this locked system to secondary Spaces without redesigning it. Recommended sequence: Tasks, Habits, Goals, Journal, Projects, Finance, Workout, Mood, Statistics, Timeline, Life DNA / Weekly Review / Analyst, Settings.

Start with Tasks: inspect its real data and interaction contracts, retain readable execution rows, apply canonical optical material, add only truthful progress/priority instrumentation, verify empty/populated and desktop/mobile behavior, and protect all four canonical surfaces. Then apply purpose-specific variations: rhythm for Habits, direction for Goals, quiet editorial writing for Journal, precise charts for Finance, restrained intelligence for analysis, minimal motion for Settings. Do not make every Space identical to Now.

## Read Next If Needed

Read `docs/NOVUS_2_VISUAL_SYSTEM.md` for renderer details, actual token values, component map, screenshot references, limitations and propagation guidance. Read `design-qa.md` for the relevant Stage 1K–1M validation record. `APP_OVERVIEW.md` provides broad historical application context, but its old lime/brand design and completion/backlog assumptions are not current authority. `README.md` covers repository setup. The original external knowledge/development-history attachments are not tracked here; do not invent a repository path for them or regenerate their chronology.

For every future model switch: read this file first, inspect only task-relevant code, consult the detailed spec for visual questions, preserve locked surfaces, and return to full history only when a specific unresolved question requires it. Current implementation outranks old prompts. The handoff is meant to eliminate rediscovery, not begin another project archaeology pass.

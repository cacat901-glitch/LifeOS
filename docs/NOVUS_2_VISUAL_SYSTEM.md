# Novus 2.0 — Canonical Visual System

Stage 1N freeze, 19 September 2026. Documentation baseline: `0b3347741dc98770ccc96777b50fc80882600bff` on `main`. This document records the implemented system, including its imperfections. It does not authorize redesign, optimization, or new product work.

## Authority and locked decisions

Source-of-truth order:

1. Current canonical implementation.
2. Current canonical screenshots, for regression comparison.
3. This specification.
4. Original TARGET mockups, historical art direction only.

The original mockup must not override the finished liquid identity. Older CSS comments calling the mockup “the specification” predate this freeze. Desktop Now, mobile Now, desktop Novus AI, and mobile Novus AI are locked. Preserve their composition, color balance, material, navigation relationship, responsive philosophy, and motion hierarchy. Preserve silver-white liquid, black/white/ice identity, optical smoked glass, precision instrumentation, truthful data, desktop top navigation, and mobile bottom navigation. No permanent sidebar. No fake analytics. No generic chatbot bubbles. Secondary Spaces are not yet canonical merely because they inherit shared CSS.

## 1. Product visual identity

Novus is a personal operating system, not a collection of unrelated dashboards. Its canonical surfaces place legible information in an obsidian environment crossed by silver-white material. Pale blue supports depth and edge definition; it is not a dominant neon fill. Broad liquid folds coexist with fine strands and localized reflections. Black negative space is essential: filling every gap with glow destroys the hierarchy.

Smoked optical glass reveals the environment without turning text into a transparency demonstration. Precision comes from differentiated small instruments, thin calibration marks, quiet technical labels, narrow edges, and restrained numerical typography. Editorial greeting and intelligence headings provide human scale. The character is futuristic but calm, not a gaming HUD, random particle screensaver, ordinary opaque SaaS card grid, or generic chat interface.

This is an implemented visual family, not a fully normalized design-token package. Literal colors, scoped CSS overrides, shared primitives, and page-local composition all contribute. Inspect the cascade before treating any earlier rule as the final value.

## 2. Four canonical surfaces

### Desktop Now

Source: `src/app/(app)/dashboard/page.tsx`, `src/styles/globals.css` (`.now-canonical`, desktop Stage 1J overrides, optical rules).

At widths of at least 1024px, the content console is capped at 1120px and centered inside the wider authenticated shell. It sits below the existing top navigation, not beside a sidebar. Desktop canonical padding is 26px above and 130px below. The 265px hero contains date/live metadata, left greeting and summary, and a right Life Score dial. The greeting starts at left 50px/top 50px; the 174px dial sits right 38px/top 65px. Liquid flows across the hero and behind the following instruments rather than appearing in a separate image card.

The five instruments are Life score, Tasks, Habits, Progress, Momentum. Their columns are deliberately unequal: `1fr 1.07fr 1fr .95fr 1.34fr`, gap 24px, padding `0 34px 29px 42px`; each is 146px high. Their small graphics differ by meaning. The lower three modules use `.94fr 1.12fr 1.03fr`, gap 31px, padding `0 34px 26px 42px`, and minimum 320px module height. These are Today, Up Next, and Recent Activity, not more KPI cards.

One `NowLiquidField` owns the hero, connecting material, local Today/Activity regions, and under-console flow. Its canvas extends outside the console; the lower flow is part of the composition. Text and controls remain above it. The console and its optical surfaces are separate material levels. Preserve this hierarchy instead of making the entire page uniformly transparent.

### Mobile Now

Source: the same page, separate `.now-mobile` JSX; Stage 1L CSS under `max-width:1023px`.

This is a different composition, not a scaled desktop. A maximum 560px column contains date/live metadata, greeting and concise summary, one primary Life Score surface, an Ask Novus surface, Attention, two at-a-glance instruments, Today actions, and a Goals entry. Five desktop KPIs and three desktop columns are not squeezed onto a phone.

The presence region owns a mobile `NowLiquidField`, using the same optical material with a right-hand crest and lower cradle. The greeting remains quiet on the left. The score surface uses `upper` lighting; Ask uses `stream`; Attention uses quiet material. The score button is a full-width grid with a 100px dial, content, and arrow, minimum height 132px. Ask is at least 64px high. The lower metric pair is 126px high. Today rows are at least 55px and wrap long content.

The fixed five-slot navigation is Now, Tasks, Novus Ask, Habits, Spaces. `OperatingDock` adds the route-specific `bottom-nav--now` class. It uses a smoked bar, 12px diffusion, safe-area padding, and restrained active ice detail. The main content reserves `90px + --safe-bottom` so controls are not covered. At viewport heights at most 740px, greeting spacing and score height contract; content remains scrollable.

### Desktop Novus AI

Sources: `src/components/novus/novus-panel.tsx`, `src/components/novus/intelligence-primitives.tsx`, Stage 1M CSS.

Novus is a modal intelligence layer over the current Space. The underlay is `rgba(0,2,5,.55)`, blur 3px, saturation .75. The right surface is `min(600px, calc(100vw - 64px))`, full available viewport height, with a defined left ice edge and deep `rgba(3,5,8,.97)` material. This intentionally deeper layer is not as transparent as an instrument. It retains inherited canonical-panel backdrop diffusion; the later scoped selector controls geometry.

Header: Novus mark, name, truthful “From [Space]” context label, 44px close control. The welcome state uses “Intelligence, in context”, “Make sense / of now.”, explanatory copy, four numbered optical prompt rows, and a separate bottom composer. The content body is the sole main vertical scroller. In conversation, user requests and assistant prose are editorial sections with separators, not colored speech bubbles.

`IntelligenceLiquid` reuses the mobile composition of the canonical shader at every AI width. Its intensity follows actual state; during reading it recedes. The composer is a multiline textarea, not a fake command line. Confirmation and execution results are explicit structured surfaces inside the narrative flow.

### Mobile Novus AI

Below 768px the same intelligence surface becomes full width, not a floating narrow desktop drawer. Header minimum height is `64px + env(safe-area-inset-top)`. Body padding is `28px 22px 20px`; heading is 42px, line-height 1.07. Prompt rows have at least 64px height. The composer includes left/right safe-area protection and bottom padding `max(14px, var(--safe-bottom), env(safe-area-inset-bottom))`.

`VisualViewport` height and offset are applied through `--intelligence-height` and `--intelligence-top` when scale is 1. Textarea type is 16px on mobile, avoiding typical focus zoom. Coarse-pointer opening focuses the panel rather than summoning the keyboard; fine-pointer devices at least 768px focus the textarea. Touch Enter inserts a newline; the send button submits. No duplicate bottom navigation is added inside the full-screen dialog. At heights at most 740px the heading becomes 38px and spacing tightens.

## 3. Implementation map

All paths below are repository-relative. “Reusable” does not mean every surrounding page-specific selector is portable.

| File / exports | Owns and current use | Status / dependency |
| --- | --- | --- |
| `src/app/layout.tsx` | Root fonts, providers, toast host | Shared infrastructure; Next font, theme/session providers |
| `src/app/(app)/layout.tsx` / `AppLayout` | Authenticated shell; atmosphere, dock, header, main, Command, Novus | Locked navigation architecture |
| `src/components/layout/operating-dock.tsx` / `OperatingDock` | Desktop top links, mobile bottom links, Spaces sheet | Canonical navigation; Next links, Framer Motion, store |
| `src/components/layout/header.tsx` / `AppHeader` | Route title, Command/Novus entry, API notifications | Current shared chrome; notifications not a newly locked Stage 1M design |
| `src/components/command/command-center.tsx` / `CommandCenter` | Searchable navigation/action commands and keyboard control | Existing shared overlay; preserve behavior |
| `src/hooks/use-store.ts` / `useAppStore` | Novus open/draft, Command and other global state | Zustand; `openNovusWithPrompt` is the draft entry contract |
| `src/app/(app)/dashboard/page.tsx` / `NowPage` | Both canonical Now compositions and data mapping | Locked; Next/session, APIs, primitives, Framer Motion |
| `src/components/novus/now-liquid-field.tsx` / `NowLiquidField` | Canonical WebGL material, timing, quality, fallback | Locked identity plus authored secondary-Space mode; React, browser WebGL, store |
| `src/components/novus/secondary-space-field.tsx` / `SecondarySpaceField` | One shared live environment for Tasks, Habits, and Goals | Reuses `NowLiquidField`; one field per page, purpose-specific spatial variant |
| `src/components/visual-system/optical-surface.tsx` / `OpticalSurface`, `OpticalLight` | Shared smoked-glass wrapper and lighting preset | Reusable canonical material; class utility + CSS, no rendering context |
| `src/components/visual-system/metric-instrument.tsx` / `MetricInstrument` | Five differentiated metric types | Canonical with `optical`; default is false; CSS still partly Now-scoped |
| `src/components/visual-system/instruments.tsx` / `RadialInstrument` | SVG score/progress dial | Shared canonical dial base; Framer Motion + contextual CSS |
| Same file / `SignalTrace` | Earlier SVG trend helper, used by Statistics | Not canonical liquid; constant-series caveat below |
| `src/components/novus/novus-panel.tsx` / `NovusPanel` | Modal, conversation, input, states, request/confirmation orchestration | Locked surface; Radix Dialog, store, Framer Motion, existing API |
| `src/components/novus/intelligence-primitives.tsx` | `IntelligenceLiquid`, `NovusPromptRow`, `IntelligenceResponse`, `AIActionResults`, `AIActionConfirmation` | Reusable intelligence pieces; optical material, Lucide, react-markdown, remark-gfm |
| `src/components/shared/novus-logo.tsx` / `NovusMark` | Brand mark used in chrome/intelligence | Existing shared mark |
| `src/components/layout/system-atmosphere.tsx` / `SystemAtmosphere` | Route-mode atmosphere outside Now | Earlier implementation, still active on secondary Spaces |
| `src/components/visual-system/ambient-field.tsx` / `AmbientField` | Canvas2D background in secondary Spaces | Earlier living field, not replacement canonical liquid |
| `src/styles/globals.css` | Actual materials, layout, responsive rules, motion, legacy cascade | Primary visual implementation; preserve selector specificity/order |
| `tailwind.config.ts` | Token mappings, fonts, utility radii/shadows | Shared foundation; includes older palettes, not all canonical |

`InstrumentSection`, `StarterActions`, `FocusList`, `ActivityList`, `EmptyInstrument`, `MetaLabel`, `NowSkeleton`, and `LoadFailure` are local dashboard helpers, not exported shared components. Mobile Now is not a standalone component file. The AI composer is inline in `NovusPanel`, not a separate shared input abstraction. There is no canonical exported `InstrumentSurface`, `DataSparkline`, or `IntelligenceMaterial` component: do not invent these names in integration plans.

## 4. Liquid renderer: actual implementation

`now-liquid-field.tsx` uses browser WebGL 1 directly, not Three.js or React Three Fiber. A vertex shader draws a full-screen quad as two triangles. A high-precision fragment shader evaluates the optical field. Context options include alpha, premultiplied alpha, no antialiasing/depth, and high-performance preference. Uniforms include resolution, console size, pointer, time, hero height, mobile layout, and density samplers.

Raster assets remain essential inputs:

- `public/media/novus-hero-liquid.png`
- `public/media/novus-bottom-flow.png`
- `public/media/novus-activity-stream.png`
- `public/media/novus-today-signal.png`

They supply luminance/alpha density and height-like information. The main capable-browser appearance is not simply a translated PNG. `liquidVolume` advects sample coordinates with three-octave procedural noise, samples finite differences for a normal, computes directional reflection, Fresnel-like response, caustic veins, separate depth sampling, diffuse body, and restrained rim light. It is a shader optical approximation, not physically simulated fluid or scene refraction through actual DOM geometry.

The silver basis interpolates approximately `vec3(.63,.72,.85)` to `vec3(.91,.96,1.)`; other strand contributions use pale silver-blue. Filmic compression `1 - exp(-light * 1.5)` retains crest detail. Density sampling multiplies by edge fades. Final alpha is maximum channel luminance clamped to .95. These choices create black folds and silver ridges rather than a white bloom blob.

Desktop composition is authored in normalized console coordinates. The canvas CSS inset is `0 -80px -190px`; the shader compensates using console size plus 160px width and 190px height. It evaluates the main crest and fork, a narrow connecting channel near the first instruments, Activity material, Today signal, reflected lower pickup, a decorative dormant signal, bottom density, broad undercurrent, and crossing silk paths. `silk` includes twenty nonparallel strands and sparse suspended points. These are decorative material, not analytics. Today’s density receives a localized precision enhancement; it is not a global hero change.

Mobile evaluates only crest and cradle through the same `liquidVolume`, loads only hero/bottom maps, omits the desktop silk particle loop, and attenuates the left editorial region. Intelligence uses this branch even on desktop. It is intentionally less complex, not a shrunken full console. The field’s local dimensions and authored paths matter: dropping the desktop renderer behind an arbitrary board will not automatically position material correctly.

### Ownership, timing and quality

Each mounted eligible field owns its resources and RAF. Props include `pixelRatioCap=1.35`, `mobile=false`, `intelligence=false`, `secondary=false`, `spaceVariant=0`, and `activity=1`. Both Now JSX variants exist, but the effect’s 1024px guard activates only the correct renderer. Secondary mode uses the same field at both breakpoints with a cheaper two-volume phone branch. Opening Novus releases Now and secondary rendering resources and displays their fallback; the intelligence renderer takes priority. Closing reinitializes the page field. `SystemAtmosphere` returns null on Now, Tasks, Habits, and Goals, avoiding a second Canvas2D loop beneath their composition-owned WebGL field.

Time is elapsed seconds with each delta capped at .05. Desktop mouse response smooths pointer values by .035 per frame; touch is ignored. Mobile/intelligence do not attach this mouse response. Intelligence activity smoothly approaches its target by .025 per frame: idle/error/complete 1, focused 1.3, thinking/executing 2.1. State illumination complements actual evolving shader motion; it is not the sole animation.

DPR is capped at the requested ceiling, clamped between .75 and desktop 2/mobile 1.2; normal Now desktop uses 1.35, mobile and intelligence 1.15. There is no measured GPU capability detector or automatic FPS feedback controller. ResizeObserver updates dimensions. IntersectionObserver and document visibility suspend the canonical RAF; returning to visibility resumes without a large time jump.

Cleanup cancels RAF, disconnects observers, removes listeners, detaches image handlers, and deletes buffers/program/shaders/textures when valid. Context loss switches to fallback and avoids deleting lost-generation objects; restoration initializes fresh resources. This does not explicitly force browser context destruction with `WEBGL_lose_context`. Do not claim that only one allocated browser context can ever exist; the intended invariant is one active canonical rendering loop.

### Fallbacks and seams

Reduced-motion preference is watched dynamically. Unsupported WebGL, compilation/allocation failure, image loading failure, or context loss uses `.now-liquid-field__fallback`; static supplied maps remain visually consistent. `data-renderer` controls canvas visibility and fallback display. Images begin as transparent one-pixel textures until loaded.

Seam management combines density edge fades, out-of-range rejection, final canvas fades, CSS masks, and a single desktop field rather than stacked opaque image rectangles. Mobile adds horizontal/vertical fades. Intelligence confines the field to a clipped wrapper and scales inside it to avoid horizontal scroll growth. Preserve transparency and these boundaries when extending the system.

### Canonical liquid rules

Keep broad flowing volume plus fine strands, deep folds, silver-white highlights, pale-blue support, calm deformation and restrained pointer response. Do not introduce neon cyan dominance, orbit/torus ornaments, generic smoke, random particles, unrelated 3D objects, aggressive rotation, or independent animations merely because they are available. Static fallback is valid for accessibility/failure, not a replacement for normal real-time motion.

## 5. Optical glass and material hierarchy

`OpticalSurface` renders a `section` or `article`, classes `target-instrument optical-surface`, and `data-optical-light`. It accepts normal element attributes, children, className, and a lighting preset. It creates no canvas or pointer loop. Presets describe the surrounding light, never a user metric.

| Preset | Light position | Pickup / edge | Diffusion | Current examples |
| --- | --- | --- | --- | --- |
| upper/default | 14% / 0% | .16 / .38 | 1.3px | Score, mobile score, AI prompts/confirmation |
| stream | 85% / 100% | .18 / .27 | .8px | Tasks metric, Recent Activity, mobile Ask |
| cadence | 12% / 85% | .12 / .28 | 1px | Habits metric, Today |
| quiet | 70% / 0% | .065 / .2 | 1.8px | Progress, Up Next, Attention, AI results |
| signal | 100% / 65% | .14 / .32 | inherited 1.3px | Momentum |

The base combines a local radial pickup `rgba(154,183,215,var(--optical-pickup))` with smoked diagonal layers `rgba(5,8,12,.38)`, `rgba(1,3,6,.18)`, and `rgba(5,8,12,.34)`. Diffusion uses backdrop blur and saturation .78. Corners are 12px, border zero. The edge is not a uniform blue stroke: a pseudo-element creates a narrow upper radial highlight and separate one-pixel side/bottom gradients. A second pseudo-element supplies a small localized reflection. Both ignore pointer events.

Shadows include top inset white/ice .1, bottom .07, a dark inner lower fold controlled by `--optical-shadow=.22`, and exterior `0 9px 24px rgba(0,0,0,.15)`. `--optical-response=180ms` is used by row interactions. Mobile overrides diffusion to 1px, clips its surfaces, and varies pickup by purpose. AI prompts use 10px corners, stronger edge .5, 3px diffusion, and more explicit inset edges. AI results are quieter; the composer has its own deeper 16px diffusion and focus-within highlight.

Material levels actually exist through these selectors rather than a formal enum: obsidian shell; living field; subtle content structure; optical instruments; locally brighter controls; deeper intelligence panel; quiet `.material-bar`; `.material-sheet` and `.material-overlay` overlays. Do not replace them all with the same wrapper. Older broad `.novus-shell [class*="bg-card"]` overrides tint secondary pages but do not constitute completed optical adoption.

Hover changes should reveal an edge, arrow, or shallow pickup, not inflate whole panels. Today/Up Next rows use 180ms background changes; prompt arrows translate 3px over .2s. Zero-state instruments retain their optical structure, unfilled calibration and honest labels. No CSS glow should imply a successful mutation or measured trend.

## 6. Tokens, type and depth

Sources: `src/styles/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`. Values below are implemented values, not a proposed token rewrite.

| Token / selector | Value / role |
| --- | --- |
| `.dark --background` / `--foreground` | `220 23% 3%` / `216 33% 97%` |
| `--card`, `--popover` | `220 21% 6%` |
| `--primary`, `--primary-foreground` | `191 100% 78%` / `220 23% 3%` |
| `--muted`, `--muted-foreground` | `220 20% 10%` / `219 11% 63%` |
| `--border`, `--input`, `--ring` | `218 18% 16%`, `218 18% 18%`, `191 100% 78%` |
| `--novus-highlight`, `--novus-cobalt`, `--novus-glow` | `189 100% 88%`, `231 100% 74%`, `197 100% 67%` |
| `--radius` | 1rem utility baseline; canonical optical corners override to 12px |
| `--motion-fast/base/slow` | 160ms / 260ms / 420ms |
| `--motion-ease` | `cubic-bezier(.16,1,.3,1)` |
| `--safe-top/bottom/left/right` | Corresponding `env(safe-area-inset-*, 0px)` |
| Canonical metric value / detail | `#c3d9eb` / `#99a7b5` |
| Desktop summary | `#c2c8cf` |
| AI heading / prose / intro | `#eef3fa` / `#e0e5ee` / `#a3adbb` |
| AI focus outline | 2px `#d3e5fc`, offset 3px |

Global cyan primary is not the complete canonical palette. Silver literals and local gradients deliberately temper it. Tailwind still contains brand/violet/mesh utilities; their existence is not permission to reintroduce that identity. Light-theme tokens remain in code, but this freeze’s reviewed canonical appearance is dark.

Fonts are Inter (`--font-inter`, body/UI), Bricolage Grotesque (`--font-display`), and JetBrains Mono (`--font-mono`), loaded through Next fonts with swap. Desktop Now’s greeting actually uses Inter, 49px/1.06, weight 550, tracking -.045em. Mobile Now overrides to Bricolage, clamp 30px–38px with 8.6vw, weight 550. Desktop metric numbers are 36px, weight 350, with tabular numerals; Momentum uses a smaller word label. Metric details use Inter 10px, not uppercase mono. Desktop technical metadata is 8px with .14em tracking. These labels are subordinate; never use them for primary instructions.

Mobile Attention uses Bricolage 27px/1.12, weight 450. AI welcome uses Bricolage clamp 46px–64px at 4.1vw, weight 450, 1.04 line-height and -.055em tracking; mobile uses 42px. AI prose is 14px/1.8, request text 14px/1.65, prompts 13px/1.5. Prose headings are 23px, h3 18px; code uses mono. Preserve long-form readability rather than applying dashboard micro-type to answers.

Actual depth conventions: header z30; desktop/mobile navigation z50; Spaces overlay z80; intelligence layer z90; Command z100. Liquid stays noninteractive beneath content. Component-local pseudo-elements have their own levels. These are existing conventions, not a universal z-index token scale. Command can sit above Novus; future overlay work must consider focus coordination, not just increase z-index.

## 7. Instrument and lower-module systems

`MetricInstrument` clamps finite progress to 0–100 and sets `is-dormant` at zero. The optical branch is explicit opt-in. Score uses a miniature `RadialInstrument` and calibration ticks. Tasks uses ten equal completion divisions; Habits uses fifteen optical cells, labelled completion today rather than weekly history. Progress fills a fixed trajectory path according to actual percentage; it is not a forecast. Momentum’s path is decorative and aria-hidden; its label derives from current Life Score, and the detail explicitly says “No trend history yet.” The head arrow is decorative, not itself a working link.

Hierarchy is label/arrow, primary readout, explanation, subordinate visualization. Space is reserved so little graphics do not cross numbers; 1024–1200px overrides shrink/reposition them. The shared component still depends on Now-scoped CSS for its exact final geometry. New Spaces should reuse its semantics and material where appropriate, not assume an arbitrary import recreates the entire canonical layout.

`RadialInstrument` clamps the value against max (normally 100), draws radius 43 in a 100-unit viewBox, and animates the arc over .9s with `[.16,1,.3,1]`. The displayed number is not interpolated by this component. Do not promise animated counting where only arc animation exists.

Today uses a cadence surface, concise heading, real focus rows or starter actions, and a bottom Ask link. Checks reflect real completion, not onboarding decoration. Its local liquid signal is environment, not personal history. Up Next uses quieter glass, icon/text rows with fine separators and a circular arrow, then a 40px prompt footer. It chooses actual insight items, then focus items, then general actionable suggestions. Recent Activity uses stream lighting, small activity marks, truthful empty copy and source links, with material concentrated near its lower edge.

The current `ActivityList` gathers a limited selection of completed tasks/habits and recent workout/journal records. It is not a fully sorted event-log product. Do not invent “2m ago” timestamps from mock art or present the selection as comprehensive chronology. Local dashboard helpers own these behaviors; extracting them later requires preserving semantics as well as appearance.

## 8. Novus intelligence behavior

`NovusPanel` uses Radix Dialog for modal containment, Escape dismissal, and focus lifecycle. Ctrl/Cmd+J toggles it. The initiating element is saved and restored on close. Store-provided drafts populate the textarea without automatic submission; prompt rows directly submit their selected text. Route maps supply general suggestions for Now, Tasks, Habits, Goals, with general prompts elsewhere. “From Tasks” names the invoking route: no new route-context payload is sent to the API.

Actual states are `idle`, `focused`, `thinking`, `executing`, `complete`, `error`, in priority executing → thinking → failure → complete → focused → idle. Completion lasts 1500ms. Welcome liquid opacity is .72, focus .9, thinking/executing 1 with brightness 1.18; completed .95. During conversation it is .2, increasing to .46 for thinking/executing. Internal scale .975 while busy and 1.025 on completion transitions over 1.2s. These are quiet state cues layered over the living shader.

The existing API is **non-streaming JSON**. Sending posts `{messages: [{role, content}]}` to `/api/ai/chat`; the interface waits, then renders the returned response. There is no streaming state, token animation, fabricated typewriter, or percentage progress. Busy status is a narrow 1.8s light signal and accurate text. A ref guards duplicate in-flight requests.

`IntelligenceResponse` uses `react-markdown` and `remark-gfm`: raw HTML is skipped, remote images become alt text, links open with noopener/noreferrer, tables scroll in a labelled keyboard-focusable region, code blocks scroll, and long prose wraps. User requests preserve line breaks. Conversation uses a polite live log. Auto-follow only stays engaged when the reader is within 80px of the bottom; sending explicitly resumes follow.

Returned confirmation requests render `AIActionConfirmation` with actual summaries, a permanent-change warning, Confirm and Cancel. Confirm posts `{confirmActions: pending.actions}`. Cancel sends nothing and records cancellation. Executing disables confirmation controls; result rows use actual `ok` and summary values. An executed response refreshes the router; account deletion redirects to login. Degraded responses say no actions were performed according to the existing response contract. A failed result is explicitly labelled, not dressed as success.

Network/HTTP failures surface a calm warning. “Review request and retry” restores the draft rather than silently replays it. A lost confirmation response clears the pending action and tells the user to inspect their data, since a mutation might already have completed. Preserve this safety distinction. Generic bubbles, avatars on every turn, colored message tiles, spinner spectacle, and mock intelligence claims would undo the canonical editorial layer.

## 9. Motion and responsive choreography

Primary motion is hero/intelligence material; secondary motion is under-console/global flow; tertiary signals are small instrument details; interaction motion is fast and local. They must not compete. Now owns one unified field rather than a canvas in each card. Reading-heavy AI fades its field; Settings should remain quiet. Shader paths share one elapsed clock. Ordinary data changes drive arcs/fills, not independent perpetual “trend” animations.

Existing timings: Now root fade .32s; radial and trace reveal .9s; progress dash transition .6s; optical row response 180ms; AI underlay .28s and panel .32s with `[.22,.8,.2,1]`; prompt arrow .2s; AI field opacity/filter .8s, scale 1.2s. Navigation selection uses Framer springs (stiffness 420, damping 36). No global clock coordinates every CSS/Framer animation; choreography is hierarchical, not a centralized animation engine.

Now/navigation composition changes at 1024px; intelligence changes at 768px. Consequently 768–1023px tablets have mobile-style Now/bottom navigation but desktop-width AI behavior. Do not casually merge these breakpoints. Desktop compact instrument rules cover 1024–1200px. Mobile Now’s shorter-height rule and AI’s short-height rule both use 740px, with different scopes. Safe-area variables live in CSS; AI additionally tracks VisualViewport. Overflow protections include `min-width:0`, wrapping, clipped visual layers, and scrollable code/tables. Long names are allowed to wrap rather than covered with graphics.

Reduced motion: `NowLiquidField` responds to media-query changes and chooses static fallback; Framer `useReducedMotion` disables selected entrance animations; CSS removes AI animation/transitions and progress transitions. Earlier shared primitives may still define a transition after initial animation is disabled, and the old Canvas2D environment samples reduced preference at effect initialization. Do not claim a universal zero-motion audit. Preserve premium material and readable static calibration when motion is reduced.

## 10. Accessibility and truthful data

Canonical controls use visible ice focus outlines; graphics are aria-hidden and pointer-transparent. AI close/send/confirmation controls are 44px; phone prompt rows are 64px; mobile Today rows 55px. Native buttons and links retain their behavior, and mobile completion controls expose state. AI textarea has an accessible name, status messages have status/alert roles, and Radix handles modal focus. Spaces uses a custom dialog-like sheet and body locking, not the same Radix focus architecture; do not assume identical accessibility guarantees.

Keep readable text away from luminous peaks; use local shadow/quiet material where currently present. Numeric meters carry labels and values. Fine calibration and metadata are not substitutes for explanatory text. Current QA is not a complete WCAG contrast certification across the product, nor proof all older controls meet 44px targets.

`NowPage` fetches dashboard, AI briefing, and insights with `Promise.allSettled`. Task/habit actions use existing PATCH contracts. Today progress averages available task/habit/goal domains; missing domains are excluded, not invented. Momentum labels current score thresholds (75 Strong, 50 Building, above zero Starting, otherwise Quiet), not historical acceleration. Preserve that distinction.

Never fabricate tasks, streaks, activity, mood history, scores, timestamps, or personalized insights to fill a layout. Acceptable empty states are unfilled meters, labelled waiting signals, real starter actions, and general contextual prompts that do not claim analysis. Decorative liquid is not measured data.

One existing caveat is `SignalTrace` in `instruments.tsx`: for constant series it draws a stylized dormant non-flat path. It is currently used by Statistics, not canonical Now/AI. Before propagating it as an analytical chart, address that ambiguity in a separately authorized task; do not cite it as proof that every current graph is metrically exact. Stage 1N does not change it.

## 11. Practical do / don't

| Do | Don't |
| --- | --- |
| Reuse canonical shader identity with composition awareness | Invent another blob, torus, smoke or orbit system |
| Preserve silver body and black folds | Turn all highlights neon cyan or wash out the crest |
| Use OpticalSurface lighting presets | Copy a generic opaque black card with a blue border |
| Differentiate instruments by meaning | Repeat one KPI treatment everywhere |
| Label real current progress | Imply recorded history from decorative paths |
| Use actual actions and dormant empty states | Populate mock values, timestamps or fake successes |
| Keep desktop top/mobile bottom navigation | Restore the old permanent sidebar |
| Give writing/reading quieter material | Put a hero-strength renderer behind every paragraph |
| Keep explicit confirmation and uncertain-result warnings | Retry mutations automatically after an ambiguous failure |
| Preserve mobile-specific composition and safe areas | Shrink the desktop console onto a phone |
| Compare against current canonical screenshots | Restart art direction from the original TARGET |
| Inspect complete selector chains | Treat an early CSS declaration as the final computed style |

## 12. Extending to secondary Spaces

Tasks, Habits, and Goals are completed canonical propagations. The remaining rows are future directions, not claims of completed adoption. Preserve existing functionality and real data contracts. All routes live under `src/app/(app)`.

| Space / route | Appropriate interpretation |
| --- | --- |
| Tasks `/tasks` | **Stage 2A canonical.** Execution, priority and real completion; compact readable rows, restrained motion, clear filters and deadlines. Reflection never obscures checkboxes. |
| Habits `/habits` | **Stage 2B canonical.** Cadence, actual streaks and today completion; the current route exposes no dated history, so it deliberately has no historical matrix. |
| Goals `/goals` | **Stage 2C canonical.** Direction, real current/target distance, ordered milestones, and actual target dates without invented forecasts. |
| Journal `/journal` | Writing-first editorial hierarchy, quiet glass and minimal ambient movement; no large active material behind long-form editing. |
| Projects `/projects` | Board/list clarity, project state and recorded progress; preserve drag/drop hit targets and column legibility. |
| Finance `/finance` | Precise values, units, dates, income/expense/account/budget charts supported by available data. Minimal decoration; never remove axes merely for aesthetics. |
| Workout `/workout` | Real sets, volume, sessions and training rhythm; slightly stronger local energy, not continuous visual competition. |
| Mood `/mood` | Softer state and recorded trends; no implied correlations without evidence. Calm material around sensitive reflection. |
| Statistics `/statistics` | Highest useful data density, comparable scales, temporal labels and truthful series. Audit SignalTrace before reuse. |
| Timeline `/timeline` | Chronological continuity, fine event line, clear periods and actual dates; avoid scroll-driven spectacle. |
| Life DNA `/dna`, Weekly Review `/review`, Analyst `/analyst` | Structured intelligence narrative, evidence and pattern presentation; reuse prose/result material where appropriate, not a duplicated chat interface. |
| Settings `/settings` | Minimal motion, clear forms/toggles, account/security confidence; canonical edges without cinematic display. |

Reuse exactly the color identity, material vocabulary, fonts, liquid character, motion philosophy, navigation architecture, and micro-detail language. Vary composition, density, instrument/chart type, content hierarchy, local light placement, and amount of motion according to purpose. A shared system does not require every Space to duplicate Now’s three columns.

### Stage 2A — canonical Tasks propagation

`src/app/(app)/tasks/page.tsx` and `tasks.module.css` define the Tasks-specific composition. Tasks uses one compact `OpticalSurface` execution rail for truthful current Active, Completed, and Completion values, followed by one dominant queue surface. Priority is conveyed by precise line and label treatment rather than traffic-light cards; due state, category, status, filtering, creation, completion, and deletion remain attached to the existing task contracts. The desktop queue is dense and execution-first. The mobile composition is separately authored for touch targets, safe areas, metadata flow, and the canonical bottom navigation.

Tasks uses the shared `SecondarySpaceField` in its execution composition. The field crosses header, execution rail, queue, and lower continuation; the older `SystemAtmosphere` is disabled on this route so there is one environmental loop. Its local completion sweep is brief, subordinate, and disabled for reduced motion. `scripts/tasks-qa.cjs` covers populated, long-list, empty, touch, dialog, mutation-contract, responsive, and reduced-motion states with intercepted local fixtures. The task creation overlay remains the route's legacy custom dialog and does not claim the Radix focus-containment guarantees of the canonical Novus intelligence layer.

### Stage 2B — canonical Habits propagation

`src/app/(app)/habits/page.tsx` and `habits.module.css` define the rhythm-specific composition. One integrated cadence surface places actual today completion in a segmented arc beside supported active, longest-streak, and all-time completion values. The dominant Today surface uses circular ritual controls, exact frequency labels, real target-day marks when present, restrained streak metadata, and a short local completion signal. The shared `SecondarySpaceField` crosses the cadence and Today surfaces; the older route atmosphere is disabled, so it adds no competing rendering loop or historical inference.

Creation still supports the existing name, icon, color, and daily/weekly/monthly frequency contract; completion, archival deletion, optimistic state, rollback messaging, plan limit, checkout entry, and route-context Novus entry remain intact. The route receives only today’s logs, so no weekly/monthly matrix or consistency history is claimed. `scripts/habits-qa.cjs` covers populated, long-list, empty, touch, create/delete/toggle contracts, responsive, dialog, and reduced-motion states with local intercepted fixtures. The creation overlay uses the legacy custom Dialog; its Habits-only layer override keeps mobile navigation non-interactive beneath it, but it does not claim Radix focus containment.

### Stage 2C — canonical Goals propagation

`src/app/(app)/goals/page.tsx` and `goals.module.css` define the direction-specific composition. An integrated direction surface displays the honestly derived average of current active-goal progress beside active, completed-milestone, and completed-goal counts. Goal surfaces make current value, target, remaining distance, actual target dates, status, and ordered real milestones primary. Their calibrated paths represent only current progress and milestone state; they do not claim history, velocity, or prediction. The shared field forms one horizon through the overview and asymmetric destination surfaces while the older route atmosphere remains disabled.

### Tasks / Habits / Goals visual-convergence foundation

`SecondarySpaceField` is the reusable foundation for subsequent high-motion secondary Spaces. It delegates to the canonical renderer rather than creating a second shader or per-panel canvases. Desktop evaluates a crest, structural bridge, lower continuation, and one fine filament layer; mobile uses only two refractive volumes, is capped to the first 1120px of the composition, and fades before long lists. Static canonical density maps remain the reduced-motion and unsupported-WebGL fallback. The `space` variant changes authored material placement only; it never represents data.

Page surfaces intentionally remain purpose-specific: Tasks concentrates material around the execution rail and queue controls; Habits allows richer cadence illumination; Goals uses a spacious directional horizon and asymmetric goal grid. All three use more transparent local optical surfaces with variable edge pickup, but controls and readable rows remain above the field. Future Spaces may reuse this foundation only when continuous material suits their reading and interaction model; Journal and Settings should use quieter treatments.

Creation retains the existing title, description, horizon, target value, color, target date, and milestone contract. Numeric progress and milestone toggles use the existing PATCH shapes with optimistic UI and rollback messaging. Existing Goal Coach output remains available, and its generated timeline is explicitly labelled AI guidance rather than measured forecasting. The current UI still exposes no delete, metadata edit, filter, sort, or status-change control, so Stage 2C does not invent them. `scripts/goals-qa.cjs` covers populated, dense, empty, touch, create/progress/milestone/coach contracts, rollback, responsive composition, dialog layering, and reduced motion with local intercepted fixtures.

### Stage 2D — canonical Journal propagation

`src/app/(app)/journal/page.tsx` and `journal.module.css` define the writing-first composition. Journal deliberately keeps the shared calm `SystemAtmosphere` instead of mounting the higher-energy `SecondarySpaceField`. A quiet optical writing threshold opens a borderless long-form editor; the archive uses real month grouping, dates, metadata and a continuous chronology rail rather than repeated dashboard cards. Summary labels explicitly distinguish the full entry count from values calculated over the current API page.

The editor and reader use constrained prose measure, 16px body type, generous line height, independent scrolling and safe short-height behavior. Page-level transforms and stacking contexts must not contain these fixed overlays: mobile editor controls need to remain above the shell header and inside keyboard-height viewports. Search, create, read, delete, mood, type, tags and the existing whole-life pattern request retain their current contracts; returned pattern evidence is labeled as whole-life analysis rather than fabricated journal-only interpretation. `scripts/journal-qa.cjs` covers populated chronology, long reading, writing/create payloads, search, patterns, deletion, two phone widths, a shortened editor viewport, empty state and reduced motion with intercepted local fixtures.

## 13. Legacy, performance and future refactoring notes

Source searches at this freeze found only definitions, no TSX consumers, for `NovusCore` in `src/components/novus/novus-core.tsx`, `AppSidebar` in `src/components/layout/sidebar.tsx`, and `BottomNav` in `src/components/layout/bottom-nav.tsx`. They are superseded for the canonical surfaces. Current navigation is `OperatingDock`. Do not resurrect them. This is not permission to delete them without a full reference audit.

`AmbientField`, earlier `.novus-instrument`/`.instrument-panel` styling and broad card overrides remain active outside the locked surfaces. They are earlier-stage adoption, not the final optical standard. Old `.novus-panel-*` and message CSS remains; the new composer still uses `novus-panel-input`, and `novus-canonical-panel` supplies inherited rules. Bulk deletion would be unsafe. Old brand/lime descriptions in `APP_OVERVIEW.md` are historical. File names such as experiments/discoveries are not by themselves evidence of obsolete product functionality.

Future profiling targets, not diagnosed lag causes: multiple texture samples and procedural noise per fragment, twenty-strand desktop loops, large extended canvas area, device DPR, stacked backdrop filters, and retained browser contexts. The canonical loop properly pauses out of view/hidden. The older Canvas2D `AmbientField` throttles draws to 18fps mobile or 30fps desktop; its RAF continues while the page is hidden although drawing is skipped. Mobile uses four layers, desktop nine plus dashed detail. It draws a static frame when explicitly paused. These are different implementations; document and profile separately.

There are no freeze-stage hardware frame-time measurements, so do not claim a confirmed GPU bottleneck or universal smoothness. Physical Safari compositing and memory behavior remain unverified. Asset loading, texture dimensions and startup compilation warrant profiling before any optimization. Do not change material identity as a shortcut to performance.

Future refactoring should consider the long ordered CSS cascade, page-local dashboard helper extraction, Now-scoped metric geometry, authored shader coordinates, duplicated mounted responsive JSX, and shared modal coordination. First pin screenshots and interaction evidence; then extract without changing output in a separately authorized task. There is no normalized material/spacing/token package hiding behind these files. This stage deliberately performs no cleanup.

## 14. Validation, limitations and screenshot references

Evidence is summarized in `design-qa.md`; this stage does not rerun the entire visual suite. Stage 1K locked desktop optical instruments; 1L locked mobile Now; 1M locked intelligence and reran Now regressions. Recorded `npx tsc --noEmit` and `npx next build` passed. Existing metadataBase/dynamic-route diagnostics remain. Do not casually use `npm run build` for a read-only check: `package.json` includes `prisma db push` in that command.

Relevant harnesses:

- `scripts/now-visual-qa.cjs`: desktop geometry, populated/empty states, motion and responsive checks.
- `scripts/mobile-now-qa.cjs`: six sizes including 360×640, long names/titles, greetings, zero/100 score, safe-area, fixture mutation contracts and reduced motion.
- `scripts/intelligence-qa.cjs`: desktop/three phone widths, idle/focus/thinking, long Markdown, safe output, confirmation/cancel/execution/results/failure, reduced motion, focus containment, route context, keyboard-sized viewport and ten-second shader progression.
- `scripts/intelligence-touch-qa.cjs`: coarse-pointer Chrome emulation, no unwanted opening keyboard, newline/send and focus restoration.
- `scripts/tasks-qa.cjs`: Stage 2A desktop/mobile Tasks composition, real task request contracts, filters, dense and empty states, touch, safe areas, dialog and reduced motion.
- `scripts/habits-qa.cjs`: Stage 2B desktop/mobile Habits rhythm, truthful summary values, recurrence display, create/toggle/delete contracts, dense and empty states, touch, dialog and reduced motion.
- `scripts/goals-qa.cjs`: Stage 2C desktop/mobile Goals direction, truthful progress/date/milestone values, create/update/toggle/coach contracts, rollback, dense and empty states, touch, dialog and reduced motion.

Recorded final suites had no unexpected console/page errors. Destructive actions were intercepted fixtures, not live account mutations. This verifies UI and request contracts, not real provider quality or live authenticated action success. A physical iPhone, Safari and physical soft keyboard were not tested. Dependency installation reported advisories; no broad security audit or dependency remediation is implied. Light mode and secondary Spaces other than Tasks, Habits, and Goals are not newly certified by the canonical lock.

The following files exist locally under `artifacts/visual-qa/`. They are ignored/untracked artifacts, **not files guaranteed in a fresh clone**. Share/copy them separately if another workstation needs visual evidence. Paths are useful locally; do not silently substitute an older tracked mockup if unavailable.

| Reference | Local path |
| --- | --- |
| Current desktop Now, post-1M regression | `artifacts/visual-qa/stage1m-final-now-desktop.png` |
| Current mobile Now | `artifacts/visual-qa/stage1m-final-now-390.png` |
| Original locked desktop 1K | `artifacts/visual-qa/stage1k-final.png` |
| Original locked mobile 1L | `artifacts/visual-qa/stage1l-final-390.png` |
| Current desktop AI | `artifacts/visual-qa/stage1m-final-desktop-idle.png` |
| Current mobile AI | `artifacts/visual-qa/stage1m-final-mobile-390.png` |
| AI motion evidence | `artifacts/visual-qa/stage1m-final-motion-start.png`, `artifacts/visual-qa/stage1m-final-motion-10s.png` |
| AI action evidence | `artifacts/visual-qa/stage1m-final-desktop-confirm.png`, `artifacts/visual-qa/stage1m-final-desktop-success.png`, `artifacts/visual-qa/stage1m-final-desktop-action-failed.png` |
| Now regression comparison | `artifacts/visual-qa/stage1m-final-now-desktop-compare.png`, `artifacts/visual-qa/stage1m-final-now-390-compare.png` |

`.golden-reference-desktop-final-comparison.png` is also a local untracked historical board: 3360×945, with original TARGET in its left half. The right half is an older implementation comparison, not current canon. Bezel/marketing copy from TARGET is not application content. Current liquid frames naturally differ over time; compare layout/material character and motion evidence, not arbitrary pixel equality between time samples.

## 15. Git, deployment and reading context

Repository: `cacat901-glitch/LifeOS`; existing branch `main`. Application baseline at documentation start was clean, commit `0b3347741dc98770ccc96777b50fc80882600bff` (Stage 1M, canonical intelligence). Earlier locks are `0b6ab547381890368f74b846e3f0b7ae6445d86d` (1L mobile Now) and `4dba5dac17b20efb567bdd5756e36f2e3da26fdf` (1K desktop optical instruments).

Production snapshot checked for this freeze: Vercel project **life-os-bs7c**, project ID `prj_5mlBNxNIk34EsIvgddtWf7XWA6RU`, canonical URL https://getlife-os.vercel.app. Deployment `dpl_G65nDiwDzgVJ8mQVp3p921CqDRLz` was READY/production at the Stage 1M commit above. This is a dated snapshot, not a promise that an alias cannot move. The documentation commit follows this baseline and changes no application files. Do not operate on the separate `life-os` Vercel project.

Start future model switches with `docs/NOVUS_2_MODEL_HANDOFF.md`. Use this file for visual questions, task-relevant source for implementation, `design-qa.md` for relevant validation, `APP_OVERVIEW.md` for broad historical product context, and `README.md` for repository setup. Only three broader Markdown files were tracked before this stage; the original external knowledge/history attachments are not portable repository documentation. Do not recreate them or rely on old completion/backlog claims as current instructions.

## Next Phase

Continue propagating the locked Novus 2.0 visual system across secondary Spaces using actual canonical primitives, without redesigning the system. Recommended next order: Journal → Projects → Finance → Workout → Mood → Statistics → Timeline → Life DNA / Weekly Review / Analyst → Settings.

Begin the next Space only when authorized. Inspect its existing data/interaction model, reuse canonical material and purpose-appropriate instrumentation, preserve functionality, verify desktop/mobile and truthful empty/populated states, then guard all previously locked surfaces against regression. Do not combine propagation with backend redesign, Stripe, onboarding, integrations, new modules, or performance rewrites.

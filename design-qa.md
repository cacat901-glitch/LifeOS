# Novus desktop Now instrumentation — screenshot reconstruction QA

## Desktop fidelity refinement — 2026-09-18 (latest)

Source: the owned mockup preserved in the left 1680×945 region of `.golden-reference-desktop-final-comparison.png`, normalized to 1672×941. Source content crop: x203/y140 to x1110/y778, excluding sidebar and command chrome. Existing top navigation remains the intentional architectural exception.

Implementation: `artifacts/visual-qa/fidelity-final.png`, 1672×1050 CSS pixels at DPR 1. Empty local fixture state, not a real account. Console 1120×786 at x276/y91; width-normalized to 907 pixels without aspect distortion. Full comparison: `fidelity-final-compare.png`; transparent overlay: `fidelity-final-compare-overlay.png`; focused regions: `fidelity-final-compare-metrics.png` and `fidelity-final-compare-lower.png`.

### Comparison iterations

1. `fidelity-01`: reduced crest fill and fine-strand density; tightened lower action rows; added shared reflected light. Review found excessive uniform blue pickup, weak dormant instruments, and a too-high incoming stream.
2. `fidelity-02`: reduced pickup, lowered the incoming flow, refined rings and added an explicitly decorative dormant momentum signal. Review found greeting placement/scale drift, local signals too low, and uneven lower text positioning.
3. `fidelity-03`: reduced optical noise, refined local padding, and used the new overlay to identify greeting and readout inset differences.
4. `fidelity-04`: corrected greeting size/position, metric inset, Today row spacing, and local signal position. Populated 1024px inspection caught graphics overlapping multi-digit values.
5. `fidelity-final`: compact desktop graphics moved above the values; reinforced the flow through the metric row. Repeated full/focused comparisons and interaction checks.

### Required fidelity surfaces

- Typography: same existing font system; greeting now 49px at the rendered scale, matching the target's hierarchy and two-line wrap. Mono labels, metric numerals, lower headings, icon sizing and action rows inspected in focused crops. Dynamic greeting/copy remains real.
- Geometry: normalized metric widths approximately 143/153/143/136/192px, against target approximately 144/154/144/137/193px. Lower modules approximately 242/288/265px, 259px tall; their top is 356px below the content origin, matching the target lower-row position. These are image measurements, not original design-file coordinates.
- Materials: stronger localized top reflections, translucent dark centers, quieter sides, and lower silver-blue pickup. The initial excessive blue wash was reduced. Rings use broken light segments rather than uniform bright outlines. No normal-renderer hard raster boundaries observed.
- Graphics: existing density inputs, continuous WebGL material and isolated shared clock retained. Crest keeps darker folds, local activity/Today signal placement is closer, and the bottom composition now has a broader dominant arc with fewer competing strands. No new raster asset or per-card rendering loop was added.
- Content: no invented history. Task/habit/progress instruments use actual fields. Momentum's decorative trace is aria-hidden and accompanied by “No trend history yet.” The sparse Recent Activity state intentionally differs from concept events in the target.

### Residual P3 differences / intentional constraints

- Liquid branch contours, particle distribution and individual glints are not identical to the static mockup. They remain a real-time approximation using the existing density source, not a pixel-identical reconstruction.
- The target Today signal has sharper isolated points; current signal is softer. Lower reflections and font rasterization differ slightly.
- Target concept data, sidebar and marketing/device framing are intentionally not copied. These are not evidence of implementation drift.

### Verification

`fidelity-final-checks.json`: six browser checks passed, no console/page errors. Tested local fixture task/habit updates, prompt prefill/chat contract, navigation, context recovery, reduced-motion fallback/restoration, 1024px layout and mobile preservation. Motion evidence: `fidelity-final-10s.png`. Geometry is recorded in `fidelity-final.json`. Live authenticated AI/database service execution is not covered by this fixture harness.

The scoped desktop layout/material refinement passes visual QA with the above remaining approximation differences; this does not claim exact pixel parity or user approval of the canonical design.

final result: passed

---

## Stage 1J implementation — 2026-09-18 (current; supersedes reports below)

Meaningful application changes are implemented. This is not a claim of pixel-perfect target parity.

- Capture: `artifacts/visual-qa/stage1j-final.png`, 1672×1050 CSS viewport, DPR 1; console bounds x276/y91, 1120×781.
- Comparison: `stage1j-final-compare.png` and focused `-metrics` / `-lower` images in the same directory. Both content crops preserve aspect ratio and exclude the explicitly forbidden target sidebar.
- The expired clipboard reference was recovered from the complete target preserved in the left half of `.golden-reference-desktop-final-comparison.png`.
- Motion pair: `stage1j-final.png` / `stage1j-final-10s.png`; reduced-motion capture: `stage1j-final-reduced.png`.
- Browser-only local fixtures are clearly isolated from real services. No database writes, auth changes, or fabricated production history were introduced.

### Implemented and compared

Iterations replaced the wire-like first procedural experiment with one shared WebGL field. Existing images supply density/height inputs, not displayed RGB plates; fragment-local advection, derived normals, refractive sampling, filaments, particles, and traveling light evolve in real time. It is a 2D shader material, not a fluid simulation. Desktop Now no longer runs the previous background renderer underneath it.

The narrower/taller console, greeting weight and placement, score placement, five instrument widths, three lower-module proportions, gaps, prompt footer, and transparent variable-edge material were adjusted against repeated captures. Local Today/Activity graphics and the bottom field share the shader rhythm. Previous rectangular raster boundaries are no longer visible in the normal renderer.

Task bars encode completion rather than fictional history. Habit dots encode current completion, not a weekly matrix. Progress is a completion path. Momentum explicitly reports missing history. Contextual suggestions now prefill Novus without automatically sending a request.

### Remaining visual differences

- The target's broader silk-like branching and exact crest silhouette are not reproduced exactly; current material has denser fine fibres.
- Target lower-card bodies have stronger blue-silver illumination and different reflection distribution. Current lower cards remain darker.
- Typography and geometry are substantially closer, but not identical. Existing top navigation is retained by requirement.
- Recent Activity is intentionally sparse for empty data; target concept events/timestamps are not copied.

These differences remain open visual fidelity work, not merely expected animation variance. Earlier blanket “passed/no actionable findings” statements below are historical and superseded.

### Verified locally

Final browser suite: six checks passed, no console/page errors. Covered suggestion prefill and chat request/response contract; populated metric derivation; task PATCH and optimistic completion; habit PATCH; WebGL loss/recovery; 1024px/mobile overflow; desktop GPU disabled on mobile; Tasks navigation and renderer unmount. Reduced-motion fallback/restoration passed. Evidence: `stage1j-final-checks.json`.

These are fixture-based frontend checks, not verification of live authenticated AI/database services. Render loops pause on hidden/offscreen state and dispose resources on unmount; context-restoration resource warnings found during QA were fixed. Build and deployment status are reported separately.

---

## Historical reports (superseded)

## Evidence

- Source visual truth: `C:\Users\Ducky\AppData\Local\Temp\codex-clipboard-4407ed32-2255-49ac-b817-0944bcc3f525.png` (1672 × 941).
- Latest implementation capture: `G:\Novus\.console2-motion-a.png` (1273 × 841 full page from a 1280 × 720 CSS viewport, DPR 1).
- Normalized full-console comparison: `G:\Novus\.console2-final-comparison.png` (2412 × 712).
- Focused lower-console comparison: `G:\Novus\.console2-qa-final-comparison.png`.
- Motion pair: `G:\Novus\.console2-motion-a.png` and `G:\Novus\.console2-motion-b.png`, separated by 10 seconds.
- State: desktop Now, truthful zero-data account. The local visual-QA auth/data harness was removed before build.

The target desktop console was cropped to exclude the explicitly forbidden permanent sidebar and width-normalized to the implementation console. This avoids treating the product's required top-navigation architecture as visual drift.

## Findings

No actionable P0, P1, or P2 findings remain in the scoped desktop Now instrumentation and lower-console reconstruction.

- [P3] The target's populated Recent Activity panel is text-denser than a truly new account can be.
  - Classification: truthful-state variance. The implementation uses one genuine system-ready event, a dormant activity axis, and a dedicated local liquid stream without inventing history or timestamps.
- [P3] Liquid brightness varies between frozen screenshots because the implementation is live.
  - Classification: expected motion-state variance. The ten-second pair confirms the same composed material moves through both brighter and darker phases.

## Required fidelity surfaces

- Fonts and typography: passed. Sans display hierarchy, compact body text, mono technical captions, numerical weight, wrapping, and truncation align with the target family. Dynamic user/product copy remains real.
- Spacing and layout rhythm: passed. Five-card width ratios, compact instrument height, lower 1.03 / 1.16 / .92 grid, 13 px gaps, 238 px module height, and panel padding reproduce the target silhouette after sidebar normalization.
- Colors and tokens: passed. Obsidian, silver-white, and restrained ice-blue dominate. Lower surfaces are smoky rather than teal cards; environmental light remains visible through local diffusion.
- Image quality and asset fidelity: passed. The hero remains locked. Three dedicated production assets now cover the composed bottom ribbon, Today signal field, and Recent Activity stream. They are not CSS substitutes or duplicated hero crops.
- Copy and content: passed. Zero-data metrics remain zero. Starter actions are real destinations or Novus actions; suggestions are explicitly labeled as Novus suggestions; no activity, streak, timestamp, achievement, or trend history is fabricated.
- Icons and controls: passed. Existing product icon language is preserved; Up Next actions use compact circular controls matching the target rhythm.
- Accessibility and behavior: passed for scope. Starter destinations expose real hrefs, the Novus suggestion opens the real intelligence panel, the panel closes correctly, text remains legible over motion, and reduced-motion fallback is preserved.

## Comparison history

### Iteration 1 — blocked

- [P1] Lower modules remained visually empty compared with target.
  - Fix: replaced blank states with four real Today setup actions, four contextual Novus suggestions, and a truthful activity-ready state.
- [P1] Bottom field read as blurred procedural fog.
  - Fix: created a dedicated panoramic refractive ribbon plate and integrated it into the shared Canvas renderer with slow deformation and traveling light.
- [P2] Metric readouts lacked distinct internal identities.
  - Fix: added a score radial, task histogram, habit rhythm markers, progress trajectory, and momentum waveform, each derived from current real state or shown dormant.

### Iteration 2 — blocked

- [P2] Today and Recent Activity still lacked the target's art-directed local graphics.
  - Fix: added separate Today signal and Recent Activity stream plates with restrained local motion.
- [P2] Lower action density and arrow controls remained weaker than target.
  - Fix: tightened row height, increased optical text size, darkened smoky panel material, and added circular directional controls.

### Iteration 3 — passed

- Normalized full and focused comparisons show matching five-instrument / three-module silhouette, dedicated local graphics, stronger black glass, and composed bottom-flow continuity.
- Novus prompt interaction: passed.
- Starter Tasks destination (`/tasks`): passed.
- Local console errors were limited to the expected missing Auth.js secret in the temporary unauthenticated QA harness; production configuration is checked separately after deployment.

## Motion evidence

- 724,003 of 1,070,593 captured pixels changed across 10 seconds.
- Mean absolute RGB differences were approximately 6.96 / 7.28 / 7.78.
- The changed-pixel bounding box covered the living liquid environment and local panel material while content remained stable.

## Implementation checklist

- [x] Five metrics have distinct truthful live/dormant readouts.
- [x] Three lower modules remain useful and visually dense at zero data.
- [x] Today and Recent Activity use separate local visual compositions.
- [x] Bottom liquid uses deliberate layered crossings rather than fog or parallel streaks.
- [x] Liquid continues hero → metrics → modules → outside console.
- [x] Hero, mobile, secondary Spaces, APIs, and auth architecture were not redesigned.
- [x] Same-state screenshot comparison and focused lower-region comparison passed.

## Stage 1J — fresh review, 2026-09-08

This review supersedes the previous pass claim above. Stage 1J is not implemented or verified.

- Source visual truth: `C:/Users/Ducky/AppData/Local/Temp/codex-clipboard-d94e1509-c184-4c9d-a455-285305d5bcff.png`.
- User-supplied current screenshot: `C:/Users/Ducky/AppData/Local/Temp/codex-clipboard-28ba8ca6-ba50-4e13-bfeb-d16b2b5645b5.png`.
- State: desktop Now, empty account. Target includes concept data, a sidebar, phone mockups, and marketing framing; current contains real account data and top navigation. Compare desktop content with aspect ratio preserved, excluding those intentional differences.
- New browser-rendered implementation capture and normalized focused comparisons: unavailable; no application changes made in this stage.

### Fresh findings

- [P1] Layout: current console is substantially wider and shallower relative to its content than the target; metric and lower-card proportions require measured reconstruction.
- [P1] Material: visible rectangular graphic boundaries break continuity around and below the console.
- [P1] Liquid: the bright hero crest loses internal detail. Code inspection confirms the primary desktop treatment uses raster layers with affine transforms, not the requested procedural material evolution.
- [P2] Typography/content: current greeting is optically heavier; lower rows remain more compressed than the target. Preserve real values and do not populate concept activity.
- [P2] Data semantics: completion-derived trajectories and cross-domain values should not imply measured time-series history. Review mini-instrument encodings before calling them truthful analytics.

### Verification blocker

Both in-app browser control and the native computer-use JavaScript runtime fail during initialization with `failed to write kernel assets: The system cannot find the path specified. (os error 3)`. Resetting and retrying the browser runtime produces the same error. No new captures, interaction checks, or 10-second motion observation can be claimed. Direct Playwright fallback requires user agreement under the image-to-code workflow's browser rule.

### Next implementation checks

1. Restore browser capture or obtain agreement to use direct Playwright.
2. Measure desktop target content and compare proportional regions without stretching either screenshot.
3. Reconstruct shared real-time liquid, desktop-only layout/materials, and truthful mini-instruments.
4. Repeat rendered full-view and focused comparisons; then validate interactions, TypeScript, and build.

final result: blocked

## Stage 1K — desktop Now material lock, 2026-09-18

This stage supersedes the historical blocked review above. The user's current
liquid identity, not the mockup liquid, is the source of truth. Scope is desktop
Now only; mobile and secondary Spaces are not being redesigned.

### Visual iterations

- Captured `artifacts/visual-qa/stage1k-baseline.png` before editing. Console
  remains 1120 x 786 at the 1672px desktop viewport. Hero, greeting, large score,
  navigation, metric row and lower-module geometry are unchanged.
- Compared full and focused views with the original target recovered from the
  existing golden comparison. Compared liquid separately with the baseline.
- Replaced uniform gray panel pickup with five opt-in optical-light presets:
  localized reflections, smoked diffusion, dark interiors and partial edges.
- First iteration exposed an inherited radial minimum width and overbroad top
  reflections. Corrected the concentric alignment and narrowed edge pickup.
- Refined score calibration, task proportion bars, dormant habit grid, progress
  anchors and inactive momentum depth. These are current-state instruments,
  not fabricated histories. Momentum explicitly says no trend history exists.
- Refined Today controls, Up Next rows/footer and Recent Activity architecture.
  Empty activity includes real destination links, not fictional events.
- Local Today signal received a small sharp-ridge contribution. Hero and bottom
  shader paths, geometry, timing and rendering architecture are unchanged.
- Populated-state review caught progress text/trace proximity; moved the trace
  above the numerical readout. Compact desktop already uses that separation.

### Reusable system

`OpticalSurface` accepts `upper`, `stream`, `cadence`, `quiet`, or `signal`
lighting. CSS variables expose pickup position, intensity, edge strength,
diffusion, shadow and response timing. Lighting is art-directed; it is not a
physical light simulation. Existing liquid remains visible through the material.
`MetricInstrument` takes actual values and bounded completion percentages;
`optical` is explicit opt-in. Other Spaces can adopt these later, with no current
global reskin. No additional animation loops or graphics contexts were added.

### Verification and boundaries

- Reviewed empty and populated desktop screenshots, 1024px desktop, and mobile.
- Ten-second capture pair verifies ongoing procedural movement; reduced-motion
  fallback and WebGL context-loss recovery pass.
- QA suite passes suggestion prefill/chat request-response contract, task and
  habit PATCH contracts with optimistic state, navigation, rendering unmount,
  and absence of horizontal overflow. Browser errors: none.
- These interaction checks use local intercepted fixtures. They do not claim a
  live AI response or a write to the user's production database.
- TypeScript and production build pass. Existing metadataBase and dynamic
  export-route build diagnostics remain outside this visual pass.
- Design assessment: the remaining target differences are intentional (canonical
  liquid, top navigation, true account data). Desktop Now is the proposed locked
  material baseline, not a claim of pixel identity with the old mockup.

Evidence: `stage1k-02-compare.png`, `stage1k-02-compare-canonical.png`, and
`stage1k-final*` under `artifacts/visual-qa`. Generated captures stay local.

## Stage 1L — canonical mobile Now, 2026-09-19

Scope: mobile Now and its required shell treatment only. Desktop Stage 1K is
locked. No secondary Space or full Novus AI redesign. The user explicitly
requires shared real-time liquid and data graphics, so the existing procedural
material and instrument primitives are reused instead of new static art assets.

### Sources and normalization

- Material source: Stage 1K, `artifacts/visual-qa/stage1k-final.png`.
- Mobile composition source: first phone in
  `.golden-reference-desktop-final-comparison.png`, original left 1680 x 945
  reference. App content crop (1148,209)-(1375,760), 227 x 551, normalized to
  390px width with its aspect ratio preserved. Device/status chrome excluded.
- Implementation: `artifacts/visual-qa/stage1l-final-390.png`, 390 x 844 CSS
  pixels, DPR 1. The mockup has a taller content ratio and different dynamic
  greeting; these are documented differences, not claimed pixel equivalence.
- Combined comparison: `stage1l-final-390-compare.png`. Score, greeting and
  navigation are readable at this scale; `stage1l-final-glance.png` and
  `stage1l-final-glance-completed.png` inspect the lower instruments separately.

### Iteration history

1. Existing mobile had older cyan graphics, independent wave renderers, a
   duplicated numerical score outside an empty ring, and noncanonical panels.
   Replaced these with mobile composition of the same liquid shader, one active
   field, OpticalSurface material, and an integrated radial readout. Retained
   bottom-navigation destinations and contextual Novus entry.
2. `stage1l-02-390-compare.png`: score lacked visual prominence and the crest
   competed with the greeting. Increased the dial/card, added quiet calibration
   detail, moved the crest upward, and recomposed the score's material cradle.
3. `stage1l-03-390-compare.png`: composition and hierarchy accepted. Lower-region
   inspection found inherited top/bottom positioning stretching the habit grid,
   and mobile lacked explicit percentage-fill styling. Restricted its bounds
   and applied the real completion percentage to each cell. Verified after fix.

### Required fidelity surfaces

- Typography: canonical Bricolage display/Inter UI family; mobile-specific
  greeting size and natural long-name wrapping. Long action titles expand rather
  than clip. Micro-labels stay subordinate to readable values/actions.
- Spacing: primary score and Attention replace five equally prominent cards.
  Two compact metrics and Today follow below. 44px+ navigation targets and
  55px action rows; bottom padding accounts for dock and safe area.
- Tokens: obsidian/silver/ice, shared smoked glass with localized pickup,
  restrained nav line/icon illumination. No cyan pill active state on Now.
- Material: the exact canonical optical shader functions and density sources
  are reused, recomposed for phone. Mobile omits desktop silk/particle loops and
  extra local layers, caps DPR at 1.15, and has no pointer tracking. Reduced
  motion retains static source material and full instrument quality.
- Content: real score, open tasks, completed habits, real action handlers and
  concise summaries derived from existing data. No fake activity/history.
  Contextual Ask differs from persistent navigation: it starts a specific prompt.

### Validation

- 360x800, 375x812, 390x844, 393x852, 430x932, plus short 360x640: no horizontal
  overflow, score intact, bottom navigation reachable. Taller content scrolls.
- Long name/title tests at 360, 375, 390, 393 and 430 widths; score 0 and 100.
- Morning, afternoon and evening greetings with short, long and accented names.
- Ten-second mobile shader clock advanced about 10.09 seconds; screenshots
  recorded real evolving material. Reduced-motion fallback passed.
- Score prompt and bottom Novus access, Spaces sheet, task/habit PATCH contracts,
  completed habit state, Tasks navigation and renderer unmount passed.
- Simulated 34px bottom safe area: final action remains above navigation.
- Desktop `stage1l-desktop.png` compared with Stage 1K. Exact console bounds and
  all measured region geometry match; only live date/greeting differ. Desktop
  shader branch, materials and layout unchanged. Existing desktop QA passed.
- TypeScript and production build pass. Existing dynamic-route build diagnostics
  remain outside scope. Browser page errors: none.
- Tests are local intercepted fixtures, not writes to production data or proof
  of live AI behavior. Physical iOS/Safari hardware was not tested.

No actionable P0/P1/P2 findings remain after the follow-up grid correction.
Remaining target differences are intentional: canonical liquid, truthful state,
shorter contextual copy, current navigation order, and real phone-height limits.

final result: passed

## Stage 1M — canonical intelligence surface, 2026-09-19

Scope: desktop/mobile Novus only. Desktop Now and mobile Now remain locked.
Frontend/image-to-code guidance was used for reference comparison and iteration;
the user's explicit requirement to reuse the real-time canonical material takes
precedence over generating static artwork or exploring another visual identity.

### Source and comparison evidence

- Target: second phone in `.golden-reference-desktop-final-comparison.png`.
  Original board is 3360 x 945; source mockup occupies its left 1680 x 945.
  App content crop (1410,210)-(1638,740), 228 x 530, normalized to 390px width
  with aspect ratio preserved. Bezel/status chrome excluded. Target has a taller
  content ratio and older example copy; pixel equivalence is not claimed.
- Material/typography: locked Stage 1K/1L Now and existing OpticalSurface.
- Implementation: `artifacts/visual-qa/stage1m-final-desktop-idle.png` at
  1440 x 1000; phone captures `stage1m-final-mobile-{360,390,430}.png` at
  360 x 800, 390 x 844, 430 x 932, CSS pixels/DPR 1.
- Combined target comparison: `stage1m-final-mobile-390-compare.png`.
  Phone-scale text, prompt edges and composer are directly legible in this view.
- Focused state evidence: `stage1m-final-desktop-focus.png`,
  `stage1m-final-desktop-response.png`, `stage1m-final-desktop-long-bottom.png`,
  `stage1m-final-desktop-confirm.png`, `stage1m-final-desktop-executing.png`,
  `stage1m-final-desktop-success.png`, `stage1m-final-desktop-action-failed.png`,
  `stage1m-final-desktop-error.png`, `stage1m-final-mobile-confirm.png`,
  `stage1m-final-mobile-long.png`, `stage1m-final-mobile-keyboard-sized.png`.
- Locked-surface comparisons, same fixture and viewport:
  `stage1m-final-now-desktop-compare.png`, `stage1m-final-now-390-compare.png`.
  Composition, type, materials and navigation remain unchanged. Minor liquid
  frame differences are expected from its live clock. Shader source is unchanged.

### Findings and iteration history

1. Baseline (`stage1m-before-*`): older wave Core, generic message bubbles,
   one-line input and hidden action results. Replaced with shared canonical
   renderer, editorial response layout, multiline composer, explicit results.
2. `stage1m-01/02`: decorative field/transformed extent increased panel scroll
   width. Confined the field to the panel; state scale now occurs inside its
   clipped wrapper. Long response/code no longer widens the panel.
3. `stage1m-03`: existing mobile renderer CSS hid the intelligence field.
   Added an intelligence-scoped display rule; no change to Now selectors.
   Prompt block sat too low; moved it closer to the mobile heading.
4. `stage1m-04`: focus on the modal container showed a browser outline and
   prompts lacked edge definition. Suppressed only the container outline,
   retained visible control focus, strengthened optical edge pickup and mobile
   prompt text/tap height. Final captures above verify these corrections.
5. QA fixture correction: Tasks API returns an array, not `{tasks: []}`.
   Fixed the harness response shape, then reran navigation and all suites.
   No production Tasks change was needed or made.

### Required fidelity surfaces

- Typography: existing Bricolage display and Inter UI, measured mobile heading
  42px, prompt 13px, prose 14px, textarea 16px to avoid mobile focus zoom.
  Technical labels are subordinate to readable content; long strings wrap.
- Spacing: 600px desktop layer, full-width mobile; 44px controls, 64px phone
  prompts, one content scroller and a separate safe-area-aware composer.
  Reference hierarchy is retained; heading copy and no redundant bottom nav
  inside the full-screen dialog are intentional Stage 1M choices.
- Tokens: obsidian, silver/ice, smoked optical glass. Slightly deeper surface
  with a controlled 3px dimmed underlay. Quiet failure color, no green confetti.
- Imagery: supplied canonical maps and unchanged procedural shader, not the
  older Core/wave implementation. One active Now/intelligence liquid loop;
  secondary atmosphere pauses while Novus is open. Reduced-motion fallback
  retains the supplied material. State changes gently alter timing/illumination.
- Content: route-based suggestions make no fabricated claims. "From Tasks"
  describes invocation context, not a new backend context contract. Responses,
  result summaries and confirmations come from the existing API. No fake metrics.

### Engineering and interaction evidence

- `npx tsc --noEmit` and `npx next build` pass. Existing metadataBase and dynamic
  route diagnostics remain. No schema, auth, AI provider or action API changes.
- `scripts/intelligence-qa.cjs`: idle/focus/thinking/completed, long Markdown,
  safe links/no raw HTML or remote images, confirmation/cancellation, execution,
  explicit action success/failure, HTTP failure recovery, 3 phone widths,
  safe area, smaller keyboard-sized viewport, reduced motion, focus containment,
  Escape/shortcut close, renderer resumption and Tasks-context invocation pass.
- Ten-second shader-clock progression verified with screenshots, not inferred
  from a single still. Existing API is non-streaming JSON; no fake stream added.
- `scripts/intelligence-touch-qa.cjs`: actual coarse-pointer Chrome emulation,
  no keyboard autofocus on open, prompt submission, Enter inserts newline,
  send submits multiline text and close restores focus. No console/page errors.
- Desktop Now suite passes with WebGL and no console/page errors.
- Mobile Now suite passes at six sizes, including all entry points, fixture
  task/habit mutation contracts and long names/titles. No console/page errors.
- New Markdown dependencies are locked in package-lock.json. Installation
  reported repository dependency advisories; broad dependency/security upgrades
  are outside this visual stage and were not attempted.

### Limits / follow-up

State tests use local intercepted API responses, including destructive action
fixtures. No production account data was created/deleted to test UI. This
verifies request contracts and rendering, not live provider answer quality.
Physical iOS/Safari and a physical soft keyboard were not tested. Keyboard
resilience uses VisualViewport and an emulated reduced-height viewport.
The existing non-streaming API has no streaming state to exercise.

No actionable P0/P1/P2 visual findings remain after the documented corrections.
Reference copy, lower liquid composition and current full-screen mobile
architecture are intentional; this is not a claim of pixel-identical mock art.

final result: passed

# Novus desktop Now instrumentation — screenshot reconstruction QA

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

# Novus desktop Now instrumentation — screenshot reconstruction QA

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

final result: passed

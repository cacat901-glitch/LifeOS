# Novus desktop Now hero — target reconstruction QA

## Comparison target

- Source visual truth: `C:\Users\Ducky\AppData\Local\Temp\codex-clipboard-7cd8ef85-c148-46af-b228-780f58030cd8.png`
- Source pixels: 1672 × 941, DPR-equivalent 1
- Browser-rendered implementation: `G:\Novus\.hero-qa-implementation.png`
- Implementation pixels / CSS viewport: 1672 × 941 at DPR 1
- Combined full-view comparison: `G:\Novus\.hero-qa-comparison.png`
- Focused motion captures: `G:\Novus\.hero-motion-a.png` and `G:\Novus\.hero-motion-b.png`, each 1480 × 270
- State: desktop Now, dark theme, truthful zero-data/empty state matching the target's visible value family. The deterministic QA harness was browser-only and removed before the final build.

The source is a 1672 × 941 promotional board whose desktop application occupies a narrower embedded frame and includes the explicitly excluded permanent sidebar. The implementation uses the same 1672 × 941 browser viewport, preserves Novus's top navigation, and compares the app-owned hero at its actual wider desktop frame. The combined comparison therefore judges composition, material, typography, and hierarchy without treating the missing sidebar or promotional phone renders as defects.

## Findings

No actionable P0, P1, or P2 findings remain in the scoped desktop Now hero.

- [P3] The implementation's central crest is slightly more luminous than the frozen source frame.
  - Location: desktop Now hero, center liquid crest.
  - Evidence: the source retains a little more internal dark translucency; the implementation reaches a brighter silver-white peak during its live light cycle.
  - Classification: acceptable live-state variance. The crest remains readable, does not obscure copy, and moves through dimmer states during the animation.
- [P3] The implementation hero is wider because the permanent sidebar and promotional phone area are intentionally absent.
  - Location: hero horizontal proportions.
  - Evidence: source desktop content is embedded in a narrower poster frame; implementation uses the product's 1480 px desktop content width.
  - Classification: required architectural translation, not target drift.

## Required fidelity surfaces

- Fonts and typography: passed. The real Novus sans/mono system is preserved. Greeting size, two-line wrap, weight, line height, technical date/Live labels, supporting-copy width, and optical contrast closely follow the target hierarchy. Dynamic greeting and user name remain real product content.
- Spacing and layout rhythm: passed. Greeting anchors left; the liquid dominates center/right; the Life Score sits within the same field. The 270 px hero height and internal offsets reproduce the target's compact cinematic band without altering lower modules.
- Colors and visual tokens: passed. The hero shifts from cyan-heavy procedural rendering to obsidian, silver-white, pearl, and restrained pale-blue edges. Localized smoked-glass darkening protects text while shared haze connects copy, material, and score.
- Image quality and asset fidelity: passed. The target-owned liquid art direction is represented by a dedicated production raster plate at `public/media/novus-hero-liquid.png`, with clean alpha and no checkerboard or rectangular background. The plate is rendered inside a real-time Canvas system with geometry breathing, affine deformation, dual material layers, and traveling internal light. It is not displayed as a static primary hero.
- Copy and content: passed. No product data was fabricated. Life Score and grade remain wired to the real dashboard response; supporting copy remains the real briefing or truthful generated summary.
- Accessibility and interaction: passed for scope. Hero text remains readable against the darkest field, the score retains its text label, motion respects the existing reduced-motion fallback, and the hero introduces no interactive obstruction or focus-order change.

## Motion evidence

- The hero was left idle for 10 seconds at 1672 × 941.
- The two 1480 × 270 hero captures changed across the liquid region with mean absolute RGB differences of approximately 6.32 / 6.23 / 6.32 and RMS differences of approximately 17.79 / 17.43 / 17.46.
- The changed-pixel bounding box was `(415, 0)–(1480, 270)`, matching the liquid/dial field while the left copy remained visually stable.
- Motion includes slow scale deformation, shear, drift, dual-layer refraction, and a traveling source-masked highlight.

## Comparison history

### Iteration 1 — blocked

- [P1] The first texture-deformation implementation exposed bright vertical ribs at every canvas slice.
- Evidence: first browser capture showed evenly spaced white bars across the central crest, absent from the target.
- Fix: removed the slice-based primary compositor and replaced it with smooth whole-material affine deformation plus layered refraction and a source-masked traveling light.
- Post-fix evidence: `G:\Novus\.hero-qa-implementation.png` and `G:\Novus\.hero-qa-comparison.png` show a continuous liquid surface with no quantization artifacts.

### Iteration 2 — passed

- Rechecked the full 1672 × 941 view and focused 1480 × 270 hero.
- No actionable P0/P1/P2 mismatch remained in the requested hero scope.
- Framework overlay check: OK.
- Browser console: no error or warning entries during the comparison state.
- Real data wiring and mobile composition were not changed.

## Implementation checklist

- [x] Broad silver-white liquid plate matches the target subject and silhouette family.
- [x] Default hero remains genuinely animated.
- [x] Life Score instrument is integrated into the liquid field.
- [x] Smoked-glass environment and localized text darkening match target hierarchy.
- [x] Desktop-only renderer prevents mobile and Novus-panel drift.
- [x] TypeScript and production build pass.

## Follow-up polish

- [P3] A future WebGL mesh could add finer localized displacement if the product later standardizes a GPU dependency budget; the current Canvas implementation already satisfies the scoped visual and motion criteria without adding a rendering framework.

final result: passed

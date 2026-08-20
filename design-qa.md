# Novus 2.0 corrective visual-convergence QA

- Source visual truth: `C:\Users\Ducky\AppData\Local\Temp\codex-clipboard-4b675b62-cfb8-462f-b3cc-bd1e681778dc.png`
- Source pixels: 1672 × 941
- Primary implementation: `G:\Novus\.novus2-final-now-b.png`
- Implementation pixels / CSS viewport: 1680 × 945 at device scale factor 1
- Normalization: source scaled to 1680 × 945 for the combined comparison; no browser chrome included
- Combined full-view evidence: `G:\Novus\.novus2-reference-comparison.png`
- Focused implementation evidence: `G:\Novus\.novus2-novus-panel.png`, `G:\Novus\.novus2-command.png`, `G:\Novus\.novus2-habits.png`, `G:\Novus\.novus2-statistics.png`
- Mobile evidence: `G:\Novus\.novus2-now-mobile.png`, `G:\Novus\.novus2-habits-mobile.png` at 393 × 852 CSS px / DPR 1
- State: authenticated dark theme with deterministic QA responses matching the existing Novus data schema; no test values were added to product code

## Findings

No actionable P0, P1, or P2 findings remain after the comparison iterations below.

- [P3] The reference’s concept frame remains denser than a low-data real account.
  - Location: Now / secondary data Spaces.
  - Evidence: the source concept fills every instrument with mature data, while the implementation preserves real empty and low-data states.
  - Classification: acceptable product constraint. The implementation does not fabricate values to fill visual space.
- [P3] The procedural Core is deliberately less photographic than the concept render.
  - Location: `NovusCore` on Now and the Novus panel.
  - Evidence: the source is a pre-rendered liquid illustration; the implementation is a real-time Canvas system with evolving geometry, refractive bands, light propagation, and live filaments.
  - Classification: acceptable technical translation required by the brief. The static generated asset is used only for reduced-motion fallback.

## Required fidelity surfaces

- Fonts and typography: display/body/mono hierarchy is consistent with the reference family; strong numerical typography and micro-label tracking are present. No clipping or unintended wrapping was observed at 1680, 1440, or 393 px.
- Spacing and layout rhythm: the current Novus top/bottom navigation model is preserved intentionally. Hero, instrument, Space header, and mobile spacing remain stable. No persistent controls are obscured.
- Colors and visual tokens: obsidian, ice white, cyan, and restrained cobalt are consistent across base field, instruments, active controls, intelligence overlays, and data traces. No magenta drift was introduced.
- Image quality and asset fidelity: the default Core is procedural Canvas, not raster animation. The existing transparent Core image is hidden during capable-device operation and displayed only for reduced motion. Lucide remains the control icon family.
- Copy and content: authenticated Space copy is concise and purpose-specific. Data instruments use only API state or honest empty states.

## Motion and behavior evidence

- Core remained visibly active over a 10-second idle observation.
- Sampled Core canvas checksum changed from `243281` to `241859` without interaction, confirming evolving rendered pixels rather than a translated static image.
- Ambient field, Core, and instrument specular loops use separate slow choreography layers.
- Canvas resolution is DPR-capped, complexity is reduced on coarse/mobile devices, animation pauses for hidden tabs and off-screen Core instances, and resources are cleaned up on unmount.
- Reduced-motion mode disables real-time canvases and uses the static Core fallback.
- Primary controls tested: desktop navigation, mobile navigation, Spaces surfaces, Novus open/close, Command open, and interactive Space controls.
- Framework overlay check: `OK`. Meaningful interactive accessibility snapshots were present.

## Comparison history

### Iteration 1 — blocked

- P1: Core did not render in the browser because a shared `.novus-core { position: relative }` rule overrode the absolute hero placement and collapsed its canvas to one pixel.
- Fix: removed the conflicting position rule and verified a 649 × 558 rendered Core canvas.
- Post-fix evidence: `G:\Novus\.novus2-corrective-now-v2.png`.

### Iteration 2 — blocked

- P2: Core read as thin wire contours and the continuous environmental field was too restrained relative to the reference.
- Fix: added broad evolving refractive bands, stronger internal aura, brighter segmented highlights, richer route-aware ambient filaments, and moving instrument specular light.
- Post-fix evidence: `G:\Novus\.novus2-final-now-b.png` and `G:\Novus\.novus2-reference-comparison.png`.

### Iteration 3 — passed

- Verified final Now, Tasks, Habits, Goals, Journal, Finance, Statistics, Novus, Command, mobile Now, and mobile Habits.
- No actionable P0/P1/P2 visual, responsive, or interaction findings remained.

## Follow-up polish

- When accounts contain longer temporal history, Statistics and Finance will naturally demonstrate more signal traces without changing the visual system.
- Future stages can increase Core material complexity with WebGL shaders if the product later standardizes a GPU capability budget; this pass intentionally avoids a new rendering dependency.

final result: passed

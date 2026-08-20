# Novus golden-reference implementation QA

- Source visual truth: `C:\Users\Ducky\AppData\Local\Temp\codex-clipboard-e1d11835-a22e-41bb-b6c7-723e1bed495d.png`
- Source pixels: 1680 × 945
- Desktop implementation: `G:\Novus\.golden-now-desktop-final.png`
- Desktop pixels / CSS viewport: 1680 × 945 at device scale factor 1
- Desktop combined evidence: `G:\Novus\.golden-reference-desktop-final-comparison.png`
- Mobile implementation: `G:\Novus\.golden-now-mobile-final.png`
- Mobile pixels / CSS viewport: 393 × 852 at device scale factor 1
- Mobile normalized evidence: `G:\Novus\.golden-reference-mobile-final-comparison.png`
- Novus intelligence evidence: `G:\Novus\.golden-novus-desktop-final.png` and `G:\Novus\.golden-novus-mobile-02.png`
- State: authenticated dark theme with deterministic browser-routed QA responses matching the existing dashboard and intelligence API schemas. QA values were not added to product code.
- Intentional constraints: the target’s permanent left sidebar is translated into the existing top navigation and Spaces architecture; poster-only marketing copy, surrounding device renders, and device bezels are not authenticated app content.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] Live liquid material is slightly more legible and less optically chaotic than the still render.
  - Location: desktop Now hero and Novus intelligence background.
  - Evidence: the target uses a single photographic-quality still; the implementation uses broad procedural sheets, sculptural bezier folds, traveling highlights, filaments, particles, and evolving refraction.
  - Classification: acceptable live-software translation. The composition, direction, volume, glow, and relationship to the radial instrument match the target; motion remains readable over real content.
- [P3] Real activity and attention content changes exact line wrapping.
  - Location: Today, Up Next, Recent Activity, and mobile Attention.
  - Evidence: the target contains concept values and an empty-account state; the implementation renders truthful account state.
  - Classification: required product constraint. No data was fabricated for visual filling.

## Required fidelity surfaces

- Fonts and typography: the greeting, intelligence headline, numerical instruments, supporting copy, and technical labels now follow the target scale and hierarchy. Mobile greeting scale was corrected in the final comparison. No clipping or unintended desktop wrapping remains.
- Spacing and layout rhythm: desktop uses the target’s compact hero, five-instrument row, and three-module lower region rather than the previous editorial scroll. Mobile uses a dedicated target-shaped stack instead of shrinking desktop. Panel heights, gaps, and above-the-fold density align closely with the reference.
- Colors and visual tokens: obsidian, ice white, pale cyan, restrained cobalt, smoked glass, soft bloom, and variable edge luminance match the source. Panels transmit the moving field rather than reading as opaque black cards.
- Image quality and asset fidelity: the generated liquid image is reduced-motion fallback only. Capable devices render the primary hero, embedded panel flow, and ambient field procedurally. The supplied mockup’s woven liquid mark was recreated as a real image asset rather than a text-glyph substitute.
- Copy and content: all metrics, completion values, streaks, task/habit rows, activity, and Novus actions are real API-backed values or honest empty states. Poster marketing copy was not introduced into the authenticated product.
- Icons: existing functional control icons remain from the product icon library; the custom Novus brand mark is a dedicated asset.
- Responsive behavior: 1680 × 945 desktop and 393 × 852 mobile render without overflow or hidden persistent navigation. Mobile score, Ask Novus, Attention, and bottom navigation follow the target phone hierarchy.

## Motion and behavior evidence

- The visible mobile Core canvas checksum changed from `427948` to `425112` over ten seconds without interaction.
- Core motion uses deforming sheets, changing folds, traveling highlights, internal filaments, and particles rather than rotating or translating a static raster.
- Ambient material continues beneath lower instruments and through the bottom field.
- Canvas DPR is capped; coarse devices use reduced layers and frame rate; page visibility and intersection observers pause work; observers and animation frames are cleaned up on unmount.
- Reduced-motion browser verification returned `{"core":"none","fallback":"block","ambient":"none"}`.
- Primary interactions tested: mobile and desktop navigation, Novus open/close, suggestion submission, real conversation transition, input state, and notification/command controls.
- Browser framework overlay check returned `OK`.
- Browser console contained no runtime exceptions. Development-only messages were React DevTools/Fast Refresh notices.
- Axe WCAG 2 A/AA scan: 0 violations; one contrast check remained incomplete because animated gradients prevent automated background calculation.

## Comparison history

### Iteration 1 — blocked

- P1: the original implementation was an oversized scrolling dashboard with a wireframe oval and did not reproduce the target composition.
- Fix: replaced it with a bounded hero, compact five-instrument band, three lower instruments, and dedicated mobile composition.
- Evidence: `G:\Novus\.golden-now-desktop-01.png` and `G:\Novus\.golden-now-mobile-01.png`.

### Iteration 2 — blocked

- P1: the procedural hero still read as a thin, symmetrical line wave; panels did not visibly share one environment.
- Fix: added broad translucent sheets, stronger diffusion, an environment renderer behind lower surfaces, and radial instrument integration.
- Evidence: `G:\Novus\.golden-now-desktop-03.png`.

### Iteration 3 — blocked

- P2: mobile showed a hard canvas boundary, the score surface lacked liquid continuity, and active bottom navigation did not match the target phone treatment.
- Fix: masked the mobile flow, embedded a live liquid layer in the score instrument, and added the target-like active glass navigation state.
- Evidence: `G:\Novus\.golden-reference-mobile-final-comparison.png`.

### Iteration 4 — passed

- Added sculptural multi-bezier folds, brighter internal cores, concentric dial depth, and stronger lower flow.
- Compared the final desktop and mobile captures directly against the target at normalized sizes.
- No actionable P0/P1/P2 visual, responsive, interaction, or accessibility findings remain.

## Follow-up polish

- P3 only: if a future stage standardizes a WebGL capability budget, the same composition could gain additional physical refraction without changing layout or art direction.

final result: passed

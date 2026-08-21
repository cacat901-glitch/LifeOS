# Novus desktop Now console — target reconstruction QA

## Comparison target

- Source visual truth: `C:\Users\Ducky\AppData\Local\Temp\codex-clipboard-7cd8ef85-c148-46af-b228-780f58030cd8.png`
- Browser implementation capture: `G:\Novus\.console-qa-full.png`
- Combined side-by-side comparison: `G:\Novus\.console-qa-comparison.png`
- Ten-second motion captures: `G:\Novus\.console-qa-first.png` and `G:\Novus\.console-qa-motion-10s.png`
- State: desktop Now with truthful zero data. The local QA-only authentication/data harness was removed before the production build.

The target is a promotional board whose desktop console includes the explicitly excluded sidebar. The implementation preserves Novus top navigation and uses the available console width; comparison therefore focuses on the requested material, density, liquid continuity, and instrument hierarchy.

## Findings

No actionable P0, P1, or P2 findings remain in the scoped metric and lower-console pass.

- [P3] Empty-state modules are necessarily less text-dense than the populated target.
  - Classification: truthful-data variance. Dormant signal axes, illumination, and an explicit waiting state prevent large visually blank panels without fabricating activity.
- [P3] The implementation's lower liquid field reaches a brighter phase during its animation cycle than the frozen target frame.
  - Classification: acceptable live-state variance. The smoked-glass diffusion maintains content contrast and the field moves through darker phases.

## Required fidelity surfaces

- Instrument material: passed. Metric and lower surfaces now use translucent smoked material, local diffusion, inner darkness, partial specular edges, and non-uniform illumination instead of a uniform one-pixel card border.
- Transparency and continuity: passed. A single console-level Canvas field extends from the hero boundary through the metric row, lower modules, and bottom closure. It remains visibly continuous through the glass.
- Density: passed. Metric gaps and padding were tightened, the lower console height was reduced, and dormant states use their available footprint as instrumentation.
- Mini visualizations: passed. Life Score and Momentum retain real signal traces; Tasks retains a truthful seven-position activity instrument; Habits and Progress retain real completion axes. Zero values render as dormant, not fabricated, signals.
- Lower modules: passed. Today, Up Next, and Recent Activity share compact row rhythm and distinct local light pickup. Empty states contain inactive axes, scan markers, and waiting labels instead of unstructured blank space.
- Outer shell: passed. The console has a thin, varying optical edge and internal reflection without a thick frame or uniform outline.
- Hero scope: passed. No hero composition, typography, proportions, or liquid direction was redesigned.

## Motion evidence

- The browser-rendered Now console was left idle for 10 seconds.
- 569,263 of 911,468 viewport pixels changed between captures.
- Mean absolute RGB differences were approximately 4.88 / 4.78 / 4.88.
- The changed-pixel bounding box covered the rendered liquid environment while content remained stable.
- The console uses one shared loop with slow drift, deformation, layered refraction, bottom bloom, visibility pausing, reduced-motion fallback, and capped DPR.

## Implementation checklist

- [x] Five compact instruments read as smoked optical glass.
- [x] Edges vary in intensity and respond to local liquid light.
- [x] Liquid is continuous hero → metrics → lower modules → bottom.
- [x] Lower modules remain visually designed with zero data.
- [x] No fake product data was introduced.
- [x] No secondary Space or mobile design was changed.
- [x] Target and implementation were judged together in one comparison image.
- [x] Ten-second motion criterion passed.

final result: passed

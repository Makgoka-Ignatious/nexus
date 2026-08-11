# Fix click ripples on desktop + restore model picker icon

## 1. Model picker icon
Change the model selector icon in the top bar back to the previous chip/processor icon (`Cpu`) instead of `BrainCircuit`. The AI request counter keeps its current icon.

## 2. Ripples not visible on desktop
The ripple animation is drawn on the background canvas, which sits behind the app shell. On a wide desktop layout, the sidebar plus the large opaque panel/card surfaces cover almost the whole viewport, so a click lands on top of an opaque surface and the ripple underneath is never seen. On narrow screens more of the backdrop is exposed, which is why it looks like it works on phone/laptop.

Fix: add a second, non-interactive ripple overlay canvas rendered above the app content (pointer-events none, top layer). Clicks emit the pulse on that overlay so the ring is visible wherever it is clicked, including over cards and panels. The background network canvas keeps its cursor glow and node lighting as-is; overlay rings use the signal colour at low alpha so they read as a subtle pulse rather than covering UI.

## Technical notes
- `src/components/nexus/TopBar.tsx`: swap `BrainCircuit` back to `Cpu`.
- New `src/components/nexus/ClickPulse.tsx`: fixed full-screen canvas, `pointer-events-none`, high z-index, listens to `pointerdown` in capture phase, draws expanding signal-coloured rings with fade, respects `prefers-reduced-motion`, dedupes duplicate pointer/mouse events.
- `src/routes/index.tsx`: mount `<ClickPulse />` once alongside `NetworkBackground`.
- Remove the now-redundant `mousedown`/`pointerdown` pulse handling from `NetworkBackground` (keep node lighting reacting to overlay pulses out of scope) to avoid double rings.

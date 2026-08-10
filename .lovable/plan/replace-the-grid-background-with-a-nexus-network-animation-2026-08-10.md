# Replace the grid background with a Nexus network animation

## Why

The 20px grid never reads well in either theme and fights the content. Nexus is "Think. Link. Deliver." so the backdrop should be a slow, living network of nodes and links, not a static grid.

## What you'll see

- A calm field of small nodes drifting very slowly across the page.
- Faint lines that appear between nodes when they come close, forming and dissolving constantly (a "linking" effect).
- Near the cursor, nodes gently lean in and their links brighten in the primary blue, so movement feels responsive without being distracting.
- On click, a soft signal pulse travels outward and briefly lights up the nodes it passes.
- Colors come from the existing Urban Grid tokens, so it adapts to light and dark automatically.
- Motion is turned off (static node field only) for visitors with reduced-motion enabled, and node count scales down on small screens for performance.

## Technical notes

- Rewrite `src/components/nexus/GridBackground.tsx` as a canvas-based `NetworkBackground` (single `requestAnimationFrame` loop, resize + devicePixelRatio handling, cleanup on unmount). Keep the file/component name usable by `src/routes/index.tsx` or rename and update the one import there.
- Node positions in a lightweight particle array; link drawn when distance < threshold with opacity scaled by distance. Cursor tracked via pointer events, pulses stored as expanding radii.
- Colors read from CSS custom properties (`--foreground`, `--primary`, `--signal`) at draw time so theme switches apply.
- Remove now-unused `grid-lines`, `grid-halo`, `grid-ripple`, and `grid-breathe` rules from `src/styles.css`.
- No changes to panels, AI functions, or layout.

# Revert the click ripple effect

Undo the top-layer click ripple overlay and restore the previous behaviour, where a click sends a signal pulse through the background network (nodes light up as the ring passes).

## Changes

1. Delete `src/components/nexus/ClickPulse.tsx` (the overlay canvas above the app).
2. Remove the `<ClickPulse />` mount and its import from `src/routes/index.tsx`.
3. Keep the existing pulse handling in `src/components/nexus/NetworkBackground.tsx` — it already listens for `pointerdown`/`mousedown` and lights up nodes as the pulse passes, which is the effect being restored. No change needed there.

The model picker icon stays as-is (`Cpu`), since that part of the last change was requested separately.

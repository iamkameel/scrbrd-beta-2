---
description: Visual polishing for live scoring UI
---
1. Update `src/components/match/LiveScoreboard.tsx` to use a gradient background, glass‑morphism card, larger typography, and an animated run‑rate display.
2. Update `src/components/ui/button.tsx` to apply a premium color palette, hover glow, and larger touch targets.
3. Update `src/components/match/ScoreOverlay.tsx` to add a backdrop‑blur container and entrance animation for the modal.
4. Wrap `src/components/charts/WagonWheel.tsx` and `src/components/charts/PitchMap.tsx` in a glass‑morphism card with optional tooltip styling.
5. Update the header in `src/app/matches/[id]/manage/client.tsx` to use gradient text for the title and a pulsing "LIVE" badge.
6. Adjust the grid layout in `src/app/matches/[id]/manage/client.tsx` to increase gaps and add a subtle patterned background.
7. Add utility CSS classes for gradient text, pulse animation, and glass‑morphism to the global stylesheet (`src/app/globals.css`).
8. Add a tiny SVG pattern file at `public/images/pattern.svg` for the background texture.
9. Run `npm run dev` locally to preview the visual changes and verify no TypeScript errors.

## Status

Completed on 2025-12-05. All steps executed and build verified.

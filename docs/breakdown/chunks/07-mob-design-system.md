# Mobile design system

| | |
|---|---|
| ID | `mob-design-system` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 2 |
| Depends on | `mob-scaffolding` (project and module structure) |
| Unlocks | `mob-auth`, `mob-board-list`, `mob-board-view` |

## Goal
Theme, tokens (colors, typography, spacing, light/dark) and base components shared by all mobile screens.

## In scope
- Theme: colors, typography, spacing, shapes, light/dark
- Base components (buttons, text fields, dialogs/sheets, top bars, list items, chips for labels, loading/error/empty states)
- Window-size helpers for phone vs. tablet layouts
- Previews

## Out of scope
- Feature screens (feature chunks)

## Builds on
- `mob-scaffolding`: project and module structure

## Provides
- Theme and components every mobile screen uses
- Adaptive layout primitives for board view and card detail

## Done when
- Components exist with previews in light/dark and are used by a sample screen on both platforms

## Decisions from the breakdown
- Compose Multiplatform, one shared codebase incl. UI, targets Android + iOS; phone and tablet layouts in v1; no store release in this plan.

## Open questions for the deep-dive session
- Is there a design (Figma) or is the look defined in this chunk?
- Material 3 as base vs. custom
- Shared design tokens with web?
- Dark mode in v1?

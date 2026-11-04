# Mobile design system

| | |
|---|---|
| ID | `mob-design-system` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 2 |
| Depends on | `mob-scaffolding` (project and module structure) |
| Unlocks | `mob-auth-ui`, `mob-board-list-ui`, `mob-board-view-ui`, `mob-card-detail-ui`, `mob-import-export-ui`, `mob-labels-ui` |

## Goal
Theme, tokens (colors, typography, spacing, light/dark), base components incl. label chips, and adaptive layout helpers for phone and tablet.

## In scope
- Theme: colors, typography, spacing, shapes, light/dark
- Base components (buttons, text fields, dialogs/sheets, top bars, list items, label chips, loading/error/empty states)
- Window-size helpers for phone vs. tablet layouts
- Previews

## Out of scope
- Feature screens (UI chunks)

## Builds on
- `mob-scaffolding`: project and module structure
- Design exploration in `docs/design/`

## Provides
- Theme, components and adaptive layout primitives every mobile UI chunk uses

## Done when
- Components exist with light/dark previews and are used by a sample screen on both platforms

## Decisions from the breakdown
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.

## Open questions for the deep-dive session
- Material 3 as base vs. custom
- Shared tokens with web?
- Label palette mapping to colors

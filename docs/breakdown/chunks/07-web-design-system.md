# Web design system

| | |
|---|---|
| ID | `web-design-system` |
| Area | Web |
| Size | M |
| Wave | 2 |
| Depends on | `web-scaffolding` (project, styling setup) |
| Unlocks | `web-auth-ui`, `web-board-list-ui`, `web-board-view-ui`, `web-card-detail-ui`, `web-import-export-ui`, `web-labels-ui` |

## Goal
Tokens and responsive base components (buttons, inputs, dialogs, menus, label chips, layout primitives) for phone, tablet and desktop widths.

## In scope
- Tokens (color, type, spacing, breakpoints)
- Responsive base components (buttons, inputs, dialogs, side panels, menus, label chips, toasts, loading/empty/error states)
- Layout primitives for phone, tablet and desktop
- Component previews

## Out of scope
- Feature screens (UI chunks)

## Builds on
- `web-scaffolding`: project, styling setup
- Design exploration in `docs/design/`

## Provides
- Components and breakpoints every web UI chunk uses

## Done when
- Components render correctly from phone to desktop widths and are previewable

## Decisions from the breakdown
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.

## Open questions for the deep-dive session
- Headless component library vs. fully custom
- Shared tokens with mobile?
- Storybook or lighter preview setup

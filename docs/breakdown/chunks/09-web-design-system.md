# Web design system

| | |
|---|---|
| ID | `web-design-system` |
| Area | Web |
| Size | M |
| Wave | 2 |
| Depends on | `web-scaffolding` (project, styling setup) |
| Unlocks | `web-auth`, `web-board-list`, `web-board-view` |

## Goal
Tokens and responsive base components (buttons, inputs, dialogs, menus, layout primitives) for phone, tablet and desktop widths.

## In scope
- Tokens (color, type, spacing, breakpoints)
- Responsive base components (buttons, inputs, dialogs, drawers/side panels, menus, chips, toasts, loading/empty/error states)
- Layout primitives for phone, tablet and desktop
- Component previews/docs

## Out of scope
- Feature screens

## Builds on
- `web-scaffolding`: project, styling setup

## Provides
- Components and breakpoints every web page uses

## Done when
- Components render correctly from phone to desktop widths and are previewable

## Decisions from the breakdown
- React + TypeScript, fully responsive (phone to desktop); served as a static build from the same VPS as the backend.

## Open questions for the deep-dive session
- Existing design (Figma)?
- Component library base (headless UI lib vs. fully custom)
- Shared tokens with mobile?
- Dark mode in v1?
- Storybook or lighter preview setup

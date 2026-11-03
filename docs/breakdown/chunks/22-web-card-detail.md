# Web card detail & editing

| | |
|---|---|
| ID | `web-card-detail` |
| Area | Web |
| Size | M |
| Wave | 4 |
| Depends on | `web-board-view` (board page to open cards from) |
| Unlocks | `web-labels` |

## Goal
Create, view, edit and delete cards; presentation adapts to screen size (e.g. sheet on phones, dialog/side panel on wide screens).

## In scope
- Create card in a column
- Card detail with edit and delete
- Responsive presentation (full-screen sheet on phones, dialog/side panel on desktop)
- Deep link to a card (URL)?

## Out of scope
- Labels (`web-labels`)
- Moving cards (`web-card-dnd`)

## Builds on
- `web-board-view`: board page to open cards from

## Provides
- Card editing surface that labels extend

## Done when
- Card create/edit/delete works from the board page against the fake API on all breakpoints

## Decisions from the breakdown
- Cards are Jira-ticket-like; fields from the contract.

## Open questions for the deep-dive session
- Routable card URLs
- Quick-add vs. full editor
- Description formatting

# Mobile card detail & editing

| | |
|---|---|
| ID | `mob-card-detail` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 4 |
| Depends on | `mob-board-view` (board screen to open cards from and refresh after edits) |
| Unlocks | `mob-labels` |

## Goal
Create, view, edit and delete cards; presentation adapts to screen size (e.g. sheet on phones, dialog/side panel on wide screens).

## In scope
- Create card in a column
- Card detail view
- Edit card fields, delete card
- Adaptive presentation (e.g. bottom sheet on phones, dialog/side pane on tablets)

## Out of scope
- Attaching labels (`mob-labels`)
- Moving cards (`mob-card-dnd`)

## Builds on
- `mob-board-view`: board screen to open cards from and refresh after edits

## Provides
- Card editing surface that labels extend

## Done when
- Card create/edit/delete works from the board view against the fake API on phone and tablet, both platforms

## Decisions from the breakdown
- Cards are Jira-ticket-like; fields beyond title/description/labels come from the contract.

## Open questions for the deep-dive session
- Inline quick-add vs. full editor for new cards
- Unsaved-changes handling
- Description formatting (plain text vs. markdown)

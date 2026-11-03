# Cardigan — Project Breakdown

> Initial plan created with Project Breakdown v2 on 2026-10-16. This is starting context for the chunk sessions, not a living spec. Each chunk session produces its own detailed documents.

## Vision
Cardigan is a Kanban app: each user creates private boards made of columns, and each column holds cards (Jira-ticket-like) that can carry user-defined labels. Cards are reordered by drag & drop, columns by move buttons, and a complete board can be exported to and imported from JSON. It ships as a Compose Multiplatform app for Android and iOS (phone + tablet) and a fully responsive React web app, backed by a custom Kotlin Spring Boot API.

## Scope of the first version
**In:** registration, login, logout (JWT access 15 min / refresh 30 days) · multiple boards → columns → cards (create, edit, delete) · user-defined labels attachable to cards · card reordering by drag & drop within and across columns · column reordering via move buttons · board export/import as JSON (one blocking request each) · client-side search & filter (text + labels) within the open board · intentional refresh · responsive web · phone + tablet layouts on mobile · automated deployment to a production VPS.

**Out:** email verification, forgot password, social login · board sharing / members · comments, file attachments · cross-board or server-side search · offline caching · real-time sync · staging environment · mobile store release (signing, listings) · importing other tools' formats.

## Tech stack
| Area | Choice | Why (main reason) | Alternatives considered |
|---|---|---|---|
| Backend | Kotlin + Spring Boot | User decision; Kotlin across backend and mobile | — |
| Database | PostgreSQL on Supabase (DB only) | User decision; managed relational DB | — |
| Auth | Custom JWT on the backend, 15-min access / 30-day refresh tokens | User decision; no dependency on Supabase Auth | Supabase Auth (rejected) |
| Mobile | Kotlin + Compose Multiplatform (Android + iOS, shared UI) | User decision; one codebase for both platforms | Two native apps (not considered) |
| Web | React + TypeScript, fully responsive | User decision | — |
| API style | REST with a written contract | Simple CRUD domain, two client stacks | — |
| Hosting | Self-managed VPS: backend + static web behind a reverse proxy, production only, CD pipeline | User decision; no cloud hoster | Separate static host for web; staging env (both rejected) |

## Areas
| Area | What it covers | Chunks |
|---|---|---|
| API Contract | REST contract, error model, export file format | `api-contract` |
| Backend | Spring Boot service: auth, boards, columns, cards, labels, import/export | `be-scaffolding`, `be-auth`, `be-boards`, `be-cards`, `be-labels`, `be-import-export` |
| Infrastructure | VPS, reverse proxy/TLS, secrets, Supabase connection, CD for backend + web | `infra-vps` |
| Mobile (CMP) | Android + iOS app, phone + tablet | `mob-scaffolding`, `mob-design-system`, `mob-fake-api`, `mob-auth`, `mob-board-list`, `mob-board-view`, `mob-card-detail`, `mob-card-dnd`, `mob-import-export`, `mob-labels`, `mob-search-filter`, `mob-integration` |
| Web | Responsive React app | `web-scaffolding`, `web-design-system`, `web-fake-api`, `web-auth`, `web-board-list`, `web-board-view`, `web-card-detail`, `web-card-dnd`, `web-import-export`, `web-labels`, `web-search-filter`, `web-integration` |

## Existing foundations
None — greenfield (the Cardigan folder was empty when the breakdown started).

## Structural approach
- The API contract is written first; the backend implements it and both clients mirror it in a fake API layer.
- Clients develop against their fake API layer and connect to the real backend in one final integration chunk per client. That is the only place client and backend meet.
- Client board features don't depend on client auth: they use a fake session, so auth and board work run in parallel.
- Boards are split per client into board list, board view (layout per screen size, column CRUD + move buttons) and card detail, so no chunk is larger than M.
- No offline cache and no real-time sync on any client: data is always loaded from the backend, refreshed intentionally.
- CI lives in each codebase's scaffolding chunk; CD to the VPS lives in `infra-vps`.

## Waves
| Wave | Chunks (parallelizable) |
|---|---|
| 1 | `api-contract` (API Contract, M) · `be-scaffolding` (Backend, M) · `mob-scaffolding` (Mobile (CMP), M) · `web-scaffolding` (Web, M) |
| 2 | `be-auth` (Backend, M) · `infra-vps` (Infrastructure, M) · `mob-design-system` (Mobile (CMP), M) · `mob-fake-api` (Mobile (CMP), M) · `web-design-system` (Web, M) · `web-fake-api` (Web, M) |
| 3 | `be-boards` (Backend, M) · `mob-auth` (Mobile (CMP), M) · `mob-board-list` (Mobile (CMP), S) · `mob-board-view` (Mobile (CMP), M) · `web-auth` (Web, M) · `web-board-list` (Web, S) · `web-board-view` (Web, M) |
| 4 | `be-cards` (Backend, M) · `mob-card-detail` (Mobile (CMP), M) · `mob-card-dnd` (Mobile (CMP), M) · `mob-import-export` (Mobile (CMP), M) · `web-card-detail` (Web, M) · `web-card-dnd` (Web, M) · `web-import-export` (Web, S) |
| 5 | `be-labels` (Backend, S) · `mob-labels` (Mobile (CMP), M) · `web-labels` (Web, M) |
| 6 | `be-import-export` (Backend, M) · `mob-search-filter` (Mobile (CMP), S) · `web-search-filter` (Web, S) |
| 7 | `mob-integration` (Mobile (CMP), M) · `web-integration` (Web, M) |

**Critical path:** `api-contract` → `mob-fake-api` → `mob-board-view` → `mob-card-detail` → `mob-labels` → `mob-search-filter` → `mob-integration` (the longest chain by size; delays here delay the project). The web chain is equally long, so web and mobile should be staffed in parallel.

## Chunk index
| # | Chunk | Area | Size | Wave | Depends on | Unlocks |
|---|---|---|---|---|---|---|
| 01 | [API contract](chunks/01-api-contract.md) | API Contract | M | 1 | — | `be-auth`, `mob-fake-api`, `web-fake-api` |
| 02 | [Backend scaffolding & architecture](chunks/02-be-scaffolding.md) | Backend | M | 1 | — | `be-auth`, `infra-vps` |
| 03 | [Mobile scaffolding & architecture](chunks/03-mob-scaffolding.md) | Mobile (CMP) | M | 1 | — | `mob-design-system`, `mob-fake-api` |
| 04 | [Web scaffolding & architecture](chunks/04-web-scaffolding.md) | Web | M | 1 | — | `infra-vps`, `web-design-system`, `web-fake-api` |
| 05 | [Backend authentication](chunks/05-be-auth.md) | Backend | M | 2 | `be-scaffolding`, `api-contract` | `be-boards` |
| 06 | [VPS infrastructure & deployment](chunks/06-infra-vps.md) | Infrastructure | M | 2 | `be-scaffolding`, `web-scaffolding` | `mob-integration`, `web-integration` |
| 07 | [Mobile design system](chunks/07-mob-design-system.md) | Mobile (CMP) | M | 2 | `mob-scaffolding` | `mob-auth`, `mob-board-list`, `mob-board-view` |
| 08 | [Mobile fake API layer](chunks/08-mob-fake-api.md) | Mobile (CMP) | M | 2 | `api-contract`, `mob-scaffolding` | `mob-auth`, `mob-board-list`, `mob-board-view` |
| 09 | [Web design system](chunks/09-web-design-system.md) | Web | M | 2 | `web-scaffolding` | `web-auth`, `web-board-list`, `web-board-view` |
| 10 | [Web fake API layer](chunks/10-web-fake-api.md) | Web | M | 2 | `api-contract`, `web-scaffolding` | `web-auth`, `web-board-list`, `web-board-view` |
| 11 | [Backend boards & columns](chunks/11-be-boards.md) | Backend | M | 3 | `be-auth` | `be-cards` |
| 12 | [Mobile authentication](chunks/12-mob-auth.md) | Mobile (CMP) | M | 3 | `mob-fake-api`, `mob-design-system` | `mob-integration` |
| 13 | [Mobile board list](chunks/13-mob-board-list.md) | Mobile (CMP) | S | 3 | `mob-fake-api`, `mob-design-system` | `mob-import-export` |
| 14 | [Mobile board view](chunks/14-mob-board-view.md) | Mobile (CMP) | M | 3 | `mob-fake-api`, `mob-design-system` | `mob-card-detail`, `mob-card-dnd` |
| 15 | [Web authentication](chunks/15-web-auth.md) | Web | M | 3 | `web-fake-api`, `web-design-system` | `web-integration` |
| 16 | [Web board list](chunks/16-web-board-list.md) | Web | S | 3 | `web-fake-api`, `web-design-system` | `web-import-export` |
| 17 | [Web board view](chunks/17-web-board-view.md) | Web | M | 3 | `web-fake-api`, `web-design-system` | `web-card-detail`, `web-card-dnd` |
| 18 | [Backend cards & card ordering](chunks/18-be-cards.md) | Backend | M | 4 | `be-boards` | `be-labels` |
| 19 | [Mobile card detail & editing](chunks/19-mob-card-detail.md) | Mobile (CMP) | M | 4 | `mob-board-view` | `mob-labels` |
| 20 | [Mobile card drag & drop](chunks/20-mob-card-dnd.md) | Mobile (CMP) | M | 4 | `mob-board-view` | `mob-integration` |
| 21 | [Mobile board import/export](chunks/21-mob-import-export.md) | Mobile (CMP) | M | 4 | `mob-board-list` | `mob-integration` |
| 22 | [Web card detail & editing](chunks/22-web-card-detail.md) | Web | M | 4 | `web-board-view` | `web-labels` |
| 23 | [Web card drag & drop](chunks/23-web-card-dnd.md) | Web | M | 4 | `web-board-view` | `web-integration` |
| 24 | [Web board import/export](chunks/24-web-import-export.md) | Web | S | 4 | `web-board-list` | `web-integration` |
| 25 | [Backend labels](chunks/25-be-labels.md) | Backend | S | 5 | `be-cards` | `be-import-export` |
| 26 | [Mobile labels](chunks/26-mob-labels.md) | Mobile (CMP) | M | 5 | `mob-card-detail` | `mob-search-filter` |
| 27 | [Web labels](chunks/27-web-labels.md) | Web | M | 5 | `web-card-detail` | `web-search-filter` |
| 28 | [Backend board import/export](chunks/28-be-import-export.md) | Backend | M | 6 | `be-labels` | `mob-integration`, `web-integration` |
| 29 | [Mobile board search & filter](chunks/29-mob-search-filter.md) | Mobile (CMP) | S | 6 | `mob-labels` | `mob-integration` |
| 30 | [Web board search & filter](chunks/30-web-search-filter.md) | Web | S | 6 | `web-labels` | `web-integration` |
| 31 | [Mobile integration with real backend](chunks/31-mob-integration.md) | Mobile (CMP) | M | 7 | `mob-auth`, `mob-card-dnd`, `mob-search-filter`, `mob-import-export`, `be-import-export`, `infra-vps` | — |
| 32 | [Web integration with real backend](chunks/32-web-integration.md) | Web | M | 7 | `web-auth`, `web-card-dnd`, `web-search-filter`, `web-import-export`, `be-import-export`, `infra-vps` | — |

## Global open questions
- **Ordering representation** (integer positions vs. fractional ranks vs. move operations): settled in `api-contract`, implemented in `be-boards`/`be-cards`, relied on by both drag & drop chunks.
- **Refresh token transport on web** (httpOnly cookie vs. response body), which affects `api-contract`, `be-auth`, `web-auth` and `web-integration`.
- **Card fields beyond title, description and labels** (due date, priority?): settled in `api-contract`.
- **Label scope** (per user across all boards vs. per board) and **label handling on import**: settled in `api-contract`.
- **Visual design source** (Figma or defined in the design-system chunks) and whether mobile and web share design tokens.
- **Code generation from the contract** for backend and/or clients.

## Viewing the graph
Open `graph.html` in a browser. Regenerate after editing `graph.json`:
`python3 <project-breakdown-skill-dir>/scripts/build_graph.py docs/breakdown/graph.json`

## Starting a chunk session
Use this prompt to begin work on a chunk in a fresh session:

    We're starting chunk `<id>` from docs/breakdown/chunks/<NN-id>.md.
    Read docs/breakdown/OVERVIEW.md for the project context and that chunk file
    for scope, dependencies and open questions. Check that every chunk it depends
    on is complete, and read what they provide. Then interview me about the open
    questions and edge cases for this chunk before planning the implementation.
    Stay within the chunk's scope; anything outside it belongs to another chunk.

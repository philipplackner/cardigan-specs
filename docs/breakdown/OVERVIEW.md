# Cardigan — Project Breakdown

> Initial plan created with Project Breakdown v2 on 2026-10-16, revised 2026-11-04 (code-first contract, no fake API layers). This is starting context for the chunk sessions, not a living spec. Each chunk session produces its own detailed documents.

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
| API contract | Behavioral shared specs (OpenSpec, this repo) + code-first OpenAPI via SpringDoc; clients generate code from the exported spec | User decision; one source of truth for wire format, behavior agreed up front | Contract-first OpenAPI with fake API layers (replaced in revision 1) |
| Hosting | Self-managed VPS: backend + static web behind a reverse proxy, production only, CD pipeline | User decision; no cloud hoster | Separate static host for web; staging env (both rejected) |

## Areas
| Area | What it covers | Chunks |
|---|---|---|
| Shared Specs | Behavioral shared specs, export file format | `api-contract` |
| Backend | Spring Boot service: common utilities, auth, boards, columns, cards, labels, import/export | `be-scaffolding`, `be-common`, `be-auth`, `be-boards`, `be-labels`, `be-cards`, `be-import-export` |
| Infrastructure | VPS, reverse proxy/TLS, secrets, Supabase connection, CD, production smoke test | `infra-vps` |
| Mobile (CMP) | Android + iOS app, phone + tablet | `mob-scaffolding`, `mob-design-system`, `mob-api-client`, `mob-auth-ui`, `mob-board-list-ui`, `mob-board-view-ui`, `mob-card-detail-ui`, `mob-import-export-ui`, `mob-labels-ui`, `mob-auth-connect`, `mob-card-dnd`, `mob-search-filter`, `mob-boards-connect`, `mob-labels-connect`, `mob-cards-connect`, `mob-import-export-connect` |
| Web | Responsive React app | `web-scaffolding`, `web-design-system`, `web-api-client`, `web-auth-ui`, `web-board-list-ui`, `web-board-view-ui`, `web-card-detail-ui`, `web-import-export-ui`, `web-labels-ui`, `web-auth-connect`, `web-card-dnd`, `web-search-filter`, `web-boards-connect`, `web-labels-connect`, `web-cards-connect`, `web-import-export-connect` |

## Existing foundations
- Shared specs in this repo (`openspec/specs/`): `text-length`, `domain-user`, `domain-board`, `domain-column`, `domain-card`, `domain-label`, `domain-ordering`.
- Design exploration in `docs/design/`.
- No application code yet.

## Structural approach
- Behavioral shared specs come first. The wire contract is code-first: each backend feature chunk ships its endpoints in the SpringDoc-generated OpenAPI spec, and clients generate code from it.
- No fake API layers. Clients build their UI per feature in isolated modules first (screens, ViewModels, repository interfaces on shared domain models, tested with test doubles), then connect each feature once its backend chunk is done.
- `be-common` owns the users table, JWT verification and the current-user principal, so `be-auth`, `be-boards` and `be-labels` run in parallel.
- Client scaffolding owns app-wide utilities and the core domain models, so parallel UI chunks don't define shared models twice.
- Every client connect chunk after auth depends on that client's `*-auth-connect`, because protected endpoints need a real session.
- Development and connect chunks run against a local backend and local Postgres. `infra-vps` is deliberately last and includes the production smoke test of both clients.
- CI lives in each codebase's scaffolding chunk; CD lives in `infra-vps`.
- No offline cache and no real-time sync on any client.

## Waves
| Wave | Chunks (parallelizable) |
|---|---|
| 1 | `api-contract` (Shared Specs, M) · `be-scaffolding` (Backend, M) · `mob-scaffolding` (Mobile (CMP), M) · `web-scaffolding` (Web, M) |
| 2 | `be-common` (Backend, M) · `mob-design-system` (Mobile (CMP), M) · `web-design-system` (Web, M) |
| 3 | `be-auth` (Backend, M) · `be-boards` (Backend, M) · `be-labels` (Backend, S) · `mob-api-client` (Mobile (CMP), M) · `mob-auth-ui` (Mobile (CMP), S) · `mob-board-list-ui` (Mobile (CMP), S) · `mob-board-view-ui` (Mobile (CMP), M) · `mob-card-detail-ui` (Mobile (CMP), M) · `mob-import-export-ui` (Mobile (CMP), M) · `mob-labels-ui` (Mobile (CMP), M) · `web-api-client` (Web, S) · `web-auth-ui` (Web, S) · `web-board-list-ui` (Web, S) · `web-board-view-ui` (Web, M) · `web-card-detail-ui` (Web, M) · `web-import-export-ui` (Web, S) · `web-labels-ui` (Web, M) |
| 4 | `be-cards` (Backend, M) · `mob-auth-connect` (Mobile (CMP), M) · `mob-card-dnd` (Mobile (CMP), M) · `mob-search-filter` (Mobile (CMP), S) · `web-auth-connect` (Web, M) · `web-card-dnd` (Web, M) · `web-search-filter` (Web, S) |
| 5 | `be-import-export` (Backend, M) · `mob-boards-connect` (Mobile (CMP), M) · `mob-labels-connect` (Mobile (CMP), S) · `web-boards-connect` (Web, M) · `web-labels-connect` (Web, S) |
| 6 | `mob-cards-connect` (Mobile (CMP), M) · `mob-import-export-connect` (Mobile (CMP), S) · `web-cards-connect` (Web, M) · `web-import-export-connect` (Web, S) |
| 7 | `infra-vps` (Infrastructure, M) |

**Critical path:** `be-scaffolding` → `be-common` → `mob-api-client` → `mob-auth-connect` → `mob-boards-connect` → `mob-cards-connect` → `infra-vps`. The web chain and the backend chain (`be-common` → `be-boards` → `be-cards` → `be-import-export`) are almost as long, so a slip in `be-common` or either auth-connect delays everything after wave 3.

## Chunk index
| # | Chunk | Area | Size | Wave | Depends on | Unlocks |
|---|---|---|---|---|---|---|
| 01 | [Behavioral shared specs](chunks/01-api-contract.md) | Shared Specs | M | 1 | — | `be-common` |
| 02 | [Backend scaffolding & architecture](chunks/02-be-scaffolding.md) | Backend | M | 1 | — | `be-common` |
| 03 | [Mobile scaffolding & architecture](chunks/03-mob-scaffolding.md) | Mobile (CMP) | M | 1 | — | `mob-api-client`, `mob-design-system` |
| 04 | [Web scaffolding & architecture](chunks/04-web-scaffolding.md) | Web | M | 1 | — | `web-api-client`, `web-design-system` |
| 05 | [Backend common utilities](chunks/05-be-common.md) | Backend | M | 2 | `be-scaffolding`, `api-contract` | `be-auth`, `be-boards`, `be-labels`, `mob-api-client`, `web-api-client` |
| 06 | [Mobile design system](chunks/06-mob-design-system.md) | Mobile (CMP) | M | 2 | `mob-scaffolding` | `mob-auth-ui`, `mob-board-list-ui`, `mob-board-view-ui`, `mob-card-detail-ui`, `mob-import-export-ui`, `mob-labels-ui` |
| 07 | [Web design system](chunks/07-web-design-system.md) | Web | M | 2 | `web-scaffolding` | `web-auth-ui`, `web-board-list-ui`, `web-board-view-ui`, `web-card-detail-ui`, `web-import-export-ui`, `web-labels-ui` |
| 08 | [Backend authentication](chunks/08-be-auth.md) | Backend | M | 3 | `be-common` | `mob-auth-connect`, `web-auth-connect` |
| 09 | [Backend boards & columns](chunks/09-be-boards.md) | Backend | M | 3 | `be-common` | `be-cards`, `mob-boards-connect`, `web-boards-connect` |
| 10 | [Backend labels](chunks/10-be-labels.md) | Backend | S | 3 | `be-common` | `be-cards`, `mob-labels-connect`, `web-labels-connect` |
| 11 | [Mobile API client foundation](chunks/11-mob-api-client.md) | Mobile (CMP) | M | 3 | `mob-scaffolding`, `be-common` | `mob-auth-connect` |
| 12 | [Mobile auth UI](chunks/12-mob-auth-ui.md) | Mobile (CMP) | S | 3 | `mob-design-system` | `mob-auth-connect` |
| 13 | [Mobile board list UI](chunks/13-mob-board-list-ui.md) | Mobile (CMP) | S | 3 | `mob-design-system` | `mob-boards-connect` |
| 14 | [Mobile board view UI](chunks/14-mob-board-view-ui.md) | Mobile (CMP) | M | 3 | `mob-design-system` | `mob-boards-connect`, `mob-card-dnd`, `mob-search-filter` |
| 15 | [Mobile card detail UI](chunks/15-mob-card-detail-ui.md) | Mobile (CMP) | M | 3 | `mob-design-system` | `mob-cards-connect` |
| 16 | [Mobile import/export UI & file handling](chunks/16-mob-import-export-ui.md) | Mobile (CMP) | M | 3 | `mob-design-system` | `mob-import-export-connect` |
| 17 | [Mobile labels UI](chunks/17-mob-labels-ui.md) | Mobile (CMP) | M | 3 | `mob-design-system` | `mob-labels-connect`, `mob-search-filter` |
| 18 | [Web API client foundation](chunks/18-web-api-client.md) | Web | S | 3 | `web-scaffolding`, `be-common` | `web-auth-connect` |
| 19 | [Web auth UI](chunks/19-web-auth-ui.md) | Web | S | 3 | `web-design-system` | `web-auth-connect` |
| 20 | [Web board list UI](chunks/20-web-board-list-ui.md) | Web | S | 3 | `web-design-system` | `web-boards-connect` |
| 21 | [Web board view UI](chunks/21-web-board-view-ui.md) | Web | M | 3 | `web-design-system` | `web-boards-connect`, `web-card-dnd`, `web-search-filter` |
| 22 | [Web card detail UI](chunks/22-web-card-detail-ui.md) | Web | M | 3 | `web-design-system` | `web-cards-connect` |
| 23 | [Web import/export UI & file handling](chunks/23-web-import-export-ui.md) | Web | S | 3 | `web-design-system` | `web-import-export-connect` |
| 24 | [Web labels UI](chunks/24-web-labels-ui.md) | Web | M | 3 | `web-design-system` | `web-labels-connect`, `web-search-filter` |
| 25 | [Backend cards, ordering & card labels](chunks/25-be-cards.md) | Backend | M | 4 | `be-boards`, `be-labels` | `be-import-export`, `mob-cards-connect`, `web-cards-connect` |
| 26 | [Mobile auth connect](chunks/26-mob-auth-connect.md) | Mobile (CMP) | M | 4 | `mob-auth-ui`, `mob-api-client`, `be-auth` | `mob-boards-connect`, `mob-labels-connect` |
| 27 | [Mobile card drag & drop](chunks/27-mob-card-dnd.md) | Mobile (CMP) | M | 4 | `mob-board-view-ui` | `mob-cards-connect` |
| 28 | [Mobile board search & filter](chunks/28-mob-search-filter.md) | Mobile (CMP) | S | 4 | `mob-board-view-ui`, `mob-labels-ui` | `infra-vps` |
| 29 | [Web auth connect](chunks/29-web-auth-connect.md) | Web | M | 4 | `web-auth-ui`, `web-api-client`, `be-auth` | `web-boards-connect`, `web-labels-connect` |
| 30 | [Web card drag & drop](chunks/30-web-card-dnd.md) | Web | M | 4 | `web-board-view-ui` | `web-cards-connect` |
| 31 | [Web board search & filter](chunks/31-web-search-filter.md) | Web | S | 4 | `web-board-view-ui`, `web-labels-ui` | `infra-vps` |
| 32 | [Backend board import/export](chunks/32-be-import-export.md) | Backend | M | 5 | `be-cards` | `mob-import-export-connect`, `web-import-export-connect` |
| 33 | [Mobile boards connect](chunks/33-mob-boards-connect.md) | Mobile (CMP) | M | 5 | `mob-auth-connect`, `mob-board-list-ui`, `mob-board-view-ui`, `be-boards` | `mob-cards-connect`, `mob-import-export-connect` |
| 34 | [Mobile labels connect](chunks/34-mob-labels-connect.md) | Mobile (CMP) | S | 5 | `mob-auth-connect`, `mob-labels-ui`, `be-labels` | `mob-cards-connect` |
| 35 | [Web boards connect](chunks/35-web-boards-connect.md) | Web | M | 5 | `web-auth-connect`, `web-board-list-ui`, `web-board-view-ui`, `be-boards` | `web-cards-connect`, `web-import-export-connect` |
| 36 | [Web labels connect](chunks/36-web-labels-connect.md) | Web | S | 5 | `web-auth-connect`, `web-labels-ui`, `be-labels` | `web-cards-connect` |
| 37 | [Mobile cards connect](chunks/37-mob-cards-connect.md) | Mobile (CMP) | M | 6 | `mob-boards-connect`, `mob-labels-connect`, `mob-card-detail-ui`, `mob-card-dnd`, `be-cards` | `infra-vps` |
| 38 | [Mobile import/export connect](chunks/38-mob-import-export-connect.md) | Mobile (CMP) | S | 6 | `mob-boards-connect`, `mob-import-export-ui`, `be-import-export` | `infra-vps` |
| 39 | [Web cards connect](chunks/39-web-cards-connect.md) | Web | M | 6 | `web-boards-connect`, `web-labels-connect`, `web-card-detail-ui`, `web-card-dnd`, `be-cards` | `infra-vps` |
| 40 | [Web import/export connect](chunks/40-web-import-export-connect.md) | Web | S | 6 | `web-boards-connect`, `web-import-export-ui`, `be-import-export` | `infra-vps` |
| 41 | [VPS infrastructure & deployment](chunks/41-infra-vps.md) | Infrastructure | M | 7 | `mob-cards-connect`, `mob-import-export-connect`, `mob-search-filter`, `web-cards-connect`, `web-import-export-connect`, `web-search-filter` | — |

## Global open questions
- **OpenAPI hand-off to clients** (committed spec file, CI artifact, Gradle task) and how regeneration is triggered: settled in `be-common`, used by both `*-api-client` chunks.
- **Refresh token transport on web** (httpOnly cookie vs. body): affects `be-auth`, `web-auth-connect` and `infra-vps`.
- **Migration numbering for parallel backend chunks** (`be-auth`, `be-boards`, `be-labels` in wave 3): settled in `be-common`.
- **Board read shape** (full board in one call or not): settled in `be-boards`, consumed by both boards-connect chunks.
- **Shared design tokens** between mobile and web.

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

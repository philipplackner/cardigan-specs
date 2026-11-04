# Cardigan — Breakdown Interview Log

Started 2026-10-16.

## Phase 0 — Existing foundations
- `/Cardigan` is empty: greenfield. No existing code, CI or infrastructure.

## Phase 1 — Vision (from the initial brief)
- Kanban app. Multiple boards → columns → cards (Jira-ticket-like).
- Auth: register, login, logout only. No email verification, no forgot password.
- Labels: user-defined labels, attachable to cards.
- Reordering: cards via drag & drop; columns via move buttons (no DnD required).
- Import/export a complete board as JSON; one blocking request each for upload and download.
- No offline caching; all data always fetched from the backend.
- No real-time sync; new data only on intentional refresh.

## Phase 2 — Stack (fixed by the user)
- Backend: Kotlin + Spring Boot.
- Mobile: Kotlin + Compose Multiplatform (one shared codebase incl. UI).
- Web: React + TypeScript, fully responsive.
- DB: PostgreSQL hosted on Supabase (database only; Supabase Auth NOT used).
- Auth: custom JWT on the backend; access token 15 min, refresh token 30 days.
- Backend deployment: self-managed VPS, no cloud hoster.

## Phase 1 — Scope decisions (Q&A 1)
- Mobile targets: Android + iOS from one CMP codebase (no desktop).
- Boards are private per user. No sharing, members or permissions.
- Card capabilities: title, description, labels. Plus search & filter for cards, done purely client-side (no backend search endpoint).
- Out of scope: comments, file attachments, board sharing, email verification, forgot password, offline cache, real-time sync.
- Web app deployed on the same VPS as the backend (static build behind the reverse proxy).

## Phase 1 — Scope decisions (Q&A 2) — Approval gate 1 passed
- Search & filter: within the currently open board only (text + labels), client-side.
- Environments: production only. Automated CD pipeline to the VPS is part of the infrastructure chunk (no separate CD chunk).
- Mobile store release (signing, listings, store builds): out of scope for this plan.
- Areas: API Contract, Backend, Mobile (CMP), Web, Infrastructure — approved by user together with the v1 scope.

## Phase 3 — Foundation decisions (made while drafting)
- Per codebase: scaffolding chunk incl. CI (build + tests). No separate CI chunk.
- Clients: design system chunk + fake API layer chunk each; feature chunks run against fakes; one integration chunk per client at the end.
- Client feature chunks (boards) do not depend on client auth: they run against the fake layer with a fake session, so auth and boards can be built in parallel. Integration wires them together.
- Card drag & drop is its own chunk per client (non-trivial, esp. cross-column + touch); column move buttons stay in the boards chunk.
- Search & filter depends on labels (filter by label).
- Infrastructure depends on backend scaffolding (container image) and web scaffolding (static build) because CD deploys both.

## Phase 4 — Graph review
- Draft 1: 27 chunks / 6 waves, validated without warnings.
- User concern: boards chunks too large (L), esp. since boards look and behave differently per screen size.
- Change: split boards on all three platforms:
  - Backend: `be-boards` (boards + columns, column order, M) → `be-cards` (card CRUD + moves/ordering, M).
  - Mobile & web: `*-board-list` (S), `*-board-view` (M, per-screen-size layouts, column CRUD + move buttons), `*-card-detail` (M, depends on board-view).
  - Edges: card-dnd → board-view; client labels → card-detail; client import/export → board-list; be-labels → be-cards.
- Decision: mobile app supports phone + tablet with adaptive layouts in v1 (parity with responsive web).
- Draft 2: 32 chunks / 7 waves, no L chunks, validated without warnings. **Approval gate 2 passed.**
- Critical path: api-contract → mob-fake-api → mob-board-view → mob-card-detail → mob-labels → mob-search-filter → mob-integration.

## Phase 5–6 — Files written
- 32 chunk files in `chunks/`, `OVERVIEW.md`, `graph.json`, `graph.html` (generated, viewer verified to render without errors).

## Revision 1 — Code-first contract, no fakes (2026-11-04)

### Context found
- The `api-contract` chunk has turned into behavioral shared specs in this repo (OpenSpec, `shared-specs-only` schema): `text-length`, `domain-user`, `domain-board`, `domain-column`, `domain-card`, `domain-label`, `domain-ordering`. Several former open questions are now settled there (per-user labels with 20 palette colors, dense positions 0..n-1, last write wins, permanent cascading deletes, board keys and card display IDs, text limits).

### User decisions (from the request)
- The wire-level API contract is code-first: the backend generates it with SpringDoc per feature. The behavioral shared specs stay the cross-platform contract (wave 1 unchanged).
- Fake API layer chunks are removed on both clients.
- New backend-wide utility chunk in wave 2 (`be-common`): security filter chain, SpringDoc, and the other cross-cutting pieces every backend feature needs.
- VPS infrastructure & deployment moves to the end of the plan. Development runs against a local backend and local Postgres until then.
- `be-auth` moves from wave 2 to wave 3.
- Wave 3: build the whole client UI per feature in parallel on mobile and web, using isolated feature modules.
- Wave 4: connect the clients to the real backend auth. Further features are connected per feature afterwards.

### Challenges raised and answers
- Backend would become the critical path if strictly sequential. → `be-common` also owns the users table, JWT verification and the current-user principal. `be-auth` (register/login/refresh/logout), `be-boards` and `be-labels` run in parallel in wave 3. `be-cards` (incl. attaching labels) follows, then `be-import-export`.
- UI vs. connect boundary. → UI chunks build screens, ViewModels and the feature's repository interface with domain models from the shared specs, tested with test doubles. Connect chunks add DTOs, remote data sources and mapping.
- Client contract consumption. → Clients generate code from the OpenAPI spec SpringDoc exports. New foundation chunk per client (`*-api-client`, wave 3): codegen, HTTP client config, shared error model mapping, base URL per environment. The HTTP client base moves out of the scaffolding chunks.
- Infra timing. → Final wave, after all client and backend chunks. Done when both clients pass a smoke test against production.
- Not raised as a question, explained to the user: card drag & drop and search/filter live inside the board view, so they depend on the board view UI and land in wave 4. Every connect chunk after auth depends on that client's auth-connect, because protected endpoints need a real session.
- Accepted risk: first production deploy happens last (TLS, cookies, iOS ATS, Supabase pooler surface late).
- Client-wide utilities (result/error types, base MVI classes, DI, dispatchers, logging, UiText) go into the client scaffolding chunks, not a separate wave-2 chunk (user decision): too small to stand alone, and a separate chunk would delay the wave-3 UI chunks. Mapping the backend error model onto these types stays in `*-api-client`.
- Client scaffolding chunks also own a core domain module: Board, Column, Card, Label and User models plus `text-length` counting and field limits (user decision). Prevents parallel wave-3 UI chunks from defining shared models twice. No edge from `api-contract`: the domain and text-length specs are already merged.
- Approval gate 2 passed for revision 1 (41 chunks, 7 waves). Old chunk files (fake API layers, integration chunks, combined feature chunks) replaced.

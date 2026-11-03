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

# Behavioral shared specs

| | |
|---|---|
| ID | `api-contract` |
| Area | Shared Specs |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `be-common` |

## Goal
Cross-platform behavioral specs (OpenSpec) for the domain model, text limits, ordering, auth, boards, columns, cards, labels and board import/export, including the export file format. The wire-level API contract is not part of this: the backend generates it code-first.

## In scope
- Behavioral specs per feature in OpenSpec (`shared-specs-only` schema): auth, boards, columns, cards, labels, ordering, import/export
- Already done: `text-length`, `domain-user`, `domain-board`, `domain-column`, `domain-card`, `domain-label`, `domain-ordering`
- Shared error categories (validation, unauthorized, not found, conflict) at the behavioral level
- Versioned JSON export format for a complete board

## Out of scope
- Wire-level API contract (endpoints, DTOs): generated code-first by the backend feature chunks
- Implementation on any platform

## Builds on
- Nothing (root chunk)

## Provides
- The behavior every backend feature and every client UI/connect chunk implements
- Domain rules the client scaffolding chunks turn into core domain models

## Done when
- Every v1 feature has a shared spec covering normal and error behavior
- Specs are archived into `openspec/specs/`

## Decisions from the breakdown
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- Custom JWT auth: 15-minute access tokens, 30-day refresh tokens (user decision). Supabase Auth is not used.
- Boards and labels are private per user; no sharing in v1.
- Search & filter is client-side only; import/export are one blocking request each.

## Open questions for the deep-dive session
- Refresh token transport on web (httpOnly cookie vs. body) vs. mobile
- Do board reads return the full board (columns + cards + labels) in one call?
- Export format versioning and label handling on import (reuse by name vs. create)

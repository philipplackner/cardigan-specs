# Proposal

## Breaking Change

No. No API exists yet, so nothing has to migrate.

## Target Platforms

- Backend
- Android
- iOS
- Web

## Why

The wire contract is generated code-first by the backend, but every platform needs the same understanding of how that API behaves before the first endpoint exists. Without shared conventions, each backend chunk and each client would pick its own formats, error handling and token rules.

## What Changes

- Generated OpenAPI is authoritative for wire shape; shared specs are authoritative for behavior.
- All endpoints live under `/api/v1`; only additive changes within a major version.
- Shared wire formats: camelCase fields, UTC timestamps with milliseconds and `Z`, lowercase UUIDs, always-present fields, unknown fields ignored.
- Request semantics: PATCH partial updates, 201/200/204 responses, move positions as final index, move responses with all affected items, unpaginated lists with fixed order, body size limits, same-origin only, HTTPS only, no automatic POST retries after a lost response, settable backend time in tests.
- One error model: RFC 9457 problem details with a closed catalog of error codes and field error codes, a fixed precedence, and not-found for other users' data.
- Auth token conventions: Bearer access token (15 min), rotated refresh token (30 days sliding) via cookie on web and body on mobile, reuse revokes the session, logout ends the current session, rate limits on auth endpoints.
- Versioned board export file format and its import rules: label mapping, kept card numbers, key clash with override, 5 MB multipart upload, all-or-nothing import with one generic error for invalid files.

## Capabilities

### New Capabilities
- `api-conventions`: Authoritative contract, base path and versioning, wire data formats, request and response semantics, ordering and moves, lists, size limits, CORS, HTTPS, retries and test time control.
- `api-errors`: Error response shape, top-level error codes, field error codes, precedence and not-found hiding.
- `api-auth-tokens`: Access and refresh token use, lifetimes, transport per client, rotation, reuse handling, logout scope and rate limiting.
- `board-export-format`: Versioned JSON export file, download naming, import upload, validation and mapping rules.

### Modified Capabilities
- `domain-card`: Card numbers can come from an imported file, and the sort order of card labels is defined exactly.

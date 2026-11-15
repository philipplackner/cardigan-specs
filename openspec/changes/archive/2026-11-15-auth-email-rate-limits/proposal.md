# Proposal

## Breaking Change

No. No platform has shipped auth, so nothing has to migrate.

## Target Platforms

- Backend
- Android
- iOS
- Web

## Why

IP-based limits need trusted proxy handling that is too complex for this project, and a refresh request has no email to limit by. The backend limits login and register per email only, and the shared specs must match. The specs also don't say what happens to a stale refresh cookie after a failed refresh.

## What Changes

- Login and register are rate limited per email only, with separate counts. No limit uses the client IP.
- Every request with an email counts, success or not. Requests without an email are not limited.
- Refresh and logout are never rate limited.
- The rate limit moves after size, media type and parsing errors in the error precedence.
- A refresh with the `COOKIE` transport that fails with `INVALID_REFRESH_TOKEN` clears the refresh cookie.
- Clients no longer expect a 429 on refresh.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `api-auth-tokens`: "Auth endpoints are rate limited" covers login and register only. "What rate limits count" is replaced by "Rate limits count per email". "Clients handle a failed refresh" drops its 429 case and is split into "Clients end the session on a rejected refresh" and "Other refresh failures are temporary". New: "Requests without an email are not rate limited" and "A failed cookie refresh clears the cookie".
- `api-errors`: "Error precedence" places the rate limit after parsing.

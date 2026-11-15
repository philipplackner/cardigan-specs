# Decisions: auth-email-rate-limits

Confirmed with Philipp Lackner on 2026-11-15, through the `cardigan-cd` planning session, which relayed the questions and answers (IDs RATE-n).

## Summary

Login and register are rate limited per email only, each with its own count, and no limit uses the client IP. Refresh and logout are not rate limited. Because the email comes from the body, size, media type and parsing errors now come before the rate limit in the error precedence. A refresh with the `COOKIE` transport that fails with `INVALID_REFRESH_TOKEN` clears the stale refresh cookie. Nothing has shipped, so the change is not breaking.

## Decisions

### D1 — Limits are per email only
- **Question**: What do login and register limits count?
- **Decision**: The submitted email after `text-length` normalization and lowercasing. Login and register have separate counts. No limit uses the client IP, and the requirement about trusted forwarded headers is removed.
- **Alternatives**: Per client IP from the trusted reverse proxy plus per email on login (the previous rule).
- **Why**: Settled in the backend change `be-auth` (D10): IP-based limiting was too complex for this course. The user accepted that one client can try many emails and that anyone can use up a victim's limit.
- **Depends on**: —

### D2 — Every request counts
- **Question**: Which requests count toward a limit?
- **Decision**: Every login or register request that carries an email, whether it succeeds or fails, including requests that fail validation.
- **Alternatives**: Failed attempts only.
- **Why**: Settled in `be-auth` (D10).
- **Depends on**: D1

### D3 — Requests without an email (RATE-1)
- **Question**: Does the shared spec say what happens to a request without an email?
- **Decision**: Yes. A login or register request whose `email` is missing, `null` or empty after normalization is not rate limited and gets field validation (400 `VALIDATION_FAILED`).
- **Alternatives**: Leave it to the backend spec only.
- **Why**: Clients and the backend see the same rule.
- **Depends on**: D1

### D4 — Refresh and logout are not limited
- **Question**: Are refresh and logout rate limited?
- **Decision**: No. They never answer 429.
- **Alternatives**: Limit refresh per user or per token.
- **Why**: Settled in `be-auth` (D12): a refresh has no email, and guessing a 256-bit token isn't feasible.
- **Depends on**: D1

### D5 — Response over the limit
- **Question**: How does a request over the limit fail?
- **Decision**: 429 `RATE_LIMITED` with `Retry-After` in whole seconds, at least 1, before credentials are checked. The exact limit values stay a backend setting.
- **Alternatives**: —
- **Depends on**: D1

### D6 — Error precedence (RATE-3)
- **Question**: Where does the rate limit go in the error precedence?
- **Decision**: After parsing, for every endpoint: access token (401) → size (413) → media type (415) → parsing (400 `MALFORMED_REQUEST`) → rate limit (429) → route and references (404) → field validation → credentials and refresh tokens (401) → uniqueness (409).
- **Alternatives**: Keep the rate limit first and add an exception for login and register.
- **Why**: The limit key is the email in the body, so the body must be read first (`be-auth` D21). Only login and register are limited, so one order fits every endpoint.
- **Depends on**: D1

### D7 — A failed cookie refresh clears the cookie
- **Question**: Does a failed refresh with the `COOKIE` transport clear the stale refresh cookie?
- **Decision**: Yes. A refresh with `COOKIE` that answers 401 `INVALID_REFRESH_TOKEN` sends an expired refresh cookie with the same name, `Path` and attributes, like logout.
- **Alternatives**: Send no `Set-Cookie` header.
- **Why**: Settled in `be-auth` (D19).
- **Depends on**: —

### D8 — Client handling of a failed refresh (RATE-2)
- **Question**: What happens to the 429 example and the "Refresh rate limited" scenario in "Clients handle a failed refresh"?
- **Decision**: Both are removed. Any failure other than 401 `INVALID_REFRESH_TOKEN` stays temporary, and the client keeps its tokens.
- **Alternatives**: Keep them as is.
- **Why**: The backend no longer answers 429 on refresh. A 429 from a proxy is still covered by "any other reason".
- **Note**: OpenSpec can't drop a scenario through MODIFIED, so the requirement is removed and re-added. Its text is over the 500-character limit for new requirements, so it is split into "Clients end the session on a rejected refresh" and "Other refresh failures are temporary" with the same meaning. "What rate limits count" is replaced by "Rate limits count per email" for the same reason.
- **Depends on**: D4

### D9 — Not breaking
- **Question**: Is this change breaking?
- **Decision**: No. No platform has shipped auth.
- **Alternatives**: Mark as breaking.
- **Depends on**: D1–D8

### D10 — Breakdown docs (RATE-4)
- **Question**: Which breakdown docs change?
- **Decision**: Only `08-be-auth.md`: "Login rate limiting" moves from open questions to decisions (per email only, refresh and logout not limited, user decision). The other answered open points stay for the `be-auth` owner.
- **Alternatives**: Also settle every answered `be-auth` open question and the OVERVIEW transport question.
- **Depends on**: D1, D4

### D11 — Branch
- **Question**: Where are the commits made?
- **Decision**: On the local branch `12-shared-spec-followups`, shared with `label-color-constants`. No push.
- **Alternatives**: —
- **Depends on**: —

## Facts

- `api-auth-tokens` currently limits login, register and refresh, counts per client IP from the trusted reverse proxy, and also limits login per email — source: `api-auth-tokens`, "Auth endpoints are rate limited", "What rate limits count".
- `api-errors` lists the rate limit first in "Error precedence" — source: `api-errors`.
- `api-auth-tokens` says nothing about the cookie after a failed refresh — source: `api-auth-tokens`, "Invalid refresh tokens".
- The breakdown docs never mention IP-based limits; the mob/web auth-connect chunks don't rely on the old rules — source: grep over `docs/breakdown`.
- The backend spec already states these rules as deviations until this change lands — source: backend `openspec/changes/be-auth/specs/auth-rate-limiting/spec.md`.

## Out of scope

- Limit values (backend setting), where counters are kept, and limits on any other endpoint.
- The other open questions in `08-be-auth.md` and `OVERVIEW.md`.

## Deferred

- None.

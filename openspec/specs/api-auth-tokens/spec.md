# api-auth-tokens Specification

## Purpose

Defines how Cardigan clients authenticate API requests with access and refresh tokens, how long tokens live, how they travel on web and mobile, and how sessions end.

## Requirements

### Requirement: Protected requests use a bearer access token
Every endpoint under `/api/v1` SHALL require an access token sent as `Authorization: Bearer <token>`, except register, login, refresh and any other endpoint the auth feature spec defines as public. Operational endpoints outside `/api/v1`, such as a health check, are not covered by this requirement. A missing, invalid or expired access token SHALL produce 401 `UNAUTHENTICATED`.

#### Scenario: No token
- **WHEN** a client calls a protected endpoint without an `Authorization` header
- **THEN** the response is 401 `UNAUTHENTICATED`

#### Scenario: Expired token
- **WHEN** an access token is used at its `accessTokenExpiresAt`
- **THEN** the response is 401 `UNAUTHENTICATED`

### Requirement: Invalid access tokens
A token SHALL count as invalid when its signature does not verify with the backend's key, when it uses an algorithm the backend did not choose, or when it is not an access token.

#### Scenario: Refresh token as bearer
- **WHEN** a client calls a protected endpoint with a refresh token in the `Authorization` header
- **THEN** the response is 401 `UNAUTHENTICATED`

#### Scenario: Tampered token
- **WHEN** a client calls a protected endpoint with an access token whose signature does not verify
- **THEN** the response is 401 `UNAUTHENTICATED`

#### Scenario: Wrong scheme
- **WHEN** the header is `Authorization: Basic abc`
- **THEN** the response is 401 `UNAUTHENTICATED`

### Requirement: Access tokens are opaque to clients
Clients SHALL NOT decode or inspect access tokens. Every response that issues an access token SHALL include `accessTokenExpiresAt`, the token's expiry as a timestamp. `accessTokenExpiresAt` is a hint. A client MAY refresh early based on it, but device clocks can be wrong, so a client SHALL NOT end a session or refuse to send a request because of it. A client SHALL NOT refresh more than once for one issued access token because of this field. The 401 response stays authoritative.

#### Scenario: Login response
- **WHEN** a login succeeds
- **THEN** the response contains the access token and `accessTokenExpiresAt` 15 minutes after the time of issue

#### Scenario: Token is not a JWT
- **WHEN** a client receives an access token that is a random string and an `accessTokenExpiresAt` value
- **THEN** it uses the token normally

### Requirement: Token lifetimes
An access token SHALL be valid for 15 minutes from issue. A refresh token SHALL be valid for 30 days from issue. A token SHALL be rejected from the moment its expiry time is reached, with no leeway. Revoking a session or logging out SHALL NOT affect an access token already issued. It stays valid until it expires, so revocation takes full effect at the latest 15 minutes later.

#### Scenario: Expiry boundary
- **WHEN** an access token is used 1 millisecond before its `accessTokenExpiresAt`
- **THEN** the request is accepted

#### Scenario: Idle for 31 days
- **WHEN** a client has not refreshed for 31 days and tries to refresh
- **THEN** the refresh fails with 401 `INVALID_REFRESH_TOKEN`

#### Scenario: Access token after logout
- **WHEN** a client logs out and then calls a protected endpoint with its unexpired access token
- **THEN** the request succeeds

### Requirement: Refresh rotates the refresh token
Each successful refresh SHALL issue a new access token and a new refresh token valid for 30 days, and SHALL invalidate the refresh token that was used. A session SHALL stay active as long as it refreshes at least once every 30 days. Rotation SHALL be atomic. When several requests use the same refresh token at the same time, at most one SHALL succeed, and each of the others SHALL be treated as reuse of a rotated token.

#### Scenario: Successful refresh
- **WHEN** a client refreshes with a valid refresh token
- **THEN** it receives a new access token and a new refresh token, and the old refresh token no longer works

#### Scenario: Session outlives 30 days by refreshing
- **WHEN** a client logs in, refreshes after 29 days, and refreshes again 29 days later
- **THEN** both refreshes succeed

#### Scenario: New refresh token gets a full lifetime
- **WHEN** a refresh token issued by a refresh on day 29 is used 31 days after that refresh
- **THEN** the refresh fails with 401 `INVALID_REFRESH_TOKEN`

#### Scenario: Parallel refresh with one token
- **WHEN** two refresh requests with the same valid refresh token are processed at the same time
- **THEN** at most one succeeds, and the other fails with 401 `INVALID_REFRESH_TOKEN` and revokes the session

### Requirement: Reusing a rotated refresh token revokes the session
When a refresh token that was already rotated is used again, the backend SHALL revoke the whole session, including its current refresh token, and respond with 401 `INVALID_REFRESH_TOKEN`. Other sessions of the user SHALL NOT be affected. A refresh whose response was lost or not saved may already have rotated the token; using the old token afterwards counts as reuse and the user logs in again. There is no grace period.

#### Scenario: Stolen token replayed
- **WHEN** refresh token R1 was rotated to R2 and R1 is then used again
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN`, and a later refresh with R2 also fails with 401 `INVALID_REFRESH_TOKEN`

#### Scenario: Other device unaffected
- **WHEN** a session on device A is revoked because of reuse
- **THEN** a refresh with device B's refresh token succeeds

### Requirement: Rotated refresh tokens stay recognizable
Login and register each start a new session, and each refresh token belongs to one session. The backend SHALL keep a record of every rotated refresh token for as long as its session is active, so that a rotated token is always detected as reused, even after its own 30 days have passed.

#### Scenario: Thief refreshes first
- **WHEN** refresh token R1 is stolen, the thief rotates it to R2, and the owner then uses R1
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN`, and a later refresh with R2 also fails with 401 `INVALID_REFRESH_TOKEN`

### Requirement: Invalid refresh tokens
A refresh with a missing, unknown, expired or revoked refresh token SHALL fail with 401 `INVALID_REFRESH_TOKEN`.

#### Scenario: After logout
- **WHEN** a client refreshes with a refresh token whose session was logged out
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN`

#### Scenario: Unknown refresh token
- **WHEN** a client refreshes with a random string
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN`

### Requirement: Client chooses the refresh token transport
Register, login and refresh requests SHALL carry `refreshTokenTransport` with the value `COOKIE` or `BODY`. With `COOKIE`, the backend SHALL set the refresh token only in a cookie and SHALL NOT include it in the response body. With `BODY`, it SHALL return the refresh token in the response body and SHALL NOT set a cookie. Access tokens SHALL always be returned in the body.

#### Scenario: Cookie refresh sets a new cookie
- **WHEN** a refresh with `COOKIE` succeeds
- **THEN** the body contains a new access token and no refresh token, and the response sets a cookie holding a new refresh token

#### Scenario: Web login
- **WHEN** the web app logs in with `refreshTokenTransport` `COOKIE`
- **THEN** the response body contains the access token but no refresh token, and the refresh token is set as a cookie

#### Scenario: Mobile login
- **WHEN** a mobile app logs in with `refreshTokenTransport` `BODY`
- **THEN** the response body contains the access token and the refresh token, and no cookie is set

### Requirement: The backend reads the refresh token from the chosen transport
With `COOKIE`, the backend SHALL read the refresh token only from the cookie. With `BODY`, it SHALL read it only from the request body and SHALL ignore any refresh cookie. A session's transport SHALL be fixed when the session starts, and a refresh with a different transport SHALL fail with 401 `INVALID_REFRESH_TOKEN`.

#### Scenario: Cookie is not accepted for the body transport
- **WHEN** a refresh request has `refreshTokenTransport` `BODY`, a valid refresh cookie and no `refreshToken` in the body
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN`, the body contains no refresh token, and the session's refresh token still works

### Requirement: Missing or unknown transport
A missing or unknown `refreshTokenTransport` SHALL produce 400 `VALIDATION_FAILED` with a field error for `refreshTokenTransport` with code `REQUIRED` or `INVALID_VALUE`.

#### Scenario: Missing transport
- **WHEN** a login request has no `refreshTokenTransport`
- **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `refreshTokenTransport` with code `REQUIRED`

### Requirement: Web uses a protected refresh cookie
The web app SHALL use the `COOKIE` transport. The refresh cookie SHALL be `HttpOnly`, `Secure` and `SameSite=Strict`, and SHALL be scoped to the auth endpoints' path. These attributes SHALL NOT depend on the scheme the backend sees. The cookie SHALL expire with the refresh token, through `Max-Age` or `Expires`. The web app SHALL keep the access token in memory only.

#### Scenario: Cookie is unreadable by scripts
- **WHEN** the web app's JavaScript reads `document.cookie`
- **THEN** the refresh token is not visible

#### Scenario: Cookie not sent to other endpoints
- **WHEN** the web app calls a board endpoint
- **THEN** the browser does not send the refresh cookie with that request

#### Scenario: Cookie attributes
- **WHEN** a response sets the refresh cookie
- **THEN** its `Set-Cookie` header has `HttpOnly`, `Secure`, `SameSite=Strict`, a `Path` covering refresh and logout but not board endpoints, and a lifetime of 30 days

#### Scenario: Cookie attributes in production
- **WHEN** a web login succeeds in production
- **THEN** the `Set-Cookie` header carries `HttpOnly`, `Secure`, `SameSite=Strict` and the auth path

#### Scenario: Web storage
- **WHEN** the web app has logged in
- **THEN** the access token is not in `localStorage`, `sessionStorage`, IndexedDB or a script-readable cookie

### Requirement: Mobile uses the body transport
Android and iOS apps SHALL use the `BODY` transport and SHALL send the refresh token in the body of refresh and logout requests. They SHALL store tokens only in the platform's secure storage. Apps SHALL save a new refresh token to secure storage before sending any further request with the new access token.

#### Scenario: Mobile refresh
- **WHEN** a mobile app refreshes
- **THEN** it sends its refresh token in the request body with `refreshTokenTransport` `BODY`

#### Scenario: Mobile logout
- **WHEN** a mobile app logs out
- **THEN** it sends its refresh token in the request body and removes its tokens from storage

### Requirement: Clients refresh once on an unauthenticated response
When a protected request fails with 401 `UNAUTHENTICATED`, a client SHALL refresh once and retry the request with the new access token. Concurrent failing requests SHALL share one refresh. On web, this SHALL hold across all open tabs of a browser, because they share the refresh cookie: tabs that need a new access token at the same time, including when a page loads, SHALL share one refresh request, and each tab SHALL get a valid access token from it.

#### Scenario: Two requests expire together
- **WHEN** two requests fail with 401 `UNAUTHENTICATED` at the same time
- **THEN** the client sends one refresh request and retries both requests with the new access token

#### Scenario: Two tabs need a token at once
- **WHEN** two tabs of the web app need a new access token at the same time
- **THEN** only one refresh request is sent, both tabs get a valid access token, and the session stays active

### Requirement: Clients handle a failed refresh
When the refresh fails with 401 `INVALID_REFRESH_TOKEN`, the client SHALL discard its tokens and return the user to login. When the refresh fails for any other reason (network error, 429, 5xx), the client SHALL keep its tokens, fail the original request as a temporary error and try refreshing again on a later request. When the retried request fails with 401 `UNAUTHENTICATED` again, the client SHALL NOT refresh again for that request and SHALL end the session.

#### Scenario: Refresh fails
- **WHEN** the refresh fails with 401 `INVALID_REFRESH_TOKEN`
- **THEN** the client discards its tokens and shows login

#### Scenario: Refresh has no network
- **WHEN** the refresh request cannot reach the backend
- **THEN** the client keeps its tokens and shows an error for the original request

#### Scenario: Refresh rate limited
- **WHEN** the refresh fails with 429 `RATE_LIMITED`
- **THEN** the client keeps its tokens and shows an error for the original request

#### Scenario: Retry fails again
- **WHEN** the refresh succeeds and the retried request fails with 401 `UNAUTHENTICATED`
- **THEN** the client sends no second refresh and shows login

### Requirement: Logout ends only the current session
Logout SHALL revoke the refresh token of the current session only. Other sessions of the same user SHALL stay active. With the `COOKIE` transport, logout SHALL also clear the refresh cookie. On logout a client SHALL discard its access and refresh tokens, whatever the response.

#### Scenario: Logout on one device
- **WHEN** a user logged in on web and on Android logs out on web
- **THEN** the web session's refresh token stops working and the Android session keeps working

#### Scenario: Logout clears the cookie
- **WHEN** a client logs out with the `COOKIE` transport
- **THEN** the response has a `Set-Cookie` header for the same name and `Path` with `Max-Age=0`

### Requirement: Auth endpoints are rate limited
Login, register and refresh SHALL be rate limited. A request over the limit SHALL fail with 429 `RATE_LIMITED` and a `Retry-After` header giving the wait in whole seconds. The exact limits SHALL be a backend setting. Clients SHALL use only `Retry-After` to decide when to try again.

#### Scenario: Too many requests
- **WHEN** a client exceeds the limit on login, register or refresh
- **THEN** the response is 429 `RATE_LIMITED` with a `Retry-After` header holding a positive whole number

#### Scenario: Other endpoints
- **WHEN** a client sends 2,000 requests within one minute to a board endpoint
- **THEN** no response has the status 429

### Requirement: What rate limits count
Limits SHALL be counted per client IP address. The address SHALL come from the deployment's trusted reverse proxy, and values a client can set itself SHALL NOT be trusted. Login SHALL also be limited per email, compared after case folding.

#### Scenario: Forged forwarded header
- **WHEN** a client changes a forwarded address header on every login request
- **THEN** all its requests count toward the same limit

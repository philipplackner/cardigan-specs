# Spec Delta

## MODIFIED Requirements

### Requirement: Auth endpoints are rate limited
Login and register SHALL be rate limited. Refresh and logout SHALL NOT be rate limited and SHALL never answer 429. A request over the limit SHALL fail with 429 `RATE_LIMITED` and a `Retry-After` header giving the wait in whole seconds, at least 1. The exact limits SHALL be a backend setting. Clients SHALL use only `Retry-After` to decide when to try again.

#### Scenario: Too many requests
- **WHEN** a client exceeds the limit on login or register
- **THEN** the response is 429 `RATE_LIMITED` with a `Retry-After` header holding a positive whole number

#### Scenario: Many refresh attempts
- **WHEN** a client sends 100 refresh requests with unknown refresh tokens within one second
- **THEN** every response is 401 `INVALID_REFRESH_TOKEN`

#### Scenario: Other endpoints
- **WHEN** a client sends 2,000 requests within one minute to a board endpoint
- **THEN** no response has the status 429

## REMOVED Requirements

### Requirement: What rate limits count
**Reason**: Limits are no longer counted per client IP address, and refresh is no longer limited.
**Migration**: Replaced by "Rate limits count per email". The backend counts login and register per email only.

### Requirement: Clients handle a failed refresh
**Reason**: The backend no longer answers 429 on refresh, so the rule drops its 429 case. The rest is split into two requirements.
**Migration**: Replaced by "Clients end the session on a rejected refresh" and "Other refresh failures are temporary". Clients keep treating every failure other than 401 `INVALID_REFRESH_TOKEN` as temporary.

## ADDED Requirements

### Requirement: Rate limits count per email
Limits SHALL be counted per email only, separately for login and register. The email SHALL be compared after `text-length` normalization and lowercasing, as defined in `domain-user`. No limit SHALL use the client IP address. Every login or register request that carries an email SHALL count toward that email's limit, whether it succeeds or fails, including requests that fail validation.

#### Scenario: Same email in different forms
- **WHEN** a client sends login requests for `ann@example.com`, ` Ann@Example.com ` and `ANN@EXAMPLE.COM`
- **THEN** all of them count toward the same limit

#### Scenario: Different emails
- **WHEN** a client is over the login limit for `ann@example.com` and logs in as `bob@example.com`
- **THEN** the request for `bob@example.com` is not answered with 429

#### Scenario: Another client, same email
- **WHEN** one client used up the login limit for `ann@example.com` and another client logs in as `ann@example.com` with the right password
- **THEN** the response is 429 `RATE_LIMITED`

#### Scenario: Login and register count separately
- **WHEN** a client used up the login limit for an email and sends a register request for the same email
- **THEN** the register request is not answered with 429

#### Scenario: Successful logins count
- **WHEN** a client logs in successfully until the limit is used up and then sends a login with the right password
- **THEN** the response is 429 `RATE_LIMITED`

#### Scenario: Invalid register requests count
- **WHEN** a client sends register requests for one email with a weak password until the limit is used up and then one with a valid password
- **THEN** the response is 429 `RATE_LIMITED`

### Requirement: Clients end the session on a rejected refresh
When the refresh fails with 401 `INVALID_REFRESH_TOKEN`, the client SHALL discard its tokens and return the user to login. When the refresh succeeds and the retried request fails with 401 `UNAUTHENTICATED` again, the client SHALL NOT refresh again for that request and SHALL end the session.

#### Scenario: Refresh fails
- **WHEN** the refresh fails with 401 `INVALID_REFRESH_TOKEN`
- **THEN** the client discards its tokens and shows login

#### Scenario: Retry fails again
- **WHEN** the refresh succeeds and the retried request fails with 401 `UNAUTHENTICATED`
- **THEN** the client sends no second refresh and shows login

### Requirement: Other refresh failures are temporary
When the refresh fails for any reason other than 401 `INVALID_REFRESH_TOKEN`, such as a network error or a 5xx, the client SHALL keep its tokens, fail the original request as a temporary error and try refreshing again on a later request.

#### Scenario: Refresh has no network
- **WHEN** the refresh request cannot reach the backend
- **THEN** the client keeps its tokens and shows an error for the original request

#### Scenario: Server error on refresh
- **WHEN** the refresh fails with a 5xx response
- **THEN** the client keeps its tokens, shows an error for the original request and refreshes again on a later request

### Requirement: Requests without an email are not rate limited
A login or register request whose `email` is missing, `null` or empty after normalization SHALL NOT count toward any limit and SHALL NOT be answered with 429. It SHALL be answered by field validation.

#### Scenario: No email
- **WHEN** a client sends 20 login requests without `email` within one second
- **THEN** every response is 400 `VALIDATION_FAILED` with a field error for `email` with code `REQUIRED`

### Requirement: A failed cookie refresh clears the cookie
When a refresh with `refreshTokenTransport` `COOKIE` fails with 401 `INVALID_REFRESH_TOKEN`, the response SHALL clear the refresh cookie with an expired cookie of the same name, `Path` and attributes. A failed refresh with `BODY` SHALL NOT set a cookie.

#### Scenario: Stale cookie
- **WHEN** the web app refreshes with `COOKIE` and a refresh cookie whose session was revoked
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN` with a `Set-Cookie` header for the same name and `Path` with `Max-Age=0`

#### Scenario: Body transport
- **WHEN** a mobile app refreshes with `BODY` and an unknown refresh token
- **THEN** the response is 401 `INVALID_REFRESH_TOKEN` and has no `Set-Cookie` header

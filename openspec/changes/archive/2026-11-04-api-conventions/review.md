# Artifact review: api-conventions

**Verdict:** Ready
**Reviewed:** 2026-11-04, schema `shared-specs-only`, repo kind `specs-only`

Counts are per reviewer, as reported, before merging. The reviewers returned 83 findings. After removing duplicates there are 51: 3 blockers, 36 majors and 12 minors.

| Reviewer | Blocker | Major | Minor |
|---|---|---|---|
| Testability | 1 | 22 | 9 |
| Security | 1 | 12 | 3 |
| Hidden assumptions | 2 | 10 | 6 |
| Design contract | 0 | 10 | 7 |

## Conflicts between reviewers

The user decided all seven.

### C1: How web tabs share a refresh (A1 and S8 against D6 and T6)
Finding: A1.
- **A1, S8:** Tabs refresh one at a time. At most one refresh is in flight, and a tab that waited sends the current cookie or gets its token some other way. Several refresh requests can be sent in sequence.
- **D6, T6:** Only one refresh request is sent, and every tab gets its access token from it.
- **Why both can't apply:** A contract test either allows several sequential requests or requires exactly one. The second also needs tabs to pass the access token to each other.
- **Decision:** D6 and T6: exactly one refresh request.

### C2: Unknown path without a token (D7 against T13)
Finding: T13.
- **D7:** 404 `ROUTE_NOT_FOUND` with or without a token. Route checks come before all other categories.
- **T13:** 401 `UNAUTHENTICATED` without a token, 404 `ROUTE_NOT_FOUND` with one.
- **Why both can't apply:** The same request gets different statuses.
- **Decision:** T13: 401 `UNAUTHENTICATED` without a token.

### C3: Status for an invalid `key` part on import (D10 against A11 and T21)
Finding: T21.
- **D10:** 422 `INVALID_EXPORT_FILE` with a field error for `key`. D10 names 400 as its alternative.
- **A11, T21:** 400 `VALIDATION_FAILED` with a field error for `key`. T21 names 422 as its alternative.
- **Why both can't apply:** The key dialog on each client maps one status.
- **Decision:** First D10: 422 `INVALID_EXPORT_FILE`. Changed by the follow-up below to 400 `VALIDATION_FAILED`, because 422 now means the file itself is bad.

### C4: Upper limit for imported card numbers (D9, S12 and A15 against T20)
Finding: S12.
- **D9, S12, A15:** 1 to 1,000,000,000.
- **T20:** 1 to 2,147,483,646, leaving room for one more number. T20 names a larger maximum as its alternative, and D9 names 2^53-1.
- **Why both can't apply:** One limit is needed, and it also appears in the `max` of the field error.
- **Decision:** D9, S12 and A15: 1,000,000,000.

### C5: Missing `description` in an import file (A10 against T19)
Finding: T19.
- **A10:** A missing `description` means the empty string.
- **T19:** A missing `description` is rejected with `REQUIRED`, and its scenario tests this.
- **Why both can't apply:** The same file imports under one and fails under the other.
- **Decision:** A10: a missing `description` means the empty string.

### C6: Duplicate label names on one card in a file (A10 against T20)
Finding: T20.
- **A10:** `["Bug", "bug"]` counts as one label, and the import proceeds.
- **T20:** The second entry is rejected with 422 and `ALREADY_USED`.
- **Why both can't apply:** The same file imports under one and fails under the other.
- **Decision:** A10: counts as one label.

### C7: How many errors an import reports (T19 against S11)
Findings: T19, S11.
- **T19:** `fieldErrors` SHALL list every violation in the file.
- **S11:** `fieldErrors` SHALL hold at most 100 entries, and validation stops at that number.
- **Why both can't apply:** A file with more than 100 violations gets different responses. S11 exists because a full list can reach hundreds of MB.
- **Decision:** First T19: every violation is listed, with S11 rejected. Replaced by the follow-up below: no violations are listed, and validation stops at the first one.

## Findings

### T1: Nothing says where the backend reads the refresh token from, or what a bad transport value does
**Status:** applied
**Also reported as:** S1 (blocker). S1 adds the rule below and a stricter fix: "A session's transport SHALL be fixed when the session starts, and a refresh with a different transport SHALL fail with 401 `INVALID_REFRESH_TOKEN`." The two fixes can be combined.
- Severity: blocker - as written, a script on the web origin can get the HttpOnly token in a response body, which is a security hole.
- Location: api-auth-tokens/spec.md > Client chooses the refresh token transport
- Current text: "With `BODY`, it SHALL return the refresh token in the response body and SHALL NOT set a cookie."
- Problem: The requirement covers only how the token goes out, not how it comes in. There are no scenarios for a mismatch between transport and token source, for a missing or unknown `refreshTokenTransport`, or for a missing token. "Invalid refresh tokens" lists "missing", but only the logout case has a scenario.
- Failure scenario: Injected JavaScript calls refresh with `refreshTokenTransport: BODY`. The browser attaches the cookie, a backend that reads "cookie or body" accepts it, and the rotated refresh token comes back readable by the script.
- Proposed fix: In api-auth-tokens/spec.md, add to the requirement: "With `COOKIE`, the backend SHALL read the refresh token only from the cookie. With `BODY`, it SHALL read it only from the request body and SHALL ignore any refresh cookie. A missing or unknown `refreshTokenTransport` SHALL produce 400 `VALIDATION_FAILED` with a field error for `refreshTokenTransport` with code `REQUIRED` or `INVALID_VALUE`." Add these scenarios:
  - "#### Scenario: Cookie is not accepted for the body transport / **WHEN** a refresh request has `refreshTokenTransport` `BODY`, a valid refresh cookie and no `refreshToken` in the body / **THEN** the response is 401 `INVALID_REFRESH_TOKEN`, the body contains no refresh token, and the session's refresh token still works"
  - "#### Scenario: Cookie refresh sets a new cookie / **WHEN** a refresh with `COOKIE` succeeds / **THEN** the body contains a new access token and no refresh token, and the response sets a cookie holding a new refresh token"
  - "#### Scenario: Missing transport / **WHEN** a login request has no `refreshTokenTransport` / **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `refreshTokenTransport` with code `REQUIRED`"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Log in with `COOKIE`, then call refresh with that cookie and `refreshTokenTransport: BODY`.
  - Passes when: The response is 401 and the body contains no token.
  - Fails when: The backend falls back to the cookie and the test sees 200 with `refreshToken` in the body.

### A1: Web refresh assumes one tab, but tabs share one rotating cookie
**Status:** applied with edits · **Conflict:** C1
**Applied as:** Uses D6 and T6 (C1): one refresh request, with every tab getting its token from it.
**Also reported as:** D6 (major), S8 (major), T6 (major, the part on tabs)
- Severity: blocker - normal multi-tab use revokes the session, and it happens as written.
- Location: specs/api-auth-tokens/spec.md > Clients refresh once on an unauthenticated response
- Current text: "Concurrent failing requests SHALL share one refresh."
- Assumption: One client equals one JavaScript context, so one in-memory single-flight refresh is enough.
- Problem: All tabs share the refresh cookie, but each tab has its own memory. The access token is memory-only, so every new tab or reload also has to refresh. Under D27, a second use of a rotated token revokes the whole session. D27 rejected a grace period, so the fix has to be on the client side.
- Failure scenario: The browser restores two Cardigan tabs, or two idle tabs both get a 401 after 15 minutes. Both send R1. One rotates it, and the other counts as theft. The session is revoked and both tabs go to login.
- Proposed fix (A1, S8): Add to that requirement in specs/api-auth-tokens/spec.md: "On web, the shared refresh SHALL cover all tabs and windows that share the refresh cookie, including the refresh made when a page loads: at most one refresh SHALL be in flight across them, and a tab that waited SHALL obtain its access token without sending the already-rotated cookie again." Add: "#### Scenario: Two tabs need a token at once / **WHEN** two tabs of the web app need a new access token at the same time / **THEN** only one refresh request using the current cookie is in flight at a time, and the session is not revoked".
- Proposed fix (D6, T6): "On web, this SHALL hold across all open tabs of a browser, because they share the refresh cookie." Add: "#### Scenario: Two tabs / **WHEN** two tabs of the web app need a new access token at the same time / **THEN** only one refresh request is sent, both tabs get a valid access token, and the session stays active".
- Alternative named by T6: Accept tab logouts, remove the tab sentence, and state that in the spec.
- Upstream: no

### A2: "Refresh fails" assumes every failure means the session is dead
**Status:** applied
**Also reported as:** D5 (major), T7 (major), S16 (minor)
- Severity: blocker - read literally, a network drop logs the user out, and clients can reasonably differ.
- Location: specs/api-auth-tokens/spec.md > Clients refresh once on an unauthenticated response
- Current text: "When the refresh fails, the client SHALL end the session and return the user to login."
- Assumption: A refresh only fails because the token is invalid. The only scenario covers 401 `INVALID_REFRESH_TOKEN`, but refresh can also hit a network error, 429 (refresh is rate limited by this same spec), 500, or a proxy 502/503 during a deploy.
- Problem: Whether tokens are discarded on those failures is undefined. The spec also doesn't say what happens when the retried request gets 401 again, so "once" is never tested, and that case could loop or log out depending on the client. A client that discards its token after a temporary failure also leaves a valid refresh token on the server for up to 30 days, with no client able to end it.
- Failure scenario: A phone loses signal while refreshing, or a CD deploy returns 502. One client discards its tokens and shows login. Another keeps them. A burst of reloads on web hits 429 and logs the user out. Separately, the backend returns 401 for the new token too, and the client loops until it is rate limited.
- Proposed fix: Replace the sentence with: "When the refresh fails with 401 `INVALID_REFRESH_TOKEN`, the client SHALL discard its tokens and return the user to login. When the refresh fails for any other reason (network error, 429, 5xx), the client SHALL keep its tokens, fail the original request as a temporary error and try refreshing again on a later request. When the retried request fails with 401 `UNAUTHENTICATED` again, the client SHALL NOT refresh again for that request and SHALL end the session." Add: "#### Scenario: Refresh has no network / **WHEN** the refresh request cannot reach the backend / **THEN** the client keeps its tokens and shows an error for the original request", "#### Scenario: Refresh rate limited / **WHEN** the refresh fails with 429 `RATE_LIMITED` / **THEN** the client keeps its tokens and shows an error for the original request", and "#### Scenario: Retry fails again / **WHEN** the refresh succeeds and the retried request fails with 401 `UNAUTHENTICATED` / **THEN** the client sends no second refresh and shows login".
- Decision to confirm: This narrows D24's "a failed refresh ends the session", which does not say what counts as failed. The alternative is to apply D24 literally and state that logout on network loss is intended.
- Upstream: no
- Test sketch (from T7):
  - Level: contract (fake server)
  - Arrange and act: Script 401 on a call, 200 on refresh, and 401 on the retry.
  - Passes when: There is exactly one refresh and login is shown.
  - Fails when: The client loops, and the test counts more than one refresh.

### D2: Keeping card numbers on import silently contradicts `domain-card`, and no delta declares it
**Status:** applied
- Severity: major - after archive, two main specs contradict each other on card numbering, and the proposal says nothing existing changes.
- Location: proposal.md > Modified Capabilities; specs/board-export-format/spec.md > Requirement: Card numbers in the file
- Current text: proposal: "### Modified Capabilities\n- None." Export spec: "Imported cards SHALL keep their numbers."
- Problem: `domain-card` > Card number is unique per board and never reused says: "assigned by the backend when the card is created. The first card created in a board SHALL get 1. Each new card in that board SHALL get a number higher than every number ever assigned in that board." An imported file with cards 109, 3, 7 breaks all of this. D34 settled that numbers are kept, so `domain-card` needs a MODIFIED delta.
- Failure scenario: A client or backend developer reading `domain-card` treats it as a complete rule, for example a database constraint or test that the first number is 1 and numbers increase in creation order. Import then fails, or the rule gets dropped by whoever hits it first.
- Proposed fix: In proposal.md, change Modified Capabilities to "- `domain-card`: Card numbers can come from an imported file." Add specs/domain-card/spec.md (no `## Purpose`) with `## MODIFIED Requirements` and the whole existing requirement block, keeping its three scenarios, with this description: "Every card SHALL have a positive integer number. A card created through the API SHALL get its number from the backend: the first card created in a board SHALL get 1, and each new card SHALL get a number higher than every number ever assigned in that board. A card created by an import SHALL keep its number from the file, as defined in `board-export-format`, and those numbers count as assigned. Numbers of deleted cards SHALL never be assigned again. A card's number SHALL never change." Add the scenario "Imported card keeps its number": "**WHEN** a card with the number 109 is imported into a new board" / "**THEN** it has the number 109 and the next new card in that board gets a higher number".
- Upstream: no

### D1: Scenario uses board key `CRD2`, which `domain-board` forbids
**Status:** applied
**Also reported as:** A18 (minor)
- Severity: major - the scenario contradicts a main spec and would produce a wrong test. A backend that follows `domain-board` fails it.
- Location: specs/board-export-format/spec.md > Requirement: Imported board key and clashes > Scenario: Retry with another key
- Current text: "**WHEN** the user then imports the same file with the `key` part `CRD2`" / "**THEN** the board is created with the key `CRD2` and its cards have display IDs like `CRD2-109`"
- Problem: `domain-board` > Board key format allows only 2 to 5 letters A-Z. Its own scenario rejects `CR1` because of the digit.
- Failure scenario: A backend developer writes this scenario as an import test. It fails with a validation error, or someone relaxes key validation on import so that a digit key gets stored.
- Proposed fix: In specs/board-export-format/spec.md, replace with: "**WHEN** the user then imports the same file with the `key` part `CRDB`" / "**THEN** the board is created with the key `CRDB` and its cards have display IDs like `CRDB-109`"
- Upstream: no

### T12: Error precedence leaves out several codes and has ties
**Status:** applied with edits
**Applied as:** A7's login rule was not applied. D4 leaves it to the auth feature spec, and no option was recommended.
**Also reported as:** S7 (major), A7 (major), D4 (major). S7 adds a security reason and a scenario: on a rate-limited endpoint the limit is checked first, and a request over the limit gets 429 without its credentials being evaluated, so "**WHEN** a client over the login limit sends the correct password / **THEN** the response is 429 `RATE_LIMITED`, not a successful login". Without this, an attacker over the limit sees 429 for wrong guesses and 200 for the right one. A7 also proposes: "Login SHALL NOT apply email format or password composition rules: a value that breaks them SHALL produce `INVALID_CREDENTIALS`." D4 leaves that login question to the auth feature spec, so it is a separate choice for the user. T12 and D4 otherwise give the same order. T12 also fixes the order within size, media type and parsing.
- Severity: major - common requests have two valid answers.
- Location: api-errors/spec.md > Error precedence
- Current text: "authentication (401); request parsing, size and media type (400 `MALFORMED_REQUEST`, 413, 415); not found for path and body references (404); field validation (400 `VALIDATION_FAILED`); uniqueness (409)."
- Problem: 429 and 422 are missing. `INVALID_CREDENTIALS` and `INVALID_REFRESH_TOKEN` read as step one under "authentication", though they need a parsed body. The second step has no order among 413, 415 and 400. No scenario tests parsing against 404, and "invalid body" in "Expired token and invalid body" doesn't say parse failure or field failure.
- Failure scenario: An import with an over-limit title and a used key returns 422 from one implementation and 409 from another. A client that handles only the key dialog shows the wrong error.
- Proposed fix: Replace the sentence in api-errors/spec.md with "When a request breaks several rules, the backend SHALL report only the first applying rule in this order: rate limit (429); access token (401 `UNAUTHENTICATED`); size (413); media type (415); parsing (400 `MALFORMED_REQUEST`); route and references (404); field validation (400 `VALIDATION_FAILED`, or 422 `INVALID_EXPORT_FILE` for import file content); credentials and refresh tokens (401 `INVALID_CREDENTIALS`, 401 `INVALID_REFRESH_TOKEN`); uniqueness (409)." Add "#### Scenario: Missing board and unparseable body / **WHEN** a rename for a board that does not exist has an unparseable body / **THEN** the response is 400 `MALFORMED_REQUEST`" and "#### Scenario: Invalid file and used key / **WHEN** an import file has an over-limit title and a used key / **THEN** the response is 422 `INVALID_EXPORT_FILE`". This keeps D17's order and fills its gaps, including file validation before the key clash.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Send requests that each break two adjacent rules.
  - Passes when: Each returns the earlier rule's code.
  - Fails when: The resource is loaded before the body is parsed, and the test sees 404 for the unparseable body.

### T14: Moving a card to a column of the user's other board has no stated code
**Status:** applied
**Also reported as:** D3 (major), A14 (minor). All three recommend 404. D3 also quotes the requirement in `domain-card` > A card stays in one board: "Moving a card to a column of another board SHALL be rejected."
- Severity: major - the rule exists in `domain-card`, but no error applies to it.
- Location: api-errors/spec.md > Other users' data is not found, never forbidden
- Current text: "Every reference to a board, column, card or label that does not exist or belongs to another user SHALL produce 404 `NOT_FOUND`"
- Problem: `domain-card` says this move "SHALL be rejected". That column exists and belongs to the same user, so this requirement doesn't cover it, and no other requirement does.
- Failure scenario: One backend returns 400 `INVALID_VALUE`, and a client written for 404 shows the wrong message.
- Proposed fix: Add to api-errors/spec.md, in that requirement: "A column or card referenced under a board it does not belong to SHALL also produce 404 `NOT_FOUND`." Add "#### Scenario: Target column in another board / **WHEN** a card is moved to a column of another board of the same user / **THEN** the response is 404 `NOT_FOUND` and no position changes". The alternative is 400 `VALIDATION_FAILED` with `INVALID_VALUE`.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Create two boards for one user and move a card from the first to a column of the second.
  - Passes when: The response is 404 and positions are unchanged.
  - Fails when: Only ownership is checked, and the test sees 200 and a card in another board.

### T13: Unknown routes have no stated result without a token or with a wrong method
**Status:** applied · **Conflict:** C2
**Also reported as:** D7 (major), A5 (major, the part on 405). D7's fix: in specs/api-conventions/spec.md, replace the WHEN with "**WHEN** a client calls a path and method under `/api/v1/` that no endpoint serves, with or without an access token". Add the scenario "**WHEN** a client sends POST to a path that only serves GET / **THEN** the response is 404 with the error code `ROUTE_NOT_FOUND`". In specs/api-errors/spec.md > Error precedence, add: "`ROUTE_NOT_FOUND` SHALL be checked before all of these." All three name 405 `METHOD_NOT_ALLOWED` as the alternative for a wrong method.
- Severity: major - common framework defaults conflict with the closed catalog.
- Location: api-conventions/spec.md > All endpoints use a versioned base path (Unknown path)
- Current text: "**WHEN** a client calls a path under `/api/v1/` that no endpoint serves"
- Problem: The scenario sets no authentication state, and a security filter often answers 401 before routing. A wrong method on a real path normally gives 405, which is not in the closed catalog.
- Failure scenario: `PUT` on a card, which D18 rules out, returns 405 with no catalog code, and generated error mapping fails. A test of an unknown path without a token sees 401 where the scenario says 404.
- Proposed fix: In api-conventions/spec.md, replace the scenario's WHEN with "**WHEN** an authenticated client calls a path under `/api/v1/` that no endpoint serves". Add "#### Scenario: Unknown path without a token / **WHEN** a client without a token calls such a path / **THEN** the response is 401 `UNAUTHENTICATED`" and "#### Scenario: Wrong method / **WHEN** an authenticated client calls an existing path with a method it does not serve / **THEN** the response is 404 `ROUTE_NOT_FOUND`". The alternative is adding 405 `METHOD_NOT_ALLOWED` to the catalog, which changes D12.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Send `PUT` to a card path with a valid token.
  - Passes when: The response is 404 `ROUTE_NOT_FOUND` as problem details.
  - Fails when: The framework default returns 405, and the test sees the wrong status.

### T10: Field error codes overlap, and one field can break several rules
**Status:** applied
**Also reported as:** D8 (major). D8 proposes a similar order and places `INVALID_VALUE` before `PASSWORD_TOO_WEAK` and adds `ALREADY_USED` last, and it adds this scenario: "**WHEN** a board is saved with the key `C` / **THEN** the field error for `key` has the code `TOO_SHORT` with `min` 2". D8 names one entry per broken rule as the alternative too. **Corrected citation:** the original texts said key `C1` could be `TOO_SHORT`, but it has a valid length of 2.
- Severity: major - clients map codes to messages, so backends and clients can build different mappings.
- Location: api-errors/spec.md > Field error codes; Field errors identify the field and rule (Two broken fields, Array item); Validation errors report all broken fields
- Current text: "`INVALID_FORMAT` (such as email, board key or UUID syntax)"
- Problem: Key `C` fits both `TOO_SHORT` and `INVALID_FORMAT`. Key `ABCDEF` fits both `TOO_LONG` and `INVALID_FORMAT`. Nothing says if a field with two broken rules gets one entry or two. "Two broken fields" and "Array item" check only `field`, not `code`.
- Failure scenario: Key `C` returns `INVALID_FORMAT`, while the client's localized text is keyed to `TOO_SHORT` with `min`. An 11-character password with no digit gets one entry from one implementation and two from another, and exact-list tests disagree.
- Proposed fix: In api-errors/spec.md, add to "Field error codes": "Each field SHALL produce at most one entry, using the first rule it breaks in this order: `REQUIRED`, `INVALID_CHARACTER`, `TOO_SHORT`, `TOO_LONG`, `INVALID_FORMAT`, `PASSWORD_TOO_WEAK`, `INVALID_VALUE`, `OUT_OF_RANGE`. For a board key, a wrong length SHALL be `TOO_SHORT` or `TOO_LONG` and a wrong character SHALL be `INVALID_FORMAT`." Replace the THEN of "Two broken fields" with "**THEN** `fieldErrors` contains exactly `name` with code `REQUIRED` and `key` with code `INVALID_FORMAT`". Replace the THEN of "Array item" with "**THEN** the field error has the field `labelIds[2]` with code `INVALID_FORMAT`". The alternative is one entry per broken rule.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Create a board with key `C`, then register with an 11-character password with no digit.
  - Passes when: There is exactly one entry per field: `TOO_SHORT` with `min` 2 for the key and `TOO_SHORT` with `min` 12 for the password.
  - Fails when: A regex-only key validator is used, and the test sees `INVALID_FORMAT`.

### S12: Card numbers in a file have no upper bound
**Status:** applied with edits · **Conflict:** C4
**Applied as:** A number outside the limit gets the generic 422 with no field error, after the follow-up below. T20's scenario for number 0 was kept.
**Also reported as:** D9 (major), A15 (minor), T20 (major, the part on numbers)
- Severity: major - a crafted file can leave a board unusable, but the damage is limited to that imported board.
- Location: specs/board-export-format/spec.md > Requirement: Card numbers in the file
- Current text: "Card numbers in the file SHALL be positive integers, unique within the file."
- Problem: Normal card creation can never reach huge numbers, but a file can. The next number is highest plus one, so the highest possible value overflows. JavaScript clients lose precision above 2^53, and generated mobile clients may use 32-bit types.
- Failure scenario: Someone shares a board file with a card numbered at the 64-bit maximum, and a colleague imports it. Every new card on that board fails with 500 or gets a wrapped number. Web can show wrong display IDs, and a client that uses a 32-bit type can fail to decode the board.
- Proposed fix (S12, D9, A15): Replace the sentence with: "Card numbers in the file SHALL be integers from 1 to 1,000,000,000, unique within the file. Any other value SHALL produce a field error with code `OUT_OF_RANGE` with `min` 1 and `max` 1000000000." Add: "#### Scenario: Number too large / **WHEN** a card in the file has the number 9007199254740993 / **THEN** the response is 422 `INVALID_EXPORT_FILE` with a field error with code `OUT_OF_RANGE` for that card's `number`."
- Proposed fix (T20): "Card numbers SHALL be from 1 to 2,147,483,646." with the scenario "**WHEN** a card has number 0 / **THEN** the response is 422 `INVALID_EXPORT_FILE` with code `OUT_OF_RANGE`, `min` 1 and `max` 2147483646". The value needs to stay low enough to leave room for further numbers.
- Upstream: no

### T21: An invalid `key` part and a missing `file` part have no stated result
**Status:** applied with edits · **Conflict:** C3
**Applied as:** Follows T21 and A11, including 400 for an invalid `key` part after the follow-up below.
**Also reported as:** D10 (major), A11 (major). D10's fix: "The `key` part SHALL be validated with the board key rules. An invalid `key` part SHALL be rejected with 422 `INVALID_EXPORT_FILE` and a field error for `key`. When a valid `key` part is present, the file's key SHALL NOT be validated." A11 adds a further problem: system pickers and browsers send `application/octet-stream`, `application/json` or an empty type, so a backend that checks the part type returns 415 where the PNG scenario expects 422 and import works on web only. A11's added text: "The backend SHALL ignore the content type and file name of the `file` part and judge only its content." All three agree on a missing `file` part, and that an override removes validation of the file's key.
- Severity: major - this is the retry path the key clash dialog uses.
- Location: board-export-format/spec.md > Import upload; Imported board key and clashes
- Current text: "Import SHALL be one blocking `multipart/form-data` request with a required `file` part holding the export file and an optional `key` part."
- Problem: There's no result for no `file` part, a non-multipart request, or a `key` part of `C1`. The key part isn't in the file, so its path and status (400 or 422) are unclear. It's also unclear if the file's key is still validated when overridden.
- Failure scenario: A user enters `C1` in the key dialog. One backend returns 422 with `key`, another 400. A file with a broken `board.key` and a good override is rejected by one and accepted by the other.
- Proposed fix: Add to board-export-format/spec.md: "A missing `file` part SHALL produce 400 `VALIDATION_FAILED` with a field error for `file` with code `REQUIRED`. An invalid `key` part SHALL produce 400 `VALIDATION_FAILED` with a field error for `key`. When the `key` part is present, `board.key` in the file SHALL be ignored." Add "#### Scenario: Invalid key part / **WHEN** a valid file is uploaded with the `key` part `C1` / **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `key` with code `INVALID_FORMAT`", "#### Scenario: Missing file / **WHEN** a multipart request has no `file` part / **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `file` with code `REQUIRED`" and "#### Scenario: Not multipart / **WHEN** the import endpoint receives `application/json` / **THEN** the response is 415 `UNSUPPORTED_MEDIA_TYPE`". The alternative is 422 for the `key` part, so all import content errors share one status.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Upload a valid file with key `C1`.
  - Passes when: The response is 400 with `key`, and no board is created.
  - Fails when: The override skips validation, and the test sees 201 with a board keyed `C1`.

### T19: Import has no rule for missing fields, wrong types or bad timestamps, and field reporting is unclear
**Status:** applied with edits · **Conflict:** C5, C7
**Applied as:** A10's wording on C5. The per-field codes and the full list were removed by the follow-up below.
**Also reported as:** A10 (major), D11 (minor). A10's fix: "A missing required property or a value of the wrong JSON type SHALL be rejected with 422 `INVALID_EXPORT_FILE`, with field code `REQUIRED` or `INVALID_FORMAT` and the path into the file. `format`, `formatVersion`, `board`, `name`, `key`, `labels`, `columns`, `cards`, `number`, `title` and `color` are required; a missing `description` means the empty string. `exportedAt`, `createdAt` and `updatedAt` SHALL NOT be validated and MAY be missing. Card label names that map to the same label SHALL count as one label." D11 agrees that wrong types are 422 and timestamps are never validated.
- Severity: major - this is the main invalid input an import will see, and it is not covered.
- Location: board-export-format/spec.md > Import validates every rule of the domain; api-errors/spec.md > Field errors identify the field and rule
- Current text: "Every value in the file SHALL be normalized and validated with the same rules that apply when the data is created through the API."
- Problem: API wrong types give `MALFORMED_REQUEST`, but a file's problems must be 422. No code is given for `"title": 123` or a missing `columns`. "Every value" conflicts with "Timestamps in the file SHALL be ignored" for a broken `createdAt`. Nothing says if all violations are listed. api-errors defines `field` as a path in "the request body", not the file as D14 says.
- Failure scenario: A hand-edited file with a missing `description` returns 500, 400 or 422 depending on the implementation. A file with `"createdAt": "yesterday"` is accepted by one backend and rejected by another.
- Proposed fix: Add to board-export-format/spec.md: "A missing required field SHALL be reported with code `REQUIRED`, and a value of the wrong JSON type with code `INVALID_FORMAT`. `exportedAt`, `createdAt` and `updatedAt` SHALL NOT be validated and may be missing. `fieldErrors` SHALL list every violation in the file." Add "#### Scenario: Missing and wrong-typed fields / **WHEN** the first card of the first column has no `description` and a `title` of `123` / **THEN** the response is 422 `INVALID_EXPORT_FILE` with field errors for `board.columns[0].cards[0].description` with code `REQUIRED` and `board.columns[0].cards[0].title` with code `INVALID_FORMAT`" and "#### Scenario: Broken timestamp / **WHEN** a card has `"createdAt": "yesterday"` / **THEN** the import proceeds". In api-errors/spec.md, change to "the JSON path of the property in the request body or import file".
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Upload files with each defect.
  - Passes when: The results match the scenarios.
  - Fails when: The file is bound to a typed class, and the test sees 400 `MALFORMED_REQUEST`.

### T20: Import label and number rules give no code or path
**Status:** applied with edits · **Conflict:** C6, and C4 for its card number limit, which is covered under S12
**Applied as:** The label on a card follows A10 (C6), and the number limit is under S12. The codes and paths were removed by the follow-up below.
**Also reported as:** D12 (minor), A10 (major, the part on `["Bug", "bug"]`). D12 agrees on the codes `INVALID_VALUE` and `ALREADY_USED`.
- Severity: major - the rule is stated, but a test can't assert the result.
- Location: board-export-format/spec.md > Card labels must be declared in the file; Card numbers in the file
- Current text: "**THEN** the response is 422 `INVALID_EXPORT_FILE` with a field error for that card label entry"
- Problem: "Undeclared label" has no code. "Two entries in `board.labels` SHALL NOT have the same case-folded name" has no scenario, code or path. `0`, `-1` and very large `number` values have no scenario, and "positive integer" has no upper limit. A card with `["Bug", "bug"]` is undefined.
- Failure scenario: A file with `number: 9007199254740993` or 2^63 overflows, so the import gives 500, or the next card number can't be assigned.
- Proposed fix: In board-export-format/spec.md, replace the THEN with "**THEN** the response is 422 `INVALID_EXPORT_FILE` with a field error for `board.columns[0].cards[0].labels[0]` with code `INVALID_VALUE`". Add to the requirements: "Card numbers SHALL be from 1 to 2,147,483,646." Add "#### Scenario: Duplicate declared label / **WHEN** `board.labels` has `Bug` and `bug` / **THEN** the response is 422 `INVALID_EXPORT_FILE` with code `ALREADY_USED` for the second entry's `name`", "#### Scenario: Duplicate label on a card / **WHEN** a card lists `Bug` and `bug` / **THEN** the response is 422 `INVALID_EXPORT_FILE` with code `ALREADY_USED` for the second entry" and "#### Scenario: Number out of range / **WHEN** a card has number 0 / **THEN** the response is 422 `INVALID_EXPORT_FILE` with code `OUT_OF_RANGE`, `min` 1 and `max` 2147483646". The alternative is a larger maximum, such as the largest safe JSON integer. The value needs to leave room for one more number.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Upload files with number 0, number 2^63, and duplicate labels.
  - Passes when: Each returns 422 with the stated code and path.
  - Fails when: The value overflows, and the test sees 500.

### T5: Access tokens after logout or session revocation are undefined
**Status:** applied
**Also reported as:** A4 (major), S5 (major). All three recommend that issued access tokens stay valid until expiry, because that matches the planned stateless JWT design. All three name immediate rejection as the alternative. A4 adds: "Revocation takes full effect at the latest 15 minutes later." S5 adds: "On logout a client SHALL discard its access and refresh tokens, whatever the response."
- Severity: major - two valid tests would disagree on a security behavior.
- Location: api-auth-tokens/spec.md > Reusing a rotated refresh token revokes the session; Logout ends only the current session
- Current text: "the backend SHALL revoke the whole session, including its current refresh token"
- Problem: "Whole session" doesn't say if the outstanding access token stops working. "Other device unaffected" uses the unobservable "keeps working".
- Failure scenario: One test expects 401 on the access token right after reuse is detected. Another expects it to work until expiry. D1 and D26 don't settle this, and the planned stateless JWTs imply the second.
- Proposed fix: Add to "Token lifetimes" in api-auth-tokens/spec.md: "Revoking a session or logging out SHALL NOT affect an access token already issued. It stays valid until it expires." Add "#### Scenario: Access token after logout / **WHEN** a client logs out and then calls a protected endpoint with its unexpired access token / **THEN** the request succeeds". Replace the THEN of "Other device unaffected" with "**THEN** a refresh with device B's refresh token succeeds". The alternative is immediate rejection, which needs a server-side lookup on every request.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Log in, log out, then call a protected endpoint with the access token.
  - Passes when: The result matches the stated rule (200).
  - Fails when: A partial denylist affects only some paths, and the test sees 401.

### S3: Concurrent refreshes with one token are not required to be atomic
**Status:** applied
**Also reported as:** T6 (major, the part on concurrent rotation), A3 (major, the part on atomicity)
- Severity: major - a race creates an undetected second token chain, but it needs a stolen token and tight timing.
- Location: specs/api-auth-tokens/spec.md > Requirement: Refresh rotates the refresh token
- Current text: "Each successful refresh SHALL issue a new access token and a new refresh token valid for 30 days, and SHALL invalidate the refresh token that was used."
- Problem: Sequential tests cannot show the race, and the requirement does not rule it out.
- Failure scenario: A thief's and a victim's requests with R1 arrive together. Both read R1 as valid in separate transactions and both get new tokens. No reuse is ever seen, so both chains stay alive.
- Proposed fix: Add to this requirement: "Rotation SHALL be atomic. When several requests use the same refresh token at the same time, at most one SHALL succeed, and each of the others SHALL be treated as reuse of a rotated token." Add this scenario: "#### Scenario: Parallel refresh with one token / **WHEN** two refresh requests with the same valid refresh token are processed at the same time / **THEN** at most one succeeds, and the other fails with 401 `INVALID_REFRESH_TOKEN` and revokes the session."
- Upstream: no
- Test sketch (from T6):
  - Level: contract
  - Arrange and act: Send 10 parallel refreshes with one token.
  - Passes when: At most one returns 200.
  - Fails when: Rotation is check-then-update, and the test sees two 200s.

### S2: Reuse detection can be silently lost when rotated tokens are cleaned up
**Status:** applied
**Also reported as:** A3 (major, the part on token history)
- Severity: major - the theft case stops being detected in production while tests stay green, but it needs both a stolen token and a cleanup job.
- Location: specs/api-auth-tokens/spec.md > Requirement: Reusing a rotated refresh token revokes the session
- Current text: "When a refresh token that was already rotated is used again, the backend SHALL revoke the whole session, including its current refresh token"
- Problem: Detection needs a record of old tokens, and the spec does not say how long it lasts. It also does not say what wins when a rotated token has passed its original expiry, and it does not define a session. The only scenario has the thief replaying after the victim.
- Failure scenario: A cleanup job deletes rotated rows. The thief refreshes with stolen R1 first. The victim's later R1 is "unknown", so it gets 401 with no revocation. The victim logs in again, while the thief keeps refreshing the old session forever under sliding expiry.
- Proposed fix: Add to this requirement: "Login and register each start a new session, and each refresh token belongs to one session. The backend SHALL keep a record of every rotated refresh token for as long as its session is active, so that a rotated token is always detected as reused, even after its own 30 days have passed." Add this scenario: "#### Scenario: Thief refreshes first / **WHEN** refresh token R1 is stolen, the thief rotates it to R2, and the owner then uses R1 / **THEN** the response is 401 `INVALID_REFRESH_TOKEN`, and a later refresh with R2 also fails with 401 `INVALID_REFRESH_TOKEN`."
- Upstream: no

### A3: Rotation assumes the new token always reaches storage
**Status:** applied
**Merged parts:** A3's points on atomicity and token history are under S3 and S2.
- Severity: major - a lost response forces a logout, which is limited in reach, but clients and backend can differ.
- Location: specs/api-auth-tokens/spec.md > Reusing a rotated refresh token revokes the session; Refresh rotates the refresh token
- Current text: "When a refresh token that was already rotated is used again, the backend SHALL revoke the whole session"
- Assumption: The refresh response is delivered and saved before the process dies.
- Problem: Without D27's rejected grace period, a lost response or a kill between receiving and saving R2 leaves the client holding R1, and its next refresh revokes the session. That outcome is a direct result of D27 and isn't written down, so a client might try to work around it or treat it as a bug.
- Failure scenario: Android is killed right after the refresh response arrives, before secure storage is written. On next launch it sends R1, and the user lands on login. Test authors can't tell if this is expected.
- Proposed fix: Add to "Reusing a rotated refresh token revokes the session" in specs/api-auth-tokens/spec.md: "A refresh whose response was lost or not saved may already have rotated the token; using the old token afterwards counts as reuse and the user logs in again. There is no grace period." Add to "Mobile uses the body transport": "Apps SHALL save a new refresh token to secure storage before sending any further request with the new access token."
- Upstream: no

### S4: Nothing explicitly rejects forged tokens or refresh tokens used as bearer tokens
**Status:** applied
**Also reported as:** T24 (minor)
- Severity: major - a mistake here gives API access outside every token rule, though code review may catch it.
- Location: specs/api-auth-tokens/spec.md > Requirement: Protected requests use a bearer access token; Invalid refresh tokens
- Current text: "A missing, invalid or expired access token SHALL produce 401 `UNAUTHENTICATED`."
- Problem: "Invalid" is undefined, and the scenarios cover only missing and expired tokens. "Unknown" refresh tokens have no scenario. The signing algorithm is deferred, and `be-common` tests use helpers that mint tokens, so a wrong-kind or wrong-key token may never be tried.
- Failure scenario: Refresh tokens are built as JWTs with the same key. A stolen one works as a bearer token for 30 days. It skips the 15-minute limit, rotation and reuse detection, and it keeps working after logout if only the signature is checked.
- Proposed fix: Add to this requirement: "A token is invalid when its signature does not verify with the backend's key, when it uses an algorithm the backend did not choose, or when it is not an access token." Add: "#### Scenario: Refresh token as bearer / **WHEN** a client calls a protected endpoint with a refresh token in the `Authorization` header / **THEN** the response is 401 `UNAUTHENTICATED`", "#### Scenario: Tampered token / **WHEN** a client calls a protected endpoint with an access token whose signature does not verify / **THEN** the response is 401 `UNAUTHENTICATED`", "#### Scenario: Wrong scheme / **WHEN** the header is `Authorization: Basic abc` / **THEN** the response is 401 `UNAUTHENTICATED`" and "#### Scenario: Unknown refresh token / **WHEN** a client refreshes with a random string / **THEN** the response is 401 `INVALID_REFRESH_TOKEN`".
- Upstream: no
- Test sketch (from T24):
  - Level: contract
  - Arrange and act: Change one character of the token's signature and call a protected endpoint.
  - Passes when: The response is 401.
  - Fails when: Claims are read without verification, and the test sees 200.

### S6: Rate limits have no defined key, so they can be bypassed or turned against all users
**Status:** applied
- Severity: major - password guessing goes unthrottled or all users get locked out, and a test from one fixed address shows neither.
- Location: specs/api-auth-tokens/spec.md > Requirement: Auth endpoints are rate limited
- Current text: "The exact limits SHALL be a backend setting and SHALL NOT be relied on by clients."
- Problem: D29 leaves the values to the backend, but nothing says what is counted. The backend sits behind a reverse proxy, so the "client" is ambiguous.
- Failure scenario: (1) The backend counts by remote address and sees only the proxy, so one attacker's requests produce 429 for every user's login. (2) The backend trusts a forwarded header sent by the client, and an attacker changes it on every request, so the limit never applies.
- Proposed fix: Add to this requirement: "Limits SHALL be counted per client IP address. The address SHALL come from the deployment's trusted reverse proxy, and values a client can set itself SHALL NOT be trusted. Login SHALL also be limited per email, compared after case folding." An IP-only limit is the alternative. It avoids an attacker locking a known email out of login, but it lets a distributed attacker guess one account's password. If the user prefers, the key rule can go in the backend store instead.
- Upstream: no

### S9: Body limits do not say they apply to bytes actually received
**Status:** applied
- Severity: major - unauthenticated clients could exhaust memory on the single VPS, but the fix is small and local.
- Location: specs/api-conventions/spec.md > Requirement: Request body size limit; specs/board-export-format/spec.md > Requirement: Import upload
- Current text: "A request body larger than 256 KB SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`, except where a spec defines a different limit for an endpoint."
- Problem: A check of `Content-Length` satisfies the scenario. Import limits only the file part, so other parts and the overall request have no limit. Login, register and refresh are reachable with no token.
- Failure scenario: An attacker sends a chunked, very large JSON body to login. A header-based check sees nothing, and the backend buffers the body until it runs out of memory. In a second case, an authenticated attacker sends many large extra multipart parts, which are written to temporary storage.
- Proposed fix: Add to the requirement in specs/api-conventions/spec.md: "The limit SHALL apply to the bytes actually received, whether or not the request has a `Content-Length` header, and the backend SHALL stop reading once the limit is passed." Add: "#### Scenario: Oversized chunked body / **WHEN** a client sends a 300 KB JSON body with chunked encoding and no `Content-Length` / **THEN** the response is 413 `PAYLOAD_TOO_LARGE`." Add to Import upload in specs/board-export-format/spec.md: "The whole multipart request SHALL NOT exceed 5 MB plus 64 KB for the `key` part and multipart overhead; a larger request SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`. Other parts SHALL be ignored and SHALL NOT be stored."
- Upstream: no

### S10: Import has no limit on item counts, so one user can flood the system
**Status:** applied with edits
**Applied as:** The limits apply, but an over-limit file gets the generic 422 with no field error, after the follow-up below.
- Severity: major - a single free account can exhaust a single-VPS deployment, though it needs an authenticated user.
- Location: specs/board-export-format/spec.md > Requirement: Import upload
- Current text: "A file over 5 MB SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`."
- Problem: By the reviewer's estimate, 5 MB of minimal cards is about 60,000 cards, or well over 100,000 labels, in one blocking transaction. Rate limiting does not cover import (D29), and lists are unpaginated (D22), so this later affects every list and export call. The domain specs set no counts.
- Failure scenario: An attacker registers and imports the same 5 MB file repeatedly under new keys. Each import holds a long transaction and adds tens of thousands of rows until storage fills or the database slows for everyone.
- Proposed fix: This needs the user's choice of numbers. Add to Import upload in specs/board-export-format/spec.md: "A file SHALL contain at most 200 columns, 20,000 cards and 500 labels in `board.labels`. A file over one of these limits SHALL be rejected with 422 `INVALID_EXPORT_FILE` with a field error with code `OUT_OF_RANGE` and `max` for the array." The alternative is per-account quotas on boards and labels. The risk with file limits is that a very large real board can be exported but not re-imported, so the limits should sit above realistic use.
- Upstream: no

### S11: Import error responses can be far larger than the request
**Status:** applied with edits · **Conflict:** C7
**Applied as:** Not the cap of 100. The response has no field errors, and validation stops at the first violation, which closes the same risk.
- Severity: major - one small request can force a response of hundreds of MB, which can take down the backend.
- Location: specs/board-export-format/spec.md > Requirement: Import validates every rule of the domain
- Current text: "Rule violations SHALL be rejected with 422 `INVALID_EXPORT_FILE` and `fieldErrors` whose `field` is the JSON path into the file"
- Problem: Implementers will likely reuse the "report every broken field" rule from `api-errors`. An empty card costs about 3 bytes in the file, but it produces several errors of about 70 bytes each. D17's "all field errors" applies to `VALIDATION_FAILED`, and D40 does not require all errors for import, so a cap fits the decisions.
- Failure scenario: By the reviewer's estimate, a 5 MB file with over a million empty card objects in one column produces several million error entries. Building the response uses hundreds of MB of memory, and the backend runs out of it.
- Proposed fix: Add to this requirement: "`fieldErrors` SHALL contain at most 100 entries, in file order. A file with more violations SHALL report the first 100. Validation SHALL stop once that number is reached." Add: "#### Scenario: Many broken cards / **WHEN** a file breaks more than 100 rules / **THEN** the response is 422 `INVALID_EXPORT_FILE` with exactly 100 field errors."
- Upstream: no

### S13: No requirement says the API is HTTPS-only, and `Secure` can silently disappear
**Status:** applied
- Severity: major - this exposes passwords and tokens if a configuration slips, and `41-infra-vps.md` already lists TLS and cookies as a risk that surfaces late.
- Location: specs/api-conventions/spec.md > Requirement: Same-origin only (new requirement next to it); specs/api-auth-tokens/spec.md > Requirement: Web uses a protected refresh cookie
- Current text: "The refresh cookie SHALL be `HttpOnly`, `Secure` and `SameSite=Strict`, and SHALL be scoped to the auth endpoints' path."
- Problem: The specs cover only the cookie, and neither cookie scenario checks the `Secure` flag on the wire. TLS ends at the proxy, so the backend sees HTTP. Local development also tempts people to add a switch for `Secure`.
- Failure scenario: A profile setting ties `Secure` to the request scheme. Production issues the cookie without it, and all scenarios pass. A later plain-HTTP request to the same host sends the refresh token in the clear. In a second case, a release mobile build keeps an `http://` base URL from development and sends passwords unencrypted.
- Proposed fix: Add to specs/api-conventions/spec.md: "### Requirement: HTTPS only / Outside local development, the API SHALL be served only over HTTPS. A plain HTTP request SHALL NOT be processed by an endpoint. Release builds of clients SHALL use only an HTTPS base URL. / #### Scenario: Plain HTTP request / **WHEN** a client sends a request to the production API over plain HTTP / **THEN** no endpoint processes it." Add to the cookie requirement in specs/api-auth-tokens/spec.md: "These attributes SHALL NOT depend on the scheme the backend sees." Add: "#### Scenario: Cookie attributes in production / **WHEN** a web login succeeds in production / **THEN** the `Set-Cookie` header carries `HttpOnly`, `Secure`, `SameSite=Strict` and the auth path."
- Upstream: no

### A5: The error model assumes every error comes from the backend application
**Status:** applied with edits
**Applied as:** The "Error body" WHEN uses T18's wording.
**Also reported as:** D15 (minor)
**Merged parts:** A5's point on 405 is under T13.
- Severity: major - client error parsing breaks on real production responses, and this is caught late.
- Location: specs/api-errors/spec.md > Errors use problem details (Error body); Clients handle unknown error codes by status
- Current text: "Every error response SHALL have the content type `application/problem+json`"
- Assumption: Nothing sits in front of the application. But production runs behind a reverse proxy with a CD pipeline (docs/breakdown/chunks/41-infra-vps.md). The proxy can answer with HTML 413, 502, 503 or 504 itself.
- Problem: "Clients handle unknown error codes by status" only covers problem bodies with an unknown `code`. A body that isn't a problem document has no defined handling. A proxy body limit lower than 5 MB also breaks import with an HTML 413.
- Failure scenario: During a deploy the proxy returns an HTML 502. A generated client fails to decode the body and surfaces a serialization crash rather than a temporary error. A proxy default of 1 MB rejects a 2 MB import with HTML.
- Proposed fix: In specs/api-errors/spec.md, change the first sentence to "Every error response produced by the backend SHALL have...". Change the WHEN of "Error body" to "**WHEN** the backend rejects a request for any reason". Add to "Clients handle unknown error codes by status": "A client SHALL also handle an error response that is not valid problem details, such as from a proxy, by its HTTP status. 5xx responses SHALL be treated as temporary." Add to "Import upload" in specs/board-export-format/spec.md: "Everything in front of the backend SHALL accept requests of at least the import limit, so that the backend produces the 413."
- Upstream: no

### T15: The sort order of labels is not defined anywhere
**Status:** applied
**Also reported as:** A6 (major), D17 (minor). All three recommend code point order. D17 notes that `domain-card` > Card labels are a set sorted by name uses the same wording and needs the same clarification. A6's scenario uses `Zebra` and `Ärger`.
- Severity: major - backend, clients and the export can sort differently for non-ASCII names.
- Location: api-conventions/spec.md > Label list order; board-export-format/spec.md > Exported cards
- Current text: "The label list SHALL be sorted by case-folded name, as defined in `domain-label`."
- Problem: `domain-label` defines case folding for equality only and has no ordering rule. `domain-card` points to it as well. Code point, UTF-16 and locale ordering all pass the ASCII scenario.
- Failure scenario: With `Äpfel` and `Zebra`, a database locale collation returns `Äpfel` first, while code point order returns `Zebra` first. A client re-sorting by UTF-16 places emoji differently again.
- Proposed fix: Replace in api-conventions/spec.md with "The label list SHALL be sorted by the Unicode code points of the case-folded name, as compared in ascending order, independent of locale. Card labels and export file labels SHALL use the same order." Add "#### Scenario: Non-ASCII names / **WHEN** a user has labels `Zebra`, `Äpfel` and `apple` / **THEN** the label list returns `apple`, `Zebra`, `Äpfel`". The alternative is one fixed locale-neutral collation (Unicode root), which is more natural for users but harder for all platforms to match.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Create the three labels and list them.
  - Passes when: The order is exactly as in the scenario.
  - Fails when: The database uses a locale collation, and the test sees `Äpfel` before `Zebra`.

### A8: Move range rules assume the client's view of the column is current
**Status:** applied
- Severity: major - this is routine under the no-sync design, and no client behavior is defined.
- Location: specs/api-conventions/spec.md > Move target is the final position
- Current text: "Any other value SHALL be rejected with a validation error for `position` with the code `OUT_OF_RANGE`."
- Assumption: A client knows the real n. But the project has no real-time sync and new data arrives only via intentional refresh (docs/breakdown/OVERVIEW.md), so a second device's view is regularly stale.
- Problem: `OUT_OF_RANGE` reads as a client bug, but here it's a normal result of stale data. With the catalog rule that clients map field codes to messages, a client has no drag-and-drop field to attach the error to and no defined recovery. The UI stays out of date and the retry fails again.
- Failure scenario: A tablet shows 5 cards in a column, and a phone deleted 2 of them. The user drags a card to the end of the column on the tablet, which sends position 5, and gets a 400. One client shows a generic error with the stale board still on screen, while another reverts and reloads.
- Proposed fix: Add to the requirement in specs/api-conventions/spec.md: "Because clients can hold stale data, `OUT_OF_RANGE` on a move is an expected outcome. A client that receives it SHALL reload the affected board and tell the user the move did not apply. A stale position that is still in range SHALL be applied as sent." This keeps D20's rejection instead of clamping.
- Upstream: no

### A9: Non-idempotent requests assume responses are never lost
**Status:** applied with edits
**Applied as:** Two scenarios were added, because the proposed text had none.
- Severity: major - duplicates and misleading errors on flaky mobile networks, and HTTP client retry defaults differ.
- Location: specs/api-conventions/spec.md > Success status codes and bodies; Deleting a missing resource is not found; specs/board-export-format/spec.md > Imported board key and clashes
- Current text: "Creating a resource SHALL return 201 with the full created resource."
- Assumption: Clients get every response, or never retry after losing one. The specs have no idempotency key and don't say whether clients may retry automatically. Client timeouts are deferred, but this rule isn't about timeout values.
- Problem: The retry policy decides visible behavior and isn't written down. A retried create makes a duplicate card and uses up a card number. A retried delete returns 404. A retried import returns 409 with a "choose another key" prompt even though the first import worked, and following that prompt creates a second board.
- Failure scenario: A phone uploads an import, and the connection drops after the commit. The user retries and sees the key clash dialog, enters `CRDX`, and now has two copies of the board.
- Proposed fix: Add this requirement to specs/api-conventions/spec.md: "### Requirement: Retries after a lost response / The API has no idempotency keys. Clients SHALL NOT automatically repeat a POST after a network failure with an unknown outcome; they SHALL report the failure and reload the affected data before the user tries again. A client that repeats a DELETE and receives 404 `NOT_FOUND` SHALL treat the item as deleted. Repeating a request after 401 `UNAUTHENTICATED` is allowed, because that request was not applied."
- Upstream: no

### A12: Export and import assume every board fits in 5 MB
**Status:** applied with edits
**Applied as:** The matching scenario is "Board over the import limit".
- Severity: major - low frequency, but it's a backup that fails only when it's needed.
- Location: specs/board-export-format/spec.md > Export file contains the complete board; Import upload
- Current text: "A file over 5 MB SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`."
- Assumption: Exports always stay below the import limit. No spec limits the number of cards, and one description can be up to 10,000 code points, or up to 40 KB of UTF-8.
- Problem: By the reviewer's estimate, about 170 cards with full-length CJK descriptions exceed 5 MB. The spec doesn't say whether export still succeeds or warns, and a re-import has no way forward. Users rely on "a complete board can be exported to and imported from JSON".
- Failure scenario: A user exports a large board, deletes it, and tries to import the file. It fails with 413, and domain-board says deleted data can't be restored.
- Proposed fix: Add to "Export download" in specs/board-export-format/spec.md: "Export SHALL have no size limit and SHALL always return the complete board. A file over 5 MB cannot be imported again; this is an accepted limit of v1." Add the matching scenario. The alternative is for export to reject boards that wouldn't fit, which seems worse because the user gets no file at all.
- Upstream: no

### T2: Time-based rules cannot be tested without waiting
**Status:** applied
- Severity: major - the token lifetime scenarios would be skipped or tested with a different constant.
- Location: api-auth-tokens/spec.md > Token lifetimes; api-conventions/spec.md > Board list order; board-export-format/spec.md > Export download, Imported data gets new identity and times
- Current text: "**WHEN** a client has not refreshed for 31 days and tries to refresh"
- Problem: The outcomes depend on the clock, and the spec gives no way to control it. No test can wait 31 days. Shortening the configured lifetimes means the 15-minute and 30-day values are never checked.
- Failure scenario: The refresh lifetime is set to 30 hours by mistake. Tests run with a 1-second lifetime and pass.
- Proposed fix: Add to api-conventions/spec.md: "### Requirement: Backend time can be set in tests / Test setups SHALL be able to set the current time the backend uses for token lifetimes, timestamps and export names. Production deployments SHALL NOT expose this. / #### Scenario: Time moved forward / **WHEN** a test setup moves the backend time forward by 16 minutes after a login / **THEN** the access token from that login fails with 401 `UNAUTHENTICATED`". The alternative is to state in each backend's own store how time is controlled. The shared scenarios then remain unenforced here.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Set the time, log in, then advance the time by 31 days and refresh.
  - Passes when: The response is 401 `INVALID_REFRESH_TOKEN`.
  - Fails when: Token code reads a separate system clock, and the test sees 200.

### T3: Sliding expiry has no test
**Status:** applied
- Severity: major - the alternative rejected in D26 passes every scenario.
- Location: api-auth-tokens/spec.md > Refresh rotates the refresh token
- Current text: "A session SHALL stay active as long as it refreshes at least once every 30 days."
- Problem: No scenario crosses day 30. "Successful refresh" only checks that new tokens exist.
- Failure scenario: The new refresh token inherits the session's original expiry, so users are logged out 30 days after login even if they use the app daily.
- Proposed fix: Add to api-auth-tokens/spec.md: "#### Scenario: Session outlives 30 days by refreshing / **WHEN** a client logs in, refreshes after 29 days, and refreshes again 29 days later / **THEN** both refreshes succeed" and "#### Scenario: New refresh token gets a full lifetime / **WHEN** a refresh token issued by a refresh on day 29 is used 31 days after that refresh / **THEN** the refresh fails with 401 `INVALID_REFRESH_TOKEN`"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Using a settable clock, log in, advance 29 days and refresh, then advance 29 days and refresh.
  - Passes when: The second refresh returns success on day 58.
  - Fails when: Expiry is absolute from login, and the test sees 401 on day 58.

### T4: The expiry boundary is undefined, and clock leeway can make scenarios disagree
**Status:** applied
- Severity: major - a backend with leeway fails "older than 15 minutes" but may pass "16 minutes".
- Location: api-auth-tokens/spec.md > Protected requests use a bearer access token (Expired token); Token lifetimes (Access token at 16 minutes)
- Current text: "**WHEN** a client calls a protected endpoint with an access token older than 15 minutes"
- Problem: Token libraries often allow clock leeway. The spec doesn't say if that is allowed or if a token at exactly 15:00.000 is valid. A test at 15:01 and a test at 16:00 could disagree.
- Failure scenario: A leeway of 60 seconds is left on. A token is accepted at 15:30, while the client's `accessTokenExpiresAt` says it has expired.
- Proposed fix: Add to "Token lifetimes" in api-auth-tokens/spec.md: "A token SHALL be rejected from the moment its expiry time is reached, with no leeway." Replace both scenarios with "#### Scenario: Expiry boundary / **WHEN** an access token is used 1 millisecond before its `accessTokenExpiresAt` / **THEN** the request is accepted" and "#### Scenario: Expired token / **WHEN** an access token is used at its `accessTokenExpiresAt` / **THEN** the response is 401 `UNAUTHENTICATED`". The alternative is a stated fixed leeway, such as 30 seconds, with the scenario adjusted to match.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Set the clock to `accessTokenExpiresAt` and call a protected endpoint.
  - Passes when: The response is 401.
  - Fails when: Library leeway is left on, and the test sees 200.

### T8: Security attributes of the refresh cookie are mostly untested, and cookie lifetime is missing
**Status:** applied
**Related:** S13 adds a production check of the same cookie attributes.
- Severity: major - removing `SameSite` or `Secure` fails no scenario, and a session cookie breaks the 30-day promise.
- Location: api-auth-tokens/spec.md > Web uses a protected refresh cookie; Logout ends only the current session
- Current text: "The refresh cookie SHALL be `HttpOnly`, `Secure` and `SameSite=Strict`, and SHALL be scoped to the auth endpoints' path."
- Problem: Scenarios only cover `HttpOnly` and path, and they need a real browser. `Secure` and `SameSite=Strict` have no scenario. No `Max-Age` or `Expires` is required. "With the `COOKIE` transport, logout SHALL also clear the refresh cookie" has no scenario.
- Failure scenario: The cookie is set with no `Max-Age`, so closing the browser ends a web session that the spec says lasts 30 days. Or logout clears the cookie with a different `Path`, so the browser keeps it.
- Proposed fix: In api-auth-tokens/spec.md, add to the requirement: "The cookie SHALL expire with the refresh token, through `Max-Age` or `Expires`." Add "#### Scenario: Cookie attributes / **WHEN** a response sets the refresh cookie / **THEN** its `Set-Cookie` header has `HttpOnly`, `Secure`, `SameSite=Strict`, a `Path` covering refresh and logout but not board endpoints, and a lifetime of 30 days" and "#### Scenario: Logout clears the cookie / **WHEN** a client logs out with the `COOKIE` transport / **THEN** the response has a `Set-Cookie` header for the same name and `Path` with `Max-Age=0`"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Log in with `COOKIE` and parse `Set-Cookie`.
  - Passes when: All attributes are present and `Max-Age` is 2,592,000.
  - Fails when: `SameSite` is left at the default, and the assertion on the header fails.

### T9: "Always present" contradicts conditional fields, and D7's "no nullable in v1" is missing
**Status:** applied
**Also reported as:** D14 (minor). D14's text: "At the start of v1, no field is nullable. A nullable field MAY be added later as a new field."
- Severity: major - a generic presence test fails on correct responses, or implementers send `null` to satisfy it.
- Location: api-conventions/spec.md > Documented fields are always present
- Current text: "Every field documented for a response SHALL always be present in that response."
- Problem: `min` and `max` appear only on some field errors. `{ "field": "key", "code": "ALREADY_USED" }` is an exact expected object. `refreshToken` must be absent with `COOKIE`. The requirement has no exception for these. D7's "In v1 no field is nullable" is not in the spec.
- Failure scenario: The backend documents `min`, `max` and `refreshToken` as nullable to pass a schema check, and sends `"refreshToken": null`. That breaks the `COOKIE` rule and D7.
- Proposed fix: In api-conventions/spec.md, add after the first sentence: "The only exceptions are `min` and `max` in field errors, present only as `api-errors` defines, and `refreshToken` in auth responses, present only as `api-auth-tokens` defines. In v1 no response field is documented as nullable." Add "#### Scenario: No nullable fields in v1 / **WHEN** the generated OpenAPI document is inspected / **THEN** no response field is marked nullable"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Scan the OpenAPI document and validate sample responses against it.
  - Passes when: No field is nullable and all non-excepted fields are present.
  - Fails when: A nullable `description` type leaks in, and the scan finds it.

### T11: Wrong types and missing values have conflicting codes
**Status:** applied
- Severity: major - two requirements give different results for the same request.
- Location: api-conventions/spec.md > Move target is the final position; api-errors/spec.md > Top-level error codes (Unparseable JSON)
- Current text: "Any other value SHALL be rejected with a validation error for `position` with the code `OUT_OF_RANGE`."
- Problem: `"position": "a"`, `1.5` and `null` are all "any other value", but a wrong type is `MALFORMED_REQUEST`, and `null` or missing is `REQUIRED`. A number too large for an integer has no stated result. "Unparseable JSON" tests two behaviors. It also doesn't say if `fieldErrors` names the field on `MALFORMED_REQUEST`.
- Failure scenario: A position of `1.5` returns 400 `VALIDATION_FAILED` on one reading and `MALFORMED_REQUEST` on another. A client that highlights the broken field works only with the first. A position of 2^40 gives 500 when deserialized into a 32-bit integer.
- Proposed fix: In api-conventions/spec.md, replace with "Any other integer, of any size, SHALL be rejected with a validation error for `position` with the code `OUT_OF_RANGE`." In api-errors/spec.md, add "`MALFORMED_REQUEST` SHALL have an empty `fieldErrors`." Split the scenario into "#### Scenario: Unparseable JSON / **WHEN** a request body is not valid JSON / **THEN** the response is 400 `MALFORMED_REQUEST` with empty `fieldErrors`" and "#### Scenario: Wrong field type / **WHEN** a move request has `"position": "a"` / **THEN** the response is 400 `MALFORMED_REQUEST` with empty `fieldErrors`". Add "#### Scenario: Huge position / **WHEN** a card is moved to position 1099511627776 / **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `position` with code `OUT_OF_RANGE`"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Send a move with `"a"`, `1.5`, `null`, no `position`, and 2^40.
  - Passes when: The results are `MALFORMED_REQUEST` twice, `REQUIRED` twice, and `OUT_OF_RANGE`.
  - Fails when: Binding to a 32-bit integer fails, and the test sees `MALFORMED_REQUEST` for 2^40.

### T16: Size limits have no exact byte values
**Status:** applied
**Also reported as:** A17 (minor). A17 uses the same binary values and says the 5 MB is measured on the `file` part. **Related:** S9 limits the whole multipart request.
- Severity: major - clients checking file size up front can disagree with the backend.
- Location: api-conventions/spec.md > Request body size limit; board-export-format/spec.md > Import upload
- Current text: "A file over 5 MB SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`."
- Problem: 5 MB could be 5,000,000 or 5,242,880 bytes, and 256 KB could be 256,000 or 262,144. The scenarios use 300 KB and 6 MB, far from the limit. It's unclear if multipart overhead counts toward the file limit.
- Failure scenario: A client blocks a 5.1 million byte file that the backend would accept, or the reverse. A file of exactly 5 MB fails because of multipart overhead.
- Proposed fix: In api-conventions/spec.md, write "larger than 262,144 bytes (256 KB)". In board-export-format/spec.md, write "A `file` part over 5,242,880 bytes (5 MB) SHALL be rejected with 413 `PAYLOAD_TOO_LARGE`; multipart overhead does not count." Add "#### Scenario: Exactly at the limit / **WHEN** a client uploads a valid file of exactly 5,242,880 bytes / **THEN** the file is not rejected for its size" and "#### Scenario: One byte over / **WHEN** a client uploads a file of 5,242,881 bytes / **THEN** the response is 413 `PAYLOAD_TOO_LARGE`", and the same pair for the 256 KB limit. The alternative is decimal values (5,000,000 and 256,000).
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Upload files at the limit and one byte over.
  - Passes when: The first passes the size check, and the second gets 413.
  - Fails when: The total request size is limited, and the test sees 413 at the limit.

### T17: Unknown-code handling is vague and differs from D12
**Status:** applied
**Also reported as:** D13 (minor). D13's fix is only the first replacement: "by its HTTP status".
- Severity: major - a generated closed enum could crash on an additive change, and no scenario catches it.
- Location: api-errors/spec.md > Clients handle unknown error codes by status
- Current text: "A client that receives a code it does not know SHALL handle the error by its HTTP status class."
- Problem: D12 says "by HTTP status". The artifact says "status class" (4xx), but its scenario treats 409 specifically as a conflict. "Handles it as a generic conflict" has no observable result. Unknown field error codes have no scenario.
- Failure scenario: A client generated from OpenAPI deserializes `code` as a closed enum and shows a crash or a parse error when v1 adds a code.
- Proposed fix: In api-errors/spec.md, replace with "A client that receives a code it does not know SHALL handle the error by its HTTP status and SHALL show the same message it shows for other errors with that status." Replace the scenario's THEN with "**THEN** it shows its general message for a 409 and does not fail to parse the response". Add "#### Scenario: New field code / **WHEN** a client receives 400 `VALIDATION_FAILED` with a field error code it does not know / **THEN** it shows its general invalid-value message on that field"
- Upstream: no
- Test sketch:
  - Level: contract (fake server)
  - Arrange and act: Script 409 with `code: FUTURE_THING`.
  - Passes when: The general message for 409 is shown.
  - Fails when: A closed enum throws a parse error, and the test sees the general network error.

### T18: Error shape is promised for "any reason", and "no internal details" is unmeasurable
**Status:** applied
**Also reported as:** S15 (minor). S15 extends the rule to every code: "`title` and `detail` SHALL NOT contain class names, stack traces, SQL, framework messages, tokens, passwords or submitted values, for any error code." It adds: "#### Scenario: Wrong type in a request / **WHEN** a request fails with `MALFORMED_REQUEST` / **THEN** `detail` contains no class names and no submitted values." **Related:** A5 limits the "Error body" scenario to errors the backend produces.
- Severity: major - a leak or a framework-default error body can pass the scenarios.
- Location: api-errors/spec.md > Errors use problem details (Error body); Top-level error codes (Unexpected failure)
- Current text: "**THEN** the response is 500 with the code `INTERNAL_ERROR` and the body reveals no internal details"
- Problem: "Reveals no internal details" has no measure. "Fails for any reason" can't be enumerated, and no scenario says how errors from the framework, not the app, behave. A failure must also be triggered, which needs fault injection.
- Failure scenario: A framework-generated 415 or 413 returns the default error body, not problem details. A 500 includes an SQL message in `detail`.
- Proposed fix: In api-errors/spec.md, replace "Error body" WHEN with "**WHEN** a request triggers any code in the top-level catalog, including errors raised before an endpoint is reached". Replace the "Unexpected failure" THEN with "**THEN** the response is 500 with the code `INTERNAL_ERROR`, `fieldErrors` is empty, and `title` and `detail` are the same fixed text for every internal error". Add to the requirement: "`detail` of an `INTERNAL_ERROR` SHALL NOT vary with the failure."
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Trigger each catalog code; for 500, inject a failure with a marker string.
  - Passes when: All are `application/problem+json` with the required fields, and the marker is absent.
  - Fails when: An exception message is copied to `detail`, and the test finds the marker.

### T22: The all-or-nothing scenario doesn't exercise the risky case
**Status:** applied
- Severity: major - an import that creates labels first can pass, and storage failures are not covered.
- Location: board-export-format/spec.md > Import is all or nothing (One invalid card)
- Current text: "**WHEN** a file has 50 valid cards and one card with an empty title"
- Problem: The file isn't said to contain a new label, so "no label is created" may hold trivially. Validate-then-write with no transaction also passes. The THEN says only that "the import fails", with no status.
- Failure scenario: Labels are saved before cards. A storage failure on card 40 leaves new labels or half a board behind. The test still passes.
- Proposed fix: In board-export-format/spec.md, replace the scenario with "**WHEN** a file declares the new label `Docs`, has 50 valid cards and one card with an empty title / **THEN** the response is 422 `INVALID_EXPORT_FILE`, and the user's boards and labels are unchanged". Add "#### Scenario: Failure while storing / **WHEN** storing fails after part of a valid file was written / **THEN** the response is 500 `INTERNAL_ERROR`, and the user's boards and labels are unchanged"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Upload the file; for the second scenario, inject a storage failure.
  - Passes when: The board list and label list equal their state before the upload.
  - Fails when: Labels commit separately, and the test finds `Docs`.

### T23: The authoritative-contract and additive-change scenarios can't fail at runtime
**Status:** applied
- Severity: major - the rules every client relies on have no check that could catch a breaking change.
- Location: api-conventions/spec.md > Generated OpenAPI is authoritative for wire shape; Changes within a version are additive
- Current text: "**THEN** the backend is wrong and must be changed to enforce the shared limit"
- Problem: The THEN parts state an intent or a process. "The generated OpenAPI document answers it" and "the change is made in a new major version" are true for any running backend. The "existing clients keep working" outcome has no test target.
- Failure scenario: A response field is renamed in v1, and the OpenAPI document changes along with it. Every scenario passes, and existing clients break.
- Proposed fix: In api-conventions/spec.md, replace "Field shape question" with "**WHEN** any documented endpoint responds / **THEN** the response body validates against that endpoint's schema in the generated OpenAPI document". Replace "Behavior contradiction" with "**WHEN** a client creates a board with a name of normalized length 101, even if the generated document allows longer names / **THEN** the response is 400 `VALIDATION_FAILED` with code `TOO_LONG` and `max` 100". Replace both additive scenarios with "#### Scenario: Release compared with the last v1 document / **WHEN** the generated OpenAPI document of a new build is compared with the last released v1 document / **THEN** no path, method, response field or enum value was removed or renamed, no field type changed, and no optional request field became required". "Change the meaning of existing values" can't be checked this way, and stays a review rule.
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Diff the build's OpenAPI document against the stored v1 document.
  - Passes when: Only additions are present.
  - Fails when: `boardId` is renamed, and the diff reports a removal.

### T25: Client-only rules have no scenario
**Status:** applied
- Severity: minor - limited reach, though a rule on decoding can't fail as written.
- Location: api-auth-tokens/spec.md > Access tokens are opaque to clients, Web uses a protected refresh cookie, Mobile uses the body transport; api-conventions/spec.md > UUIDs are lowercase canonical strings
- Current text: "Clients SHALL NOT decode or inspect access tokens."
- Problem: "Not decode" isn't observable. Web's "in memory only" and mobile's "only in the platform's secure storage" have no scenario, nor does "Clients SHALL treat UUIDs as opaque values". Logout's body transport isn't covered either.
- Failure scenario: A client reads `exp` from the JWT. It works until the signing format changes, then every session breaks.
- Proposed fix: In api-auth-tokens/spec.md, add "#### Scenario: Token is not a JWT / **WHEN** a client receives an access token that is a random string and an `accessTokenExpiresAt` value / **THEN** it uses the token normally", "#### Scenario: Web storage / **WHEN** the web app has logged in / **THEN** the access token is not in `localStorage`, `sessionStorage`, IndexedDB or a script-readable cookie" and "#### Scenario: Mobile logout / **WHEN** a mobile app logs out / **THEN** it sends its refresh token in the request body and removes its tokens from storage"
- Upstream: no
- Test sketch:
  - Level: contract (fake server)
  - Arrange and act: A fake server issues `abc123` as the access token.
  - Passes when: The client sends `Bearer abc123` on later requests.
  - Fails when: The client parses the JWT, and the test sees a crash or a forced logout.

### T26: The rate-limit scenarios have unbounded terms
**Status:** applied
**Related:** S6 defines what a limit is counted per.
- Severity: minor - the rule is simple, and values are deferred on purpose.
- Location: api-auth-tokens/spec.md > Auth endpoints are rate limited
- Current text: "**WHEN** a client sends many requests to a board endpoint"
- Problem: "Many" has no bound, so a limit at 10,000 requests passes a test of 100. Register and refresh have no scenario. `Retry-After` format isn't asserted. "SHALL NOT be relied on by clients" can't fail. What a limit is counted per is unspecified, so a test can't know how to exceed it.
- Failure scenario: A global limit filter is applied to all endpoints with a high threshold, and a small test doesn't reach it. Busy drag-and-drop then fails with 429 in production.
- Proposed fix: In api-auth-tokens/spec.md, replace the WHEN with "**WHEN** a client sends 2,000 requests within one minute to a board endpoint" and the THEN with "**THEN** no response has the status 429". Extend the scenario to "**WHEN** a client exceeds the limit on login, register or refresh / **THEN** the response is 429 `RATE_LIMITED` with a `Retry-After` header holding a positive whole number". Replace the last sentence with "The exact limits SHALL be a backend setting. Clients SHALL use only `Retry-After` to decide when to try again."
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Set a low limit and exceed it on each endpoint.
  - Passes when: Each returns 429 with a positive integer `Retry-After`.
  - Fails when: `Retry-After` is an HTTP date, and the integer check fails.

### T27: The board list tie-break is incomplete and untested
**Status:** applied
- Severity: minor - it affects only exact ties, but tests can disagree.
- Location: api-conventions/spec.md > Board list order
- Current text: "Boards with the same updated time SHALL be sorted by created time, newest first, and then by identifier."
- Problem: The identifier direction and comparison aren't given, and UUID byte order and string order can differ. No scenario covers ties. If stored times are more precise than milliseconds, boards with equal wire times sort by a hidden value.
- Failure scenario: Two boards show the same `updatedAt` and `createdAt`, and their order flips between implementations.
- Proposed fix: Replace in api-conventions/spec.md with "Boards with the same updated time SHALL be sorted by created time, newest first, and then by identifier as a lowercase string in ascending order. Times SHALL be compared at the millisecond precision sent on the wire." Add "#### Scenario: Full tie / **WHEN** two boards have the same updated and created times / **THEN** the board with the lower identifier string comes first"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: With a frozen clock, create boards until identifiers cover both orders, then list them.
  - Passes when: The order follows the identifier string.
  - Fails when: The tie-break is missing, and the test sees creation order.

### T28: Tautological or narrow wire-format scenarios
**Status:** applied
- Severity: minor - the rules are clear, but the scenarios catch little.
- Location: api-conventions/spec.md > All endpoints use a versioned base path (Endpoint path); JSON with camelCase field names (Timestamp field name)
- Current text: "**THEN** the request path starts with `/api/v1/`"
- Problem: The THEN describes what the client sent, so it is true by construction. The camelCase scenario checks one name only.
- Failure scenario: One endpoint is mapped to `/api/health-check`, or a DTO exposes `updated_at`. Neither fails a scenario.
- Proposed fix: In api-conventions/spec.md, replace with "#### Scenario: Endpoint paths / **WHEN** the generated OpenAPI document is inspected / **THEN** every path starts with `/api/v1/`" and "#### Scenario: Field names / **WHEN** the generated OpenAPI document is inspected / **THEN** every field name matches `^[a-z][a-zA-Z0-9]*$`"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Scan the generated OpenAPI document.
  - Passes when: All paths and field names match.
  - Fails when: A field is `updated_at`, and the scan reports it.

### T29: Move rules are missing a same-column case and a no-duplicates case
**Status:** applied
- Severity: minor - low risk, but the scenarios don't cover the promise.
- Location: api-conventions/spec.md > Move target is the final position; Move responses contain all affected items
- Current text: "Within the same column, that column's cards SHALL be returned once."
- Problem: No scenario checks this sentence or the same-column upper limit (n is invalid in the same column, valid in another).
- Failure scenario: Code shared with cross-column moves accepts position n in the same column, or returns the column's cards twice.
- Proposed fix: Add to api-conventions/spec.md: "#### Scenario: Move within a column / **WHEN** a card is moved within a column of 3 cards to position 2 / **THEN** the response contains each of the 3 cards exactly once with positions 0, 1, 2" and "#### Scenario: Same-column position equal to n / **WHEN** a card in a column of 3 cards is moved within that column to position 3 / **THEN** the response is 400 `VALIDATION_FAILED` with a field error for `position` with code `OUT_OF_RANGE` and `max` 2"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Move a card within a 3-card column to position 3.
  - Passes when: The response is 400 with `max` 2.
  - Fails when: The target's n+1 rule is used, and the test sees 200 with non-dense positions.

### T30: Export scenarios are loosely worded or assume key order
**Status:** applied
- Severity: minor - the file's main shape is clear.
- Location: board-export-format/spec.md > Export file identifies its format and version; Export file contains the complete board; Exported cards; Export file has no identifiers or positions; Export download
- Current text: "**THEN** the file starts with `"format": "cardigan.board"`, `"formatVersion": 1` and an `exportedAt` timestamp of that day"
- Problem: "Starts with" requires a JSON key order no requirement sets, so a test on bytes could fail a correct file. "No UUIDs" doesn't check positions. Card fields `description`, `createdAt` and `updatedAt` are not checked. The order of `board.labels` isn't defined. "Blocking" is not observable, and export has no status. The file name date and `exportedAt` could come from two clock reads around midnight.
- Failure scenario: A card entry includes `position`, or `board.labels` order changes between exports, and a golden-file test is flaky.
- Proposed fix: In board-export-format/spec.md, replace the THEN with "**THEN** the parsed file has `format` `cardigan.board`, `formatVersion` `1` and `exportedAt` equal to the time of the export". Add "`board.labels` SHALL be sorted by name in the label list order." Replace "No UUIDs" with "#### Scenario: Exact fields / **WHEN** a board is exported / **THEN** the file root has exactly `format`, `formatVersion`, `exportedAt`, `board`; the board has exactly `name`, `key`, `labels`, `columns`; a label has exactly `name`, `color`; a column has exactly `name`, `cards`; and a card has exactly `number`, `title`, `description`, `labels`, `createdAt`, `updatedAt`". Replace the first sentence of "Export download" with "Export SHALL return 200 with the complete file in the response to one request, with the content type `application/json` and a `Content-Disposition` attachment file name of `<KEY>-<yyyy-MM-dd>.json`, using the board key and the UTC date part of `exportedAt`."
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Set the clock to 23:59:59.999 UTC and export.
  - Passes when: The key sets are exact, and the file name date equals the `exportedAt` date.
  - Fails when: A UUID or `position` is serialized, and the key set check fails.

### T31: Round trip and imported times are not precisely stated
**Status:** applied
- Severity: minor - the outcome is clear in intent, but `be-import-export` depends on this round trip test.
- Location: board-export-format/spec.md > Imported data gets new identity and times (Import into another account)
- Current text: "**THEN** user B owns a new board with new identifiers that is equivalent in names, key, columns, cards, numbers and labels"
- Problem: "Equivalent" doesn't say what's compared, and label colors can differ if user B already has a label with that name. The preconditions aren't set up, and "all their times are the time of the import" doesn't say if they must be one identical value.
- Failure scenario: User B already has `bug` colored `Blue`, so a test comparing colors fails on correct behavior. Timestamp checks flake when values differ by a millisecond.
- Proposed fix: In board-export-format/spec.md, replace the scenario with "**WHEN** user A's export is imported by user B, who has no boards or labels / **THEN** exporting user B's board gives a file equal to user A's, except for `exportedAt`, `createdAt` and `updatedAt`". Add to the requirement: "All these times SHALL be one identical value for an import."
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Export as A, import as B, export as B, then compare with timestamps removed.
  - Passes when: The files are equal.
  - Fails when: Column order is lost, and the comparison shows a difference.

### T32: `min` and `max` wording, and the CORS requirement, overstate what is checked
**Status:** applied
- Severity: minor - each has a clear intended reading.
- Location: api-errors/spec.md > Limit errors carry the limit; api-conventions/spec.md > Same-origin only
- Current text: "SHALL also contain the broken limit as `min`, `max` or both"
- Problem: "Or both" leaves open what `TOO_LONG` carries, while its scenario is an exact object. `TOO_SHORT` has no scenario. "SHALL NOT allow cross-origin browser requests" reads as rejection, but no code exists for that and the scenario checks only headers. Preflight isn't covered.
- Failure scenario: `TOO_LONG` includes `min` 1, and the exact-object test fails on an acceptable-looking response. A test expects rejection when the backend correctly only withholds headers.
- Proposed fix: In api-errors/spec.md, replace with "`TOO_SHORT` SHALL contain `min`, `TOO_LONG` SHALL contain `max`, and `OUT_OF_RANGE` SHALL contain both, as integers." Add "#### Scenario: Name too short / **WHEN** a board key has the length 1 / **THEN** the field error is `{ "field": "key", "code": "TOO_SHORT", "min": 2 }`". In api-conventions/spec.md, replace the first sentence with "The API SHALL NOT send `Access-Control-Allow-*` headers on any response." Add "#### Scenario: Preflight / **WHEN** a browser sends an `OPTIONS` preflight from another origin / **THEN** the response has no `Access-Control-Allow-*` headers"
- Upstream: no
- Test sketch:
  - Level: contract
  - Arrange and act: Send an `OPTIONS` request with `Origin: https://evil.example`.
  - Passes when: No `Access-Control-Allow-*` header is returned.
  - Fails when: A permissive CORS setting is present, and the test finds the header.

### S14: Login is not required to hide whether an email exists
**Status:** applied
- Severity: minor - register already reveals existing emails by decision (D13), but only login probing is quiet, since a register probe on a free email creates an account.
- Location: specs/api-errors/spec.md > Requirement: Top-level error codes
- Current text: "`INVALID_CREDENTIALS` (401)"
- Problem: The spec drops D12's meaning ("wrong login email or password") and has no rule for a same-looking response. A different `detail` or a large timing gap (skipping the password hash for unknown emails) reveals which accounts exist.
- Failure scenario: A hand-written login returns `detail` "User not found", or returns much faster for unknown emails. An attacker checks a leaked email list quietly, and then targets only real accounts.
- Proposed fix: Add to this requirement: "`INVALID_CREDENTIALS` SHALL be used for a wrong login email or password, with an identical response in both cases. The backend SHALL do the same password verification work for an unknown email." Add: "#### Scenario: Unknown email and wrong password / **WHEN** one login uses an unknown email and another uses a wrong password for a known email / **THEN** both responses are 401 `INVALID_CREDENTIALS` with identical bodies."
- Upstream: no

### A13: `accessTokenExpiresAt` assumes the device clock is correct, and its purpose is unstated
**Status:** applied
- Severity: minor - it only causes harm if a client adds proactive refresh and the device clock is wrong.
- Location: specs/api-auth-tokens/spec.md > Access tokens are opaque to clients
- Current text: "Every response that issues an access token SHALL include `accessTokenExpiresAt`, the token's expiry as a timestamp."
- Assumption: Client wall clocks match the backend's. The field's use isn't defined, while the only specified trigger for refresh is a 401.
- Problem: One platform may refresh proactively by comparing to the local clock, and another may ignore the field.
- Failure scenario: A phone's clock is an hour ahead. A proactive client sees every new token as expired, refreshes before each request and hits `RATE_LIMITED`.
- Proposed fix: Add to the requirement: "`accessTokenExpiresAt` is a hint. A client MAY refresh early based on it, but device clocks can be wrong, so a client SHALL NOT end a session or refuse to send a request because of it. A client SHALL NOT refresh more than once for one issued access token because of this field. The 401 response stays authoritative."
- Upstream: no

### A16: Export assumes no change happens while the board is being read
**Status:** applied
- Severity: minor - a single-user app makes this rare, but the resulting file can be unusable.
- Location: specs/board-export-format/spec.md > Export file contains the complete board
- Current text: "`columns` SHALL list every column in position order, each with `name` and `cards`."
- Assumption: The board stays still during export. Another device can move a card during a read that spans several queries.
- Problem: A moved card can appear in two columns or none. A duplicate number makes the file fail its own import rule with `ALREADY_USED`.
- Failure scenario: A phone drags a card while the tablet exports. The file holds card 7 twice, and later import fails with 422.
- Proposed fix: Add to "Export download": "The file SHALL be a consistent snapshot of the board at one point in time."
- Upstream: no

### D16: The access token rule has no exception for operational endpoints
**Status:** applied
- Severity: minor - it will be caught during implementation, but the text is literally wrong for a planned endpoint.
- Location: specs/api-auth-tokens/spec.md > Requirement: Protected requests use a bearer access token
- Current text: "Every endpoint SHALL require an access token sent as `Authorization: Bearer <token>`, except register, login, refresh and any other endpoint the auth feature spec defines as public."
- Problem: `docs/breakdown/chunks/02-be-scaffolding.md` plans a health endpoint, and `41-infra-vps.md` plans uptime checks. Neither can send a user token, and the auth feature spec is an odd place to list them.
- Failure scenario: A developer protects the health endpoint to follow the spec, and uptime checks report 401. Or a developer leaves it public and technically breaks the shared spec.
- Proposed fix: In specs/api-auth-tokens/spec.md, replace with: "Every endpoint under `/api/v1` SHALL require an access token sent as `Authorization: Bearer <token>`, except register, login, refresh and any other endpoint the auth feature spec defines as public. Operational endpoints outside `/api/v1`, such as a health check, are not covered by this requirement."
- Upstream: no

## Security analysis

### Trust boundaries

**Refresh transport flag and browser cookie (XSS)**
- Attacker position: Script running in the web app's origin, for example through an XSS flaw. It cannot read the httpOnly cookie.
- Attack path: The script sends a refresh request from the page. The browser attaches the cookie, and the script sets `refreshTokenTransport` to `BODY`. A backend that accepts the token from the cookie and picks the response format from the flag returns the new refresh token in JSON.
- What they gain: A readable 30-day sliding refresh token, usable from anywhere. This defeats the purpose of httpOnly.
- What stops it: Nothing. See T1 (S1).

**Refresh endpoint and rotation**
- Attacker position: Holds a stolen refresh token, from a device, backup or log.
- Attack path 1: The thief refreshes first and gets R2'. The victim later presents R1. If the rotated row was already cleaned up, R1 counts as "unknown", so nothing is revoked and the thief keeps the session.
- Attack path 2: The thief sends R1 in parallel with the victim's refresh. Both pass the check before either write, which forks the session without detection.
- What they gain: A long-lived session that survives detection.
- What stops it: The reuse requirement covers only a simple replay. Neither retention nor atomicity is stated. See S2 and S3.

**Bearer token on protected endpoints**
- Attacker position: Anyone able to send requests, possibly holding a refresh token or a token of the wrong kind.
- Attack path: Present a tampered token, a token signed with a different key, or a refresh token as the bearer. If refresh tokens are JWTs signed with the same key, the verifier may accept them.
- What they gain: API access for up to 30 days, with no rotation or reuse detection.
- What stops it: Only the word "invalid". Scenarios cover just missing and expired tokens. See S4.

**Session end versus live access tokens**
- Attacker position: Holds a valid access token when the session is logged out or revoked for reuse.
- Attack path: Keep calling the API after the revocation.
- What they gain: Up to 15 more minutes of full access.
- What stops it: Nothing is specified either way. See T5 (S5).

**Login and register (anonymous credentials)**
- Attacker position: Anonymous internet client.
- Attack path: Credential stuffing, password guessing, and probing which emails exist.
- What they gain: Account takeover or a list of registered emails.
- What stops it: Rate limiting exists, but its key and its check order are undefined (S6, T12/S7). Login-side enumeration is open (S14). The register 409 oracle for email is a settled decision (D13), so no finding is reported on it. It does mean rate limiting is the only control on that path.

**Cross-origin browser requests and CSRF**
- Attacker position: Malicious page visited by a logged-in user.
- Attack path: Cross-site POST to refresh or logout to use the cookie, or a form POST to login.
- What they gain: Nothing.
- What stops it: `SameSite=Strict` and cookie path scoping cover refresh and logout. The 415 rule rejects non-JSON form bodies. Other endpoints use a bearer token, which a cross-site page does not have. No finding.

**Network path and reverse proxy**
- Attacker position: On the network path, or sending requests through the proxy.
- Attack path: Read credentials and tokens from a plain HTTP request, or get a cookie issued without `Secure`.
- What they gain: Passwords and tokens.
- What stops it: Only the cookie text. No requirement says the API is HTTPS-only. See S13. The proxy also affects rate limit keys (S6).

**Ownership of IDs in paths and bodies**
- Attacker position: Logged-in user B, with user A's UUIDs.
- Attack path: Reference A's board, column, card or label through a path or body.
- What they gain: Nothing, as specified.
- What stops it: "Other users' data is not found, never forbidden" and `domain-user`. Foreign and missing IDs give the same 404, and that check runs before validation, so `max` in a position error reveals counts only for the user's own data. No finding.

**Request bodies, including unauthenticated ones**
- Attacker position: Anonymous client calling login, register or refresh.
- Attack path: Send a very large chunked JSON body with no `Content-Length`. Spring Boot sets no default limit on JSON bodies.
- What they gain: Memory exhaustion on the single VPS.
- What stops it: The 256 KB rule states the limit but not how it is measured. See S9.

**Unknown and read-only request fields (mass assignment)**
- Attacker position: Logged-in user.
- Attack path: Send `ownerId`, `key`, `number` or `createdAt` in a PATCH.
- What they gain: Nothing, as specified.
- What stops it: The domain specs say owner, key, number and created time never change. No finding.

**Imported file (untrusted, possibly written by someone else)**
- Attacker position: A registered user (registration is free), or a person who sends a victim a crafted file. The scenario "Import into another account" makes the second case a normal flow.
- Attack path 1: Upload a file with tens of thousands of cards or labels, again and again under new keys.
- Attack path 2: Upload a file with a very large number of empty cards so the error response is huge.
- Attack path 3: Hand over a file with an extreme card `number`.
- What they gain: Disk, memory and CPU exhaustion, or a board that cannot take new cards and that clients may fail to decode.
- What stops it: The 5 MB cap limits bytes, not items. Domain validation covers text, including NUL (via `text-length`). UUIDs and owners in a file are ignored. Nothing limits items, error count or number size. See S10, S11 and S12.

**Error responses to clients**
- Attacker position: Any client that can trigger errors.
- Attack path: Send wrong types and malformed bodies, then read `detail`.
- What they gain: Class names, field internals and framework details.
- What stops it: Only a scenario on 500 errors. See T18 (S15).

**Export file leaving the system**
- Attacker position: Anyone who receives an exported file.
- Attack path: Read the file for identifiers or account data.
- What they gain: Board content only, which the user chose to share.
- What stops it: "Export file has no identifiers or positions". The `Content-Disposition` name is built from a validated A-Z key, so header injection does not apply. No finding.

**Tokens at rest**
- Attacker position: Has database access or a copy of a device backup.
- Attack path: Read stored refresh tokens.
- What they gain: Session takeover.
- What stops it: The `be-auth` chunk plans hashed refresh tokens, and the spec requires secure platform storage on mobile. Hashing and backup exclusion are platform details under `openspec/config.yaml`, so they belong in the platform stores. No finding.

### Test versus production

**`COOKIE` refresh token never appears in a response body**
- What a test would do: Log in with `COOKIE` and assert there is no token in the body. Log in with `BODY` and assert there is a token in the body.
- What differs in production: A browser request can carry the cookie and also set the flag to `BODY`.
- How it fails: Tests never combine the two, so they stay green while the httpOnly protection can be bypassed.
- What would close the gap: T1 (S1).

**Reusing a rotated refresh token revokes the session**
- What a test would do: Rotate R1 to R2, replay R1 straight away, and check that R2 fails.
- What differs in production: A cleanup job runs ("Cleanup of expired refresh tokens" is an open question in `be-auth`), and the thief may refresh before the victim.
- How it fails: Rotated rows get deleted, R1 becomes "unknown", and no revocation happens. The test never runs the job.
- What would close the gap: S2.

**Refresh invalidates the used token**
- What a test would do: Send sequential refreshes on one thread.
- What differs in production: Parallel requests hit the same row.
- How it fails: Two read-then-update transactions both succeed, which forks the session.
- What would close the gap: S3.

**Protected requests need a valid access token**
- What a test would do: Use the `be-common` test helpers to mint tokens, sometimes with a test key, and try missing and expired tokens.
- What differs in production: Real signing keys, real refresh tokens and tokens from other sources exist.
- How it fails: A refresh JWT signed with the same key passes verification. No scenario tries one.
- What would close the gap: S4.

**Logout and reuse end the session**
- What a test would do: Log out, then check that the refresh token fails.
- What differs in production: The access token is still valid.
- How it fails: The test passes while the thief or the shared-device user still has API access for up to 15 minutes. Another developer could read the requirement as immediate revocation.
- What would close the gap: T5 (S5).

**Auth endpoints are rate limited**
- What a test would do: Send many wrong-password requests from one fixed client address and expect 429.
- What differs in production: The backend sits behind a reverse proxy, so it may see one address for everyone or trust a client-supplied forwarded header.
- How it fails: With one shared bucket, one attacker locks out all users. With a trusted header, the attacker rotates the value and is never limited. If the limit is checked only after a failed password check, a correct guess still returns 200, and the test using wrong passwords still sees 429.
- What would close the gap: S6 and T12 (S7).

**Web refresh with one shared refresh (reuse must not fire on honest clients)**
- What a test would do: Use one tab and two concurrent requests.
- What differs in production: Several tabs share one cookie, and each keeps its access token only in memory.
- How it fails: Restoring a browser session makes all tabs refresh at once. The second request is treated as reuse, so the session is revoked. The pressure to fix those logouts then invites a weakening of the detection.
- What would close the gap: A1 (S8).

**Refresh cookie attributes**
- What a test would do: Read `Set-Cookie` in a local or test configuration, or only check `document.cookie` and path behavior as the scenarios do.
- What differs in production: TLS ends at the proxy, so the backend sees plain HTTP. A dev profile may turn `Secure` off.
- How it fails: A setting tied to the request scheme or profile drops `Secure` in production. The current scenarios still pass.
- What would close the gap: S13.

**Request body size limit**
- What a test would do: Send a 300 KB body with a `Content-Length` header.
- What differs in production: An attacker uses chunked encoding with no `Content-Length`.
- How it fails: A filter that checks only the header passes the test and lets the unbounded body through.
- What would close the gap: S9.

**Import limits and validation**
- What a test would do: Upload a 6 MB file, plus small files with one bad card or one duplicate number.
- What differs in production: Crafted files stay under 5 MB but contain very many items, errors or extreme numbers.
- How it fails: All tests pass while one request consumes large amounts of memory or leaves a damaged board.
- What would close the gap: S10, S11 and S12.

**Other users' data is not found**
- What a test would do: Use two real users and compare responses.
- What differs in production: Nothing relevant. Real ownership checks run in tests too.
- How it fails: No realistic gap found. The scenarios cover paths and bodies and require an identical response. UUIDs are not guessable, so a timing difference has little value.
- What would close the gap: Nothing needed.

**Same-origin only**
- What a test would do: Send a request with a foreign `Origin` and assert no CORS headers.
- What differs in production: A permissive dev CORS setting could reach production.
- How it fails: No realistic gap with real impact. Without a cross-site bearer token and with the cookie blocked by `SameSite=Strict`, such a setting exposes nothing protected.
- What would close the gap: Nothing needed.

**Import is all or nothing and gets new identity**
- What a test would do: Upload a file with one bad card and check that nothing was stored. Check that new UUIDs are assigned.
- What differs in production: Larger files and concurrent writes.
- How it fails: No realistic security gap. An attacker gains nothing from a partial import of their own data, and IDs in the file are ignored.
- What would close the gap: Nothing needed.

## Assumptions safe to leave implicit

| Assumption | Where it is implied | Why it is safe |
|---|---|---|
| Production is served over HTTPS, so a `Secure` cookie works | api-auth-tokens > Web uses a protected refresh cookie | `infra-vps` makes HTTPS a done-when item, and a failure shows up at the first login |
| All auth endpoints share one path prefix for the cookie | api-auth-tokens > Web uses a protected refresh cookie | The spec defines the cookie by "the auth endpoints' path" and there is only one backend; a wrong path fails loudly on the first refresh |
| A revoked session's stale cookie stays in the browser | api-auth-tokens > Reuse; Invalid refresh tokens | The next refresh returns 401 and the client shows login, so the outcome is the same whether or not it is cleared |
| Timestamps may be stored with finer precision than milliseconds | api-conventions > Timestamps; Board list order | The backend sorts and clients show the backend's order; the tie-break rule keeps the order deterministic either way |
| Backend clock is reliable enough for ordering and expiry | api-conventions > Board list order; api-auth-tokens > Token lifetimes | One backend clock on one VPS; a small adjustment only changes a sort position or token expiry by a small amount |
| Token verification survives backend restarts | api-auth-tokens > Token lifetimes | Refresh tokens must persist to meet the 30-day rule, and a lost signing key only causes a 401 and a refresh |
| Simultaneous imports don't clash on a new label name | board-export-format > Labels are reused by name | Import is all-or-nothing and uniqueness is enforced, so stored data stays correct and the user can retry |
| List and move response sizes stay manageable without pagination | api-conventions > Lists are complete; Move responses | D22 and D21 accept this, and code-first OpenAPI fixes the exact item shape |
| Secure storage is readable when the app needs it | api-auth-tokens > Mobile uses the body transport | No background sync or offline work exists, so tokens are read while the user is using the app |
| Logout behavior on no network, and logout's auth requirement | api-auth-tokens > Logout | D1 and the out-of-scope list move full auth flows to a later feature spec |
| Export files are UTF-8 JSON | board-export-format > Export file identifies its format | A file in another encoding fails parsing and gets 422 |

The assumptions reviewer also listed "Production is served over HTTPS" as safe, while S13 asks for an explicit HTTPS rule. S13 stays open as a finding.

## Coverage
- Artifacts reviewed: `proposal.md`, `decisions.md` (43 decisions), `specs/api-auth-tokens/spec.md`, `specs/api-conventions/spec.md`, `specs/api-errors/spec.md`, `specs/board-export-format/spec.md`
- Missing artifacts: none required by the schema. The `shared-specs-only` schema generates no `design.md` or `tasks.md`.
- Testability: all 58 requirements and 98 scenarios checked; 44 requirements have a finding. `domain-column` was only searched for sort rules.
- Security: 13 trust boundaries and 13 security-relevant invariants examined. `domain-ordering` was read by its SHALL lines only.
- Hidden assumptions: 18 must-specify and 11 safe assumptions. Not applicable: operating system or device type specifics, battery, disk space, permissions and feature flags. Rollout has no finding, because no API exists yet. One corrected count: the reviewer reported 61 requirements; the specs have 58.
- Design contract: specs-only mode, so abstractions were not reviewed. All 7 main specs compared. `openspec validate api-conventions --strict` passes.
- Not checked: the design HTML mockups beyond a text search of the import page.
- Estimates: item counts, response sizes and byte counts in S10, S11 and A12 are the reviewers' estimates, not measurements.
- Reviewers that did not complete: none
- Findings dropped because their evidence did not exist: 0
- Findings dropped because they challenged decisions.md: 0
- Citations corrected: 3 (the `C1` example in T10 and D8, the `domain-card` quote in D3, the requirement count from the assumptions reviewer)
- Severity changes by the orchestrator: none. Merged findings use the highest severity reported.
- Fixes that narrow or fill a decision and need confirmation: A2 (D24), T12 (D17, fills gaps only), T5 (D27), T13 and T14 (D12, D16), S12 (D34).

## Applied changes
- Files changed: `proposal.md`, `specs/api-auth-tokens/spec.md`, `specs/api-conventions/spec.md`, `specs/api-errors/spec.md`, `specs/board-export-format/spec.md`, `specs/domain-card/spec.md` (new)
- Split requirements: applying the fixes pushed 12 requirements over the 500-character limit that `openspec validate --strict` enforces, so their rules were split into separate requirements with the same wording. Three new scenarios were needed for this: "Forged forwarded header", "Move on a stale column" and "Too many labels". They have not been reviewed.
- Stale non-standard artifacts the user chose not to update: none
- Contradictions with decisions.md (the file was not edited; each fix narrows or adds to the decision):
  - D17: "authentication (401)" now means the access token only, and 429, 422, credentials and refresh token failures have their own places (T12).
  - D20: "anything else" is `OUT_OF_RANGE` only for integers, while other types are `MALFORMED_REQUEST` (T11).
  - D24: "a failed refresh" ends the session only on 401 `INVALID_REFRESH_TOKEN` or a second 401 after the retry (A2).
  - D27: "the whole session" does not cover access tokens already issued (T5).
  - D34: card numbers have an upper limit of 1,000,000,000 (S12).
- `decisions.md` edits, approved by the user: D14 and D40, for the follow-up below.
- Accepted risks: none. No finding remains rejected.
- Not applied: A7's rule that login skips email format and password composition checks. It stays with the auth feature spec, as D4 proposes.

### Follow-up: one generic error for invalid import files
After the fixes, the user decided that an invalid import file gets one generic error that does not say what failed.
- Every problem inside the file returns 422 `INVALID_EXPORT_FILE` with an empty `fieldErrors`. The backend stops at the first violation and logs its JSON path and rule.
- An invalid `key` part returns 400 `VALIDATION_FAILED` with a field error for `key`.
- Unchanged: 409 for a used key, 413, a missing `file` part (400) and a non-multipart request (415).
- Accepted costs: hand-edited files get no hint, a valid export over the item limits or with a newer `formatVersion` is reported as invalid, and tests must start from a valid file and break one value.
- Files changed: `decisions.md` (D14, D40), `proposal.md`, `specs/api-errors/spec.md`, `specs/board-export-format/spec.md`.

The new wording has not been reviewed. A re-run in a fresh session is recommended.

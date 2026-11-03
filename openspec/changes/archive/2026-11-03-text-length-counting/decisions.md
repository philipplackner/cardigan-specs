# Decisions: text-length-counting

Confirmed with Philipp Lackner on 2026-11-03.

## Summary

All platforms count text length the same way: trim Unicode whitespace, normalize line breaks to LF, normalize to NFC, then count Unicode code points. The backend rejects text that is over a limit or contains invalid characters, and returns the stored normalized value. Clients validate with the same rule before sending. This change defines the rule only; each feature spec sets its own limits.

## Decisions

### D1 — Counting unit
- **Question**: Which unit do all platforms use to count text length for limits?
- **Decision**: Unicode code points.
- **Alternatives**: Grapheme clusters, UTF-16 code units, UTF-8 bytes.
- **Why**: Same result on every platform and in PostgreSQL; grapheme counts depend on each platform's Unicode version.
- **Depends on**: —

### D2 — Normalization
- **Question**: Is text Unicode-normalized before counting and storing?
- **Decision**: NFC before counting; the backend stores the NFC form.
- **Alternatives**: No normalization; NFC for counting only, store original.
- **Why**: The same visible text always has the same length.
- **Depends on**: D1

### D3 — Whitespace handling
- **Question**: How are leading and trailing whitespace handled for length-limited fields?
- **Decision**: Trimmed before validation and storage; whitespace-only text counts as empty.
- **Alternatives**: Keep as entered; trim only for the empty check.
- **Depends on**: —

### D4 — Whitespace definition
- **Question**: Which characters count as whitespace for trimming?
- **Decision**: Exactly the characters with the Unicode White_Space property.
- **Alternatives**: ASCII whitespace only.
- **Why**: Built-in trim functions differ between platforms (e.g. U+FEFF); a fixed set avoids mismatches.
- **Depends on**: D3

### D5 — Line breaks
- **Question**: Are line breaks in multi-line fields normalized?
- **Decision**: CRLF and lone CR become LF before counting and storing; a line break counts as 1.
- **Alternatives**: Keep as sent.
- **Depends on**: D1

### D6 — Scope
- **Question**: Does this change also set the concrete limit per field?
- **Decision**: No. It defines the counting rule only; each feature spec sets its own limits and refers to this rule.
- **Alternatives**: Rule plus a table of all field limits.
- **Depends on**: —

### D7 — Over-limit input on the backend
- **Question**: What does the backend do when text exceeds its limit?
- **Decision**: Reject the request with the standard validation error naming the field; nothing is stored.
- **Alternatives**: Truncate silently.
- **Depends on**: D1–D5

### D8 — Client validation
- **Question**: What do clients do with length limits before sending?
- **Decision**: Web, Android and iOS apply the identical rule and do not send over-limit or invalid text. The backend stays authoritative. How this is shown in the UI is up to each platform.
- **Alternatives**: Backend-only validation.
- **Depends on**: D1–D5, D7

### D9 — Passwords
- **Question**: Do passwords follow the same trim and NFC rules?
- **Decision**: Passwords are NFC-normalized and counted in code points, but never trimmed.
- **Alternatives**: Same rules as all text; exclude passwords entirely.
- **Why**: Trimming silently changes a password; NFC keeps the same visible password working across keyboards.
- **Depends on**: D1, D2, D3

### D10 — Invalid text
- **Question**: How is text with unpaired surrogates or control characters handled?
- **Decision**: Rejected with a validation error. Control characters are U+0000–U+001F. Tab, LF and CR are allowed only in fields that allow multi-line text. Passwords allow no control characters at all.
- **Alternatives**: Reject invalid Unicode only; out of scope.
- **Depends on**: D7, D9

### D11 — Response value
- **Question**: Does the backend return the stored value in responses?
- **Decision**: Yes. Responses contain the stored, trimmed, LF- and NFC-normalized text; clients show that value.
- **Alternatives**: Echo the client's original input.
- **Depends on**: D2, D3, D5

### D12 — Platforms and compatibility
- **Question**: Which platforms are targeted, and is the change breaking?
- **Decision**: Backend, Android, iOS and web. Not breaking.
- **Why**: No shared specs or field limits exist yet, so nothing has to migrate.
- **Depends on**: —

## Facts

- Kotlin (JVM and Native) `String.length` and JavaScript `String.length` count UTF-16 code units (👍 = 2). — source: language standard libraries
- PostgreSQL `varchar(n)` and `char_length` count code points. — source: PostgreSQL docs
- JS `trim()` removes U+FEFF; Kotlin `trim()` does not. — source: ECMAScript spec, Kotlin `Char.isWhitespace`
- No shared specs exist yet in this store. — source: `openspec/specs/`
- The existing password rule is "at least 12 characters" with no counting unit defined. — source: `docs/design/DECISIONS.md:45`
- Name length limits are still open for boards and columns. — source: `docs/breakdown/chunks/11-be-boards.md:44`

## Out of scope

- Concrete length limits for each field (set by each feature spec).
- Validation and normalization of text in board imports (decided in the import/export spec).
- How clients show limits or errors in the UI.
- Text matching for client-side search and filter.

## Deferred

- Exact shape of the validation error (field, limit, reason) — settle before: specs of the API contract.

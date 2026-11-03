# Proposal

## Breaking Change

No. No shared specs or field limits exist yet, so nothing has to migrate.

## Target Platforms

- Backend
- Android
- iOS
- Web

## Why

Kotlin, JavaScript and PostgreSQL count text length differently, especially for emojis, accented letters and non-Latin scripts. Without one shared rule, a text that a client accepts can be rejected by the backend, or the other way around.

## What Changes

- Text length is counted in Unicode code points after trimming Unicode whitespace, converting line breaks to LF, and normalizing to NFC.
- The backend stores and returns the normalized text.
- Passwords are normalized and counted the same way, but never trimmed.
- Text over its limit, or with unpaired surrogates or control characters, is rejected with a validation error. It is never truncated.
- Clients validate with the same rule before sending. The backend has the final say.
- Concrete limits for each field stay in each feature's own spec.

## Capabilities

### New Capabilities
- `text-length`: The shared rule for normalizing, validating and counting user-entered text on every platform.

### Modified Capabilities
- None.

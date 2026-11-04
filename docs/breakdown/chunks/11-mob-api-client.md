# Mobile API client foundation

| | |
|---|---|
| ID | `mob-api-client` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 3 |
| Depends on | `mob-scaffolding` (result/error types, DI), `be-common` (exported OpenAPI spec and error model) |
| Unlocks | `mob-auth-connect` |

## Goal
Code generation from the backend's exported OpenAPI spec, Ktor client configuration, mapping of the shared error model into the app's result/error types, and base URL per build environment.

## In scope
- Code generation from the backend's exported OpenAPI spec
- Ktor client configuration and serialization
- Mapping the shared error model onto the app's result/error types
- Base URL per build environment (local backend for emulator, simulator, device)

## Out of scope
- Auth headers, token storage and refresh (`mob-auth-connect`)
- Feature data sources (connect chunks)

## Builds on
- `mob-scaffolding`: result/error types
- `be-common`: OpenAPI spec and error model

## Provides
- Generated client and HTTP pipeline every mobile connect chunk uses

## Done when
- Generated code builds for Android and iOS
- A call to the sample protected endpoint maps success and error responses correctly

## Decisions from the breakdown
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- Clients generate code from the spec instead of hand-writing DTOs (user decision).

## Open questions for the deep-dive session
- Generator choice for Kotlin Multiplatform
- How regeneration is triggered when the backend spec changes
- Cleartext HTTP to the local backend on Android/iOS dev builds

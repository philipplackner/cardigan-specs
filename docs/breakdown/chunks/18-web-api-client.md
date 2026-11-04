# Web API client foundation

| | |
|---|---|
| ID | `web-api-client` |
| Area | Web |
| Size | S |
| Wave | 3 |
| Depends on | `web-scaffolding` (result/error types), `be-common` (exported OpenAPI spec and error model) |
| Unlocks | `web-auth-connect` |

## Goal
Code generation from the backend's exported OpenAPI spec, HTTP client configuration, mapping of the shared error model, and base URL per environment (dev proxy to the local backend).

## In scope
- Code generation from the backend's exported OpenAPI spec
- HTTP client configuration
- Mapping the shared error model onto the app's result/error types
- Base URL per environment; dev proxy to the local backend

## Out of scope
- Token handling and refresh (`web-auth-connect`)
- Feature data access (connect chunks)

## Builds on
- `web-scaffolding`: result/error types
- `be-common`: OpenAPI spec and error model

## Provides
- Generated client every web connect chunk uses

## Done when
- Generated code type-checks
- A call to the sample protected endpoint maps success and error responses correctly

## Decisions from the breakdown
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- Clients generate code from the spec instead of hand-writing DTOs (user decision).

## Open questions for the deep-dive session
- Generator choice (openapi-typescript, orval, …)
- How regeneration is triggered when the backend spec changes

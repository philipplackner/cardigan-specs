# Mobile labels connect

| | |
|---|---|
| ID | `mob-labels-connect` |
| Area | Mobile (CMP) |
| Size | S |
| Wave | 5 |
| Depends on | `mob-auth-connect` (authenticated pipeline), `mob-labels-ui` (label screens and repository interface), `be-labels` (label endpoints) |
| Unlocks | `mob-cards-connect` |

## Goal
Real labels data source and mapping; label management wired into navigation.

## In scope
- Real labels repository with DTO mapping
- Label management wired into navigation

## Out of scope
- Attaching labels to cards (`mob-cards-connect`)

## Builds on
- `mob-auth-connect`
- `mob-labels-ui`
- `be-labels`

## Provides
- Real label data for the picker and filter

## Done when
- Label management works against the local backend

## Decisions from the breakdown
- Connect chunks add the remote data source and DTO mapping on the generated client and are verified against a local backend. Production is verified in `infra-vps`.
- The wire contract is code-first: the backend generates the OpenAPI spec with SpringDoc, clients generate code from it. Behavioral rules come from the shared specs in this repo.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- none

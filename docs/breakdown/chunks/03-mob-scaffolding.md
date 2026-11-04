# Mobile scaffolding & architecture

| | |
|---|---|
| ID | `mob-scaffolding` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `mob-api-client`, `mob-design-system` |

## Goal
Compose Multiplatform project for Android and iOS, isolated feature module structure, base architecture (MVI, DI), navigation shell, app-wide utilities (result/error types, UiText, dispatchers, logging), a core domain module (Board, Column, Card, Label, User, text-length counting and field limits) and CI build.

## In scope
- Compose Multiplatform project for Android and iOS
- Isolated feature module structure (core vs. feature modules)
- Base architecture: MVI base classes, DI, dispatchers
- Navigation shell
- App-wide utilities: result/error types, UiText, logging
- Core domain module: Board, Column, Card, Label, User models per the shared domain specs, `text-length` counting and field limits
- CI building Android and iOS

## Out of scope
- Design system (`mob-design-system`)
- HTTP client and backend error mapping (`mob-api-client`)

## Builds on
- Nothing (root chunk)
- Shared specs already merged in this repo: domain specs and `text-length`

## Provides
- Project skeleton, architecture conventions and shared domain models every mobile chunk uses

## Done when
- App launches on Android and iOS with a placeholder screen and navigation
- Domain models and text-length counting have unit tests
- CI builds both targets

## Decisions from the breakdown
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- Client-wide utilities and core domain models live here, not in a separate chunk (user decision).

## Open questions for the deep-dive session
- DI library (Koin?)
- Navigation library
- CI runner for iOS builds
- Min Android SDK / iOS version

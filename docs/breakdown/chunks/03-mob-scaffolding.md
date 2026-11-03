# Mobile scaffolding & architecture

| | |
|---|---|
| ID | `mob-scaffolding` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 1 |
| Depends on | none |
| Unlocks | `mob-design-system`, `mob-fake-api` |

## Goal
Compose Multiplatform project for Android and iOS, module structure, base architecture (MVI, DI), navigation shell, HTTP client base and error model, CI build.

## In scope
- Compose Multiplatform project for Android and iOS
- Module structure (core vs. feature modules)
- Base architecture (MVI/ViewModels, DI)
- Navigation shell
- HTTP client base and error/result model
- CI building Android and iOS

## Out of scope
- Design system (`mob-design-system`)
- Fake data sources (`mob-fake-api`)

## Builds on
- Nothing (root chunk; greenfield repo)

## Provides
- Project skeleton, architecture conventions, navigation and networking base for all mobile chunks

## Done when
- App launches on Android and iOS with a placeholder screen and navigation
- CI builds both targets

## Decisions from the breakdown
- Compose Multiplatform, one shared codebase incl. UI, targets Android + iOS; phone and tablet layouts in v1; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).

## Open questions for the deep-dive session
- Module layout (feature modules vs. single shared module)
- DI library (Koin?)
- Navigation library
- HTTP client (Ktor) and serialization setup
- CI runner for iOS builds (macOS)
- Min Android SDK / iOS version

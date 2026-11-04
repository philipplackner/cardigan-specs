# Mobile import/export UI & file handling

| | |
|---|---|
| ID | `mob-import-export-ui` |
| Area | Mobile (CMP) |
| Size | M |
| Wave | 3 |
| Depends on | `mob-design-system` (dialogs, progress states) |
| Unlocks | `mob-import-export-connect` |

## Goal
Export and import actions with blocking progress and error states, plus platform file access (share sheet / save, file picker) on Android and iOS.

## In scope
- Export and import actions with blocking progress and error states
- Platform file access via expect/actual: share sheet / save on export, file picker on import
- Import/export repository interface

## Out of scope
- Real upload/download (`mob-import-export-connect`)
- Async import jobs (not wanted)

## Builds on
- `mob-design-system`: dialogs, progress states

## Provides
- File handling and UI that import-export-connect wires to the backend

## Done when
- A JSON file can be picked and saved/shared on Android and iOS
- Progress and error states show correctly; ViewModel tests pass against test doubles

## Decisions from the breakdown
- UI chunks build screens, ViewModels and the feature's repository interface on the shared domain models, tested with test doubles. There is no fake API layer (user decision).
- Compose Multiplatform, one shared codebase incl. UI, Android + iOS, phone and tablet layouts; no store release in this plan.
- No offline cache: every screen loads from the backend; new data only via intentional refresh (no real-time sync).
- One blocking request each way (user decision).

## Open questions for the deep-dive session
- Share sheet vs. save-to-files
- File picker library vs. custom expect/actual
- Navigate to the imported board afterwards?

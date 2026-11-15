# Proposal

## Breaking Change

No. No platform has shipped labels or export files, so nothing has to migrate.

## Target Platforms

- Backend
- Android
- iOS
- Web

## Why

The backend writes label colors as enum constants such as `RED`, while the shared specs spell them `Red`. One spelling in the API, the domain spec and the export file avoids translation on import and export.

## What Changes

- Label colors are the upper-case constants `AMBER` … `YELLOW`, compared case-sensitively. `Red` and `red` are invalid.
- Export files write label colors with the same values, for example `"color": "TEAL"`. `formatVersion` stays `1`.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `domain-label`: "Label color is a palette name" lists the upper-case values and rejects other spellings.
- `board-export-format`: "Import validates every rule of the domain" and "Labels are reused by name on import" use the upper-case values in file examples.

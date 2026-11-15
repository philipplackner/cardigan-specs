# Decisions: label-color-constants

Confirmed with Philipp Lackner on 2026-11-15, through the `cardigan-cd` planning session, which relayed the questions and answers (IDs COLORS-n).

## Summary

Label colors are written as upper-case constants `AMBER` … `YELLOW` everywhere: in the API, in the domain spec and in the export file. The values are case-sensitive, so `Red` and `red` are invalid. Nothing has shipped, so the change is not breaking and the export file stays at `formatVersion` 1. Design mockups keep their display names; only a README note points to the wire spelling.

## Decisions

### D1 — Palette values
- **Question**: How are the 20 palette colors spelled?
- **Decision**: `AMBER`, `BLUE`, `BROWN`, `CYAN`, `EMERALD`, `FUCHSIA`, `GREEN`, `INDIGO`, `LIME`, `OLIVE`, `ORANGE`, `PINK`, `PURPLE`, `RED`, `ROSE`, `SKY`, `SLATE`, `TEAL`, `VIOLET`, `YELLOW`. Case-sensitive. Any other value, including `Red`, `red` or `#FF0000`, is invalid.
- **Alternatives**: Title-case names as before (`Red`); numeric ids.
- **Why**: Settled in the backend change `be-labels` (D1, D2): the API writes enum constants, and one spelling everywhere means import/export needs no translation.
- **Depends on**: —

### D2 — Export file uses the same values
- **Question**: How are label colors written in the export file?
- **Decision**: With the same upper-case values, for example `"color": "TEAL"`. `formatVersion` stays `1`. Import rejects any other spelling with 422 `INVALID_EXPORT_FILE`, as for any unknown color.
- **Alternatives**: Keep title case in the file and translate on import/export.
- **Why**: Nothing has shipped, so no file with the old spelling exists.
- **Depends on**: D1

### D3 — Not breaking
- **Question**: Is this change breaking?
- **Decision**: No. No platform has shipped labels or export files.
- **Alternatives**: Mark as breaking.
- **Depends on**: D1, D2

### D4 — Design docs (COLORS-1)
- **Question**: Should the design mockups switch to the upper-case spelling?
- **Decision**: No. The mockups and the figma-export scripts keep their display names (`data-color="Blue"`). One line in `docs/design/README.md` says that the API and export file use `AMBER` … `YELLOW`.
- **Alternatives**: Rename everywhere, including Figma variant names; leave the design docs untouched.
- **Why**: The mockup values feed Figma variant names; renaming them would break the export without changing any shared behavior.
- **Depends on**: D1

### D5 — Breakdown chunk
- **Question**: What happens to the open question "Palette representation on the wire (names vs. ids)" in `10-be-labels.md`?
- **Decision**: It moves to the chunk's decisions as upper-case constants (user decision).
- **Alternatives**: —
- **Depends on**: D1

### D6 — Branch (COLORS-2)
- **Question**: Where are the commits made?
- **Decision**: On a new local branch `12-shared-spec-followups` from the current HEAD, shared with `auth-email-rate-limits`. No push.
- **Alternatives**: Separate numbered branches per change; stay on `11-user-email-lowercase-folding`.
- **Depends on**: —

## Facts

- Only `domain-label` ("Label color is a palette name") and `board-export-format` ("Import validates every rule of the domain", "Labels are reused by name on import") spell palette names — source: grep over `openspec/specs`.
- `board-export-format` defines only `formatVersion` 1 — source: `board-export-format`, "Export file identifies its format and version".
- `api-errors` uses `#FF0000` as its unknown-color example, which stays valid — source: `api-errors`, "Field error codes".
- The design mockups use `data-color` values that `docs/design/figma-export/compile.js` turns into Figma variant names — source: `docs/design/README.md`, `compile.js`.
- `be-labels` must not be archived until this change lands — source: backend `openspec/changes/be-labels/decisions.md`, D2.

## Out of scope

- Renaming colors in mockups, Figma or display text.
- Any change to the palette itself (same 20 colors).

## Deferred

- None.

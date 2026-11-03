# Cardigan — design mockups

Static HTML mockups of every v1 screen in the **Graphite** style. Open `index.html` in a browser to browse them; agents can read the files directly.

## Files

| File | What it contains |
|---|---|
| `DECISIONS.md` | The product and UI decisions behind the mockups (source of truth for requirements). |
| `index.html` | Overview: links to all pages + the decisions summary and open proposals. |
| `foundations.html` | Design tokens (colors, type, spacing, radius), 20-color label palette, components, breakpoints. |
| `auth.html` | Log in, register, and their error/loading states. |
| `board-list.html` | Board list (home): all sizes, loading/empty/error, phone scrolling, menus, create/rename/delete dialogs. |
| `board-view.html` | Board with columns and cards: all sizes, column menu and dialogs, quick add, drag & drop, search & label filter, board menu. |
| `card-detail.html` | Card detail (side panel on tablet/desktop, full screen on phone): label picker, editing, validation, unsaved changes, delete. |
| `labels.html` | Labels page: list, new/edit label dialog with the 20-color palette, delete, empty/loading. |
| `import-export.html` | Export from the board menu, import dialog, progress, errors (invalid file, over 5 MB, key already used), success. |
| `graphite.css` | **The design system**: tokens (light + dark) and all component and layout classes used inside the frames. |
| `gallery.css`, `gallery.js` | Gallery chrome only (page header, tabs, frame scaling, full-size view, theme toggle). Not product UI. |
| `style-directions.html` | Earlier round: the three style directions (Graphite was chosen). Historical. |

## How to read a mockup page

Each frame is one `<figure class="g-item">`, preceded by an HTML comment:

```html
<!-- Screen: Board view | State: Column menu | Size: phone (390 × 844) | Note: … -->
<figure class="g-item" data-screen="board-view" data-state="column-menu" data-size="phone">
  <div class="g-fw" …>              <!-- gallery wrapper, ignore -->
    <div class="fr ui fr-web fr-phone" style="width: 390px; height: 844px;">
      … real screen markup using graphite.css classes …
```

- `data-size`: `phone` (390 wide), `tablet` (834, portrait), `desktop` (1440; tablet landscape uses this layout too).
- Web (React) and the app (Compose Multiplatform) share these designs. App-only differences are written in the frame notes: pull to refresh instead of the refresh button, the system file picker for import, the share sheet for export.
- Label colors carry `data-color="Blue"` etc.; the palette is listed in `foundations.html` and `graphite.css` (`--h`/`--s` per color, lightness from `--lab-l` per theme).
- Theme: light tokens on `:root`, dark tokens under `prefers-color-scheme: dark` and `[data-theme="dark"]`. The product follows the system theme; there is no in-app setting.
- Sample content (boards, cards, emails, dates) is illustrative only.
- Frame notes marked "proposal" are layout choices not yet confirmed as requirements; `index.html` lists them.

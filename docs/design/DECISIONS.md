# Cardigan — UI decisions (design interview, 2026-10-16)

Source of truth for the mockups in `screens.html`. Anything not listed here is a layout choice made in the mockups, not a product requirement.

## Visual direction
- **Graphite**: cool blue-grey neutrals, one cobalt accent, hairline borders, compact density.
- Type: Geist (UI, headings), Geist Mono (card IDs, counts, metadata).
- Light and dark theme. **No in-app theme setting**: the app always follows the system theme.
- One shared look across web, Android and iOS (no Material/Cupertino-specific UI). One shared device frame in mockups; platform differences are only noted.
- Audience: developers. Tool-like, no "cozy" branding.

## Cards
- Fields: title, description (**plain text, no Markdown**), labels, created time, updated time (read-only).
- Card ID: **board key + number**, e.g. `CRD-109`.
- Create: **inline quick add** (title only) at the bottom of a column.
- Detail: **side panel** on tablet/desktop widths, **full screen** on phones.
- Editing: **explicit Save** button; warn about unsaved changes on close.
- Moving between columns: **drag & drop only** (no column picker).

## Boards
- Board has a name and a **key**: 2–5 uppercase letters, entered by the user at creation (prefilled from name), **not editable afterwards**, **unique per user**.
- New boards start with **default columns**: To do / In progress / Done.
- Board list: **grid of tiles** (list on phone). Each tile shows name, key, card count, last updated time.
- Web navigation on tablet/desktop: **persistent sidebar** (board list page remains the home).
- App navigation mirrors web by size: phone = board list home with a menu (Labels, Log out); tablet = persistent sidebar.

## Board view & columns
- Phone: **horizontal scroll** of columns (next column peeks in).
- Column actions (move left, move right, rename, delete) **all in a … menu**.
- Deleting a column with cards: **confirm dialog that names the card count; cards are deleted too**.
- All deletions (board, column, card, label) use a **confirmation dialog**.

## Labels
- Scope: **per user, shared across all boards**.
- Color: **fixed palette of 20 colors** tuned to the theme.
- Managed on an **own Labels page** (sidebar on wide screens, menu on phones). The list shows color dot and name only (no color names).
- **No inline label creation** in the card's label picker.

## Search & filter (client-side, open board only)
- Text search matches **title, description and card ID**.
- Multiple label filters combine with **OR** (any selected label).

## Auth & account
- Register: **email + password + repeat password**.
- Password rule: **at least 12 characters, with one lowercase letter, one uppercase letter and one digit**.
- Rules are **checked live while typing**: each shows a cross until met, then a check (two states only).
- "Email already exists" error has no extra "Log in instead" link; the Log in link below the form covers it.
- **No account/settings screen**; Log out lives in a menu.

## Board list on phones
- Top bar stays pinned; the large "Boards" title scrolls under it, then "Boards" appears in the bar with a divider.
- All boards load at once (no paging); the list ends with the board count.

## Import / export
- Export: from the **board view … menu** only.
- Web import: **button opening a dialog with a drop zone** (or browse). App import: system file picker.
- Max file size: **5 MB**.
- Key clash on import: **dialog asks for a different key**.
- After import: **stay on the board list**; a toast confirms (no "new" tag or highlight).

## Mockup scope
- **Web and app share one set of mockups**: phone (390), tablet portrait (834), desktop (1440). Tablet landscape uses the desktop layout.
- App-only differences are noted, not drawn: pull to refresh instead of the refresh button, system file picker for import, share sheet for export.
- States: loading, empty, error (load failed, validation), dialogs and menus open.

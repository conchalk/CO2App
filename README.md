# CO2App
## v4.0 – 2026-01-09
- Version bump to v4.0 to reset PWA cache and stabilise updates
- Verified and updated service worker cache name and precache list
- Verified menu.js integrity and navigation links (Footprint, Documentation, About)

## v3.5.0 – 2026-01-09
- Added full scientific documentation pages (EL & EN) and kept Model ↔ Values & References separation.
- Fixed broken drawer menu JavaScript and restored Settings page rendering.
- Updated Service Worker cache version and precached documentation pages.
- Updated About page content and version label.

## Update v3.4 (2026-01-07)

- Documentation pages refreshed:
  - `/pages/model.html` (Model Documentation) is now the active documentation entry in the menu.
  - `/pages/values.html` (Constants & References) is styled consistently and cross-linked with the model page.
- Drawer menu restored to the intended structure (removed Dashboard / Values from the menu; values page is reachable from Documentation).
- Icons adjusted: **Info** uses the “i” icon, **Documentation** uses the book icon.
- Mobile fix: menu open/close improved for touch devices.
- Info page updated with current/upcoming version note.

## Update v3.0 (2026-01-03)

- Added `config.json` for easy updates of key constants (Grid CI, EU target, social services, transport factors) with safe fallbacks.
- Added a **Settings** page to temporarily override selected constants (stored in `localStorage`) and reset to defaults.
- Transport fix: public-transport slider now represents **km/week** (not %). Emissions use km split (car vs public) with clamping to total distance.
- Metro/Tram now computed from energy intensity **0.05 kWh/pkm** × Grid CI (instead of fixed kg/km).
- EU target updated to **2.5 tCO2/year** (Paris Agreement reference) and unified across config/model/UI.
- Goods slider title updated to include “Clothes, electronics, shopping & lifestyle” (no separate hint text).
- Dashboard: chart labels/tooltips formatted to 2 decimals, improved title visibility, and KPI layout refinements.
- Removed legacy static QR image (`qrCO2App.png`) — installation page generates QR dynamically.

## Update v1.8 (2026-01-03)
- Added `config.json` for easy updates of CI and other constants.
- Added Settings page to temporarily override CI, EU target, social share, and metro/tram energy (stored locally).
- Public transport slider now represents km/week (clamped to total distance).
- Metro/Tram emissions now computed from energy (0.05 kWh/pkm) × CI.
- Updated digital-use slider labels and hid numeric ticks under sliders.

## v1.7
- Dashboard: fixed crash (ReferenceError: euTarget) by reading USER_TOTAL & EU_TARGET from localStorage and rendering the two KPI boxes correctly.
- Cache-bust: bumped assets to v17 and updated service worker cache name to co2app-cache-v17.

## v1.5
- Fix: footprint live updates on all inputs (ranges/checkboxes), sanitize NaN.
- Fix: Charts button works reliably.
- Remove qrCO2App.png (QR is generated dynamically on install page).
- Bump service worker cache to v15.

## v1.4
- Dashboard: title changed to “Ετήσια Εκτίμηση” and added 2 KPIs (User CO₂, EU 2030 target) with tCO2/έτος units.
- Sliders: removed % labels; Digital slider shows descriptive labels.
- Install page: generates QR dynamically from current URL.
- Updated manifest.webmanifest.

## Update v1.3 (Sliders + goods 4-level + public km display)
- Replaced long dropdowns on mobile with sliders for Home insulation, Home electricity use, and Goods consumption (4-level with intermediate mapping).
- Updated model keys for home condition (modern/post1980/pre1980) and updated heating-demand mapping.
- Public transport slider now displays km (computed from weekly distance × share).
- Improved inline wrapping alignment for mobile/desktop.

### v1.2
- Διόρθωση κεντραρίσματος λογοτύπου στην αρχική σελίδα.
- Καλύτερες αποστάσεις (desktop) μεταξύ των cards στο footprint.
- Ενημέρωση τίτλου/υπότιτλου στο footprint.
- Αφαίρεση KPI “% του στόχου” και “Απαιτούμενη μείωση” από Dashboard.
- Λεπτότερα donuts στο Dashboard.
- Κεντράρισμα icon σε hamburger/κλείσιμο menu.

## 2026-01-01 — UI improvements (v1.1)
- Responsive container widths for the footprint calculator (desktop & mobile).
- More prominent category KPI badge styling (closer to total KPI).
- Version bump for cache-busting (styles/js) and service worker cache name.

## 2026-01-01 — UI improvements (v1.1)
- Responsive container widths for the footprint calculator (desktop & mobile).
- More prominent category KPI badge styling (closer to total KPI).
- Version bump for cache-busting (styles/js) and service worker cache name.

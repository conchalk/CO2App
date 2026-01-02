# CO2App

## Update v13 (Sliders + goods 4-level + public km display)
- Replaced long dropdowns on mobile with sliders for Home insulation, Home electricity use, and Goods consumption (4-level with intermediate mapping).
- Updated model keys for home condition (modern/post1980/pre1980) and updated heating-demand mapping.
- Public transport slider now displays km (computed from weekly distance × share).
- Improved inline wrapping alignment for mobile/desktop.


## Update v10 (UI mobile layout)
- Mobile footprint cards now use a horizontal swipe carousel with proper full-width snap (no overflow/peek).
- Fixed inline row layout in Transport (car type + “Μετακινούμαι μόνος”) and improved wrapping on small screens.
- Improved cache-busting/consistent loading via versioned assets (keeps KPI + carousel consistent).
## Recent updates (2026-01-01)
- Mobile UI: added horizontal swipe carousel for the 3 main categories (Housing / Transport / Lifestyle) with left–right stepper buttons.
- Added per-category KPI badges (t CO₂/yr) at the top of each category card for immediate feedback as inputs change.
- Improved mobile layout stability: prevented dropdown/inline rows from overflowing and added a compact inline checkbox style.

## 2026-01-01 — UI improvements (v11)
- Responsive container widths for the footprint calculator (desktop & mobile).
- More prominent category KPI badge styling (closer to total KPI).
- Version bump for cache-busting (styles/js) and service worker cache name.


### v12
- Διόρθωση κεντραρίσματος λογοτύπου στην αρχική σελίδα.
- Καλύτερες αποστάσεις (desktop) μεταξύ των cards στο footprint.
- Ενημέρωση τίτλου/υπότιτλου στο footprint.
- Αφαίρεση KPI “% του στόχου” και “Απαιτούμενη μείωση” από Dashboard.
- Λεπτότερα donuts στο Dashboard.
- Κεντράρισμα icon σε hamburger/κλείσιμο menu.


## v14
- Dashboard: title changed to “Ετήσια Εκτίμηση” and added 2 KPIs (User CO₂, EU 2030 target) with tCO2/έτος units.
- Sliders: removed % labels; Digital slider shows descriptive labels.
- Install page: generates QR dynamically from current URL.
- Updated manifest.webmanifest.


## v15
- Fix: footprint live updates on all inputs (ranges/checkboxes), sanitize NaN.
- Fix: Charts button works reliably.
- Remove qrCO2App.png (QR is generated dynamically on install page).
- Bump service worker cache to v15.

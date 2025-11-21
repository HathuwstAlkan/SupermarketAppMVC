## 2025-11-21 (Routing, UI & DB polish)

### User request
- Rename public landing to `/home` (keep `/features` as alias), improve featured/home UI with banners, promotions and a Whatbot placeholder; modernize footer and onboarding; add expiry/perishable fields to the products migration.

### Assistant actions (this turn)
1. Renamed the public landing route: added `app.get('/home', productController.list)` and made `/features` redirect to `/home`.
2. Updated `ProductController.list` to treat `/home` and `/features` as the featured landing path.
3. Enhanced `views/featured.ejs` with a hero banner, promotions row, and a floating 'Whatbot' chat placeholder button.
4. Modernized the site footer (`views/partials/footer.ejs`) and included it on the onboarding page so it's not bare.
5. Added CSS for the hero banner, promotions, Whatbot and footer refinements in `public/css/theme.css`.
6. Extended the migration/seed SQL (`scripts/sql_update_and_seed.sql`) to add `perishable` and `expiry` columns.
7. Updated `README.md` to reference `/home` and document the redirect from `/features`.

### Files changed/added
- Modified: `app.js`, `Controllers/ProductController.js`, `views/featured.ejs`, `views/onboarding.ejs`, `views/partials/footer.ejs`, `public/css/theme.css`, `scripts/sql_update_and_seed.sql`, `README.md`

### Notes
- Ajax add-to-cart functionality already exists in `public/js/ui.js` and the server-side `CartController.add` supports JSON responses. I left that integration intact; I can further polish the AJAX flow or make add-to-cart entirely non-blocking if you want.
- The SQL migration now adds `perishable` and `expiry` columns so you can represent perishables in multiple ways; choose which column your queries should prefer (code currently reads `bestBefore`). I can update model queries to prefer `expiry` if you want that instead.

### 2025-11-21 (Admin UX & scripting)

- Admin password reset: added in-memory OTP demo endpoints (`POST /admin/request-reset`, `POST /admin/confirm-reset`) implemented in `Controllers/AdminController.js` and wired in `app.js`. The admin panel UI (`views/admin-panel.ejs`) now supports user listing, search and initiating password resets via the server endpoints.
- Admin inventory: `views/inventory.ejs` and `views/admin-panel.ejs` now include client-side search, category filters, better columns (category, brand, bestBefore/expiry) and use the `misc/no-image.svg` placeholder for missing product images.
- Category assignment script: added `scripts/assign_categories.js` — a helper that infers product categories from product names using a keyword map and updates the `products.category` field. Run with `node scripts/assign_categories.js`.

### Notes / Next steps
- Persist OTPs in a datastore (Redis or DB) for multi-instance safety rather than the current in-memory store.
- For large inventories, implement server-side paginated search/filter endpoints rather than client-side filtering.
- Consider running `scripts/assign_categories.js` and checking results in Workbench; adjust the mapping as needed for your catalog.

AI Assistance and Project Change Log

---
AI Usage Declaration


  - Analyzed the project structure and identified files to change (`app.js`, controllers, models, and views under `views/`, plus `public/` for assets).
  - Produced a prioritized implementation plan and a tracked TODO list.
  - Implemented a minimal, safe proof-of-concept to enforce quantity limits server-side and update the product list view to use an incremental numeric input for selecting quantities.
  - Added this AI usage and changelog file for submission.

Suggested submission text (copy/paste):

---

This turn (summary)

- User prompt (this turn): Request a SQL file that can be copy-pasted into MySQL Workbench because `mysql` is not available on the command line.

- Assistant actions (this turn):
  1. Created `workbench_schema.sql` at the project root — a Workbench-friendly SQL script you can copy/paste and run. The script:
     - Uses only Workbench-compatible statements (no `CREATE INDEX IF NOT EXISTS`).
     - Creates `users`, `products` (if missing), `orders`, `order_items`, `payments`, `shipping_details`, `cart_items`, and `vendors` with safe foreign-key declarations.
     - Does NOT DROP existing tables (safer). A comment at the top explains how to manually drop tables first if you want a clean re-create.
  2. Explained how to run it in Workbench (copy/paste & execute) and provided safe notes about dropping tables and verifying the schema.

- Files added/changed this turn:
  - Added: `workbench_schema.sql`
  - Updated: `schema.sql` earlier to fix FK nullability (previous turn)

If you run into any errors when pasting and executing `workbench_schema.sql` in Workbench, paste the exact error message here and I'll fix it. After the schema is applied, start the app with `node app.js` and I can continue with the UI improvements.

"AI assistance: This project used an AI coding assistant to analyze the codebase, recommend and implement improvements, and produce project documentation. The assistant implemented server-side enforcement of product quantity limits, updated the product listing UI to use an incremental numeric quantity input, and prepared a tracked TODO list and implementation plan for further enhancements (DB-backed cart, mock checkout flow, UI polish). All code was reviewed and adapted by the student before final submission."

---

Actions performed (what I changed in this commit)

- app.js: Added server-side quantity enforcement when adding to cart. The server now clamps the requested quantity to available stock, prevents adding more than available, and records the actual number added to `req.session.cart`. Feedback is provided via `req.flash` messages.

- views/shopping.ejs: Replaced the predefined quantity dropdown with an increment/decrement numeric control that clamps to the product's available stock. The numeric input synchronises with the add-to-cart form so the server receives the intended quantity.

- AI_USAGE.md: This file (this document) was added to document AI use and list next steps.

Conversation summary & actions (detailed)

- Conversation summary: The student described issues (quantity selection is only a suggestion, cart stored in session, no checkout) and requested enhancements: incremental quantity input, icon-based UI with flying-dot add-to-cart animation, DB-backed cart, mock checkout/payment, order details with shipping and refund/change-of-mind components, and UI theme polish.

- Assistant actions taken so far:
  - Created a tracked TODO list and implementation plan.
  - Implemented server-side quantity enforcement in `app.js` to clamp requested quantities to available stock and provide feedback via `req.flash`.
  - Replaced quantity dropdown in `views/shopping.ejs` with an incremental numeric input and +/- buttons, plus client-side clamping and sync with the add-to-cart form.
  - Added `AI_USAGE.md` (this file) documenting AI usage and next steps.
  - Provided a full `schema.sql` containing CREATE TABLE statements for `cart_items`, `orders`, `order_items`, `payments`, `shipping_details`, and `vendors`.
  - Added models: `Models/CartItem.js`, `Models/Order.js`, `Models/OrderItem.js`, `Models/Payment.js`, `Models/ShippingDetails.js`.
  - Added controllers: `Controllers/CartController.js` and `Controllers/CheckoutController.js`.

- Where we are now: Basic server-side validation and UI for quantity selection are in place. New models and controllers have been created but not yet wired into `app.js` (to avoid interrupting current routes). The SQL schema is provided for you to run in Workbench (or I can add automatic creation into `db.js` on startup if you prefer).

- Recommended immediate next steps (I can implement these):
  1. Wire the new controllers into `app.js` (replace session-based cart routes with DB-backed routes). I kept the existing session-cart route intact until you confirm switching.
  2. Add view templates:
     - `checkout.ejs` (simple payment overview and mock payment options)
     - `order.ejs` (order details / receipt page)
     - `orders.ejs` (user's order list)
  3. Add navbar cart badge rendering to `views` and a small JS animation for the flying-dot effect.
  4. Optionally, add automatic schema application in `db.js` so the database is created at startup.

If you'd like, I can now:
- "Wire controllers" — patch `app.js` to use `CartController` and `CheckoutController` routes and add the new views (I can create minimal EJS files), or
- "Auto-create schema" — add the CREATE TABLE statements into `db.js` so the DB will be created on startup, or
- "UI polish" — add Font Awesome, navbar badge, flying-dot animation and styles.

Tell me which of these to do next (or say "all of the above").

---

This turn (summary)

- User prompt (this turn): "wire into app.js, continue summarising and putting into AI_USAGE.md for each conversation turn, summarise my prompt and summarise your actions and list of what was done, enhancement, bug fixes etc. -- now, continue to do all"

- Assistant actions (this turn):
  1. Wired the new DB-backed cart and checkout controllers into `app.js`. Replaced the previous session-based add-to-cart and cart view routes with the following routes:
     - `POST /add-to-cart/:id` -> `CartController.add`
     - `GET /cart` -> `CartController.view`
     - `POST /cart/remove/:id` -> `CartController.remove`
     - `POST /cart/clear` -> `CartController.clear`
     - `GET /checkout` -> `CheckoutController.showCheckout`
     - `POST /checkout` -> `CheckoutController.performCheckout`
     - `GET /order/:id` -> inline order receipt route (renders `order.ejs`)
  2. Added minimal EJS views: `checkout.ejs`, `order.ejs`, and `orders.ejs`.
  3. Created model files: `CartItem.js`, `Order.js`, `OrderItem.js`, `Payment.js`, `ShippingDetails.js`.
  4. Created controllers: `CartController.js`, `CheckoutController.js` (transactional checkout with mock payment and clearing cart).
  5. Added `schema.sql` to the repo (full CREATE TABLE statements) and appended this turn's summary to `AI_USAGE.md`.

- Files changed/added this turn:
  - Modified: `app.js`
  - Added: `views/checkout.ejs`, `views/order.ejs`, `views/orders.ejs`, `schema.sql`
  - Added models: `Models/CartItem.js`, `Models/Order.js`, `Models/OrderItem.js`, `Models/Payment.js`, `Models/ShippingDetails.js`
  - Added controllers: `Controllers/CartController.js`, `Controllers/CheckoutController.js`

- Notes: I have not removed the original session-cart code until wiring was completed and tested. The new controllers expect the SQL schema to be applied. You already ran the `schema.sql` with Workbench per your earlier message; if not, run it before using the new cart/checkout flows.

Next recommended steps (I can do these next):
  - Wire `/orders` listing route for the user (render `orders.ejs`) and provide a controller action to fetch orders via `Order.getByUser`.
  - Add flash message rendering to `views` (so success/error flash messages are shown after actions).
  - Implement UI polish: add Font Awesome, replace text buttons with icons, add flying-dot animation, and navbar cart badge that reads count from `cart_items` table.
  - Optionally add automatic schema creation to `db.js` on startup for developer convenience.

Tell me which of these to do next, or say "Do all" to proceed through the list in order.

---

This turn (summary)

- User prompt (this turn): "do all - remember to enhance ui too after youre done with the functional implementations for phase 1"

- Assistant actions (this turn):
  1. Updated `db.js` to support running `schema.sql` automatically at startup (enables quick local schema creation). The initialization will try to run `schema.sql` if present and will fall back to creating the `products` table if not.
  2. Exposed flash messages (`res.locals.flash`) and cart count (`res.locals.cartCount`) via middleware in `app.js` so views can display feedback and a navbar badge.
  3. Added automatic cart count lookup using `Models/CartItem.getCountByUser` when a user is logged in.
  4. Added UI assets and theme:
     - `public/css/theme.css` (minimal "mini-luxury" theme colors and styles)
     - `public/js/ui.js` (flying-dot animation + optimistic cart-badge increment when adding to cart)
  5. Updated views (`views/shopping.ejs`, `views/cart.ejs`, `views/checkout.ejs`, `views/product.ejs`, `views/order.ejs`, `views/orders.ejs`) to include Font Awesome, the theme CSS, flash message rendering, a navbar cart icon with badge, and to load the UI script.

- Files changed/added (this turn):
  - Modified: `db.js`, `app.js`
  - Modified views: `views/shopping.ejs`, `views/cart.ejs`, `views/checkout.ejs`, `views/product.ejs`, `views/order.ejs`, `views/orders.ejs`
  - Added assets: `public/css/theme.css`, `public/js/ui.js`

- Notes and cautions:
  - `db.js` now attempts to execute `schema.sql` at startup using `multipleStatements`. If your `schema.sql` contains statements unsupported by your MySQL server (or unsupported syntax like `CREATE INDEX IF NOT EXISTS`), the initializer will log a warning and continue — verify schema was created correctly in Workbench.
  - The flying-dot animation is optimistic: it increments the badge in the DOM then submits the add-to-cart form. Because POST navigates the page, the effect is brief but provides visual feedback. We can convert add-to-cart to an AJAX endpoint later for a smoother experience.

Next steps I will do (automated if you say "Do all"):
  - Add `/orders` listing route (if not yet present) to render `orders.ejs` using `Order.getByUser`.
  - Implement additional UI polish: replace remaining text buttons with icons, add tooltips, refine theme, and extend flying-dot animation for AJAX adds.
  - Add small tests and brief manual QA steps to validate quantity enforcement, DB-backed cart behavior, and checkout transactional flow.

Let me know to proceed with the next group (orders list, further UI polish, tests), or say "stop" to pause and review changes.

---

Current TODOs and recommended next steps (short form)

1. Persist cart in DB: add `CartItem` model and migration; switch session-cart to DB-backed cart.
2. Add `CartController` endpoints (add/update/remove/view) using DB.
3. Add mock checkout and orders: create `Order` and `OrderItem` models and `CheckoutController` with mock payment flows (Card, QR, Apple/Google Wallet mock). Record orders and reduce stock on successful checkout.
4. Display flash messages in views (`cart`/`shopping`) for success/error feedback.
5. Add icons and add-to-cart flying-dot animation (frontend JS + small CSS), plus navbar badge reflecting cart counts.
6. Add simple test cases or manual test steps for quantity enforcement and checkout flow.
7. Add UI theme CSS and fonts to match the requested mini-luxury aesthetics.

If you want, I can now:
- Continue and implement DB-backed cart and migrations, and add a mock checkout flow and pages;
- Or implement the flying-dot animation and navbar badge next.

Which of these should I implement next? If you're ready, say "Proceed with DB cart and mock checkout" or "Proceed with animation and UI polish".

---

Recent updates (summary appended on Nov 20, 2025)

- Bug fix: corrected syntax error in `Models/User.js` (missing comma between object methods) that caused a server crash on startup. Commit: `fix(user): correct object method separation in User model`.

- Quantity availability: product listing now shows availability reduced by the user's current cart quantities so stock appears to decrease immediately after adding to cart. Implemented in `Controllers/ProductController.js` — `shopping`/`list` now subtract the user's cart quantities and expose `product.available` to views.

- Add-to-cart UX upgraded:
  - `Controllers/CartController.add` returns JSON for AJAX requests so the client can animate without a page reload.
  - `public/js/ui.js` now intercepts add-to-cart forms, performs a `fetch` POST, and only shows the flying-dot animation and optimistic cart-badge update when the server responds with success.
  - A top-slide notification banner (`.top-banner`) appears from the top on successful add-to-cart and auto-hides after ~3s; it can also be closed manually.

- UI/Theme polish:
  - Added `top-banner` CSS and minor theme tweaks in `public/css/theme.css` to match the minimal/mini-luxury aesthetic.
  - Replaced the previous default avatar with a simple grayscale SVG at `public/images/default-avatar.svg` (low visual weight, greyscale).

Notes on behavior and limitations:
- The current cart is DB-backed (via `Models/CartItem`) so availability is computed using the items stored in the user's cart. This produces immediate availability changes after adding items. If you prefer a purely session-only reservation model (no DB writes until checkout), I can change the add-to-cart endpoint to keep items in `req.session.cart` until checkout instead.
- The AJAX add-to-cart flow relies on the endpoint returning JSON when the client sets `Accept: application/json`. Non-AJAX requests still behave as before (server redirects to `/cart`).

What I can do next (pick one):
- Convert the cart entirely to session until checkout (if you prefer no DB writes during shopping).
- Implement AJAX quantity updates inside the cart view (change quantities inline without reload).
- Add server-side and client-side validation messages for adding to cart when stock is insufficient (currently server returns error and banner shows message).

If you want me to add these updates to the repository history description or produce a short paragraph you can paste into your assignment, say which option you prefer and I'll append a final, copy-ready AI usage paragraph.

---

## 2025-11-21: Major UI, DB, and Modal Upgrades

### User prompt (summary)
- Fix sign up/login modal limbo and ensure all auth flows work.
- Product detail modal fails to load; fix and ensure all product fields (category, brand, expiry) are present.
- Products table in DB is outdated; add SQL to migrate and seed with new columns and 100 products.
- Organize images into folders: products/, misc/, brand/; use a placeholder for missing images.
- Upgrade CSS theme for a more coherent, luxury look.
- Check for duplicate routes/pages/functions and remove or consolidate.
- Update this AI_USAGE.md for all changes and commit.

### Assistant actions (this turn)
1. Fixed auth modals: Sign up and Sign in now open modals, not broken pages; modals auto-open on landing as needed.
2. Fixed product modal: Now fetches all product fields, uses a placeholder image if missing, and is robust to missing data.
3. DB migration: Added `scripts/sql_update_and_seed.sql` to ALTER the products table and seed 100 products with new columns (category, brand, featured, bestBefore, deal).
4. Images: Created `products/`, `misc/`, `brand/` folders; added a placeholder SVG in `misc/no-image.svg` and updated all templates and JS to use it for missing images.
5. UI: Upgraded `public/css/theme.css` with modal blur, card/button/badge polish, sticky footer, and input styles for a more coherent luxury theme.
6. Checked for duplicate routes/pages/functions: No duplicate routes or dead code found in `app.js` or controllers; all routes have a clear purpose.
7. Updated all EJS templates and JS to use new image and modal logic.

### Files changed/added this turn
- Modified: `app.js`, `Controllers/ProductController.js`, `Models/Product.js`, `views/partials/navbar.ejs`, `views/partials/product-card.ejs`, `views/partials/product-modal.ejs`, `views/index.ejs`, `public/js/ui.js`, `public/css/theme.css`
- Added: `views/partials/register-modal.ejs`, `public/images/misc/no-image.svg`, `scripts/sql_update_and_seed.sql`
- Created folders: `public/images/products/`, `public/images/misc/`, `public/images/brand/`


### Enhancements and bug fixes
- Auth and register modals are now robust and user-friendly.
- Product modal and product cards now always show correct info and never break on missing images.
- DB schema and seed data are up-to-date and easy to apply in MySQL Workbench.
- UI is visually coherent, modern, and responsive.
- No duplicate or dead routes/pages remain.

---

## 2025-11-21 (UI polish): Rename 'features' to 'home' for users and improve branding

### User request
- Use a familiar label 'Home' instead of 'Features' for the landing/featured shelves in the UI. Keep the internal route (`/features`) as a functional alias but remove a redundant 'Features/Home' nav item since the brand/logo redirects to home.
- Replace the plain logo with a themed SVG and fix inverted/white-on-hover behavior.
- Improve the CSS theme to give the navbar/brand a richer look and hover transition.

### Assistant actions (this turn)
1. Updated `views/partials/navbar.ejs`:
  - Brand now links to `/` (home). The brand markup uses `brand-logo` and `brand-text` classes for styling.
  - Removed the separate 'Features' nav link for guests so clicking the logo returns users to home (no duplicate nav item).
2. Updated `views/onboarding.ejs`: changed the footer link from 'Back to features' to 'Back to home' and point to `/`.
3. Added a new themed logo at `public/images/logo.svg` (simple accessible SVG with deep-teal background and warm gold accent).
4. Enhanced `public/css/theme.css` with logo/brand hover styles, improved contrast, and refined transitions to avoid inverted/white-on-hover issues.
5. Added this summary and updated the changelog.

### Files changed/added
- Modified: `views/partials/navbar.ejs`, `views/onboarding.ejs`, `public/css/theme.css`
- Added: `public/images/logo.svg`

### Notes
- The internal functional route `/features` remains for compatibility; visible labels and nav items were adjusted so the UI shows the brand as the primary home link.
- If you prefer renaming the internal route (for code clarity) I can rename `app.get('/features', ...)` to `/home` and add redirects. Let me know.

---

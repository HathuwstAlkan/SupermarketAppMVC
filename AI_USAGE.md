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

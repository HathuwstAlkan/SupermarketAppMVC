# Supermarket MVC

A small Node.js + Express MVC supermarket demo application built with EJS views.

## Features
- Product browsing (gallery and featured shelves)
- User authentication (register/login)
- DB-backed cart and mock checkout (requires schema)
- Admin analytics and admin panel (mock features)
- AJAX add-to-cart, animated UI, and responsive layout

## Quick start
1. Install dependencies

```powershell
npm install
```

2. Prepare the database

- Use MySQL / Workbench to run the provided SQL in `scripts/sql_update_and_seed.sql` (adds columns and seeds sample products).
- Alternatively, if you already have a `schema.sql` file, run it in Workbench.

3. Configure environment (optional)

- By default the app uses settings in `db.js`. If needed, update DB connection details there or set environment variables as appropriate.

4. Start the app

```powershell
# run with node
node app.js
# or with nodemon (recommended during development)
nodemon app.js
```

5. Visit

- Open `http://localhost:3000/` in your browser. Click the app logo to return to the home/featured shelves.

## Admin utilities
- The admin panel provides user management, password reset (demo OTP), and an improved inventory view with search and filters.
- To auto-assign categories for existing products based on product names, run the helper script:

```powershell
node scripts/assign_categories.js
```

This updates `products.category` for products that are missing categories using a simple keyword mapping. Review changes in Workbench if desired.

## Notes
- The landing/featured shelves are available at `/home` (and `/features` redirects to `/home`). The UI uses the brand/logo as the primary home link (no separate "Home" nav item).
- To reset seed data, re-run the SQL in Workbench or drop and re-create the tables as desired.

## Development tasks
See `AI_USAGE.md` for a chronological log of AI-assisted changes, TODOs and recommended next steps.

## License
This project is for coursework/demo purposes.

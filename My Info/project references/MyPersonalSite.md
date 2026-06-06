# Jack's Guitar Shop - Project Reference

## Project Overview
Jack's Guitar Shop is a full-stack PHP/MySQL e-commerce web application for browsing products, managing customer accounts, handling shopping carts, and completing purchases. The project supports role-based behavior for standard customers and administrators, with separate workflows for storefront actions and back-office management.

## Core Purpose
- Provide an online product catalog with category-based inventory.
- Allow customer account registration, activation, login, and password updates.
- Support shopping cart management and transactional checkout.
- Provide admin CRUD tools for customers and products.

## Tech Stack
- Backend: PHP (procedural, multi-page architecture)
- Database: MySQL with `mysqli`
- Frontend: HTML, CSS, Bootstrap 3, inline component styling
- Session/Auth: PHP sessions with user-agent fingerprint check
- Email: PHP `mail()` for account activation and contact confirmations

## Functional Scope

### Customer Features
- Account registration with server-side validation and unique email checks.
- Email-based account activation before login.
- Login/logout with session persistence (`cust_id`, `cust_level`, active `cart_id`).
- Product catalog browsing with sorting and pagination.
- Add-to-cart flow with stock-aware quantity validation.
- Cart review with quantity removal and full cart clear.
- Checkout flow with transaction-like processing:
	- Validates current inventory before purchase.
	- Writes purchase records to history.
	- Decrements inventory levels.
	- Marks cart completed and issues a new active cart.
- Purchase history view with sorting and pagination.
- Password change workflow and contact form messaging.

### Admin Features
- Product management: create, edit, delete.
- Customer management: view, edit, delete.
- Expanded purchase history visibility across all customers.
- Role-based navigation and UI options in shared header.

## Data Model Highlights
Database includes six main relational tables:
- `customers`: profile, credentials (SHA2 hash), activation token, role level.
- `categories`: product category taxonomy.
- `products`: catalog metadata, pricing, stock quantity, image path.
- `carts`: customer carts with lifecycle status (`active`, `completed`, `abandoned`).
- `cart_items`: quantity and line-item cost, unique per cart/product pair.
- `purchase_history`: immutable record of completed purchases.

## Architecture Notes
- Multi-page PHP app with shared includes for layout and logic reuse.
- Reusable helper modules:
	- `includes/login_functions.inc.php` for redirects, auth checks, and cart bootstrap.
	- `includes/cart_functions.inc.php` for cart CRUD and totals.
- Session-based role handling (`cust_level`) drives access and available routes.
- Pagination and sortable list patterns reused across products, users, and history pages.

## Resume-Ready Contribution Summary
- Built and integrated a complete end-to-end e-commerce workflow in PHP/MySQL, from account onboarding through checkout and purchase history.
- Implemented role-based access controls that separated customer storefront actions from admin product/customer management tasks.
- Designed and used a normalized relational schema supporting catalog, cart lifecycle, and historical order records.
- Added server-side validation for login, registration, cart quantities, and checkout inventory constraints.
- Implemented reusable helper functions to centralize authentication redirects and cart operations.

## Strengths Demonstrated
- Full-stack feature delivery in a traditional LAMP-style architecture.
- Practical use of SQL joins, aggregation, sorting, and pagination.
- Session state design and multi-role UI behavior.
- Transaction-minded checkout flow that coordinates inventory and purchase records.

## Areas to Discuss in Interviews
- How cart state is created at login and persisted between actions.
- Tradeoffs of procedural PHP versus MVC frameworks for maintainability.
- Data integrity considerations in checkout (inventory checks and commit/rollback behavior).
- Security improvements to consider next (prepared statements, credential/config handling, stricter authorization guards).

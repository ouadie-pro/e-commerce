# AGENTS.md — SANATURA E-Commerce Project Guide

## 1. Project Overview

**SANATURA** is an e-commerce application for Moroccan sweets, cookies, customizable cookie packs, and traditional Moroccan sweet platters.

The application allows customers to browse products, customize their selections, add products to a cart, enter delivery information, and submit orders.

The project uses Next.js App Router for the frontend and API routes, MongoDB for data storage, and Mongoose for schemas and database operations. The codebase follows a lightweight MVC-inspired structure.

### Main customer flow

1. Browse the product catalog.
2. View product details, images, descriptions, and prices.
3. Customize a cookie pack or Moroccan sweet platter when applicable.
4. Add products to the cart and adjust quantities.
5. Enter delivery information: full name, phone number, city, and address.
6. Submit an order.
7. Store the customer information and order details in MongoDB.

## 2. Critical Next.js Agent Rules

**This project uses Next.js 16.4.0. Do not assume that older Next.js conventions or APIs apply.**

Before creating or modifying Next.js-specific code:

1. Read the relevant documentation inside `node_modules/next/dist/docs/`, resolved from the project directory.
2. Check the current documentation for App Router route handlers, request/response APIs, caching, configuration, and any relevant feature.
3. Follow current conventions and heed deprecation notices.
4. Do not invent APIs or rely on outdated examples when current documentation is available.
5. Do not remove or rewrite the `BEGIN:nextjs-agent-rules` block in this file. Next.js may regenerate it automatically.

When a task is limited to reviewing or explaining code, do not modify project files unless explicitly requested.

## 3. Technology Stack

- **Framework:** Next.js 16.4.0, App Router.
- **UI library:** React 19.3.0.
- **Language:** JavaScript; do not introduce TypeScript unless explicitly requested.
- **Styling:** Tailwind CSS 4.
- **Database:** MongoDB.
- **ODM:** Mongoose 9.11.1.
- **Database configuration:** `.env` and `lib/connectionDb.js`.
- **Linting:** ESLint 9 with `eslint-config-next`.
- **Module conventions:** ESM in App Router and database connection code; existing models and controllers use CommonJS.
- **Path alias:** `@/*` maps to the project root.

Use the versions specified in the actual `package.json` and lockfile if they differ from this guide. Do not upgrade dependencies without being asked.

## 4. Project Structure

Keep the project organized and straightforward. Follow this structure when adding or extending functionality:

```text
e-commerce/
├── app/
│   ├── api/
│   │   ├── clients/
│   │   │   └── route.js
│   │   ├── products/
│   │   │   └── route.js
│   │   └── orders/
│   │       ├── route.js
│   │       └── [id]/
│   │           └── route.js
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── home/
│   └── layout/
├── controllers/
│   ├── clientController.js
│   ├── productController.js
│   └── orderController.js
├── models/
│   ├── Clients.js
│   ├── Products.js
│   └── Orders.js
├── lib/
│   └── connectionDb.js
├── public/
├── .env
├── jsconfig.json
├── next.config.mjs
├── eslint.config.mjs
├── package.json
└── AGENTS.md
```

Do not create a separate root-level `api/` directory for Next.js endpoints. App Router API endpoints belong inside `app/api/`.

Only create files that are required for the requested task. Do not duplicate existing functionality or reorganize unrelated files without permission.

## 5. API Routes

API endpoints use the Next.js App Router Route Handler convention. Each endpoint is defined in a `route.js` file and exports named HTTP method handlers such as `GET`, `POST`, `PATCH`, or `DELETE`.

Route handlers should use the documented Next.js request and response APIs. Do not assume that they automatically receive Express `req` and `res` objects.

### Clients

File: `app/api/clients/route.js`

Intended endpoint:

- `POST /api/clients` — validate customer information and create a customer record.

Additional customer endpoints may be added when required.

### Products

File: `app/api/products/route.js`

Intended endpoints:

- `GET /api/products` — retrieve products.
- `POST /api/products` — create a product.
- `PATCH /api/products` — update a product, if this convention is retained.
- `DELETE /api/products` — delete a product, if this convention is retained.

Use consistent request formats and response structures. Consider using a product-specific resource route, such as `/api/products/[id]`, if it improves clarity.

### Orders

Files:
- `app/api/orders/route.js`
- `app/api/orders/[id]/route.js`

Intended endpoints:

- `POST /api/orders` — validate and create an order.
- `GET /api/orders` — retrieve orders; restrict this operation to authorized administrators.
- `GET /api/orders/[id]` — retrieve an individual order.
- `PATCH /api/orders/[id]` — update an order or its status, subject to authorization.

Use the actual route parameters and request payload documented for the current Next.js version.

## 6. Controllers and Route Handler Integration

The existing controllers use CommonJS and Express-style function signatures, for example:

```js
const { addClient } = require("../models/Clients");
```

Controllers currently follow a `(req, res)` pattern in which the response is written through methods such as `res.status()` and `res.json()`.

Next.js Route Handlers do not natively provide Express response objects. When integrating existing controllers:

1. Inspect the actual controller implementation before writing the route.
2. Decide whether to adapt the controller to work with standard request data and return values, or to use a clearly defined compatibility adapter.
3. Do not pass incomplete or fabricated request objects to controllers that depend on properties they do not receive.
4. Ensure validation errors preserve their correct HTTP status codes.
5. Avoid returning a successful response when the controller did not produce one.
6. Do not mix incompatible module systems or assume that `require()` and `export default` can be substituted without checking the project configuration.

Prefer a consistent, maintainable integration over duplicating controller logic in every route.

## 7. MongoDB Connection

Database connection helper:

`lib/connectionDb.js`

Responsibilities:

- Connect to MongoDB using Mongoose.
- Read credentials from environment variables.
- Cache the connection where appropriate to reduce repeated connections during development.
- Propagate connection errors so API routes can return suitable responses.
- Avoid connecting multiple times unnecessarily.

Call and await `dbConnect()` before performing database queries.

### Environment variables

The project `.env` currently defines:

```env
MONGODB_URI=your_mongodb_connection_string
```

There is a known inconsistency: the existing connection helper reads `MONGO_URI`, while the environment configuration uses `MONGODB_URI`.

Do not silently change this existing behavior when working on an unrelated task. When database connection work is requested, inspect both files and align the variable names deliberately.

Never hardcode database credentials or expose environment variables through client-side code. Do not commit real secrets.

## 8. Data Models

Mongoose models live in `models/`. Inspect their current implementations before changing schemas.

### Client — `models/Clients.js`

Represents a customer or delivery contact.

Fields:

- `fullname`: String, required, trimmed, maximum 150 characters.
- `phone`: currently Number; consider String to preserve leading zeros and support international formats.
- `city`: String, required.
- `address`: String, required.

When updating the phone field, account for existing data and validation requirements.

### Product — `models/Products.js`

Represents a product in the catalog.

Fields:

- `name`: String, required, trimmed, maximum 150 characters.
- `description`: String, required, trimmed, maximum 2000 characters.
- `price`: Number, required; validate that it is non-negative.
- `image`: String, required; stores an image URL or path.
- `category`: String, required.
- `isActive`: Boolean, default `true`.
- `clientId`: existing optional reference to `Client`; review whether this relationship is appropriate before changing it.
- `timestamps`: enabled.

Products are catalog entities and should not be assigned to individual customers unless the business requirements explicitly require that relationship.

### Order — `models/Orders.js`

Represents a customer's order.

The order model should support:

- A reference to the customer.
- One or more order items.
- A snapshot of product names and unit prices at the time of purchase.
- Product quantities.
- Delivery information: full name, phone, city, and address.
- Total price.
- Order status.
- Creation and update timestamps.

Recommended order statuses:

- `pending`
- `confirmed`
- `preparing`
- `shipped`
- `delivered`
- `cancelled`

Validate status changes and preserve a consistent lifecycle.

Use model caching where necessary to avoid Mongoose model re-registration errors during development.

## 9. Custom Product Requirements

SANATURA supports regular products and customizable sweets.

### Custom cookie pack

Customers can select four different cookie types to create one pack.

Requirements:

- Validate the selection on the server.
- Require exactly four distinct cookie types for a completed custom pack.
- Validate quantities and permitted cookie types.
- Store the selection with the order.
- Calculate prices on the server using trusted product data.
- Do not trust client-submitted totals or prices.

If the four-cookie selection is intended to represent four individual cookies rather than four cookie varieties, clarify the business rule before changing quantity validation.

### Moroccan sweet platter

The platter supports seven different shapes or types, with ten units per type.

Requirements:

- Validate the
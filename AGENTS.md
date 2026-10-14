<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Project Guide

## Project Overview

`e-commerce` is a small e-commerce web application. Customers browse products, select what they want, add items to a cart, and then submit their personal information to confirm an order. The app is built on the Next.js App Router (frontend) with a MongoDB database accessed through Mongoose (backend/data layer), following a light MVC split.

Core user flow:

1. Customer visits the site and browses the product catalog.
2. Customer selects products and adds them to a cart.
3. Customer enters personal/delivery details (full name, phone, city, address).
4. The order is confirmed and the customer record is persisted.

## Tech Stack

- **Framework:** Next.js `16.4.0` (App Router), React `19.3.0`, `next/font` (Geist / Geist Mono).
- **Styling:** Tailwind CSS `^4` via `@tailwindcss/turbopack` (configured in `next.config.mjs`).
- **Database:** MongoDB with Mongoose `^9.11.1` (`lib/connectionDb.js`).
- **Config/env:** `dotenv` `^18.0.7`; environment read from `.env`.
- **Lint:** ESLint `^9` with `eslint-config-next` (`eslint.config.mjs`).
- **Language:** JavaScript (no TypeScript). Path alias `@/*` maps to the repo root (`jsconfig.json`).

## Directory Structure

```
e-commerce/
├── app/                    # Next.js App Router (pages, layout, global CSS)
│   ├── layout.js           # Root layout: fonts, metadata, <html>/<body>
│   ├── page.js             # Home page ("/" route)
│   ├── globals.css         # Tailwind + global styles
│   └── favicon.ico
├── api/                    # Intended API/route-handler layer
│   ├── client/             # (empty) endpoints for client/order data
│   └── products/           # (empty) endpoints for product data
├── controllers/            # Request handlers / business logic (MVC controllers)
│   ├── clientController.js
│   └── productController.js
├── models/                 # Mongoose schemas/models
│   ├── Clients.js
│   └── Products.js
├── lib/                    # Shared infrastructure
│   └── connectionDb.js     # Cached MongoDB connection helper
├── public/                 # Static assets (SVG icons)
├── next.config.mjs         # Next.js config (Tailwind via Turbopack)
├── jsconfig.json           # `@/*` path alias
├── eslint.config.mjs       # ESLint flat config
├── .env                    # Environment variables (MongoDB URI)
├── package.json
└── AGENTS.md
```

## Data Models

Defined with Mongoose in `models/`.

- **`Client`** (`models/Clients.js`) — a customer / order contact.
  - `fullname` (String, required, trimmed, max 150)
  - `phone` (Number, required)
  - `city` (String, required)
  - `address` (String, required)
- **`Product`** (`models/Products.js`) — a catalog item. Enables `timestamps`.
  - `name` (String, required, trimmed, max 150)
  - `description` (String, required, trimmed, max 2000)
  - `price` (Number, required)
  - `image` (String, required; image URL/path)
  - `category` (String, required)
  - `isActive` (Boolean, default `true`)
  - `clientId` (ObjectId, ref `Client`) — optional link to a client

## Controllers (Business Logic)

Controllers are plain async functions with signature `(req, res)` that validate input, call the matching model, and return JSON. They use CommonJS (`require` / `module.exports`).

- **`controllers/clientController.js`** — `addClient`: validates `fullname`, `phone`, `city`, `address`, then creates a `Client`. Returns `400 {message:"empty"}` on missing fields, `500` on error.
- **`controllers/productController.js`** — 
  - `addProduct`: validates `name`, `description`, `price`, `image`, `category`, then creates a `Product`.
  - `getAllProducts`: returns all products via `Product.find({})`.
  - `deleteProduct`: expects `{ id }` in the body, deletes by id.
  - `editProduct`: expects `{ id, ...fields }`, updates by id.

Validation convention: missing required fields → `400 { message: "empty" }`; unexpected errors are logged and returned as `500 { message: err.message }`.

## Database Access

`lib/connectionDb.js` exports a default `dbConnect()` that lazily connects to MongoDB and caches the connection on `global.mongoose` (standard Next.js dev-friendly pattern to avoid reconnecting on hot reload). It reads the URI from `process.env.MONGO_URI` and sets `bufferCommands: false`. Call `dbConnect()` before any Mongoose query inside API routes/controllers.

## Conventions & Guidelines

- **App Router only.** Add UI under `app/`. Server Components are the default; add `"use client"` only when a component needs browser APIs/state/events (e.g. the cart).
- **Route handlers / API layer.** The `api/` directory is currently empty scaffolding (`client/`, `products/`). Backend endpoints are expected there; wire them to the corresponding controllers and call `dbConnect()` first. Confirm the current Next.js routing conventions in `node_modules/next/dist/docs/` before adding routes.
- **Module systems differ by layer.** `lib/connectionDb.js` uses ESM (`import`/`export default`); `models/` and `controllers/` currently use CommonJS (`require`/`module.exports`). Match the module system of the file you are editing.
- **Path alias.** Import project modules with `@/...` (e.g. `@/lib/connectionDb`, `@/models/Products`) in ESM/App Router code.
- **Styling.** Use Tailwind utility classes; shared/global styles go in `app/globals.css`. The starter uses a zinc/black-and-white theme.
- **Model naming.** Mongoose models are registered as `Client` and `Product`.
- **Secrets.** `.env` holds `MONGODB_URI`. Never hardcode credentials or commit new secrets.

## Environment Variables

- `MONGODB_URI` — MongoDB connection string (present in `.env`).

> Note: `lib/connectionDb.js` reads `process.env.MONGO_URI`, while `.env` defines `MONGODB_URI`. These names do not match; align them when touching the connection layer.

## Commands

```bash
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build
npm start       # run the production build
npm run lint    # run ESLint
```

## Known Inconsistencies (do not "fix" without being asked)

These are pre-existing issues observed in the codebase. Treat them as context, not as tasks:

- Env var name mismatch: `MONGO_URI` (code) vs `MONGODB_URI` (.env).
- `controllers/productController.js`: `deleteProduct` and `editProduct` reference `Product` (PascalCase) while the imported binding is `product` (lowercase), which would throw at runtime. They also reassign a local `const product`, shadowing the model import.
- Controller exports do not yet include a client "get/order" flow or a way to list clients; the `client/` API surface is unbuilt.

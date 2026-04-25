# Mobile Shop POS — Demo

A production-ready, **frontend-only** Point of Sale demo for a mobile phone retailer, built with **React + Vite + Tailwind CSS**. Fully deployable to Vercel with zero configuration.

> ⚠️ This is a demo — all data lives in memory and resets on page refresh. No backend, no persistence.

## Features

- 🛒 **Point of Sale** — Product grid, live cart, customer info, discounts, and multi-method checkout
- 💳 **Wallet** — Transaction ledger with sales, refunds, and expenses; balances broken down by payment method (Cash, Card, JazzCash, Easypaisa, Bank)
- 📦 **Inventory** — Full CRUD on products with SKUs, cost/price, stock levels, and margin calculations
- 📱 **Responsive** — Works on desktop, tablet, and phone with an adaptive sidebar + bottom nav
- ⚡ **Reactive state** — Zustand stores keep POS, wallet, and inventory in sync (a sale automatically decrements stock and writes to the ledger)

## Tech stack

| Area          | Choice                              |
| ------------- | ----------------------------------- |
| Framework     | React 18                            |
| Build tool    | Vite 5                              |
| Styling       | Tailwind CSS 3                      |
| Routing       | React Router 6                      |
| State         | Zustand 4                           |
| Icons         | lucide-react                        |
| Typography    | Inter + Space Grotesk + JetBrains Mono |

## Getting started

```bash
# install dependencies
npm install

# start dev server at http://localhost:5173
npm run dev

# production build → ./dist
npm run build

# preview the production build locally
npm run preview
```

The app opens on the **POS screen** by default — `/` redirects to `/pos`.

## Testing barcode (no scanner)

Most USB barcode scanners behave like a keyboard: they “type” digits and press **Enter**.

To simulate a scan on the POS screen, click the barcode field (auto-focused), type one of these and press **Enter**:

- `8801234567011` → Samsung Galaxy A55 128GB
- `6901234567023` → Redmi 13C 128GB
- `7501234567023` → Tempered Glass (Universal)

## Deploying to Vercel

The repository is Vercel-ready out of the box:

1. Push to GitHub / GitLab / Bitbucket.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects **Vite** — no overrides needed.

`vercel.json` includes a SPA rewrite so every route (e.g. `/wallet`, `/inventory`) serves `index.html` and lets React Router take over.

You can also deploy via the CLI:

```bash
npm i -g vercel
vercel        # first-time interactive setup
vercel --prod # production deploy
```

## Project structure

```
mobile-shop-pos/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── pos/          # ProductGrid, CartPanel, CheckoutModal
│   │   ├── wallet/       # WalletSummary, TransactionList, PaymentBreakdown
│   │   ├── inventory/    # InventoryTable, ProductFormModal
│   │   └── ui/           # AppLayout, Button, Card, Badge, Modal, EmptyState
│   ├── data/             # Seed catalog + payment methods
│   ├── store/            # Zustand stores (POS, wallet, inventory)
│   ├── pages/            # Route-level pages
│   ├── utils/            # format.js, cn.js
│   ├── App.jsx           # Routes — redirects / to /pos
│   ├── main.jsx          # Entry + BrowserRouter
│   └── index.css         # Tailwind directives + design tokens
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json           # SPA rewrite
└── package.json
```

## State architecture

Three Zustand stores, each with a single responsibility:

- `useInventoryStore` — products catalog + stock mutations (`decrementStock`, `restock`, CRUD)
- `usePosStore` — active cart, totals, and `completeSale()` — which cross-calls the inventory + wallet stores
- `useWalletStore` — append-only transaction ledger; selectors derive balances, summaries, and today's activity

Because sales go through `completeSale()`, you get automatic, atomic consistency: one tap on **Charge** decrements every line item's stock and writes a single ledger entry.

## Customizing

- **Currency / locale** — edit `CURRENCY` and `LOCALE` in `src/utils/format.js`
- **Brand colors** — tweak the `brand` palette in `tailwind.config.js`
- **Seed products** — replace the catalog in `src/data/products.js`
- **Payment methods** — edit `src/data/paymentMethods.js`

## License

MIT — use freely as a starting point for your own POS project.
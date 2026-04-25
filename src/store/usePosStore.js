import { create } from 'zustand'
import { shortId } from '../utils/format.js'
import { useInventoryStore } from './useInventoryStore.js'
import { useWalletStore } from './useWalletStore.js'

// Fast barcode lookup cache (rebuilt only when inventory products array changes).
let _lastProductsRef = null
let _barcodeIndex = null
function getBarcodeIndex() {
  const products = useInventoryStore.getState().products
  if (products === _lastProductsRef && _barcodeIndex) return _barcodeIndex

  const map = new Map()
  for (const p of products) {
    if (p?.barcode) map.set(String(p.barcode), p)
  }
  _lastProductsRef = products
  _barcodeIndex = map
  return map
}

function clampQty(n) {
  const q = Number(n)
  if (!Number.isFinite(q)) return 0
  return Math.max(0, Math.floor(q))
}

function recalcTotal(subtotal, discount, taxRate) {
  const afterDiscount = Math.max(0, (Number(subtotal) || 0) - (Number(discount) || 0))
  const tax = Math.round(afterDiscount * (Number(taxRate) || 0))
  return { afterDiscount, tax, total: afterDiscount + tax }
}

/**
 * POS store — manages the active cart and completes sales.
 * Completing a sale decrements inventory and records a transaction in the wallet.
 */
export const usePosStore = create((set, get) => ({
  // ---------- Cart state ----------
  cart: [],                      // [{ productId, name, price, qty }]
  customer: { name: '', phone: '' },
  discount: 0,                   // absolute discount in PKR (optional)
  taxRate: 0,                    // 0 = no tax in demo
  subtotal: 0,
  tax: 0,
  total: 0,

  // ---------- Cart mutations ----------
  /**
   * Add product by barcode (fast path for scanner input).
   * @param {string} barcode
   * @param {number} qty
   * @returns {boolean} whether a product was found and added
   */
  addToCartByBarcode: (barcode, qty = 1) => {
    const product = getBarcodeIndex().get(String(barcode))
    if (!product) return false
    get().addToCart(product, qty)
    return true
  },

  addToCart: (product, qty = 1) =>
    set((state) => {
      const q = clampQty(qty) || 1
      const existing = state.cart.find((i) => i.productId === product.id)
      if (existing) {
        const subtotal = state.subtotal + product.price * q
        const { tax, total } = recalcTotal(subtotal, state.discount, state.taxRate)
        return {
          cart: state.cart.map((i) =>
            i.productId === product.id ? { ...i, qty: i.qty + q } : i,
          ),
          subtotal,
          tax,
          total,
        }
      }
      const subtotal = state.subtotal + product.price * q
      const { tax, total } = recalcTotal(subtotal, state.discount, state.taxRate)
      return {
        cart: [
          ...state.cart,
          {
            productId: product.id,
            name:      product.name,
            sku:       product.sku,
            price:     product.price,
            qty: q,
          },
        ],
        subtotal,
        tax,
        total,
      }
    }),

  updateQty: (productId, qty) =>
    set((state) => {
      const nextQty = clampQty(qty)
      const line = state.cart.find((i) => i.productId === productId)
      if (!line) return state

      const deltaQty = nextQty - line.qty
      const subtotal = state.subtotal + line.price * deltaQty
      const { tax, total } = recalcTotal(subtotal, state.discount, state.taxRate)

      const cart =
        nextQty <= 0
          ? state.cart.filter((i) => i.productId !== productId)
          : state.cart.map((i) => (i.productId === productId ? { ...i, qty: nextQty } : i))

      return { cart, subtotal, tax, total }
    }),

  removeFromCart: (productId) =>
    set((state) => {
      const line = state.cart.find((i) => i.productId === productId)
      if (!line) return state
      const subtotal = state.subtotal - line.price * line.qty
      const { tax, total } = recalcTotal(subtotal, state.discount, state.taxRate)
      return { cart: state.cart.filter((i) => i.productId !== productId), subtotal, tax, total }
    }),

  clearCart: () =>
    set({
      cart: [],
      discount: 0,
      customer: { name: '', phone: '' },
      subtotal: 0,
      tax: 0,
      total: 0,
    }),

  setCustomer:  (customer) => set({ customer }),
  setDiscount:  (discount) =>
    set((state) => {
      const d = Math.max(0, Number(discount) || 0)
      const { tax, total } = recalcTotal(state.subtotal, d, state.taxRate)
      return { discount: d, tax, total }
    }),

  // Requested API aliases (for POS integrations)
  removeItem: (productId) => get().removeFromCart(productId),
  updateQuantity: (productId, qty) => get().updateQty(productId, qty),

  // ---------- Derived totals ----------
  getTotals: () => {
    const { cart, discount, taxRate, subtotal } = get()
    const { tax, total } = recalcTotal(subtotal, discount, taxRate)
    const itemCount = cart.reduce((n, i) => n + i.qty, 0)
    return { subtotal, discount, tax, total, itemCount }
  },

  // ---------- Checkout ----------
  /**
   * Complete a sale. Decrements inventory, writes a wallet transaction,
   * and returns the created sale so the UI can show a receipt.
   */
  completeSale: ({ paymentMethodId }) => {
    const state = get()
    if (state.cart.length === 0) return null

    const totals = state.getTotals()
    const saleId = shortId('sale')

    // 1. Decrement stock for each line item.
    const inventory = useInventoryStore.getState()
    state.cart.forEach((line) => inventory.decrementStock(line.productId, line.qty))

    // 2. Record the transaction in the wallet ledger.
    const wallet = useWalletStore.getState()
    wallet.addTransaction({
      id:              saleId,
      kind:            'sale',
      paymentMethodId,
      amount:          totals.total,
      items:           state.cart.map((l) => ({ ...l })),
      customer:        { ...state.customer },
      discount:        totals.discount,
      tax:             totals.tax,
      subtotal:        totals.subtotal,
      createdAt:       new Date().toISOString(),
    })

    const sale = {
      id: saleId,
      ...totals,
      items:    state.cart.map((l) => ({ ...l })),
      customer: { ...state.customer },
      paymentMethodId,
      createdAt: new Date().toISOString(),
    }

    // 3. Reset the cart.
    state.clearCart()

    return sale
  },
}))

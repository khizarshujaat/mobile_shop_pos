import { create } from 'zustand'
import { PRODUCTS } from '../data/products.js'
import { shortId } from '../utils/format.js'

/**
 * Inventory store — the source of truth for products and stock levels.
 * POS sales decrement stock via `decrementStock`.
 */
export const useInventoryStore = create((set, get) => ({
  products: PRODUCTS.map((p) => ({ ...p })),

  // ---------- Queries ----------
  getById: (id) => get().products.find((p) => p.id === id),

  // ---------- Mutations ----------
  addProduct: (draft) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          id:       shortId('p'),
          sku:      draft.sku     || `SKU-${Date.now().toString().slice(-5)}`,
          barcode:  String(draft.barcode || '').trim(),
          name:     draft.name    || 'Untitled product',
          category: draft.category || 'accessory',
          price:    Number(draft.price) || 0,
          cost:     Number(draft.cost)  || 0,
          stock:    Number(draft.stock) || 0,
          brand:    draft.brand    || 'Generic',
          warranty: draft.warranty || '—',
        },
      ],
    })),

  updateProduct: (id, patch) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              barcode: patch.barcode !== undefined ? String(patch.barcode) : p.barcode,
              price: patch.price !== undefined ? Number(patch.price) : p.price,
              cost:  patch.cost  !== undefined ? Number(patch.cost)  : p.cost,
              stock: patch.stock !== undefined ? Number(patch.stock) : p.stock,
            }
          : p,
      ),
    })),

  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

  decrementStock: (id, qty) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p,
      ),
    })),

  restock: (id, qty) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, stock: p.stock + qty } : p,
      ),
    })),
}))

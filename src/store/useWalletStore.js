import { create } from 'zustand'
import { shortId } from '../utils/format.js'
import { getPaymentMethod } from '../data/paymentMethods.js'

/**
 * Wallet store — a simple transaction ledger.
 * Holds sales, refunds, expenses, and cash adjustments. Balances per payment
 * method are derived from the ledger so everything stays consistent.
 */
export const useWalletStore = create((set, get) => ({
  transactions: [
    // A small amount of seeded history so the UI has context to render.
    {
      id:              shortId('sale'),
      kind:            'sale',
      paymentMethodId: 'cash',
      amount:          54000,
      items:           [{ productId: 'p_006', name: 'Redmi Note 13 128GB', sku: 'RN13-128', price: 54000, qty: 1 }],
      customer:        { name: 'Ahmed Khan', phone: '0300-1234567' },
      subtotal:        54000,
      discount:        0,
      tax:             0,
      createdAt:       new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id:              shortId('sale'),
      kind:            'sale',
      paymentMethodId: 'jazzcash',
      amount:          4500,
      items:           [{ productId: 'a_003', name: 'iPhone 15 Silicone Case', sku: 'CASE-IP15', price: 4500, qty: 1 }],
      customer:        { name: 'Walk-in', phone: '' },
      subtotal:        4500,
      discount:        0,
      tax:             0,
      createdAt:       new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
  ],

  // ---------- Mutations ----------
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        { id: tx.id || shortId('tx'), createdAt: new Date().toISOString(), ...tx },
        ...state.transactions,
      ],
    })),

  addExpense: ({ amount, note, paymentMethodId = 'cash' }) =>
    set((state) => ({
      transactions: [
        {
          id:              shortId('exp'),
          kind:            'expense',
          paymentMethodId,
          amount:          Number(amount) || 0,
          note:            note || 'Expense',
          createdAt:       new Date().toISOString(),
        },
        ...state.transactions,
      ],
    })),

  refundTransaction: (saleId) =>
    set((state) => {
      const sale = state.transactions.find((t) => t.id === saleId && t.kind === 'sale')
      if (!sale) return {}
      return {
        transactions: [
          {
            id:              shortId('ref'),
            kind:            'refund',
            paymentMethodId: sale.paymentMethodId,
            amount:          sale.amount,
            refundOf:        sale.id,
            createdAt:       new Date().toISOString(),
          },
          ...state.transactions,
        ],
      }
    }),

  // ---------- Derived selectors ----------
  getBalanceByMethod: () => {
    const balances = {}
    for (const tx of get().transactions) {
      const sign = tx.kind === 'sale' ? 1 : -1 // refund/expense subtract
      balances[tx.paymentMethodId] = (balances[tx.paymentMethodId] || 0) + sign * tx.amount
    }
    return balances
  },

  getSummary: () => {
    const txs = get().transactions
    const sales    = txs.filter((t) => t.kind === 'sale')
    const refunds  = txs.filter((t) => t.kind === 'refund')
    const expenses = txs.filter((t) => t.kind === 'expense')
    const gross = sales.reduce   ((s, t) => s + t.amount, 0)
    const refs  = refunds.reduce ((s, t) => s + t.amount, 0)
    const exps  = expenses.reduce((s, t) => s + t.amount, 0)
    return {
      gross,
      refunds: refs,
      expenses: exps,
      net: gross - refs - exps,
      salesCount: sales.length,
    }
  },

  getTodayTransactions: () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return get().transactions.filter((t) => new Date(t.createdAt) >= start)
  },

  // Convenience: resolve a transaction's payment method to its display info.
  describeMethod: (id) => getPaymentMethod(id),
}))

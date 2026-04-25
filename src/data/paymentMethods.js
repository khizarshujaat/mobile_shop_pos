// Available payment methods for the POS demo.
// `kind` is used by the wallet store to route into the right ledger bucket.

export const PAYMENT_METHODS = [
  { id: 'cash',    label: 'Cash',          kind: 'cash',    icon: 'Banknote'    },
  { id: 'card',    label: 'Debit / Credit', kind: 'card',    icon: 'CreditCard'  },
  { id: 'jazzcash', label: 'JazzCash',      kind: 'wallet',  icon: 'Smartphone'  },
  { id: 'easypaisa', label: 'Easypaisa',    kind: 'wallet',  icon: 'Wallet'      },
  { id: 'bank',    label: 'Bank Transfer', kind: 'bank',    icon: 'Building2'   },
]

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) || PAYMENT_METHODS[0]
}

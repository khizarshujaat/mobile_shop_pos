import { useState } from 'react'
import { CheckCircle2, Banknote, CreditCard, Smartphone, Wallet as WalletIcon, Building2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import { PAYMENT_METHODS } from '../../data/paymentMethods.js'
import { usePosStore } from '../../store/usePosStore.js'
import { formatCurrency } from '../../utils/format.js'
import { cn } from '../../utils/cn.js'

const ICONS = {
  Banknote,
  CreditCard,
  Smartphone,
  Wallet: WalletIcon,
  Building2,
}

export default function CheckoutModal({ open, onClose }) {
  const completeSale = usePosStore((s) => s.completeSale)
  const getTotals    = usePosStore((s) => s.getTotals)
  const totals       = getTotals()

  const [methodId, setMethodId] = useState('cash')
  const [completed, setCompleted] = useState(null)

  function handleCharge() {
    const sale = completeSale({ paymentMethodId: methodId })
    if (sale) setCompleted(sale)
  }

  function handleClose() {
    setCompleted(null)
    setMethodId('cash')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={completed ? 'Sale completed' : 'Take payment'}
      size="md"
    >
      {completed ? (
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="mt-4 font-display text-xl font-semibold text-ink-900">
            {formatCurrency(completed.total)} received
          </div>
          <div className="text-sm text-ink-500 mt-1">
            Receipt #{completed.id.slice(-6).toUpperCase()}
          </div>

          <div className="text-left mt-6 bg-ink-50 rounded-lg border border-ink-100 p-4 space-y-2 text-sm">
            {completed.items.map((i) => (
              <div key={i.productId} className="flex justify-between">
                <span className="text-ink-700">
                  {i.qty} × {i.name}
                </span>
                <span className="tabular-nums text-ink-900">
                  {formatCurrency(i.qty * i.price)}
                </span>
              </div>
            ))}
          </div>

          <button onClick={handleClose} className="btn-primary w-full mt-6">
            New sale
          </button>
        </div>
      ) : (
        <>
          <div className="bg-ink-900 text-white rounded-xl2 p-5 mb-5">
            <div className="text-[11px] uppercase tracking-wider text-ink-300">Amount due</div>
            <div className="font-display text-3xl font-semibold mt-1 tabular-nums">
              {formatCurrency(totals.total)}
            </div>
            <div className="text-xs text-ink-300 mt-1">
              {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} · Subtotal {formatCurrency(totals.subtotal)}
            </div>
          </div>

          <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-2">
            Payment method
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = ICONS[m.icon] || Banknote
              const active = methodId === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMethodId(m.id)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-50 border-brand-500 text-brand-800'
                      : 'bg-white border-ink-200 text-ink-700 hover:border-ink-300',
                  )}
                >
                  <Icon className={cn('w-4 h-4', active ? 'text-brand-600' : 'text-ink-500')} />
                  {m.label}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 mt-6">
            <button onClick={handleClose} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleCharge} className="btn-primary flex-1">
              Charge {formatCurrency(totals.total)}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

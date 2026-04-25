import { Banknote, CreditCard, Smartphone, Wallet as WalletIcon, Building2 } from 'lucide-react'
import { useWalletStore } from '../../store/useWalletStore.js'
import { PAYMENT_METHODS } from '../../data/paymentMethods.js'
import { formatCurrency } from '../../utils/format.js'

const ICONS = { Banknote, CreditCard, Smartphone, Wallet: WalletIcon, Building2 }

export default function PaymentBreakdown() {
  const getBalanceByMethod = useWalletStore((s) => s.getBalanceByMethod)
  const balances = getBalanceByMethod()

  const total = Object.values(balances).reduce((s, v) => s + Math.max(0, v), 0) || 1

  return (
    <div className="card p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Balances by method</h3>
          <p className="text-sm text-ink-500 mt-0.5">Net position across all payment rails.</p>
        </div>
      </div>

      <ul className="space-y-3">
        {PAYMENT_METHODS.map((m) => {
          const Icon    = ICONS[m.icon] || Banknote
          const balance = balances[m.id] || 0
          const pct     = Math.max(0, Math.round((Math.max(0, balance) / total) * 100))
          return (
            <li key={m.id}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-ink-900">{m.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-ink-900">
                      {formatCurrency(balance)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-100 mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

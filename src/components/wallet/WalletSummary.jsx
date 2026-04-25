import { TrendingUp, TrendingDown, Receipt, Wallet } from 'lucide-react'
import { useWalletStore } from '../../store/useWalletStore.js'
import { formatCurrency } from '../../utils/format.js'

export default function WalletSummary() {
  const getSummary = useWalletStore((s) => s.getSummary)
  const summary    = getSummary()

  const cards = [
    {
      label: 'Gross sales',
      value: formatCurrency(summary.gross),
      icon:  TrendingUp,
      tone:  'brand',
    },
    {
      label: 'Refunds',
      value: formatCurrency(summary.refunds),
      icon:  TrendingDown,
      tone:  'rose',
    },
    {
      label: 'Expenses',
      value: formatCurrency(summary.expenses),
      icon:  Receipt,
      tone:  'amber',
    },
    {
      label: 'Net',
      value: formatCurrency(summary.net),
      icon:  Wallet,
      tone:  'ink',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  )
}

const TONES = {
  brand: { bg: 'bg-brand-50',   text: 'text-brand-700',  iconBg: 'bg-brand-100 text-brand-700' },
  rose:  { bg: 'bg-rose-50',    text: 'text-rose-700',   iconBg: 'bg-rose-100  text-rose-700'  },
  amber: { bg: 'bg-amber-50',   text: 'text-amber-700',  iconBg: 'bg-amber-100 text-amber-700' },
  ink:   { bg: 'bg-ink-900',    text: 'text-white',      iconBg: 'bg-white/10  text-white'     },
}

function StatCard({ label, value, icon: Icon, tone }) {
  const t = TONES[tone] || TONES.ink
  const isDark = tone === 'ink'
  return (
    <div className={`${t.bg} rounded-xl2 p-4 border ${isDark ? 'border-ink-900' : 'border-ink-100'}`}>
      <div className="flex items-start justify-between">
        <div className={`text-[11px] uppercase tracking-wider ${isDark ? 'text-ink-300' : 'text-ink-500'}`}>
          {label}
        </div>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${t.iconBg}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className={`mt-3 font-display text-xl font-semibold tabular-nums ${t.text}`}>
        {value}
      </div>
    </div>
  )
}

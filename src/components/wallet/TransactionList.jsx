import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Receipt, RotateCcw, Search } from 'lucide-react'
import { useWalletStore } from '../../store/useWalletStore.js'
import { formatCurrency, formatDateTime, relativeTime } from '../../utils/format.js'
import { cn } from '../../utils/cn.js'
import EmptyState from '../ui/EmptyState.jsx'
import Badge from '../ui/Badge.jsx'

const KIND_META = {
  sale:    { label: 'Sale',    tone: 'brand',  icon: ArrowUpRight   },
  refund:  { label: 'Refund',  tone: 'rose',   icon: ArrowDownRight },
  expense: { label: 'Expense', tone: 'amber',  icon: Receipt        },
}

export default function TransactionList() {
  const transactions = useWalletStore((s) => s.transactions)
  const describeMethod = useWalletStore((s) => s.describeMethod)
  const refundTransaction = useWalletStore((s) => s.refundTransaction)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter((t) => {
      if (filter !== 'all' && t.kind !== filter) return false
      if (!q) return true
      const hay = `${t.id} ${t.customer?.name || ''} ${t.customer?.phone || ''} ${t.note || ''} ${(t.items || []).map((i) => i.name).join(' ')}`
      return hay.toLowerCase().includes(q)
    })
  }, [transactions, query, filter])

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-ink-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer, item or note…"
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1 bg-ink-100 p-1 rounded-lg text-xs font-medium">
          {['all', 'sale', 'refund', 'expense'].map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                'px-3 py-1.5 rounded-md capitalize transition-colors',
                filter === k ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {k === 'all' ? 'All' : `${k}s`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Completed sales, refunds and expenses will appear here."
        />
      ) : (
        <ul className="divide-y divide-ink-100">
          {filtered.map((tx) => {
            const meta = KIND_META[tx.kind] || KIND_META.sale
            const Icon = meta.icon
            const method = describeMethod(tx.paymentMethodId)
            return (
              <li key={tx.id} className="px-4 sm:px-5 py-3.5 flex items-start gap-3 hover:bg-ink-50/50 transition-colors">
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    tx.kind === 'sale'    && 'bg-brand-100 text-brand-700',
                    tx.kind === 'refund'  && 'bg-rose-100 text-rose-700',
                    tx.kind === 'expense' && 'bg-amber-100 text-amber-700',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink-900">
                      {tx.kind === 'expense'
                        ? tx.note || 'Expense'
                        : tx.customer?.name?.trim() || 'Walk-in customer'}
                    </span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <span className="text-[11px] text-ink-400">{method.label}</span>
                  </div>

                  {tx.items?.length > 0 && (
                    <div className="text-xs text-ink-500 mt-0.5 line-clamp-1">
                      {tx.items.map((i) => `${i.qty}× ${i.name}`).join(' · ')}
                    </div>
                  )}

                  <div className="text-[11px] text-ink-400 mt-1 font-mono">
                    #{tx.id.slice(-6).toUpperCase()} · <span title={formatDateTime(tx.createdAt)}>{relativeTime(tx.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      tx.kind === 'sale' ? 'text-ink-900' : 'text-rose-600',
                    )}
                  >
                    {tx.kind === 'sale' ? '+' : '−'} {formatCurrency(tx.amount)}
                  </div>
                  {tx.kind === 'sale' && (
                    <button
                      onClick={() => {
                        if (confirm('Refund this sale? This action cannot be undone.')) {
                          refundTransaction(tx.id)
                        }
                      }}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-rose-600 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Refund
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

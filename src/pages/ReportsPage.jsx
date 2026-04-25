import { useState } from 'react'
import { ArrowUpRight, Wallet, TrendingUp, Receipt, Banknote } from 'lucide-react'
import { formatCurrency } from '../utils/format.js'

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: 'month', label: 'This Month' },
]

const REPORT_DATA = {
  today: {
    dailySales: 47,
    totalRevenue: 1284500,
    profitEstimate: 218300,
    walletSummary: {
      totalTransactions: 63,
      jazzcash: 372000,
      easypaisa: 298500,
      cash: 439000,
      card: 175000,
    },
  },
  '7d': {
    dailySales: 284,
    totalRevenue: 7932000,
    profitEstimate: 1369000,
    walletSummary: {
      totalTransactions: 416,
      jazzcash: 2248000,
      easypaisa: 1834000,
      cash: 2625000,
      card: 921000,
    },
  },
  month: {
    dailySales: 1182,
    totalRevenue: 33285000,
    profitEstimate: 5864000,
    walletSummary: {
      totalTransactions: 1687,
      jazzcash: 9455000,
      easypaisa: 7812000,
      cash: 11463000,
      card: 4555000,
    },
  },
}

export default function ReportsPage() {
  const [range, setRange] = useState('today')
  const data = REPORT_DATA[range]
  const walletTotal =
    data.walletSummary.jazzcash +
    data.walletSummary.easypaisa +
    data.walletSummary.cash +
    data.walletSummary.card

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-ink-400">Insights</div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Reports</h1>
            <p className="text-sm text-ink-500 mt-1">
              Snapshot view for client demos with instant range switching.
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={
                  r.id === range
                    ? 'px-3 py-1.5 text-sm rounded-lg bg-ink-900 text-white'
                    : 'px-3 py-1.5 text-sm rounded-lg text-ink-600 hover:bg-ink-50'
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Daily Sales"
          value={data.dailySales.toString()}
          subtitle="Invoices processed today"
          icon={Receipt}
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          subtitle="Gross collections (all channels)"
          icon={Banknote}
        />
        <KpiCard
          title="Profit Estimate"
          value={formatCurrency(data.profitEstimate)}
          subtitle="Approx. after cost of goods"
          icon={TrendingUp}
        />
        <KpiCard
          title="Wallet Volume"
          value={formatCurrency(walletTotal)}
          subtitle={`${data.walletSummary.totalTransactions} wallet transactions`}
          icon={Wallet}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-ink-100 bg-white shadow-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Wallet Transactions Summary</h2>
            <span className="text-xs text-ink-500">{RANGES.find((r) => r.id === range)?.label}</span>
          </div>
          <div className="mt-4 space-y-3">
            <WalletRow label="JazzCash" value={data.walletSummary.jazzcash} tone="rose" />
            <WalletRow label="Easypaisa" value={data.walletSummary.easypaisa} tone="emerald" />
            <WalletRow label="Cash" value={data.walletSummary.cash} tone="slate" />
            <WalletRow label="Card" value={data.walletSummary.card} tone="blue" />
            <div className="pt-2 mt-2 border-t border-ink-100 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">Total Wallet Collections</span>
              <span className="font-display text-xl font-semibold text-ink-900 tabular-nums">
                {formatCurrency(walletTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white shadow-card p-5">
          <h2 className="font-semibold text-ink-900">Presentation Highlights</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            <li className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 mt-0.5 text-brand-600" />
              Peak activity between 1:00 PM and 5:00 PM.
            </li>
            <li className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 mt-0.5 text-brand-600" />
              Wallet services contribute 52% of digital collections.
            </li>
            <li className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 mt-0.5 text-brand-600" />
              Fast-moving products: iPhone accessories and Redmi mid-range models.
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}

function KpiCard({ title, value, subtitle, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-ink-100 bg-white shadow-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">{title}</div>
          <div className="mt-1 font-display text-2xl font-semibold text-ink-900 tabular-nums">{value}</div>
          <div className="mt-1 text-xs text-ink-500">{subtitle}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-ink-50 text-ink-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </article>
  )
}

function WalletRow({ label, value, tone = 'slate' }) {
  const toneClass = {
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    slate: 'bg-ink-50 text-ink-700',
  }[tone]

  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5">
      <span className="text-sm text-ink-700">{label}</span>
      <span className={`text-sm font-semibold tabular-nums px-2 py-0.5 rounded ${toneClass}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}


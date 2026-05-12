import { useMemo, useState } from 'react'
import { ShieldCheck, Lock, Building2, Wallet, Banknote, TrendingUp, Users } from 'lucide-react'
import { BRANCHES } from '../data/branches.js'
import { formatCurrency, formatNumber } from '../utils/format.js'
import { cn } from '../utils/cn.js'

const ADMIN_PIN = '1234' // UI-only demo gate

const BRANCH_DASHBOARD = {
  br_lhr_01: {
    openingBalance: {
      cash: 135000,
      bank: 420000,
      jazzcash: 88000,
      easypaisa: 76000,
      card: 22000,
    },
    todaySales: 298500,
    invoices: 86,
    walletServices: 112,
    avgTicket: 3471,
    hourlySales: [12000, 21000, 33000, 38000, 47000, 51000, 43000, 53500],
  },
  br_rwp_01: {
    openingBalance: {
      cash: 92000,
      bank: 280000,
      jazzcash: 63000,
      easypaisa: 54000,
      card: 18000,
    },
    todaySales: 219000,
    invoices: 62,
    walletServices: 78,
    avgTicket: 3532,
    hourlySales: [9000, 16000, 24000, 29000, 34000, 38000, 32000, 37000],
  },
}

const ACCOUNT_LABELS = {
  cash: 'Cash',
  bank: 'Bank',
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  card: 'Card',
}

export default function AdminDashboardPage() {
  const [pin, setPin] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [branchId, setBranchId] = useState(BRANCHES[0]?.id || '')

  const selectedBranch = BRANCHES.find((b) => b.id === branchId) || BRANCHES[0]
  const branchData = BRANCH_DASHBOARD[selectedBranch?.id] || BRANCH_DASHBOARD[BRANCHES[0].id]

  const openingRows = useMemo(
    () =>
      Object.entries(branchData.openingBalance).map(([id, amount]) => ({
        id,
        label: ACCOUNT_LABELS[id] || id,
        amount: Number(amount) || 0,
      })),
    [branchData],
  )

  const openingTotal = openingRows.reduce((sum, r) => sum + r.amount, 0)
  const totalSalesAllBranches = Object.values(BRANCH_DASHBOARD).reduce((sum, b) => sum + b.todaySales, 0)

  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-md mx-auto mt-8 rounded-2xl border border-ink-100 bg-white shadow-card p-5">
          <div className="flex items-center gap-2 text-ink-700">
            <Lock className="w-4 h-4" />
            <div className="text-[11px] uppercase tracking-wider">Admin access only</div>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">
            Enter admin PIN to access branch-level dashboard insights.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (pin.trim() === ADMIN_PIN) setIsAdmin(true)
            }}
          >
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input"
              type="password"
              placeholder="Enter admin PIN"
              autoFocus
            />
            <button className="btn-primary w-full" type="submit">
              <ShieldCheck className="w-4 h-4" />
              Unlock dashboard
            </button>
          </form>
          <div className="mt-2 text-xs text-ink-400">Demo PIN: 1234 (UI only)</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Admin Panel</div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Branch Operations Dashboard</h1>
          <p className="text-sm text-ink-500 mt-1">
            Opening balances, today sales, and operational insights by branch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input py-2" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button className="btn-outline" onClick={() => setIsAdmin(false)}>
            Lock
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard title="Today's Opening" value={formatCurrency(openingTotal)} icon={Banknote} />
        <KpiCard title="Today's Sales" value={formatCurrency(branchData.todaySales)} icon={TrendingUp} />
        <KpiCard title="Invoices" value={formatNumber(branchData.invoices)} icon={Building2} />
        <KpiCard title="Wallet Services" value={formatNumber(branchData.walletServices)} icon={Wallet} />
        <KpiCard title="Avg Ticket" value={formatCurrency(branchData.avgTicket)} icon={Users} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-ink-100 bg-white shadow-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Today Opening Balance (by account)</h2>
            <span className="text-xs text-ink-500">{selectedBranch?.city}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                  <th className="pb-2 font-medium">Account</th>
                  <th className="pb-2 font-medium text-right">Opening Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {openingRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 text-ink-700">{row.label}</td>
                    <td className="py-2.5 text-right font-semibold text-ink-900 tabular-nums">
                      {formatCurrency(row.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 font-medium text-ink-700">Total</td>
                  <td className="py-3 text-right font-display text-lg font-semibold text-ink-900 tabular-nums">
                    {formatCurrency(openingTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white shadow-card p-5">
          <h2 className="font-semibold text-ink-900">Sales by hour</h2>
          <p className="text-xs text-ink-500 mt-1">Quick visual trend for today footfall.</p>
          <div className="mt-4 space-y-2">
            {branchData.hourlySales.map((value, i) => {
              const pct = Math.max(8, Math.round((value / Math.max(...branchData.hourlySales)) * 100))
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-10 text-[11px] text-ink-500">{`${10 + i}:00`}</div>
                  <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-20 text-right text-[11px] text-ink-700 tabular-nums">
                    {formatCurrency(value)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Branch Comparison (today)</h2>
          <span className="text-xs text-ink-500">All branches</span>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {BRANCHES.map((b) => {
            const d = BRANCH_DASHBOARD[b.id]
            const pct = Math.round((d.todaySales / totalSalesAllBranches) * 100)
            return (
              <div key={b.id} className={cn('rounded-xl border border-ink-100 p-3', b.id === selectedBranch.id && 'bg-brand-50/40')}>
                <div className="text-sm font-semibold text-ink-900">{b.name}</div>
                <div className="text-xs text-ink-500 mt-0.5">{b.city}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-ink-600">Today sales</span>
                  <span className="font-semibold text-ink-900 tabular-nums">{formatCurrency(d.todaySales)}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-ink-500">{pct}% of combined sales</div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-ink-100 bg-white shadow-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">{title}</div>
          <div className="mt-1 font-display text-xl font-semibold text-ink-900 tabular-nums">{value}</div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-ink-50 text-ink-700 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </article>
  )
}

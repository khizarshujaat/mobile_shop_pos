import { useEffect, useState } from 'react'
import { Plus, ShieldCheck, Lock } from 'lucide-react'
import WalletSummary      from '../components/wallet/WalletSummary.jsx'
import TransactionList    from '../components/wallet/TransactionList.jsx'
import PaymentBreakdown   from '../components/wallet/PaymentBreakdown.jsx'
import Modal              from '../components/ui/Modal.jsx'
import { useWalletStore } from '../store/useWalletStore.js'
import { PAYMENT_METHODS } from '../data/paymentMethods.js'
import { formatCurrency } from '../utils/format.js'

const OPENING_BALANCE_METHODS = ['cash', 'bank', 'easypaisa', 'jazzcash', 'card']
const ACCOUNT_TYPES = [
  { id: 'cash', label: 'Cash' },
  { id: 'bank', label: 'Bank' },
  { id: 'easypaisa', label: 'Easypaisa' },
  { id: 'jazzcash', label: 'JazzCash' },
  { id: 'card', label: 'Debit / Credit' },
  { id: 'other', label: 'Other' },
]

export default function WalletPage() {
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [openingBalanceOpen, setOpeningBalanceOpen] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [openingAccounts, setOpeningAccounts] = useState(() =>
    PAYMENT_METHODS.filter((m) => OPENING_BALANCE_METHODS.includes(m.id)).map((m) => ({
      id: m.id,
      label: m.label,
      type: m.id,
      amount: 0,
      isCustom: false,
    })),
  )

  const openingRows = openingAccounts.filter((a) => Number(a.amount) > 0)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Finance</div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Wallet</h1>
          <p className="text-sm text-ink-500 mt-1">
            Track sales, refunds and expenses across every payment method.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminMode((v) => !v)}
            className={`btn-outline ${isAdminMode ? '!border-emerald-300 !bg-emerald-50 !text-emerald-700' : ''}`}
            title="UI only: Admin access simulation"
          >
            <ShieldCheck className="w-4 h-4" /> {isAdminMode ? 'Admin ON' : 'Admin OFF'}
          </button>
          <button
            onClick={() => setOpeningBalanceOpen(true)}
            disabled={!isAdminMode}
            className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Opening balance
          </button>
          <button onClick={() => setExpenseOpen(true)} className="btn-secondary">
            <Plus className="w-4 h-4" /> Record expense
          </button>
        </div>
      </header>

      <section className="card p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-ink-400">Admin only</div>
            <h3 className="text-base font-semibold text-ink-900">Opening Balances</h3>
            <p className="text-sm text-ink-500 mt-0.5">
              Set starting balances for any account type.
            </p>
          </div>
          {!isAdminMode && (
            <div className="inline-flex items-center gap-1.5 text-xs text-ink-500 rounded-md border border-ink-200 bg-ink-50 px-2 py-1">
              <Lock className="w-3.5 h-3.5" />
              Locked
            </div>
          )}
        </div>

        <div className={`mt-4 rounded-xl border border-ink-100 bg-ink-50/50 p-3 ${!isAdminMode ? 'opacity-65' : ''}`}>
          {openingRows.length === 0 ? (
            <div className="text-sm text-ink-500">
              No opening balance added yet.
              {isAdminMode ? ' Click "Opening balance" to add.' : ' Enable Admin mode to configure.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {openingRows.map((account) => (
                <div key={account.id} className="rounded-lg border border-ink-100 bg-white px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">{account.label}</div>
                  <div className="text-sm font-semibold text-ink-900 tabular-nums mt-0.5">
                    {formatCurrency(Number(account.amount) || 0)}
                  </div>
                  <div className="text-[11px] text-ink-500 mt-0.5 capitalize">
                    {ACCOUNT_TYPES.find((t) => t.id === account.type)?.label || 'Other'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!isAdminMode && (
        <div className="text-xs text-ink-500">
          Opening balance controls are visible only in admin mode (UI-only for now).
        </div>
      )}

      <WalletSummary />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TransactionList />
        </div>
        <div>
          <PaymentBreakdown />
        </div>
      </div>

      <ExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <OpeningBalanceModal
        open={openingBalanceOpen}
        onClose={() => setOpeningBalanceOpen(false)}
        initialAccounts={openingAccounts}
        onSave={(next) => setOpeningAccounts(next)}
      />
    </div>
  )
}

function ExpenseModal({ open, onClose }) {
  const addExpense = useWalletStore((s) => s.addExpense)
  const [amount, setAmount] = useState('')
  const [note, setNote]     = useState('')
  const [method, setMethod] = useState('cash')

  function handleSubmit(e) {
    e.preventDefault()
    const n = Number(amount)
    if (!n || n <= 0) return
    addExpense({ amount: n, note, paymentMethodId: method })
    setAmount(''); setNote(''); setMethod('cash')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Record expense" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">
            Amount (PKR) <span className="text-rose-500">*</span>
          </span>
          <input
            type="number" min="1"
            className="input mt-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            required
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Note</span>
          <input
            className="input mt-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Electricity bill, rent…"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Paid from</span>
          <select
            className="input mt-1"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Record</button>
        </div>
      </form>
    </Modal>
  )
}

function OpeningBalanceModal({ open, onClose, initialAccounts, onSave }) {
  const [draft, setDraft] = useState([])

  function setField(accountId, key, value) {
    setDraft((rows) => rows.map((r) => (r.id === accountId ? { ...r, [key]: value } : r)))
  }

  function addCustomAccount() {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setDraft((rows) => [
      ...rows,
      { id, label: '', type: 'other', amount: '', isCustom: true },
    ])
  }

  function removeCustomAccount(accountId) {
    setDraft((rows) => rows.filter((r) => r.id !== accountId))
  }

  useEffect(() => {
    if (!open) return
    const next = initialAccounts.map((a) => ({
      ...a,
      amount: a.amount > 0 ? String(a.amount) : '',
    }))
    setDraft(next)
  }, [open, initialAccounts])

  function handleSubmit(e) {
    e.preventDefault()
    const cleaned = draft
      .map((a) => {
        const amount = Number(a.amount)
        return {
          id: a.id,
          label: String(a.label || '').trim(),
          type: a.type || 'other',
          amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
          isCustom: Boolean(a.isCustom),
        }
      })
      .filter((a) => !a.isCustom || a.label.length > 0 || a.amount > 0)

    onSave(cleaned)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Set opening balances (Admin)"
      size="md"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {draft.map((row) => (
            <div key={row.id} className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_160px_140px_auto] gap-2 items-end">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Account name</span>
                <input
                  value={row.label}
                  onChange={(e) => setField(row.id, 'label', e.target.value)}
                  placeholder="e.g. UBL Current, Petty Cash"
                  className="input mt-1"
                  disabled={!row.isCustom}
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Type</span>
                <select
                  value={row.type}
                  onChange={(e) => setField(row.id, 'type', e.target.value)}
                  className="input mt-1"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">Amount</span>
                <input
                  type="number"
                  min="0"
                  value={row.amount ?? ''}
                  onChange={(e) => setField(row.id, 'amount', e.target.value)}
                  placeholder="0"
                  className="input mt-1"
                />
              </label>
              {row.isCustom ? (
                <button
                  type="button"
                  onClick={() => removeCustomAccount(row.id)}
                  className="btn-outline h-11"
                >
                  Remove
                </button>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addCustomAccount} className="btn-outline">
          <Plus className="w-4 h-4" /> Add custom account
        </button>
        <div className="text-xs text-ink-500">
          UI only: this does not write ledger entries yet.
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save opening balances</button>
        </div>
      </form>
    </Modal>
  )
}

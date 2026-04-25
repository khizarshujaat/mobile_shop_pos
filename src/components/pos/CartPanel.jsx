import { Minus, Plus, Trash2, ShoppingBag, User } from 'lucide-react'
import { usePosStore } from '../../store/usePosStore.js'
import { formatCurrency } from '../../utils/format.js'
import EmptyState from '../ui/EmptyState.jsx'

export default function CartPanel({ onCheckout }) {
  const cart          = usePosStore((s) => s.cart)
  const customer      = usePosStore((s) => s.customer)
  const discount      = usePosStore((s) => s.discount)
  const updateQty     = usePosStore((s) => s.updateQty)
  const removeFromCart = usePosStore((s) => s.removeFromCart)
  const setCustomer   = usePosStore((s) => s.setCustomer)
  const setDiscount   = usePosStore((s) => s.setDiscount)
  const clearCart     = usePosStore((s) => s.clearCart)
  const getTotals     = usePosStore((s) => s.getTotals)

  const totals = getTotals()
  const empty  = cart.length === 0

  return (
    <div className="flex flex-col h-full min-h-0 bg-white border-l border-ink-100">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">Current Order</div>
          <div className="font-display font-semibold text-ink-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
        {!empty && (
          <button
            onClick={clearCart}
            className="text-xs text-ink-500 hover:text-rose-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <EmptyState
            icon={ShoppingBag}
            title="Cart is empty"
            description="Tap a product on the left to add it to the current order."
          />
        ) : (
          <ul className="divide-y divide-ink-100">
            {cart.map((line) => (
              <li key={line.productId} className="px-5 py-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-900 line-clamp-1">{line.name}</div>
                  <div className="text-[11px] font-mono text-ink-400 mt-0.5">{line.sku}</div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(line.productId, line.qty - 1)}
                      className="w-7 h-7 rounded-md border border-ink-200 hover:bg-ink-50 flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      onClick={() => updateQty(line.productId, line.qty + 1)}
                      className="w-7 h-7 rounded-md border border-ink-200 hover:bg-ink-50 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(line.productId)}
                      className="ml-2 w-7 h-7 rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-ink-900 tabular-nums">
                    {formatCurrency(line.price * line.qty)}
                  </div>
                  <div className="text-[11px] text-ink-400 mt-0.5">
                    {formatCurrency(line.price)} each
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer — totals + checkout */}
      {!empty && (
        <div className="border-t border-ink-100 p-5 space-y-4 bg-ink-50/40">
          {/* Customer */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-400">
              <User className="w-3.5 h-3.5" /> Customer (optional)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Name"
                className="input py-2 text-sm"
              />
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="Phone"
                className="input py-2 text-sm"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-ink-400">
              Discount (PKR)
            </label>
            <input
              type="number"
              min="0"
              value={discount || ''}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              className="input py-2 text-sm mt-1"
            />
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
            {totals.discount > 0 && (
              <Row label="Discount" value={`- ${formatCurrency(totals.discount)}`} tone="rose" />
            )}
            <div className="h-px bg-ink-200 my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-ink-500 text-xs uppercase tracking-wider">Total</span>
              <span className="font-display text-2xl font-semibold text-ink-900 tabular-nums">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>

          <button onClick={onCheckout} className="btn-primary w-full py-3 text-base">
            Charge {formatCurrency(totals.total)}
          </button>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, tone = 'default' }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-ink-500">{label}</span>
      <span className={tone === 'rose' ? 'text-rose-600 tabular-nums' : 'text-ink-900 tabular-nums'}>
        {value}
      </span>
    </div>
  )
}

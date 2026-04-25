import { useEffect, useMemo, useRef, useState } from 'react'
import { Package, AlertTriangle, Coins, ScanLine, CheckCircle2, AlertCircle } from 'lucide-react'
import InventoryTable     from '../components/inventory/InventoryTable.jsx'
import ProductFormModal   from '../components/inventory/ProductFormModal.jsx'
import { useInventoryStore } from '../store/useInventoryStore.js'
import { formatCurrency, formatNumber } from '../utils/format.js'
import { cn } from '../utils/cn.js'

export default function InventoryPage() {
  const products = useInventoryStore((s) => s.products)
  const scannerRef = useRef(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [pendingBarcode, setPendingBarcode] = useState('')
  const [scanValue, setScanValue] = useState('')
  const [foundProduct, setFoundProduct] = useState(null)
  const [toast, setToast] = useState(null) // { kind, message }

  const stats = useMemo(() => {
    const totalItems = products.reduce((s, p) => s + p.stock, 0)
    const totalValue = products.reduce((s, p) => s + p.stock * p.cost, 0)
    const lowStock   = products.filter((p) => p.stock > 0 && p.stock <= 3).length
    const outOfStock = products.filter((p) => p.stock === 0).length
    return { totalItems, totalValue, lowStock, outOfStock }
  }, [products])

  function openAdd() {
    setEditing(null)
    setPendingBarcode('')
    setFormOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    setFormOpen(true)
  }

  useEffect(() => {
    scannerRef.current?.focus()
  }, [])

  function focusScannerSoon(force = false) {
    if (!force && formOpen) return
    window.setTimeout(() => {
      if (!force && formOpen) return
      scannerRef.current?.focus()
    }, 0)
  }

  function showToast(nextToast) {
    setToast(nextToast)
    window.setTimeout(() => setToast(null), nextToast?.kind === 'error' ? 2400 : 1600)
  }

  function handleBarcodeScan() {
    const code = scanValue.trim()
    if (!code) return

    const existing = products.find((p) => String(p.barcode || '') === code) || null
    if (existing) {
      setFoundProduct(existing)
      showToast({ kind: 'success', message: 'Product found in inventory' })
      setScanValue('')
      focusScannerSoon()
    } else {
      setFoundProduct(null)
      setEditing(null)
      setPendingBarcode(code)
      setFormOpen(true)
      setScanValue('')
      showToast({ kind: 'error', message: 'Product not found. Add new product.' })
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-wider text-ink-400">Catalog</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Inventory</h1>
        <p className="text-sm text-ink-500 mt-1">
          Manage products, stock levels and pricing across your store.
        </p>
      </header>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card p-4 lg:p-5">
        <div className="text-[11px] uppercase tracking-wider text-ink-400 flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-brand-600" />
          Barcode scan
        </div>
        <div className="mt-2 relative">
          <input
            ref={scannerRef}
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBarcodeScan()
              if (e.key === 'Escape') setScanValue('')
            }}
            placeholder="Scan/type barcode and press Enter"
            className="w-full input py-3 font-mono"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">
            Enter
          </div>
        </div>

        {foundProduct && (
          <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
            <div className="text-sm font-semibold text-ink-900">{foundProduct.name}</div>
            <div className="text-xs text-ink-600 mt-0.5 font-mono">{foundProduct.barcode}</div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <span className="text-ink-600 capitalize">Category: {foundProduct.category}</span>
              <span className="text-ink-700 font-medium">Price: {formatCurrency(foundProduct.price)}</span>
              <span className="text-ink-700 font-medium">Stock: {formatNumber(foundProduct.stock)}</span>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={Package}
          label="Unique SKUs"
          value={formatNumber(products.length)}
          tone="brand"
        />
        <Stat
          icon={Package}
          label="Units in stock"
          value={formatNumber(stats.totalItems)}
          tone="ink"
        />
        <Stat
          icon={AlertTriangle}
          label="Low / out of stock"
          value={`${stats.lowStock} / ${stats.outOfStock}`}
          tone={stats.outOfStock > 0 ? 'rose' : 'amber'}
        />
        <Stat
          icon={Coins}
          label="Stock value (at cost)"
          value={formatCurrency(stats.totalValue)}
          tone="ink"
        />
      </div>

      <InventoryTable onEdit={openEdit} onAdd={openAdd} />

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setPendingBarcode('')
          focusScannerSoon(true)
        }}
        product={editing}
        simpleMode={!editing}
        initialDraft={pendingBarcode ? { barcode: pendingBarcode, category: 'mobile' } : null}
        onSaved={() => showToast({ kind: 'success', message: 'Product added to inventory' })}
      />

      <div
        className={cn(
          'fixed z-50 left-1/2 -translate-x-1/2 bottom-[5.25rem] lg:bottom-6',
          'transition-all duration-150',
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
        )}
      >
        <div
          className={cn(
            'rounded-xl2 px-4 py-3 shadow-pop border text-sm font-medium backdrop-blur inline-flex items-center gap-2 min-w-[220px]',
            toast?.kind === 'error'
              ? 'bg-rose-50/95 border-rose-200 text-rose-700'
              : 'bg-emerald-50/95 border-emerald-200 text-emerald-700',
          )}
        >
          {toast?.kind === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast?.message || ''}
        </div>
      </div>
    </div>
  )
}

const TONES = {
  brand: 'bg-brand-50   text-brand-700  ring-brand-100',
  rose:  'bg-rose-50    text-rose-700   ring-rose-100',
  amber: 'bg-amber-50   text-amber-700  ring-amber-100',
  ink:   'bg-white      text-ink-900    ring-ink-100',
}

function Stat({ icon: Icon, label, value, tone = 'ink' }) {
  return (
    <div className={`rounded-xl2 p-4 border ring-1 ring-inset ${TONES[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider opacity-70">{label}</div>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="mt-2 font-display text-xl font-semibold tabular-nums">
        {value}
      </div>
    </div>
  )
}

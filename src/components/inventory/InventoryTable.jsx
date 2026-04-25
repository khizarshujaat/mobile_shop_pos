import { useMemo, useState } from 'react'
import { Pencil, Trash2, Search, PackagePlus, PackageSearch } from 'lucide-react'
import { useInventoryStore } from '../../store/useInventoryStore.js'
import { CATEGORIES } from '../../data/products.js'
import { formatCurrency } from '../../utils/format.js'
import { cn } from '../../utils/cn.js'
import EmptyState from '../ui/EmptyState.jsx'
import Badge from '../ui/Badge.jsx'

export default function InventoryTable({ onEdit, onAdd }) {
  const products     = useInventoryStore((s) => s.products)
  const removeProduct = useInventoryStore((s) => s.removeProduct)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      const name = String(p.name || '').toLowerCase()
      const sku = String(p.sku || '').toLowerCase()
      const brand = String(p.brand || '').toLowerCase()
      const barcode = String(p.barcode || '').toLowerCase()
      return (
        name.includes(q) ||
        sku.includes(q)  ||
        brand.includes(q) ||
        barcode.includes(q)
      )
    })
  }, [products, query, category])

  return (
    <div className="card p-0 overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-ink-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKUs…"
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input py-2 text-sm w-auto"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button onClick={onAdd} className="btn-primary">
            <PackagePlus className="w-4 h-4" />
            Add product
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={products.length === 0 ? 'No products added yet' : 'No products found'}
          description={
            products.length === 0
              ? 'Start by adding your first product to inventory.'
              : 'Try a different search or add a new product to your catalog.'
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-ink-500 bg-ink-50/60 border-b border-ink-100">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Cost</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-right">Margin</th>
                  <th className="px-5 py-3 font-medium text-right">Stock</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={onEdit}
                    onRemove={removeProduct}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-ink-100">
            {filtered.map((p) => (
              <ProductRowMobile
                key={p.id}
                product={p}
                onEdit={onEdit}
                onRemove={removeProduct}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ---------- Row helpers ----------
function stockTone(stock) {
  if (stock === 0) return { tone: 'rose',  label: 'Out of stock' }
  if (stock <= 3)  return { tone: 'amber', label: `Low · ${stock}` }
  return { tone: 'brand', label: `${stock} in stock` }
}

function marginPct(price, cost) {
  if (!price || price <= 0) return 0
  return Math.round(((price - cost) / price) * 100)
}

function ProductRow({ product, onEdit, onRemove }) {
  const s = stockTone(product.stock)
  return (
    <tr className="hover:bg-ink-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="font-medium text-ink-900">{product.name}</div>
        <div className="text-[11px] font-mono text-ink-400 mt-0.5">
          {product.sku} · {product.brand}
        </div>
      </td>
      <td className="px-5 py-3.5 text-ink-600 capitalize">{product.category}</td>
      <td className="px-5 py-3.5 text-right tabular-nums text-ink-500">
        {formatCurrency(product.cost)}
      </td>
      <td className="px-5 py-3.5 text-right tabular-nums font-medium text-ink-900">
        {formatCurrency(product.price)}
      </td>
      <td className="px-5 py-3.5 text-right tabular-nums text-ink-600">
        {marginPct(product.price, product.cost)}%
      </td>
      <td className="px-5 py-3.5 text-right">
        <Badge tone={s.tone}>{s.label}</Badge>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-md text-ink-500 hover:text-ink-900 hover:bg-ink-100 flex items-center justify-center"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove "${product.name}" from inventory?`)) onRemove(product.id)
            }}
            className="w-8 h-8 rounded-md text-ink-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function ProductRowMobile({ product, onEdit, onRemove }) {
  const s = stockTone(product.stock)
  return (
    <li className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-ink-900 line-clamp-1">{product.name}</div>
          <div className="text-[11px] font-mono text-ink-400 mt-0.5">
            {product.sku} · {product.brand}
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge tone={s.tone}>{s.label}</Badge>
            <span className="text-xs text-ink-500 capitalize">{product.category}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold tabular-nums text-ink-900">
            {formatCurrency(product.price)}
          </div>
          <div className="text-[11px] text-ink-400">
            {marginPct(product.price, product.cost)}% margin
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onEdit(product)} className="btn-outline flex-1 py-1.5 text-xs">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => {
            if (confirm(`Remove "${product.name}"?`)) onRemove(product.id)
          }}
          className={cn('btn flex-1 py-1.5 text-xs bg-white border border-ink-200 text-rose-600 hover:bg-rose-50')}
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      </div>
    </li>
  )
}

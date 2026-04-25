import { useMemo, useState } from 'react'
import { Search, PackageSearch } from 'lucide-react'
import { useInventoryStore } from '../../store/useInventoryStore.js'
import { CATEGORIES } from '../../data/products.js'
import { formatCurrency } from '../../utils/format.js'
import { cn } from '../../utils/cn.js'
import EmptyState from '../ui/EmptyState.jsx'

export default function ProductGrid({ onPick }) {
  const products = useInventoryStore((s) => s.products)
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)  ||
        p.brand.toLowerCase().includes(q)
      )
    })
  }, [products, query, category])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search + categories */}
      <div className="p-4 lg:p-6 border-b border-ink-100 bg-white">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU or brand…"
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto mt-3 -mx-1 px-1 pb-1">
          <CategoryPill active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </CategoryPill>
          {CATEGORIES.map((c) => (
            <CategoryPill
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </CategoryPill>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products match"
            description="Try a different search term or clear the category filter."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <ProductTile key={p.id} product={p} onPick={onPick} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-600 border-ink-200 hover:border-ink-300',
      )}
    >
      {children}
    </button>
  )
}

function ProductTile({ product, onPick }) {
  const outOfStock = product.stock === 0
  const low        = product.stock > 0 && product.stock <= 3

  return (
    <button
      onClick={() => !outOfStock && onPick(product)}
      disabled={outOfStock}
      className={cn(
        'group relative text-left p-4 rounded-xl2 border bg-white transition-all',
        'hover:border-brand-400 hover:shadow-card hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30',
        outOfStock && 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:border-ink-100 hover:shadow-none',
        'border-ink-100',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
          {product.sku}
        </span>
        {low && !outOfStock && (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            Low · {product.stock}
          </span>
        )}
        {outOfStock && (
          <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
            Out
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-[11px] text-ink-400 uppercase tracking-wider">{product.brand}</div>
        <div className="text-sm font-semibold text-ink-900 leading-snug line-clamp-2 min-h-[2.5rem] mt-0.5">
          {product.name}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="font-display font-semibold text-ink-900">
          {formatCurrency(product.price)}
        </div>
        {!outOfStock && (
          <div className="text-[11px] text-ink-400">Stock: {product.stock}</div>
        )}
      </div>
    </button>
  )
}

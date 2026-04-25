import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { CATEGORIES } from '../../data/products.js'
import { useInventoryStore } from '../../store/useInventoryStore.js'

const EMPTY_DRAFT = {
  name:     '',
  barcode:  '',
  sku:      '',
  brand:    '',
  category: 'mobile',
  price:    '',
  cost:     '',
  stock:    '',
  warranty: '1 year',
}

export default function ProductFormModal({ open, onClose, product, initialDraft = null, simpleMode = false, onSaved = null }) {
  const addProduct    = useInventoryStore((s) => s.addProduct)
  const updateProduct = useInventoryStore((s) => s.updateProduct)

  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const isEdit = Boolean(product)

  useEffect(() => {
    if (product) {
      setDraft({
        name:     product.name,
        barcode:  product.barcode || '',
        sku:      product.sku,
        brand:    product.brand,
        category: product.category,
        price:    product.price,
        cost:     product.cost,
        stock:    product.stock,
        warranty: product.warranty || '—',
      })
    } else if (initialDraft) {
      setDraft((d) => ({ ...d, ...EMPTY_DRAFT, ...initialDraft }))
    } else {
      setDraft(EMPTY_DRAFT)
    }
  }, [product, open, initialDraft])

  function handleSubmit(e) {
    e.preventDefault()
    if (!draft.name.trim() || !String(draft.barcode || '').trim()) return
    if (isEdit) {
      updateProduct(product.id, draft)
    } else {
      addProduct(draft)
    }
    onSaved?.(draft)
    onClose()
  }

  function set(key, value) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit product' : 'Add product'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" required>
            <input
              className="input"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. iPhone 15 128GB"
              autoFocus
            />
          </Field>
          <Field label="Barcode" required>
            <input
              className="input font-mono"
              value={draft.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              placeholder="e.g. 8801234567011"
            />
          </Field>
          <Field label="Category">
            <select
              className="input"
              value={draft.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Sell price (PKR)" required>
            <input
              type="number" min="0"
              className="input"
              value={draft.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Stock">
            <input
              type="number" min="0"
              className="input"
              value={draft.stock}
              onChange={(e) => set('stock', e.target.value)}
              placeholder="0"
            />
          </Field>
          {!simpleMode && (
            <>
          <Field label="SKU">
            <input
              className="input font-mono"
              value={draft.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="IP15-128-BLK"
            />
          </Field>
          <Field label="Brand">
            <input
              className="input"
              value={draft.brand}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="Apple, Samsung…"
            />
          </Field>
          <Field label="Cost (PKR)">
            <input
              type="number" min="0"
              className="input"
              value={draft.cost}
              onChange={(e) => set('cost', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Warranty">
            <input
              className="input"
              value={draft.warranty}
              onChange={(e) => set('warranty', e.target.value)}
              placeholder="1 year"
            />
          </Field>
            </>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">
            {isEdit ? 'Save changes' : 'Add to inventory'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

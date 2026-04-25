import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, ScanLine, Trash2, Loader2, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { usePosStore } from '../store/usePosStore.js'
import { useWalletStore } from '../store/useWalletStore.js'
import { useInventoryStore } from '../store/useInventoryStore.js'
import Modal from '../components/ui/Modal.jsx'
import { getMainBranch } from '../data/branches.js'
import { DEFAULT_COMMISSION_RATE } from '../data/walletServices.js'
import { formatCurrency } from '../utils/format.js'
import { cn } from '../utils/cn.js'

export default function POSPage() {
  const branch = getMainBranch()
  const inputRef = useRef(null)
  const walletNumberRef = useRef(null)
  const walletAmountRef = useRef(null)
  const discountInputRef = useRef(null)
  const toastTimerRef = useRef(null)
  const audioCtxRef = useRef(null)
  const addWalletTx = useWalletStore((s) => s.addTransaction)
  const walletTransactions = useWalletStore((s) => s.transactions)

  const {
    cart,
    subtotal,
    discount,
    total,
    addToCartByBarcode,
    updateQuantity,
    removeItem,
    clearCart,
    setDiscount,
    completeSale,
  } = usePosStore(
    (s) => ({
      cart: s.cart,
      subtotal: s.subtotal,
      discount: s.discount,
      total: s.total,
      addToCartByBarcode: s.addToCartByBarcode,
      updateQuantity: s.updateQuantity,
      removeItem: s.removeItem,
      clearCart: s.clearCart,
      setDiscount: s.setDiscount,
      completeSale: s.completeSale,
    }),
    shallow,
  )
  const products = useInventoryStore((s) => s.products)

  const itemCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart])
  const [mode, setMode] = useState('product') // 'product' | 'wallet'
  const [fastMode, setFastMode] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [barcodeFocused, setBarcodeFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [lastAddedProductId, setLastAddedProductId] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false)
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false)
  const [receiptSale, setReceiptSale] = useState(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const [selectedCartIndex, setSelectedCartIndex] = useState(0)
  const [removingProductId, setRemovingProductId] = useState('')
  const [scanError, setScanError] = useState(false)
  const [toast, setToast] = useState(null) // { kind: 'success' | 'error', message: string }
  const [walletForm, setWalletForm] = useState({
    customerNumber: '',
    amount: '',
    serviceId: 'jazzcash',
  })

  useEffect(() => {
    if (mode === 'product') inputRef.current?.focus()
    if (mode === 'wallet') walletNumberRef.current?.focus()
  }, [mode])

  useEffect(() => {
    if (cart.length === 0) {
      setSelectedCartIndex(0)
      return
    }
    setSelectedCartIndex((i) => Math.min(Math.max(i, 0), cart.length - 1))
  }, [cart.length])

  const focusScannerSoon = useCallback(() => {
    // Avoid fighting the browser during click events; defer focus to next tick.
    const runner = () => {
      if (mode === 'product') inputRef.current?.focus()
      if (mode === 'wallet') walletNumberRef.current?.focus()
    }
    if (fastMode) {
      runner()
      return
    }
    window.setTimeout(runner, 0)
  }, [mode, fastMode])

  const ensureAudioCtx = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtxRef.current = new Ctx()
    return audioCtxRef.current
  }, [])

  function playBeep({ freq = 880, durationMs = 80, type = 'square', gain = 0.04 } = {}) {
    const ctx = ensureAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume?.()

    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.value = gain
    osc.connect(g)
    g.connect(ctx.destination)

    const now = ctx.currentTime
    osc.start(now)
    osc.stop(now + durationMs / 1000)
  }

  function beepSuccess() {
    playBeep({ freq: 1175, durationMs: 70, type: 'sine', gain: 0.05 })
  }

  function beepError() {
    playBeep({ freq: 220, durationMs: 120, type: 'square', gain: 0.06 })
  }

  const playCashRegisterSound = useCallback(() => {
    const ctx = ensureAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume?.()

    // Lightweight "ka-ching" style synth: short high ping + quick lower tail.
    const now = ctx.currentTime
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    g.connect(ctx.destination)

    const osc1 = ctx.createOscillator()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(1320, now)
    osc1.frequency.exponentialRampToValueAtTime(980, now + 0.08)
    osc1.connect(g)
    osc1.start(now)
    osc1.stop(now + 0.09)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(520, now + 0.03)
    osc2.frequency.exponentialRampToValueAtTime(320, now + 0.20)
    osc2.connect(g)
    osc2.start(now + 0.03)
    osc2.stop(now + 0.22)
  }, [ensureAudioCtx])

  const showToast = useCallback((nextToast) => {
    setToast(nextToast)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    const timeoutMs = fastMode
      ? nextToast?.kind === 'error' ? 1400 : 900
      : nextToast?.kind === 'error' ? 2600 : 1600
    toastTimerRef.current = window.setTimeout(() => setToast(null), timeoutMs)
  }, [fastMode])

  function flashScanError() {
    setScanError(true)
    window.setTimeout(() => setScanError(false), fastMode ? 700 : 1400)
  }

  const withMicroDelay = useCallback((action, min = 220, maxJitter = 180) => {
    if (fastMode) {
      action()
      return
    }
    window.setTimeout(action, min + Math.floor(Math.random() * maxJitter))
  }, [fastMode])

  function paymentMethodLabel(id) {
    if (id === 'cash') return 'Cash'
    if (id === 'card') return 'Card'
    if (id === 'jazzcash') return 'JazzCash'
    if (id === 'easypaisa') return 'Easypaisa'
    return id || '—'
  }

  function handleScanSubmit() {
    const code = barcode.trim()
    if (!code || isScanning) return
    const matched = barcodeMap.get(code)
    setIsScanning(true)
    withMicroDelay(() => {
      const ok = addToCartByBarcode(code, 1)
      setBarcode('')
      if (ok) {
        beepSuccess()
        showToast({ kind: 'success', message: 'Added to cart' })
        if (matched?.id) {
          setLastAddedProductId(matched.id)
          window.setTimeout(() => setLastAddedProductId(''), 1200)
        }
      } else {
        beepError()
        flashScanError()
        showToast({ kind: 'error', message: 'Product not found' })
      }
      setIsScanning(false)
      focusScannerSoon()
    })
  }

  const handleProductCheckout = useCallback((paymentMethodId = 'cash') => {
    if (mode !== 'product' || isPaymentSubmitting || cart.length === 0) return
    setIsPaymentSubmitting(true)
    withMicroDelay(() => {
      const sale = completeSale({ paymentMethodId })
      if (sale) {
        showToast({
          kind: 'success',
          message: `${paymentMethodId === 'card' ? 'Card' : 'Cash'} sale completed`,
        })
        playCashRegisterSound()
        setReceiptSale(sale)
      }
      setIsPaymentSubmitting(false)
      focusScannerSoon()
    }, 240, 160)
  }, [mode, isPaymentSubmitting, cart.length, withMicroDelay, completeSale, showToast, playCashRegisterSound, focusScannerSoon])

  function handleRemoveCartItem(productId) {
    if (!productId || removingProductId === productId) return
    setRemovingProductId(productId)
    const delay = fastMode ? 0 : 140
    window.setTimeout(() => {
      removeItem(productId)
      setRemovingProductId('')
      focusScannerSoon()
    }, delay)
  }

  useEffect(() => {
    const onGlobalHotkey = (e) => {
      const key = e.key
      if (key === '?') {
        e.preventDefault()
        setShortcutHelpOpen(true)
        return
      }

      if (shortcutHelpOpen || receiptSale || mode !== 'product') return

      if (key === 'F9') {
        e.preventDefault()
        handleProductCheckout('cash')
        return
      }

      if (key === 'F2') {
        e.preventDefault()
        discountInputRef.current?.focus()
        discountInputRef.current?.select?.()
        return
      }

      if (key === 'Escape') {
        if (cart.length === 0) return
        e.preventDefault()
        clearCart()
        showToast({ kind: 'success', message: 'Cart cleared' })
        focusScannerSoon()
        return
      }

      if ((key === '+' || key === '-') && cart.length > 0) {
        e.preventDefault()
        const line = cart[selectedCartIndex]
        if (!line) return
        const nextQty = key === '+' ? line.qty + 1 : line.qty - 1
        updateQuantity(line.productId, nextQty)
        focusScannerSoon()
      }
    }

    window.addEventListener('keydown', onGlobalHotkey)
    return () => window.removeEventListener('keydown', onGlobalHotkey)
  }, [
    mode,
    shortcutHelpOpen,
    receiptSale,
    cart,
    selectedCartIndex,
    clearCart,
    updateQuantity,
    isPaymentSubmitting,
    focusScannerSoon,
    handleProductCheckout,
    showToast,
  ])

  const walletAmount = Number(walletForm.amount) || 0
  const walletCommission = Math.round(walletAmount * DEFAULT_COMMISSION_RATE)
  const companyAmount = Math.max(0, walletAmount - walletCommission)
  const commissionPercent = Math.round(DEFAULT_COMMISSION_RATE * 100)
  const walletProfit = walletCommission
  const canSubmitWallet = walletForm.customerNumber.trim().length >= 10 && walletAmount > 0
  const barcodeMap = useMemo(
    () => new Map(products.map((p) => [String(p.barcode), p])),
    [products],
  )
  const suggestions = useMemo(() => {
    if (mode !== 'product') return []
    const q = barcode.trim().toLowerCase()
    if (!q) return []

    const starts = []
    const contains = []
    for (const p of products) {
      const b = String(p.barcode || '')
      const n = String(p.name || '').toLowerCase()
      if (b.startsWith(q)) starts.push(p)
      else if (n.includes(q) || b.includes(q)) contains.push(p)
      if (starts.length + contains.length >= 8) break
    }
    return [...starts, ...contains].slice(0, 6)
  }, [barcode, mode, products])
  const dashboard = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const todaySales = walletTransactions.filter(
      (t) => t.kind === 'sale' && new Date(t.createdAt) >= start,
    )

    const totalSales = todaySales.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const txCount = todaySales.length
    const estimatedProfit = Math.round(totalSales * 0.18) // simple demo estimate
    const recent = todaySales.slice(0, 5)

    return {
      totalSales: totalSales || 986000,
      txCount: txCount || 12,
      estimatedProfit: estimatedProfit || 177480,
      recentSales:
        recent.length > 0
          ? recent
          : [
              { id: 'mock-1', amount: 54000, paymentMethodId: 'cash', createdAt: new Date().toISOString() },
              { id: 'mock-2', amount: 4500, paymentMethodId: 'jazzcash', createdAt: new Date().toISOString() },
            ],
    }
  }, [walletTransactions])

  function handleWalletSubmit(e) {
    e.preventDefault()
    if (!canSubmitWallet || isWalletSubmitting) return

    setIsWalletSubmitting(true)
    withMicroDelay(() => {
      addWalletTx({
        kind: 'sale',
        paymentMethodId: walletForm.serviceId,
        amount: walletAmount,
        note: `Wallet service ${walletForm.serviceId}`,
        customer: { name: 'Walk-in', phone: walletForm.customerNumber.trim() },
        subtotal: walletAmount,
        discount: 0,
        tax: 0,
        meta: {
          commissionRate: DEFAULT_COMMISSION_RATE,
          commission: walletCommission,
          companyAmount,
        },
      })

      setWalletForm({ customerNumber: '', amount: '', serviceId: walletForm.serviceId })
      showToast({
        kind: 'success',
        message: `${walletForm.serviceId === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} service completed`,
      })
      beepSuccess()
      setIsWalletSubmitting(false)
      focusScannerSoon()
    }, 240, 160)
  }

  function handleSuggestionPick(product) {
    if (isScanning) return
    setIsScanning(true)
    withMicroDelay(() => {
      const ok = addToCartByBarcode(String(product.barcode), 1)
      setBarcode('')
      setActiveSuggestion(-1)
      if (ok) {
        beepSuccess()
        showToast({ kind: 'success', message: 'Added to cart' })
        setLastAddedProductId(product.id)
        window.setTimeout(() => setLastAddedProductId(''), 1200)
      } else {
        beepError()
        flashScanError()
        showToast({ kind: 'error', message: 'Product not found' })
      }
      setIsScanning(false)
      focusScannerSoon()
    })
  }

  return (
    <div className={cn(
      'h-full min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex flex-col',
      fastMode && '[&_*]:!transition-none [&_*]:!duration-0 [&_*]:!animate-none',
    )}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-ink-100">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-display font-semibold text-ink-900 leading-tight">
              SA Mobiles POS
            </div>
            <div className="text-xs text-ink-500 truncate">
              {branch.name} · {branch.city}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setShortcutHelpOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              title="Show keyboard shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
              Shortcuts
            </button>
            <div className="relative group">
            <label className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5">
              <span className="text-xs text-ink-600">Fast Mode</span>
              <button
                onClick={() => {
                  setFastMode((v) => !v)
                  focusScannerSoon()
                }}
                className={cn(
                  'relative w-11 h-6 rounded-full border transition-colors',
                  fastMode ? 'bg-brand-500 border-brand-500' : 'bg-ink-200 border-ink-300',
                )}
                title={`Fast Mode ${fastMode ? 'ON' : 'OFF'} — instant actions, no animation, auto-focus scanner`}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-soft transition-transform',
                    fastMode && 'translate-x-5',
                  )}
                />
              </button>
              <span className={cn('text-[11px] font-medium', fastMode ? 'text-brand-700' : 'text-ink-500')}>
                {fastMode ? 'ON' : 'OFF'}
              </span>
            </label>
              <div className="pointer-events-none absolute top-[calc(100%+0.5rem)] left-0 w-72 rounded-lg border border-ink-200 bg-white p-2.5 text-[11px] leading-relaxed text-ink-600 shadow-pop opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0">
                Fast Mode: instant scan/add/payment, disables animations and delays, and keeps barcode input focused after every action.
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  clearCart()
                  showToast({ kind: 'success', message: 'Cart cleared' })
                  focusScannerSoon()
                }}
                className="btn-outline !py-2 !px-3 text-sm"
                title="Clear cart"
              >
                Clear
              </button>
            )}
            <div className="text-xs text-ink-500 tabular-nums">
              Items <span className="font-semibold text-ink-900">{itemCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Barcode input */}
      <div className="px-4 lg:px-6 py-4 bg-ink-50 border-b border-ink-100 space-y-3">
        <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1">
          <button
            onClick={() => setMode('product')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
              mode === 'product' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50',
            )}
          >
            Product Sale
          </button>
          <button
            onClick={() => setMode('wallet')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
              mode === 'wallet' ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-50',
            )}
          >
            Wallet Service
          </button>
        </div>

        {mode === 'product' ? (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-3 items-start">
            <div className="w-full min-w-0">
              <label className="text-[11px] uppercase tracking-wider text-ink-500 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-brand-600" />
                Scan / Type barcode and press Enter
              </label>
              <div className="mt-2 relative">
                <input
                  ref={inputRef}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && suggestions.length > 0) {
                    e.preventDefault()
                    setActiveSuggestion((i) => (i + 1) % suggestions.length)
                  } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
                    e.preventDefault()
                    setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
                  } else if (e.key === 'Enter') {
                    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                      e.preventDefault()
                      handleSuggestionPick(suggestions[activeSuggestion])
                    } else {
                      handleScanSubmit()
                    }
                  }
                    if (e.key === 'Escape') setBarcode('')
                  }}
                onFocus={() => {
                  setBarcodeFocused(true)
                  setActiveSuggestion(-1)
                }}
                onBlur={() => setBarcodeFocused(false)}
                  placeholder="e.g. 8801234567011"
                  inputMode="numeric"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={cn(
                    'w-full rounded-xl2 border bg-white px-4 py-4 text-lg sm:text-xl font-mono tracking-wide',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500/30',
                    scanError ? 'border-rose-400 ring-2 ring-rose-200/70' : 'border-ink-200',
                  )}
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-400 flex items-center gap-1.5">
                  {isScanning && !fastMode && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isScanning ? 'Scanning…' : 'Enter'}
                </div>

                {barcodeFocused && barcode.trim().length > 0 && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-xl2 border border-ink-200 bg-white shadow-pop overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionPick(p)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 text-sm border-b last:border-b-0 border-ink-100',
                          'hover:bg-ink-50',
                          idx === activeSuggestion && 'bg-ink-50',
                        )}
                      >
                        <div className="font-medium text-ink-900">{p.name}</div>
                        <div className="text-xs text-ink-500 font-mono mt-0.5">
                          {p.barcode} · {formatCurrency(p.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {scanError && (
                <div className="mt-2 text-sm text-rose-600">
                  Barcode not found in mock products.
                </div>
              )}
            </div>

            <div className="w-full max-w-[420px] justify-self-end rounded-xl border border-ink-100 bg-white p-3.5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wider text-ink-500">Today Insights</div>
                <div className="text-[11px] text-ink-500">Real-time</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Metric label="Sales" value={formatCurrency(dashboard.totalSales)} />
                <Metric label="Txns" value={dashboard.txCount.toString()} />
                <Metric label="Profit" value={formatCurrency(dashboard.estimatedProfit)} />
              </div>
              <div className="mt-3">
                <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1.5">
                  Recent Sales
                </div>
                <ul className="space-y-1.5">
                  {dashboard.recentSales.slice(0, 5).map((tx) => (
                    <li key={tx.id} className="flex items-center justify-between rounded-lg bg-ink-50 border border-ink-100 px-2.5 py-2 text-xs">
                      <span className="text-ink-600 uppercase">{tx.paymentMethodId || 'sale'}</span>
                      <span className="font-medium text-ink-900 tabular-nums">
                        {formatCurrency(Number(tx.amount) || 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <form onSubmit={handleWalletSubmit} className="w-full grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-ink-500">Customer number</span>
                <input
                  ref={walletNumberRef}
                  value={walletForm.customerNumber}
                  onChange={(e) => setWalletForm((p) => ({ ...p, customerNumber: e.target.value.replace(/\D/g, '') }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      walletAmountRef.current?.focus()
                    }
                  }}
                  placeholder="03XXXXXXXXX"
                  inputMode="numeric"
                  className="input mt-1 font-mono"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-ink-500">Amount (PKR)</span>
                <input
                  ref={walletAmountRef}
                  value={walletForm.amount}
                  onChange={(e) => setWalletForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="5000"
                  inputMode="decimal"
                  className="input mt-1 font-mono"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-ink-500">Service</span>
                <select
                  value={walletForm.serviceId}
                  onChange={(e) => setWalletForm((p) => ({ ...p, serviceId: e.target.value }))}
                  className="input mt-1"
                >
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">Easypaisa</option>
                </select>
              </label>
              <button type="submit" disabled={!canSubmitWallet || isWalletSubmitting} className="btn-primary h-11 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {isWalletSubmitting && !fastMode && <Loader2 className="w-4 h-4 animate-spin" />}
                {isWalletSubmitting ? 'Submitting…' : 'Submit Service'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="flex-1 min-h-0 px-4 lg:px-6 py-5">
        {mode === 'product' ? (
        <div className="h-full min-h-0 flex flex-col md:flex-row gap-4">
          {/* Cart (70%) */}
          <section className="md:basis-[70%] md:grow-[7] min-w-0">
            <div className="h-full min-h-0 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-400">Cart</div>
                  <div className="text-sm font-semibold text-ink-900">
                    Current sale
                  </div>
                </div>
                <div className="text-xs text-ink-500 tabular-nums">
                  Subtotal <span className="font-semibold text-ink-900">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-10">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-ink-900">Scan a product to start billing</div>
                      <div className="text-sm text-ink-500 mt-1">
                        Your cart is empty. Barcode scan will add items instantly.
                      </div>
                      <div className="text-xs text-ink-400 mt-3 font-mono">
                        Tip: Press{' '}
                        <kbd className="inline-flex items-center rounded border border-ink-200 bg-white px-2 py-0.5 text-[11px] text-ink-600 shadow-sm">
                          Esc
                        </kbd>{' '}
                        to clear input
                      </div>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white border-b border-ink-100">
                      <tr className="text-[11px] uppercase tracking-wider text-ink-400">
                        <th className="text-left font-medium px-5 py-3">Product</th>
                        <th className="text-center font-medium px-3 py-3 w-[160px]">Qty</th>
                        <th className="text-right font-medium px-5 py-3 w-[160px]">Price</th>
                        <th className="text-right font-medium px-5 py-3 w-[180px]">Total</th>
                        <th className="w-[56px]" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {cart.map((line, idx) => (
                        <CartRow
                          key={line.productId}
                          line={line}
                          highlight={line.productId === lastAddedProductId}
                          selected={idx === selectedCartIndex}
                          removing={line.productId === removingProductId}
                          onSelect={() => setSelectedCartIndex(idx)}
                          onDec={() => {
                            updateQuantity(line.productId, line.qty - 1)
                            focusScannerSoon()
                          }}
                          onInc={() => {
                            updateQuantity(line.productId, line.qty + 1)
                            focusScannerSoon()
                          }}
                          onRemove={() => {
                            handleRemoveCartItem(line.productId)
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>

          {/* Summary (30%) */}
          <aside className="xl:w-[420px] xl:shrink-0">
            <div className="rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">Summary</div>
                <div className="text-sm font-semibold text-ink-900">Totals & payment</div>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2 text-sm">
                  <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                  <div className="grid grid-cols-2 items-center gap-3">
                    <label className="text-ink-500 text-sm">Discount</label>
                    <input
                      ref={discountInputRef}
                      type="number"
                      min="0"
                      value={discount || ''}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="input text-right tabular-nums"
                    />
                  </div>
                  <div className="h-px bg-ink-200 my-1" />
                  <div className="flex items-end justify-between">
                    <div className="text-xs uppercase tracking-wider text-ink-500">Final total</div>
                    <div className="font-display text-3xl font-semibold text-ink-900 tabular-nums">
                      {formatCurrency(total)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={cart.length === 0 || isPaymentSubmitting}
                    onClick={() => handleProductCheckout('cash')}
                    className={cn(
                      'rounded-xl2 py-3.5 font-semibold text-white transition-all focus:outline-none focus:ring-2 inline-flex items-center justify-center gap-2',
                      cart.length === 0
                        ? 'bg-emerald-300/60 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200',
                    )}
                  >
                    {isPaymentSubmitting && !fastMode && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isPaymentSubmitting ? 'Processing…' : 'Cash'}
                  </button>
                  <button
                    disabled={cart.length === 0 || isPaymentSubmitting}
                    onClick={() => handleProductCheckout('card')}
                    className={cn(
                      'rounded-xl2 py-3.5 font-semibold text-white transition-all focus:outline-none focus:ring-2 inline-flex items-center justify-center gap-2',
                      cart.length === 0
                        ? 'bg-sky-300/60 cursor-not-allowed'
                        : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-200',
                    )}
                  >
                    {isPaymentSubmitting && !fastMode && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isPaymentSubmitting ? 'Processing…' : 'Card'}
                  </button>
                </div>

                <div className="text-xs text-ink-500 leading-relaxed">
                  Keyboard: scan input is focused by default. Press{' '}
                  <kbd className="inline-flex items-center rounded border border-ink-200 bg-white px-2 py-0.5 text-[11px] text-ink-600 shadow-sm">
                    Enter
                  </kbd>{' '}
                  to add. Press{' '}
                <kbd className="inline-flex items-center rounded border border-ink-200 bg-white px-2 py-0.5 text-[11px] text-ink-600 shadow-sm">
                  ?
                </kbd>{' '}
                for all shortcuts.
                </div>

              </div>
            </div>
          </aside>
        </div>
        ) : (
          <div className="h-full min-h-0 flex flex-col md:flex-row gap-4">
            <section className="md:basis-[70%] md:grow-[7] min-w-0">
              <div className="rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-ink-100">
                  <div className="text-[11px] uppercase tracking-wider text-ink-400">Wallet Mode</div>
                  <div className="text-sm font-semibold text-ink-900">Live commission breakdown</div>
                  <div className="text-xs text-ink-500 mt-1">
                    Enter amount to see transparent service split instantly.
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <SummaryRow label="Total Amount" value={formatCurrency(walletAmount)} />
                  <SummaryRow label="Commission Percentage" value={`${commissionPercent}%`} />
                  <SummaryRow label="Commission Earned" value={formatCurrency(walletCommission)} />
                  <SummaryRow label="Company Share" value={formatCurrency(companyAmount)} />
                  <SummaryRow label="Your Profit" value={formatCurrency(walletProfit)} />
                  <SummaryRow
                    label="Selected service"
                    value={walletForm.serviceId === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}
                  />
                </div>
              </div>
            </section>

            <aside className="xl:w-[420px] xl:shrink-0">
              <div className="rounded-xl border border-ink-100 bg-white p-3.5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">Today Insights</div>
                  <div className="text-[11px] text-ink-500">Real-time</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Metric label="Sales" value={formatCurrency(dashboard.totalSales)} />
                  <Metric label="Txns" value={dashboard.txCount.toString()} />
                  <Metric label="Profit" value={formatCurrency(dashboard.estimatedProfit)} />
                </div>
                <div className="mt-3">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1.5">
                    Recent Sales
                  </div>
                  <ul className="space-y-1.5">
                    {dashboard.recentSales.slice(0, 5).map((tx) => (
                      <li key={tx.id} className="flex items-center justify-between rounded-lg bg-ink-50 border border-ink-100 px-2.5 py-2 text-xs">
                        <span className="text-ink-600 uppercase">{tx.paymentMethodId || 'sale'}</span>
                        <span className="font-medium text-ink-900 tabular-nums">
                          {formatCurrency(Number(tx.amount) || 0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Modal
        open={shortcutHelpOpen}
        onClose={() => {
          setShortcutHelpOpen(false)
          focusScannerSoon()
        }}
        title="Keyboard Shortcuts"
        size="sm"
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-xs text-ink-600 flex items-start gap-2">
            <Keyboard className="w-4 h-4 mt-0.5 text-ink-500" />
            <span>Designed for fast cashier operation. Shortcuts work in Product mode.</span>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white divide-y divide-ink-100 overflow-hidden">
            <ShortcutRow keys="Enter" label="Add product" />
            <ShortcutRow keys="F9" label="Checkout" />
            <ShortcutRow keys="ESC" label="Clear cart" />
            <ShortcutRow keys="F2" label="Discount" />
            <ShortcutRow keys="+ / -" label="Quantity" />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(receiptSale)}
        onClose={() => {
          setReceiptSale(null)
          focusScannerSoon()
        }}
        title="Receipt"
        size="sm"
      >
        {receiptSale && (
          <div className="space-y-4">
            <div className="rounded-lg border border-ink-200 bg-white p-4 font-mono text-[12px] leading-5">
              <div className="text-center font-semibold text-ink-900 tracking-wide">
                {branch.name}
              </div>
              <div className="text-center text-ink-500">{branch.city}</div>
              <div className="text-center text-ink-500 mt-1">
                {new Date(receiptSale.createdAt).toLocaleString()}
              </div>

              <div className="border-t border-dashed border-ink-300 my-3" />

              <div className="space-y-1.5">
                {receiptSale.items.map((line) => (
                  <div key={line.productId} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-ink-900 line-clamp-1">{line.name}</div>
                      <div className="text-ink-500">
                        {line.qty} x {formatCurrency(line.price)}
                      </div>
                    </div>
                    <div className="tabular-nums text-ink-900">
                      {formatCurrency(line.qty * line.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-ink-300 my-3" />

              <div className="space-y-1 tabular-nums">
                <ReceiptRow label="Subtotal" value={formatCurrency(receiptSale.subtotal)} />
                {receiptSale.discount > 0 && (
                  <ReceiptRow label="Discount" value={`- ${formatCurrency(receiptSale.discount)}`} />
                )}
                <ReceiptRow label="Final Amount" value={formatCurrency(receiptSale.total)} bold />
                <ReceiptRow label="Payment" value={paymentMethodLabel(receiptSale.paymentMethodId)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (isPrinting) return
                  setIsPrinting(true)
                  withMicroDelay(() => {
                    showToast({ kind: 'success', message: 'Receipt sent to printer' })
                    setIsPrinting(false)
                  }, 220, 120)
                }}
                className="btn-outline inline-flex items-center justify-center gap-2"
              >
                {isPrinting && !fastMode && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPrinting ? 'Printing…' : 'Print Receipt'}
              </button>
              <button
                onClick={() => {
                  setReceiptSale(null)
                  showToast({ kind: 'success', message: 'Ready for new sale' })
                  focusScannerSoon()
                }}
                className="btn-primary"
              >
                New Sale
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      <div
        className={cn(
          'fixed z-50 left-1/2 -translate-x-1/2 bottom-[5.25rem] lg:bottom-6',
          'transition-all duration-150',
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
        )}
        aria-live="polite"
        aria-atomic="true"
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
          {toast?.message || '—'}
        </div>
      </div>
    </div>
  )
}

const CartRow = memo(function CartRow({ line, onDec, onInc, onRemove, onSelect, highlight = false, selected = false, removing = false }) {
  return (
    <tr
      onClick={onSelect}
      className={cn(
        'text-sm cursor-pointer transition-all duration-200 ease-out',
        highlight && 'bg-brand-50/70',
        selected && 'ring-1 ring-inset ring-brand-300',
        removing && 'opacity-0 translate-x-1 scale-[0.995]',
        !removing && 'opacity-100 translate-x-0 scale-100',
      )}
    >
      <td className="px-5 py-4">
        <div className="font-medium text-ink-900 leading-snug">{line.name}</div>
        <div className="text-[11px] text-ink-400 font-mono mt-0.5">{line.sku}</div>
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={onDec}
            className="w-9 h-9 rounded-lg border border-ink-200 hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500/25 flex items-center justify-center"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-10 text-center font-semibold tabular-nums">{line.qty}</div>
          <button
            onClick={onInc}
            className="w-9 h-9 rounded-lg border border-ink-200 hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500/25 flex items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </td>
      <td className="px-5 py-4 text-right tabular-nums text-ink-700">
        {formatCurrency(line.price)}
      </td>
      <td className="px-5 py-4 text-right tabular-nums font-semibold text-ink-900">
        {formatCurrency(line.price * line.qty)}
      </td>
      <td className="px-3 py-4">
        <button
          onClick={onRemove}
          className="w-9 h-9 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 flex items-center justify-center"
          aria-label="Remove item"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
})

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-ink-500">{label}</div>
      <div className="tabular-nums text-ink-900">{value}</div>
    </div>
  )
}

function ShortcutRow({ keys, label }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 text-sm">
      <span className="text-ink-600">{label}</span>
      <span className="font-mono text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-900">
        {keys}
      </span>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white px-2 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink-900 tabular-nums">{value}</div>
    </div>
  )
}

function ReceiptRow({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-ink-900 font-semibold' : 'text-ink-600'}>{label}</span>
      <span className={bold ? 'text-ink-900 font-semibold' : 'text-ink-900'}>{value}</span>
    </div>
  )
}

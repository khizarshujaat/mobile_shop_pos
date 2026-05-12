import { Outlet, NavLink } from 'react-router-dom'
import {
  ShoppingCart,
  Wallet,
  Package,
  BarChart3,
  Shield,
  Settings,
  Sparkles,
} from 'lucide-react'
import { cn } from '../../utils/cn.js'

const NAV_ITEMS = [
  { to: '/pos',       label: 'POS',       icon: ShoppingCart, shortcut: '1' },
  { to: '/wallet',    label: 'Wallet',    icon: Wallet,       shortcut: '2' },
  { to: '/inventory', label: 'Inventory', icon: Package,      shortcut: '3' },
  { to: '/reports',   label: 'Reports',   icon: BarChart3,    shortcut: '4' },
  { to: '/admin',     label: 'Admin',     icon: Shield,       shortcut: '5' },
  { to: '/settings',  label: 'Settings',  icon: Settings,     shortcut: '6' },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* ---------- Sidebar ---------- */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-ink-900 text-white relative grain">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-pop">
              <Sparkles className="w-5 h-5 text-ink-900" />
            </div>
            <div>
              <div className="font-display font-semibold text-[15px] leading-tight">SA Mobiles</div>
              <div className="text-[11px] text-ink-300 uppercase tracking-wider">POS · Demo</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, shortcut }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] shrink-0 transition-colors',
                      isActive ? 'text-brand-400' : 'text-ink-400 group-hover:text-white',
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  <kbd className="hidden group-hover:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-ink-300">
                    ⌘{shortcut}
                  </kbd>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Store</div>
            <div className="text-sm font-medium">SA Mobiles</div>
            <div className="text-xs text-ink-400 mt-0.5">Ground Floor, Barkat Market</div>
          </div>
        </div>
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-ink-900 text-white border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-ink-900" />
            </div>
            <span className="font-display font-semibold">SA Mobiles</span>
          </div>
          <span className="text-[11px] text-ink-300 uppercase tracking-wider">Demo</span>
        </div>
      </div>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink-100 flex">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-brand-600' : 'text-ink-400',
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ---------- Main content ---------- */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 pb-16 lg:pt-0 lg:pb-0">
        <Outlet />
      </main>
    </div>
  )
}

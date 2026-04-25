import { Store, Printer, Globe, Bell, Info } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <header>
        <div className="text-[11px] uppercase tracking-wider text-ink-400">Preferences</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500 mt-1">
          Store information and display preferences for this demo.
        </p>
      </header>

      <div className="card p-4 lg:p-5">
        <SectionHeader icon={Store} title="Store" subtitle="Identification shown on receipts." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Store name" value="SA Mobiles" />
          <Field label="Location"   value="Ground Floor, Barkat Market" />
          <Field label="Phone"      value="0300-1234567" />
          <Field label="Currency"   value="PKR — Pakistani Rupee" />
        </div>
      </div>

      <div className="card p-4 lg:p-5">
        <SectionHeader icon={Printer} title="Receipts" subtitle="Formatting for printed and digital receipts." />
        <ToggleRow label="Print receipt automatically"   defaultOn />
        <ToggleRow label="Email receipt to customer"     />
        <ToggleRow label="Show product SKU on receipt"   defaultOn />
      </div>

      <div className="card p-4 lg:p-5">
        <SectionHeader icon={Bell} title="Notifications" />
        <ToggleRow label="Low-stock alerts"  defaultOn />
        <ToggleRow label="End-of-day summary" defaultOn />
      </div>

      <div className="card p-4 lg:p-5">
        <SectionHeader icon={Globe} title="Region" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Locale"   value="en-PK" />
          <Field label="Timezone" value="Asia/Karachi (UTC+05:00)" />
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl2 bg-ink-900 text-ink-100">
        <Info className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          This is a <strong className="text-white">frontend-only demo</strong>. All data lives in memory
          and resets when you refresh the page.
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-500 font-medium">
        {label}
      </div>
      <div className="mt-1 input bg-ink-50 text-ink-700 cursor-default">{value}</div>
    </div>
  )
}

function ToggleRow({ label, defaultOn = false }) {
  return (
    <label className="flex items-center justify-between py-2.5 border-t border-ink-100 first:border-t-0 cursor-pointer select-none">
      <span className="text-sm text-ink-800">{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
        <span className="w-9 h-5 rounded-full bg-ink-200 peer-checked:bg-brand-500 transition-colors" />
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-soft peer-checked:translate-x-4 transition-transform" />
      </span>
    </label>
  )
}

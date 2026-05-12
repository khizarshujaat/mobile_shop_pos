import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/ui/AppLayout.jsx'
import POSPage from './pages/POSPage.jsx'
import WalletPage from './pages/WalletPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* POS is the default landing screen */}
        <Route index element={<POSPage />} />
        <Route path="/pos"        element={<POSPage />} />
        <Route path="/wallet"     element={<WalletPage />} />
        <Route path="/inventory"  element={<InventoryPage />} />
        <Route path="/reports"    element={<ReportsPage />} />
        <Route path="/admin"      element={<AdminDashboardPage />} />
        <Route path="/settings"   element={<SettingsPage />} />
        <Route path="*"           element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

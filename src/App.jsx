import { lazy, Suspense } from 'react'
import { Route, Navigate, usePathname } from './router/Router'
import { AppShell } from './components/layout/AppShell'
import { useAuth } from './store/AuthProvider'
import { PageSkeleton } from './components/ui/feedback'
import { AuthLayout, Login, Register, ForgotPassword, OTP, ResetPassword } from './pages/auth/AuthPages'
import { NotFound, Forbidden } from './pages/system/SystemPages'

const Dashboard = lazy(() => import('./pages/dashboard/DashboardPages').then((m) => ({ default: m.Dashboard })))
const Analytics = lazy(() => import('./pages/dashboard/DashboardPages').then((m) => ({ default: m.Analytics })))
const ShipsList = lazy(() => import('./pages/fleet/FleetPages').then((m) => ({ default: m.ShipsList })))
const ShipDetails = lazy(() => import('./pages/fleet/FleetPages').then((m) => ({ default: m.ShipDetails })))
const ShipmentsList = lazy(() => import('./pages/shipment/ShipmentPages').then((m) => ({ default: m.ShipmentsList })))
const ShipmentDetails = lazy(() => import('./pages/shipment/ShipmentPages').then((m) => ({ default: m.ShipmentDetails })))
const CreateShipment = lazy(() => import('./pages/shipment/ShipmentPages').then((m) => ({ default: m.CreateShipment })))
const LiveTracking = lazy(() => import('./pages/tracking/TrackingPages').then((m) => ({ default: m.LiveTracking })))
const PortsList = lazy(() => import('./pages/ports/PortsPages').then((m) => ({ default: m.PortsList })))
const PortDetails = lazy(() => import('./pages/ports/PortsPages').then((m) => ({ default: m.PortDetails })))
const CustomersList = lazy(() => import('./pages/customers/CustomersPages').then((m) => ({ default: m.CustomersList })))
const CustomerProfile = lazy(() => import('./pages/customers/CustomersPages').then((m) => ({ default: m.CustomerProfile })))
const EmployeesList = lazy(() => import('./pages/employees/EmployeesPages').then((m) => ({ default: m.EmployeesList })))
const EmployeeProfile = lazy(() => import('./pages/employees/EmployeesPages').then((m) => ({ default: m.EmployeeProfile })))
const MaintenanceDashboard = lazy(() => import('./pages/maintenance/MaintenancePages').then((m) => ({ default: m.MaintenanceDashboard })))
const MaintenanceHistory = lazy(() => import('./pages/maintenance/MaintenancePages').then((m) => ({ default: m.MaintenanceHistory })))
const Payments = lazy(() => import('./pages/payments/PaymentsPages').then((m) => ({ default: m.Payments })))
const Invoices = lazy(() => import('./pages/payments/PaymentsPages').then((m) => ({ default: m.Invoices })))
const Reports = lazy(() => import('./pages/reports/ReportsPages').then((m) => ({ default: m.Reports })))
const Export = lazy(() => import('./pages/reports/ReportsPages').then((m) => ({ default: m.Export })))
const Notifications = lazy(() => import('./pages/notifications/NotificationsPage').then((m) => ({ default: m.Notifications })))
const Settings = lazy(() => import('./pages/settings/SettingsPage').then((m) => ({ default: m.Settings })))
const Support = lazy(() => import('./pages/support/SupportPages').then((m) => ({ default: m.Support })))
const FAQ = lazy(() => import('./pages/support/SupportPages').then((m) => ({ default: m.FAQ })))
const Tickets = lazy(() => import('./pages/support/SupportPages').then((m) => ({ default: m.Tickets })))
const LiveChat = lazy(() => import('./pages/support/SupportPages').then((m) => ({ default: m.LiveChat })))
const UserProfile = lazy(() => import('./pages/profile/UserProfilePage').then((m) => ({ default: m.UserProfile })))
const SearchResults = lazy(() => import('./pages/search/SearchPage').then((m) => ({ default: m.SearchResults })))

function matches(pattern, pathname) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return false
  return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i])
}

const publicRoutes = [
  { path: '/login', page: Login },
  { path: '/register', page: Register },
  { path: '/forgot', page: ForgotPassword },
  { path: '/reset', page: ResetPassword },
  { path: '/otp', page: OTP },
]

const appRoutes = [
  { path: '/dashboard', page: Dashboard, permission: 'dashboard.view' },
  { path: '/analytics', page: Analytics, permission: 'analytics.view' },
  { path: '/ships', page: ShipsList, permission: 'fleet.view' },
  { path: '/ships/:id', page: ShipDetails, permission: 'fleet.view' },
  { path: '/shipments', page: ShipmentsList, permission: 'shipment.view' },
  { path: '/shipments/new', page: CreateShipment, permission: 'shipment.manage' },
  { path: '/shipments/:id', page: ShipmentDetails, permission: 'shipment.view' },
  { path: '/tracking', page: LiveTracking, permission: 'tracking.view' },
  { path: '/ports', page: PortsList, permission: 'port.view' },
  { path: '/ports/:id', page: PortDetails, permission: 'port.view' },
  { path: '/customers', page: CustomersList, permission: 'customer.view' },
  { path: '/customers/:id', page: CustomerProfile, permission: 'customer.view' },
  { path: '/employees', page: EmployeesList, permission: 'staff.view' },
  { path: '/employees/:id', page: EmployeeProfile, permission: 'staff.view' },
  { path: '/maintenance', page: MaintenanceDashboard, permission: 'maintenance.view' },
  { path: '/maintenance/history', page: MaintenanceHistory, permission: 'maintenance.view' },
  { path: '/payments', page: Payments, permission: 'payment.view' },
  { path: '/invoices', page: Invoices, permission: 'invoice.view' },
  { path: '/reports', page: Reports, permission: 'report.view' },
  { path: '/reports/export', page: Export, permission: 'report.manage' },
  { path: '/notifications', page: Notifications, permission: 'dashboard.view' },
  { path: '/settings', page: Settings, permission: 'settings.view' },
  { path: '/support', page: Support, permission: 'dashboard.view' },
  { path: '/support/faq', page: FAQ, permission: 'dashboard.view' },
  { path: '/support/chat', page: LiveChat, permission: 'dashboard.view' },
  { path: '/support/tickets', page: Tickets, permission: 'ticket.view' },
  { path: '/profile', page: UserProfile, permission: 'dashboard.view' },
  { path: '/search', page: SearchResults, permission: 'dashboard.view' },
  { path: '/404', page: NotFound, permission: null },
]

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function Protected({ children, permission }) {
  const { isAuthenticated, hasPermission } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (permission && !hasPermission(permission)) return <Forbidden />
  return children
}

function RouteFallback() {
  return <PageSkeleton />
}

function AppRoutes() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  if (pathname === '/') {
    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
  }

  const matched = [...publicRoutes, ...appRoutes].find((route) => matches(route.path, pathname))

  if (!matched) return <NotFound />

  const { path, page: Page, permission } = matched
  const isPublic = publicRoutes.includes(matched)

  return (
    <Route
      path={path}
      element={
        isPublic ? (
          <PublicOnly>
            <AuthLayout>
              <Page />
            </AuthLayout>
          </PublicOnly>
        ) : (
          <Protected permission={permission}>
            <AppShell>
              <Suspense fallback={<RouteFallback />}>
                <Page />
              </Suspense>
            </AppShell>
          </Protected>
        )
      }
    />
  )
}

function App() {
  return <AppRoutes />
}

export default App
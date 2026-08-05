export const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', permission: 'dashboard.view' },
      { to: '/analytics', label: 'Analytics', icon: 'line-chart', permission: 'analytics.view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/ships', label: 'Ships', icon: 'ship', permission: 'fleet.view' },
      { to: '/shipments', label: 'Shipments', icon: 'package', permission: 'shipment.view' },
      { to: '/tracking', label: 'Live Tracking', icon: 'map-pin', permission: 'tracking.view' },
      { to: '/ports', label: 'Ports', icon: 'anchor', permission: 'port.view' },
    ],
  },
  {
    label: 'Relations',
    items: [
      { to: '/customers', label: 'Customers', icon: 'users', permission: 'customer.view' },
      { to: '/employees', label: 'Employees', icon: 'user', permission: 'staff.view' },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/maintenance', label: 'Maintenance', icon: 'wrench', permission: 'maintenance.view' },
      { to: '/payments', label: 'Payments', icon: 'credit-card', permission: 'payment.view' },
      { to: '/invoices', label: 'Invoices', icon: 'file-text', permission: 'invoice.view' },
      { to: '/reports', label: 'Reports', icon: 'file-chart', permission: 'report.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/notifications', label: 'Notifications', icon: 'bell', permission: 'dashboard.view' },
      { to: '/settings', label: 'Settings', icon: 'settings', permission: 'settings.view' },
      { to: '/support', label: 'Help Center', icon: 'help-circle', permission: 'dashboard.view' },
      { to: '/profile', label: 'Profile', icon: 'user', permission: 'dashboard.view' },
    ],
  },
]

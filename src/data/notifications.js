export const initialNotifications = [
  { id: 'NT-01', type: 'weather', title: 'Storm alert — Bay of Biscay', message: 'Nordic Star may encounter Force 9 conditions near Biscay. Route adjustment recommended.', time: '12 min ago', read: false },
  { id: 'NT-02', type: 'delay', title: 'SH-2402 delayed', message: 'Nile Harvest Co. shipment delayed 3 days due to port congestion in Singapore.', time: '1 hr ago', read: false },
  { id: 'NT-03', type: 'maintenance', title: 'Dock inspection due', message: 'Blue Horizon dry-dock inspection starts in 14 days. Confirm crane bookings.', time: '3 hrs ago', read: false },
  { id: 'NT-04', type: 'payment', title: 'Invoice INV-2212 outstanding', message: 'Meridian Auto Parts invoice of $412,300 is 2 days overdue.', time: '5 hrs ago', read: false },
  { id: 'NT-05', type: 'system', title: 'System maintenance', message: 'Planned platform maintenance on Sunday 02:00–04:00 UTC.', time: 'Yesterday', read: true },
  { id: 'NT-06', type: 'route', title: 'Route change approved', message: 'Pacific Meridian route updated to avoid Typhoon advisory area.', time: 'Yesterday', read: true },
  { id: 'NT-07', type: 'security', title: 'New device sign-in', message: 'New sign-in from Safari on macOS. Verify if this was you.', time: '2 days ago', read: true },
  { id: 'NT-08', type: 'report', title: 'Monthly report ready', message: 'The July operations report is available for download.', time: '2 days ago', read: true },
]

export const notificationTemplates = [
  { type: 'weather', label: 'Weather Alerts' },
  { type: 'delay', label: 'Shipment Delays' },
  { type: 'maintenance', label: 'Maintenance' },
  { type: 'payment', label: 'Payments' },
  { type: 'route', label: 'Route Updates' },
  { type: 'security', label: 'Security' },
  { type: 'system', label: 'System' },
  { type: 'report', label: 'Reports' },
]

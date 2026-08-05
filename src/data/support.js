export const faqs = [
  {
    category: 'Shipments',
    q: 'How do I create a new shipment?',
    a: 'Navigate to Shipments → Create Shipment, complete the customer, ports, cargo and vessel details, then submit for approval. The shipment appears in the register immediately after booking confirmation.',
  },
  {
    category: 'Shipments',
    q: 'What do the shipment statuses mean?',
    a: 'Pending means the booking is created but not confirmed. In Transit means the cargo is aboard a moving vessel. Delayed signals a rescheduled ETA. Delivered and Completed close the shipment lifecycle.',
  },
  {
    category: 'Tracking',
    q: 'How accurate is live tracking?',
    a: 'Positions update every 15 minutes from AIS transponders. ETA estimates combine vessel speed, weather forecasts and port congestion data and are refreshed continuously.',
  },
  {
    category: 'Fleet',
    q: 'How is fleet utilization calculated?',
    a: 'Utilization is the percentage of booked capacity across the active fleet, weighted by cargo tons and container slots, updated daily from manifest data.',
  },
  {
    category: 'Payments',
    q: 'Which payment methods are supported?',
    a: 'Bank transfer, corporate credit and card payments are supported. Invoices are generated automatically on departure and due 14 days after issue.',
  },
  {
    category: 'Account',
    q: 'How do I reset my password?',
    a: 'Use the Forgot Password flow from the login screen. A one-time verification code is sent to your email and valid for 10 minutes.',
  },
  {
    category: 'Reports',
    q: 'Can I schedule recurring report exports?',
    a: 'Yes. From the Reports page choose a frequency (daily, weekly, monthly) and the export will be emailed to recipients automatically.',
  },
  {
    category: 'Support',
    q: 'How do I open a support ticket?',
    a: 'Head to Support → Tickets and create a ticket with a category and description. High priority issues are routed to the on-call operations team within 30 minutes.',
  },
]

export const tickets = [
  { id: 'TK-901', subject: 'Port charge discrepancy on INV-2204', category: 'Billing', status: 'Open', priority: 'High', assignee: 'Rania Khoury', created: '2026-07-30', updated: '2 hrs ago', messages: 6 },
  { id: 'TK-902', subject: 'Request additional container slots', category: 'Booking', status: 'In Progress', priority: 'Medium', assignee: 'Kenji Watanabe', created: '2026-07-29', updated: 'Yesterday', messages: 4 },
  { id: 'TK-903', subject: 'Tracking feed not updating SH-2402', category: 'Technical', status: 'In Progress', priority: 'High', assignee: 'Bruno Ferreira', created: '2026-07-28', updated: 'Yesterday', messages: 8 },
  { id: 'TK-904', subject: 'Certificate of origin request', category: 'Documentation', status: 'Closed', priority: 'Low', assignee: 'Sana Qureshi', created: '2026-07-25', updated: '3 days ago', messages: 3 },
  { id: 'TK-905', subject: 'Route insurance coverage question', category: 'General', status: 'Closed', priority: 'Low', assignee: 'Marcella Silva', created: '2026-07-24', updated: '4 days ago', messages: 2 },
  { id: 'TK-906', subject: 'Damaged container report', category: 'Claims', status: 'Open', priority: 'Critical', assignee: 'Fatima Al-Zarouni', created: '2026-07-31', updated: '1 hr ago', messages: 9 },
]

export const chatMessages = [
  { id: 1, from: 'support', name: 'AquaFlow Support', text: 'Hi! Welcome to AquaFlow live support. How can we help you today?', time: '09:41', status: 'read' },
  { id: 2, from: 'user', name: 'You', text: 'Hi, I need help tracking shipment SH-2401.', time: '09:42', status: 'read' },
  { id: 3, from: 'support', name: 'AquaFlow Support', text: 'Sure! SH-2401 is aboard Aqua Orion, currently 62% of the way to Rotterdam. ETA is Aug 21.', time: '09:43', status: 'read' },
  { id: 4, from: 'user', name: 'You', text: 'Great, is there any delay risk?', time: '09:44', status: 'read' },
  { id: 5, from: 'support', name: 'AquaFlow Support', text: 'No delays detected. Weather along the route is calm and the vessel is on schedule. I can set up alerts if you prefer.', time: '09:45', status: 'read' },
  { id: 6, from: 'user', name: 'You', text: 'Yes please, alerts would help.', time: '09:46', status: 'delivered' },
]

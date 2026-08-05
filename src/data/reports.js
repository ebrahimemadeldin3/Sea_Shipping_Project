export const reportTemplates = [
  { id: 'RP-01', name: 'Operations Summary', type: 'PDF', description: 'Fleet status, active shipments, delays and port activity snapshot.', frequency: 'Weekly', lastRun: '2026-07-28', enabled: true, metrics: ['Ships', 'Shipments', 'Delays', 'Ports'] },
  { id: 'RP-02', name: 'Financial Performance', type: 'Excel', description: 'Revenue, cost, profit and outstanding receivables by customer.', frequency: 'Monthly', lastRun: '2026-08-01', enabled: true, metrics: ['Revenue', 'Cost', 'Profit', 'Receivables'] },
  { id: 'RP-03', name: 'Fleet Utilization', type: 'Excel', description: 'Capacity utilization per vessel with route and cargo breakdown.', frequency: 'Weekly', lastRun: '2026-07-27', enabled: true, metrics: ['Utilization', 'Capacity', 'Cargo'] },
  { id: 'RP-04', name: 'Maintenance Register', type: 'PDF', description: 'Completed, scheduled and overdue maintenance tasks by vessel.', frequency: 'Monthly', lastRun: '2026-07-31', enabled: false, metrics: ['Tasks', 'Cost', 'Status'] },
  { id: 'RP-05', name: 'Customer Shipment History', type: 'CSV', description: 'Per-customer shipment records, values and delivery performance.', frequency: 'On demand', lastRun: '2026-07-22', enabled: false, metrics: ['Customers', 'Shipments', 'Values'] },
  { id: 'RP-06', name: 'Fuel & Emissions', type: 'CSV', description: 'Fuel consumption and emissions data by vessel and voyage.', frequency: 'Monthly', lastRun: '2026-08-01', enabled: true, metrics: ['Fuel', 'Emissions', 'Vessels'] },
]

export const exportHistory = [
  { id: 'EX-001', report: 'Operations Summary', format: 'PDF', generated: '2026-07-28 09:14', size: '2.4 MB', status: 'Completed' },
  { id: 'EX-002', report: 'Financial Performance', format: 'Excel', generated: '2026-08-01 00:05', size: '1.1 MB', status: 'Completed' },
  { id: 'EX-003', report: 'Fuel & Emissions', format: 'CSV', generated: '2026-08-01 00:05', size: '640 KB', status: 'Completed' },
  { id: 'EX-004', report: 'Fleet Utilization', format: 'Excel', generated: '2026-07-27 10:32', size: '880 KB', status: 'Completed' },
  { id: 'EX-005', report: 'Operations Summary', format: 'PDF', generated: '2026-07-21 09:12', size: '2.2 MB', status: 'Completed' },
]

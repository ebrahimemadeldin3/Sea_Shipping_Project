export const invoices = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-0001',
    shipmentId: 'shp_demo_3',
    customerId: 'usr_demo',
    amount: 4200,
    status: 'PAID',
    issueDate: '2026-09-15T21:43:03.466Z',
    dueDate: '2026-09-29T21:43:03.466Z',
    items: [
      { description: 'Ocean Freight (Damietta to Rotterdam)', amount: 3800 },
      { description: 'Port Handling', amount: 250 },
      { description: 'Customs Clearance', amount: 150 }
    ]
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-0003',
    shipmentId: 'shp_demo_2',
    customerId: 'usr_demo',
    amount: 1850,
    status: 'UNPAID',
    issueDate: '2026-09-28T21:43:03.466Z',
    dueDate: '2026-10-13T21:43:03.466Z',
    items: [
      { description: 'Ocean Freight (Port Said to Valencia)', amount: 1600 },
      { description: 'Insurance', amount: 250 }
    ]
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-2026-0004',
    shipmentId: 'shp_demo_5',
    customerId: 'usr_demo',
    amount: 1200,
    status: 'DRAFT',
    issueDate: '2026-10-03T21:43:03.466Z',
    dueDate: '2026-10-17T21:43:03.466Z',
    items: [
      { description: 'Ocean Freight (Alexandria to Piraeus)', amount: 1000 },
      { description: 'Port Handling', amount: 200 }
    ]
  },
  {
    id: 'inv_4',
    invoiceNumber: 'INV-2026-0000',
    shipmentId: 'shp_demo_4',
    customerId: 'usr_demo',
    amount: 350,
    status: 'OVERDUE',
    issueDate: '2026-08-24T21:43:03.466Z',
    dueDate: '2026-09-23T21:43:03.466Z',
    items: [
      { description: 'Cancellation Fee', amount: 350 }
    ]
  }
];
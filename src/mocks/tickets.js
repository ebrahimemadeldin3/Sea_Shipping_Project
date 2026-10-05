export const tickets = [
  {
    id: 'tkt_1',
    subject: 'Delay in customs clearance',
    category: 'Delivery delay',
    priority: 'High',
    status: 'Open',
    shipmentId: 'SEA-2026-00019',
    customerId: 'usr_demo',
    createdAt: '2026-10-02T21:43:03.466Z',
    messages: [
      { sender: 'customer', text: 'My shipment seems stuck at customs in Port Said.', timestamp: '2026-10-02T21:43:03.466Z' },
      { sender: 'agent', text: 'We are looking into this with the local authorities. There is a minor backlog.', timestamp: '2026-10-03T09:43:03.466Z' }
    ]
  },
  {
    id: 'tkt_2',
    subject: 'Update billing address',
    category: 'Billing',
    priority: 'Low',
    status: 'Resolved',
    shipmentId: null,
    customerId: 'usr_demo',
    createdAt: '2026-09-18T21:43:03.466Z',
    messages: [
      { sender: 'customer', text: 'Please update my invoice address to the new HQ.', timestamp: '2026-09-18T21:43:03.466Z' },
      { sender: 'agent', text: 'Done! All future invoices will reflect the new address.', timestamp: '2026-09-19T21:43:03.466Z' }
    ]
  }
];
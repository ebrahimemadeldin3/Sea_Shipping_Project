const fs = require('fs');
const path = require('path');

const mocksDir = path.join(__dirname, 'src', 'mocks');
if (!fs.existsSync(mocksDir)) {
  fs.mkdirSync(mocksDir, { recursive: true });
}

const past = (days) => new Date(Date.now() - 86400000 * days).toISOString();

const users = `export const users = [
  {
    id: 'usr_admin',
    fullName: 'Navora Operations',
    email: 'admin@navora.demo',
    phone: '+1 800 555 0199',
    companyName: 'Navora Shipping',
    country: 'US',
    password: 'Admin123!',
    role: 'company',
    createdAt: '${past(30)}'
  },
  {
    id: 'usr_demo',
    fullName: 'Ebrahim',
    email: 'ebrahim@example.com',
    phone: '+20 100 123 4567',
    companyName: 'lolo',
    country: 'EG',
    password: 'password',
    role: 'customer',
    createdAt: '${past(10)}'
  }
];`;

const ports = `export const ports = {
  Egypt: ['Alexandria Port', 'Port Said', 'Damietta Port', 'Ain Sokhna Port'],
  Italy: ['Genoa Port', 'Naples', 'La Spezia'],
  Spain: ['Valencia', 'Barcelona'],
  Greece: ['Piraeus'],
  Netherlands: ['Rotterdam'],
  France: ['Marseille'],
  SaudiArabia: ['Jeddah'],
  UAE: ['Dubai']
};`;

const shipments = `export const shipments = [
  {
    id: 'shp_demo_1',
    shipmentNumber: 'SEA-2026-00023',
    customerId: 'usr_demo',
    originCountry: 'Egypt',
    originPort: 'Alexandria Port',
    destinationCountry: 'Italy',
    destinationPort: 'Genoa Port',
    cargoType: 'Electronics',
    weight: 150,
    quantity: 1,
    containerType: 'LCL',
    status: 'PENDING_REVIEW',
    estimatedPrice: 450,
    currency: 'USD',
    vessel: '',
    estimatedArrival: '',
    timeline: [
      { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: 'Pending review by operations.', timestamp: '${past(0)}' },
    ],
    createdAt: '${past(0)}',
    updatedAt: '${past(0)}',
  },
  {
    id: 'shp_demo_2',
    shipmentNumber: 'SEA-2026-00019',
    customerId: 'usr_demo',
    originCountry: 'Egypt',
    originPort: 'Port Said',
    destinationCountry: 'Spain',
    destinationPort: 'Valencia',
    cargoType: 'Textiles',
    weight: 12000,
    quantity: 1,
    containerType: '20ft Standard',
    status: 'IN_TRANSIT',
    estimatedPrice: 1850,
    currency: 'USD',
    vessel: 'MV Mediterranean',
    estimatedArrival: '${new Date(Date.now() + 86400000 * 4).toISOString()}',
    timeline: [
      { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: '', timestamp: '${past(6)}' },
      { id: 'evt_2', status: 'ACCEPTED', title: 'Request Accepted', note: '', timestamp: '${past(5)}' },
      { id: 'evt_3', status: 'IN_TRANSIT', title: 'Departed Origin Port', note: 'Vessel departed Port Said.', timestamp: '${past(2)}' },
    ],
    createdAt: '${past(6)}',
    updatedAt: '${past(2)}',
  },
  {
    id: 'shp_demo_3',
    shipmentNumber: 'SEA-2026-00015',
    customerId: 'usr_demo',
    originCountry: 'Egypt',
    originPort: 'Damietta Port',
    destinationCountry: 'Netherlands',
    destinationPort: 'Rotterdam',
    cargoType: 'Machinery Parts',
    weight: 24000,
    quantity: 2,
    containerType: '40ft High Cube',
    status: 'DELIVERED',
    estimatedPrice: 4200,
    currency: 'USD',
    vessel: 'MV Northern Star',
    estimatedArrival: '${past(1)}',
    timeline: [
      { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: '', timestamp: '${past(20)}' },
      { id: 'evt_2', status: 'ACCEPTED', title: 'Request Accepted', note: '', timestamp: '${past(19)}' },
      { id: 'evt_3', status: 'IN_TRANSIT', title: 'Departed Origin Port', note: '', timestamp: '${past(15)}' },
      { id: 'evt_4', status: 'DELIVERED', title: 'Delivered', note: 'Arrived at Rotterdam.', timestamp: '${past(1)}' },
    ],
    createdAt: '${past(20)}',
    updatedAt: '${past(1)}',
  },
  {
    id: 'shp_demo_4',
    shipmentNumber: 'SEA-2026-00010',
    customerId: 'usr_demo',
    originCountry: 'UAE',
    originPort: 'Dubai',
    destinationCountry: 'Egypt',
    destinationPort: 'Ain Sokhna Port',
    cargoType: 'Pharmaceuticals',
    weight: 5000,
    quantity: 1,
    containerType: '20ft Reefer',
    status: 'CANCELLED',
    estimatedPrice: 3100,
    currency: 'USD',
    vessel: '',
    estimatedArrival: '',
    timeline: [
      { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: '', timestamp: '${past(40)}' },
      { id: 'evt_2', status: 'REJECTED', title: 'Request Cancelled', note: 'Cancelled by customer.', timestamp: '${past(39)}' },
    ],
    createdAt: '${past(40)}',
    updatedAt: '${past(39)}',
  },
  {
    id: 'shp_demo_5',
    shipmentNumber: 'SEA-2026-00024',
    customerId: 'usr_demo',
    originCountry: 'Egypt',
    originPort: 'Alexandria Port',
    destinationCountry: 'Greece',
    destinationPort: 'Piraeus',
    cargoType: 'Furniture',
    weight: 8000,
    quantity: 1,
    containerType: '20ft Standard',
    status: 'ACCEPTED',
    estimatedPrice: 1200,
    currency: 'USD',
    vessel: 'MV Aegean Sea',
    estimatedArrival: '${new Date(Date.now() + 86400000 * 8).toISOString()}',
    timeline: [
      { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: '', timestamp: '${past(1)}' },
      { id: 'evt_2', status: 'ACCEPTED', title: 'Request Accepted', note: 'Assigned to MV Aegean Sea.', timestamp: '${past(0)}' },
    ],
    createdAt: '${past(1)}',
    updatedAt: '${past(0)}',
  }
];`;

const invoices = `export const invoices = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-0001',
    shipmentId: 'shp_demo_3',
    customerId: 'usr_demo',
    amount: 4200,
    status: 'PAID',
    issueDate: '${past(18)}',
    dueDate: '${past(4)}',
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
    issueDate: '${past(5)}',
    dueDate: '${new Date(Date.now() + 86400000 * 10).toISOString()}',
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
    issueDate: '${past(0)}',
    dueDate: '${new Date(Date.now() + 86400000 * 14).toISOString()}',
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
    issueDate: '${past(40)}',
    dueDate: '${past(10)}',
    items: [
      { description: 'Cancellation Fee', amount: 350 }
    ]
  }
];`;

const tickets = `export const tickets = [
  {
    id: 'tkt_1',
    subject: 'Delay in customs clearance',
    category: 'Delivery delay',
    priority: 'High',
    status: 'Open',
    shipmentId: 'SEA-2026-00019',
    customerId: 'usr_demo',
    createdAt: '${past(1)}',
    messages: [
      { sender: 'customer', text: 'My shipment seems stuck at customs in Port Said.', timestamp: '${past(1)}' },
      { sender: 'agent', text: 'We are looking into this with the local authorities. There is a minor backlog.', timestamp: '${past(0.5)}' }
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
    createdAt: '${past(15)}',
    messages: [
      { sender: 'customer', text: 'Please update my invoice address to the new HQ.', timestamp: '${past(15)}' },
      { sender: 'agent', text: 'Done! All future invoices will reflect the new address.', timestamp: '${past(14)}' }
    ]
  }
];`;

const notifications = `export const notifications = [
  { id: 'not_1', userId: 'usr_demo', title: 'Shipment Departed', message: 'Shipment SEA-2026-00019 departed Port Said.', type: 'shipment', relatedId: 'SEA-2026-00019', isRead: false, createdAt: '${past(2)}' },
  { id: 'not_2', userId: 'usr_demo', title: 'New Invoice', message: 'Invoice INV-2026-0003 has been issued.', type: 'invoice', relatedId: 'INV-2026-0003', isRead: false, createdAt: '${past(5)}' },
  { id: 'not_3', userId: 'usr_demo', title: 'Ticket Reply', message: 'An agent replied to your ticket about customs.', type: 'support', relatedId: 'tkt_1', isRead: true, createdAt: '${past(0.5)}' },
  { id: 'not_4', userId: 'usr_demo', title: 'Shipment Delivered', message: 'Shipment SEA-2026-00015 has arrived at Rotterdam.', type: 'shipment', relatedId: 'SEA-2026-00015', isRead: true, createdAt: '${past(1)}' }
];`;

const activity = `export const activity = [
  { id: 'act_1', userId: 'usr_demo', text: 'Shipment SEA-2026-00023 submitted for review', timestamp: '${past(0)}' },
  { id: 'act_2', userId: 'usr_demo', text: 'Shipment SEA-2026-00019 departed Port Said', timestamp: '${past(2)}' },
  { id: 'act_3', userId: 'usr_demo', text: 'Invoice INV-2026-0001 paid ($4,200)', timestamp: '${past(4)}' },
  { id: 'act_4', userId: 'usr_demo', text: 'Shipment SEA-2026-00015 delivered to Rotterdam', timestamp: '${past(1)}' },
];`;

fs.writeFileSync(path.join(mocksDir, 'users.js'), users);
fs.writeFileSync(path.join(mocksDir, 'ports.js'), ports);
fs.writeFileSync(path.join(mocksDir, 'shipments.js'), shipments);
fs.writeFileSync(path.join(mocksDir, 'invoices.js'), invoices);
fs.writeFileSync(path.join(mocksDir, 'tickets.js'), tickets);
fs.writeFileSync(path.join(mocksDir, 'notifications.js'), notifications);
fs.writeFileSync(path.join(mocksDir, 'activity.js'), activity);

console.log('Mock files generated successfully.');

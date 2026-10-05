// src/lib/seed.js
import { getStorageItem, setStorageItem, KEYS } from './storage';

export function initializeDemoData() {
  const isInitialized = getStorageItem(KEYS.INITIALIZED, false);
  
  if (isInitialized) return; // Already seeded

  console.log('Seeding Navora demo data...');

  const now = new Date().toISOString();
  const past1 = new Date(Date.now() - 86400000 * 2).toISOString(); // 2 days ago
  const past2 = new Date(Date.now() - 86400000 * 5).toISOString(); // 5 days ago

  // 1. Company Admin User
  const adminUser = {
    id: 'usr_admin',
    fullName: 'Navora Operations',
    email: 'admin@navora.demo',
    phone: '+1 800 555 0199',
    companyName: 'Navora Shipping',
    country: 'US',
    password: 'Admin123!',
    role: 'company',
    createdAt: past2,
  };

  // 2. Demo Customer User
  const customerUser = {
    id: 'usr_demo',
    fullName: 'Ahmed Mohamed',
    email: 'ahmed@example.com',
    phone: '+1 234 567 8900',
    companyName: 'Ahmed Logistics',
    country: 'EG',
    password: 'password',
    role: 'customer',
    createdAt: past2,
  };

  setStorageItem(KEYS.USERS, [adminUser, customerUser]);

  // 3. Demo Shipments
  const shipments = [
    {
      id: 'shp_demo_1',
      shipmentNumber: 'SEA-2026-00021',
      customerId: 'usr_demo',
      originCountry: 'Egypt',
      originPort: 'Alexandria Port',
      destinationCountry: 'Italy',
      destinationPort: 'Genoa Port',
      cargoType: 'Electronics',
      weight: 1200,
      quantity: 1,
      containerType: '20ft Standard',
      status: 'IN_TRANSIT',
      estimatedPrice: 2450,
      currency: 'USD',
      vessel: 'MV Navora Star',
      containerNumber: 'NVRU 428591 7',
      estimatedArrival: '2026-10-14',
      timeline: [
        { id: 'evt_3', status: 'IN_TRANSIT', title: 'Departed Origin Port', note: 'Vessel departed Alexandria.', timestamp: now },
        { id: 'evt_2', status: 'ACCEPTED', title: 'Request Accepted', note: 'Quote provided and vessel assigned.', timestamp: past1 },
        { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: 'Pending review by operations.', timestamp: past2 },
      ],
      createdAt: past2,
      updatedAt: now,
    },
    {
      id: 'shp_demo_2',
      shipmentNumber: 'SEA-2026-00022',
      customerId: 'usr_demo',
      originCountry: 'China',
      originPort: 'Shanghai',
      destinationCountry: 'United States',
      destinationPort: 'Los Angeles',
      cargoType: 'Textiles',
      weight: 4500,
      quantity: 2,
      containerType: '40ft High Cube',
      status: 'PENDING_REVIEW',
      timeline: [
        { id: 'evt_1', status: 'PENDING_REVIEW', title: 'Request Submitted', note: 'Pending review by operations.', timestamp: now },
      ],
      createdAt: now,
      updatedAt: now,
    }
  ];

  setStorageItem(KEYS.SHIPMENTS, shipments);
  setStorageItem(KEYS.NOTIFICATIONS, []);
  setStorageItem(KEYS.INITIALIZED, true);
}

export function resetNavoraDemoData() {
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.SHIPMENTS);
  localStorage.removeItem(KEYS.SESSION);
  localStorage.removeItem(KEYS.NOTIFICATIONS);
  localStorage.removeItem(KEYS.INITIALIZED);
  localStorage.removeItem('navora_invoices');
  localStorage.removeItem('navora_tickets');
  localStorage.removeItem('navora_activity');
  localStorage.removeItem('navora_settings');
  
  initializeDemoData();
  window.location.reload();
}

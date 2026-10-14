import { shipments as mockShipments } from '../mocks/shipments';
import { invoices as mockInvoices } from '../mocks/invoices';
import { tickets as mockTickets } from '../mocks/tickets';
import { activity as mockActivity } from '../mocks/activity';
import { getStorageItem, setStorageItem, KEYS as BASE_KEYS } from './storage';

// Expand keys for new data types
export const KEYS = {
  ...BASE_KEYS,
  INVOICES: 'navora_invoices',
  TICKETS: 'navora_tickets',
  ACTIVITY: 'navora_activity',
  SETTINGS: 'navora_settings'
};

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

// Helper for simulated delay
const delay = (ms = 400 + Math.random() * 400) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get from local storage, falling back to mocks if USE_MOCKS is true
function getData(key, mockData) {
  const stored = getStorageItem(key, null);
  if (stored) return stored;
  
  // If not in storage and mocks are enabled, initialize storage with mocks
  if (USE_MOCKS && mockData) {
    setStorageItem(key, mockData);
    return mockData;
  }
  return [];
}

export const api = {
  // Shipments
  async getShipments(customerId) {
    await delay();
    const all = getData(KEYS.SHIPMENTS, mockShipments);
    if (customerId) return all.filter(s => s.customerId === customerId);
    return all;
  },
  
  async getShipment(id) {
    await delay();
    return getData(KEYS.SHIPMENTS, mockShipments).find(s => s.id === id || s.shipmentNumber === id);
  },

  // Invoices
  async getInvoices(customerId) {
    await delay();
    const all = getData(KEYS.INVOICES, mockInvoices);
    if (customerId) return all.filter(i => i.customerId === customerId);
    return all;
  },

  async updateInvoiceStatus(id, status) {
    await delay();
    const all = getData(KEYS.INVOICES, mockInvoices);
    const updated = all.map(i => i.id === id ? { ...i, status } : i);
    setStorageItem(KEYS.INVOICES, updated);
    return updated.find(i => i.id === id);
  },

  // Tickets
  async getTickets(customerId) {
    await delay();
    const all = getData(KEYS.TICKETS, mockTickets);
    if (customerId) return all.filter(t => t.customerId === customerId);
    return all;
  },

  async createTicket(ticket) {
    await delay();
    const all = getData(KEYS.TICKETS, mockTickets);
    const newTicket = { ...ticket, id: `tkt_${Date.now()}`, status: 'Open', createdAt: new Date().toISOString(), messages: [] };
    setStorageItem(KEYS.TICKETS, [newTicket, ...all]);
    return newTicket;
  },
  
  async replyToTicket(id, sender, text) {
    await delay();
    const all = getData(KEYS.TICKETS, mockTickets);
    const updated = all.map(t => {
      if (t.id === id) {
        return { ...t, messages: [...t.messages, { sender, text, timestamp: new Date().toISOString() }] };
      }
      return t;
    });
    setStorageItem(KEYS.TICKETS, updated);
  },

  // Activity
  async getActivity(userId) {
    await delay();
    const all = getData(KEYS.ACTIVITY, mockActivity);
    if (userId) return all.filter(a => a.userId === userId);
    return all;
  },

  async logActivity(userId, text) {
    const all = getData(KEYS.ACTIVITY, mockActivity);
    const newAct = { id: `act_${Date.now()}`, userId, text, timestamp: new Date().toISOString() };
    setStorageItem(KEYS.ACTIVITY, [newAct, ...all]);
  }
};

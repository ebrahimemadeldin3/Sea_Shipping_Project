import { ships as seedShips } from '../../data/ships'
import { shipments as seedShipments } from '../../data/shipments'
import { ports as seedPorts } from '../../data/ports'
import { customers as seedCustomers } from '../../data/customers'
import { employees as seedEmployees } from '../../data/employees'
import { maintenanceTasks, maintenanceHistory as seedMaintenanceHistory } from '../../data/maintenance'
import { payments as seedPayments, invoices as seedInvoices } from '../../data/finance'
import { initialNotifications as seedNotifications } from '../../data/notifications'
import { faqs as seedFaqs, tickets as seedTickets, chatMessages as seedChat } from '../../data/support'
import { reportTemplates as seedReports, exportHistory as seedExports } from '../../data/reports'

export const COLLECTIONS = [
  'users',
  'ships',
  'shipments',
  'ports',
  'customers',
  'employees',
  'maintenance',
  'maintenanceHistory',
  'payments',
  'invoices',
  'notifications',
  'tickets',
  'chatMessages',
  'faqs',
  'reportTemplates',
  'exportHistory',
  'activity',
  'documents',
]

export function buildSeed() {
  return {
    users: buildUsers(),
    ships: clone(seedShips),
    shipments: clone(seedShipments),
    ports: clone(seedPorts),
    customers: clone(seedCustomers),
    employees: clone(seedEmployees),
    maintenance: clone(maintenanceTasks),
    maintenanceHistory: clone(seedMaintenanceHistory),
    payments: clone(seedPayments),
    invoices: clone(seedInvoices),
    notifications: clone(seedNotifications),
    tickets: clone(seedTickets),
    chatMessages: clone(seedChat),
    faqs: clone(seedFaqs),
    reportTemplates: clone(seedReports),
    exportHistory: clone(seedExports),
    activity: buildSeedActivity(seedCustomers, seedShipments),
    documents: [],
  }
}

function clone(list) {
  return list.map((item) => JSON.parse(JSON.stringify(item)))
}

function buildUsers() {
  return [
    {
      id: 'usr-001',
      name: 'Amira Nasser',
      email: 'amira@aquaflow.com',
      password: 'admin123',
      role: 'admin',
      department: 'Operations',
      title: 'Operations Director',
      phone: '+1 (555) 012-7788',
      location: 'Dubai, UAE',
      joinedAt: '2021-03-14',
      avatar: 'AN',
      employeesId: 'EMP-101',
      permissions: ['admin', 'fleet.manage', 'finance.manage', 'staff.manage', 'report.manage', 'settings.manage'],
    },
    {
      id: 'usr-002',
      name: 'Rania Khoury',
      email: 'rania@aquaflow.com',
      password: 'manager123',
      role: 'manager',
      department: 'Finance',
      title: 'Finance Manager',
      phone: '+966 50 992 3310',
      location: 'Riyadh, SA',
      joinedAt: '2021-11-02',
      avatar: 'RK',
      employeesId: 'EMP-105',
      permissions: ['finance.manage', 'staff.view', 'report.view', 'customer.view'],
    },
    {
      id: 'usr-003',
      name: 'Kenji Watanabe',
      email: 'kenji@aquaflow.com',
      password: 'employee123',
      role: 'employee',
      department: 'Sales',
      title: 'Account Executive',
      phone: '+81 90 1188 4402',
      location: 'Tokyo, JP',
      joinedAt: '2022-09-12',
      avatar: 'KW',
      employeesId: 'EMP-107',
      permissions: ['customer.manage', 'shipment.view', 'fleet.view', 'ticket.manage'],
    },
    {
      id: 'usr-004',
      name: 'Bruno Ferreira',
      email: 'bruno@aquaflow.com',
      password: 'employee123',
      role: 'employee',
      department: 'Operations',
      title: 'Senior Data Analyst',
      phone: '+55 11 9920 1188',
      location: 'São Paulo, BR',
      joinedAt: '2023-02-01',
      avatar: 'BF',
      employeesId: 'EMP-109',
      permissions: ['fleet.view', 'shipment.view', 'report.view'],
    },
    {
      id: 'usr-005',
      name: 'Hana Al-Mansouri',
      email: 'hana@bluewave-trading.com',
      password: 'customer123',
      role: 'customer',
      department: 'Customer',
      title: 'Procurement Director',
      phone: '+971 50 411 2280',
      location: 'Dubai, UAE',
      joinedAt: '2021-05-12',
      avatar: 'HA',
      customersId: 'CU-001',
      permissions: ['shipment.view'],
    },
  ]
}

function buildSeedActivity(customers, shipments) {
  const now = Date.now()
  const day = 86400000
  const log = []
  const push = (action, detail, offsetDays) => log.push({ id: `ACT-${log.length + 1}`, action, detail, time: `${timeAgo(offsetDays)}`, ts: now - offsetDays * day })
  push('System seeded', 'AquaFlow demo database initialised with realistic operations data.', 0)
  push('Ops review', `${shipments.length} active shipments across the network.`, 0)
  push('Fleet check', `${seedShips.length} vessels reported position via AIS.`, 1)
  push('Customer onboard', `${customers[0].name} renewed annual shipping contract.`, 3)
  push('Report exported', 'July operations summary generated as PDF.', 5)
  return log
}

function timeAgo(days) {
  if (days === 0) return 'Just now'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}
/* eslint-disable react/only-export-components */
import { createContext, useContext, useMemo } from 'react'
import * as db from '../services/storage'
import { useDatabase } from '../services/storage/useDatabase'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const api = useDatabase()
  const analytics = useMemo(() => db.computeAnalytics(api), [api])

  const context = useMemo(
    () => ({
      ...api,
      analytics,
      ships: api.ships,
      shipments: api.shipments,
      ports: api.ports,
      customers: api.customers,
      employees: api.employees,
      maintenance: api.maintenance,
      notifications: api.notifications,
      activity: api.activity,
      addShipment: (shipment) =>
        db.insert('shipments', { id: `SH-${Date.now().toString().slice(-4)}`, progress: 0, ...shipment }),
      updateShip: (id, patch) => db.update('ships', id, patch),
      updateMaintenance: (id, patch) => db.update('maintenance', id, patch),
      addCustomer: (customer) => db.insert('customers', customer),
      updateCustomer: (id, patch) => db.update('customers', id, patch),
      removeCustomer: (id) => db.remove('customers', id),
      addEmployee: (employee) => db.insert('employees', employee),
      updateEmployee: (id, patch) => db.update('employees', id, patch),
      removeEmployee: (id) => db.remove('employees', id),
      addShip: (ship) => db.insert('ships', ship),
      removeShip: (id) => db.remove('ships', id),
      addPort: (port) => db.insert('ports', port),
      updatePort: (id, patch) => db.update('ports', id, patch),
      removePort: (id) => db.remove('ports', id),
      addTask: (task) => db.insert('maintenance', task),
      removeTask: (id) => db.remove('maintenance', id),
      addPayment: (payment) => db.insert('payments', payment),
      updatePayment: (id, patch) => db.update('payments', id, patch),
      addInvoice: (invoice) => db.insert('invoices', invoice),
      updateInvoice: (id, patch) => db.update('invoices', id, patch),
      addTicket: (ticket) => db.insert('tickets', ticket),
      updateTicket: (id, patch) => db.update('tickets', id, patch),
      removeTicket: (id) => db.remove('tickets', id),
      addDocument: (doc) => db.insert('documents', doc),
      removeDocument: (id) => db.remove('documents', id),
      addExport: (record) => db.insert('exportHistory', record),
      addReport: (report) => db.insert('reportTemplates', report),
      updateReport: (id, patch) => db.update('reportTemplates', id, patch),
      removeReport: (id) => db.remove('reportTemplates', id),
      addNotification: (notification) =>
        db.insert('notifications', { read: false, time: 'Just now', ...notification }),
      markNotificationRead: (id) => db.update('notifications', id, { read: true }),
      markAllNotificationsRead: () =>
        db.updateMany('notifications', (n) => !n.read, { read: true }),
      removeNotification: (id) => db.remove('notifications', id),
      logActivity: (action, detail) =>
        db.insert('activity', {
          id: `ACT-${Date.now()}`,
          action,
          detail,
          time: 'Just now',
          ts: Date.now(),
        }),
      resetDatabase: () => {
        db.resetDatabase()
      },
    }),
    [api, analytics],
  )

  return <DataContext.Provider value={context}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}

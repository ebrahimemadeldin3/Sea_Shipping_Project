import {
  revenueSeries as baselineRevenue,
  deliverySeries as baselineDeliveries,
  customerGrowth as baselineCustomers,
} from '../../data/finance'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseMoney(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(num) ? num : 0
}

function monthIndex(dateStr) {
  if (!dateStr) return -1
  return new Date(dateStr).getMonth()
}

function monthlySeries(items, keyForValue, keyForDate) {
  const buckets = MONTHS.map(() => 0)
  items.forEach((item) => {
    const idx = monthIndex(item[keyForDate])
    if (idx >= 0) buckets[idx] += keyForValue(item)
  })
  return buckets.map((value, i) => ({ month: MONTHS[i], value: Math.round(value * 100) / 100 }))
}

// Merge a sparse live-computed monthly series with a realistic baseline profile.
// The seed database only holds a handful of recent records; the baseline keeps
// charts populated across the full year while live records nudge the current
// months, so figures stay believable but still react to real changes.
function mergeSeries(base, live, key, scale = 1) {
  return base.map((item, i) => {
    const add = live[i]?.value ?? 0
    return { ...item, [key]: Math.round((item[key] + add * scale) * 100) / 100 }
  })
}

function sumSeries(series, key) {
  return series.reduce((sum, d) => sum + (d[key] ?? 0), 0)
}

export function computeAnalytics(db) {
  const shipments = db.shipments || []
  const customers = db.customers || []
  const employees = db.employees || []
  const ships = db.ships || []
  const payments = db.payments || []
  const maintenance = db.maintenance || []
  const ports = db.ports || []
  const maintenanceHistory = db.maintenanceHistory || []

  const statusDistribution = {}
  shipments.forEach((s) => {
    statusDistribution[s.status] = (statusDistribution[s.status] || 0) + 1
  })

  const revenueSeries = mergeSeries(
    baselineRevenue.map((d) => ({ month: d.month, value: d.revenue })),
    monthlySeries(payments, (p) => parseMoney(p.amount) / 1000000, 'date'),
    'value',
  )
  const costSeries = mergeSeries(
    baselineRevenue.map((d) => ({ month: d.month, value: d.cost })),
    monthlySeries(shipments, (s) => (parseMoney(s.cost) / 1000000) * 0.55, 'departure'),
    'value',
  )

  const deliverySeries = mergeSeries(
    baselineDeliveries,
    monthlySeries(shipments, (s) => (s.status === 'Completed' || s.status === 'Delivered' ? 1 : 0), 'departure'),
    'deliveries',
  )

  const customerGrowth = mergeSeries(
    baselineCustomers,
    monthlySeries(customers, () => 1, 'joined'),
    'customers',
  )

  const cargoTypes = {}
  shipments.forEach((s) => {
    const key = s.type || 'Other'
    cargoTypes[key] = (cargoTypes[key] || 0) + 1
  })

  const paymentMethods = {}
  payments.forEach((p) => {
    paymentMethods[p.method] = (paymentMethods[p.method] || 0) + parseMoney(p.amount)
  })

  const avgUtilization = ships.length ? Math.round(ships.reduce((sum, s) => sum + (Number(s.utilization) || 0), 0) / ships.length) : 0

  const departments = {}
  employees.forEach((e) => {
    departments[e.department] = (departments[e.department] || 0) + 1
  })

  const maintenanceCost = monthlySeries(maintenanceHistory, (m) => parseMoney(m.cost) / 1000, 'completed')
  maintenanceCost.forEach((d) => (d.cost = d.value))
  maintenanceCost.forEach((d) => delete d.value)

  const openTasks = maintenance.filter((m) => m.status !== 'Completed').length
  const totalShipmentValue = shipments.reduce((sum, s) => sum + parseMoney(s.cost), 0)
  const outstanding = payments
    .filter((p) => p.status === 'Pending' || p.status === 'Processing' || p.status === 'Overdue')
    .reduce((sum, p) => sum + parseMoney(p.amount), 0)

  const toM = (n) => Math.round((n / 1000000) * 10) / 10

  const fuelConsumption = [
    { month: 'Jan', consumption: 820 },
    { month: 'Feb', consumption: 780 },
    { month: 'Mar', consumption: 940 },
    { month: 'Apr', consumption: 910 },
    { month: 'May', consumption: 1010 },
    { month: 'Jun', consumption: 1180 },
    { month: 'Jul', consumption: 1260 },
    { month: 'Aug', consumption: 1320 },
  ]

  const currentMonthIdx = Math.min(new Date().getMonth(), revenueSeries.length - 1)
  const revenueYtd = Math.round(sumSeries(revenueSeries, 'value') * 10) / 10
  const operatingCost = Math.round(sumSeries(costSeries, 'value') * 10) / 10
  const profit = Math.round((revenueYtd - operatingCost) * 10) / 10
  const profitMargin = Math.round((profit / Math.max(revenueYtd, 1)) * 1000) / 10
  const completedDeliveries = Math.round(sumSeries(deliverySeries, 'deliveries'))
  const customerCount = Math.round(customerGrowth[customerGrowth.length - 1]?.customers ?? baselineCustomers[baselineCustomers.length - 1].customers)

  return {
    ships: ships.length,
    activeShipments: shipments.filter((s) => !['Completed', 'Delivered', 'Cancelled'].includes(s.status)).length,
    totalShipments: shipments.length,
    completedDeliveries,
    monthlyRevenue: Math.round(revenueSeries[currentMonthIdx].value * 10) / 10,
    revenueYtd,
    operatingCost,
    profit,
    profitMargin,
    paymentsCount: payments.length,
    customers: customerCount,
    employees: employees.length,
    ports: ports.length,
    openMaintenance: openTasks,
    delayed: shipments.filter((s) => s.status === 'Delayed').length,
    pending: shipments.filter((s) => s.status === 'Pending').length,
    inTransit: shipments.filter((s) => s.status === 'In Transit').length,
    fleetUtilization: avgUtilization,
    shipmentValue: Math.round(totalShipmentValue / 1000000),
    outstanding: toM(outstanding),
    revenueSeries,
    costSeries,
    deliverySeries,
    customerGrowth,
    fuelConsumption,
    paymentMethodSplit: Object.entries(paymentMethods).map(([label, value]) => ({ label, value: Math.round(value / 1000) })),
    statusDistribution: Object.entries(statusDistribution).map(([label, value]) => ({ label, value })),
    cargoDistribution: Object.entries(cargoTypes).map(([label, value]) => ({ label, value })),
    employeeDistribution: Object.entries(departments).map(([label, value]) => ({ label, value })),
    portActivity: ports.map((p) => ({ label: p.name.replace(/^Port of /, ''), value: p.traffic })),
    maintenanceCostSeries: maintenanceCost,
    profitTrend: revenueSeries.map((d, i) => ({ month: d.month, profit: Math.round((d.value - (costSeries[i]?.value || 0)) * 100) / 100 })),
  }
}

export { parseMoney }

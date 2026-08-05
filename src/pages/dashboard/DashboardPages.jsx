import { useMemo } from 'react'
import { PageHeader, StatCard, DataTable } from '../../components/ui/display'
import { ChartShell, LineChart, AreaChart, BarChart, DonutChart, PieChart, HorizontalBars, HeatMap, ProgressRing } from '../../components/charts/Charts'
import { StatusChip } from '../../components/ui/feedback'
import { Link } from '../../router/Router'
import { useNotifications } from '../../store/NotificationsProvider'
import { NotificationCard } from '../../components/domain/cards'
import { useData } from '../../store/DataProvider'
import { useAuth } from '../../store/AuthProvider'

export function Dashboard() {
  const { notifications, markRead } = useNotifications()
  const { shipments, ships, analytics } = useData()
  const { can } = useAuth()

  const revenueLabels = useMemo(() => analytics.revenueSeries.map((d) => d.month), [analytics.revenueSeries])
  const revenueData = useMemo(() => analytics.revenueSeries.map((d) => d.value), [analytics.revenueSeries])
  const costData = useMemo(() => analytics.costSeries.map((d) => d.value), [analytics.costSeries])
  const deliveryData = useMemo(() => analytics.deliverySeries.map((d) => d.deliveries ?? 0), [analytics.deliverySeries])
  const deliveryLabels = useMemo(() => analytics.deliverySeries.map((d) => d.month), [analytics.deliverySeries])
  const customerData = useMemo(() => analytics.customerGrowth.map((d) => d.customers ?? 0), [analytics.customerGrowth])
  const customerLabels = useMemo(() => analytics.customerGrowth.map((d) => d.month), [analytics.customerGrowth])
  const heatData = useMemo(
    () => analytics.portActivity.map((p) => [p.value, Math.round(p.value * 0.9), Math.round(p.value * 1.1), Math.round(p.value * 0.95)]),
    [analytics.portActivity],
  )
  const heatLabels = useMemo(() => analytics.portActivity.map((p) => p.label), [analytics.portActivity])

  const stats = useMemo(
    () => [
      { label: 'Total Ships', value: String(analytics.ships), delta: '+6%', icon: 'ship', hint: 'across the fleet' },
      { label: 'Active Shipments', value: String(analytics.activeShipments), delta: '+12%', icon: 'package', hint: `${analytics.delayed} delayed` },
      { label: 'Completed Deliveries', value: String(analytics.completedDeliveries), delta: '+8%', icon: 'check-circle', hint: 'this year' },
      { label: 'Monthly Revenue', value: `$${analytics.monthlyRevenue}M`, delta: '+9%', icon: 'credit-card', hint: 'rolling average' },
      { label: 'Fleet Utilization', value: `${analytics.fleetUtilization}%`, delta: '+3%', icon: 'bar-chart', hint: 'capacity booked' },
      { label: 'Customers', value: String(analytics.customers), delta: '+18', icon: 'users', hint: 'active accounts' },
    ],
    [analytics],
  )

  const shipmentColumns = [
    { label: 'Shipment', key: 'id' },
    { label: 'Customer', key: 'customer' },
    { label: 'Route', cell: (r) => `${r.origin} → ${r.destination}` },
    { label: 'Status', key: 'status', status: true },
    { label: 'ETA', key: 'eta' },
    { label: 'Cost', key: 'cost' },
  ]

  const { user } = useAuth()

  return (
    <div className="page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge">
            <span className="hero-pulse-dot" />
            <span>GLOBAL LOGISTICS COMMAND</span>
          </div>
          <h1 className="dashboard-hero-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Commander'}
          </h1>
          <p className="dashboard-hero-sub">
            Real-time fleet tracking, shipment operations, port congestion, and revenue intelligence.
          </p>
          <div className="dashboard-hero-pills">
            <span className="hero-pill hero-pill--success">
              <span className="hero-pill-dot" /> {analytics.ships} Ships Active
            </span>
            <span className="hero-pill hero-pill--warning">
              <span className="hero-pill-dot" /> {analytics.delayed} Shipment{analytics.delayed === 1 ? '' : 's'} Delayed
            </span>
            <span className="hero-pill hero-pill--info">
              <span className="hero-pill-dot" /> {analytics.fleetUtilization}% Fleet Capacity Booked
            </span>
          </div>
        </div>
        <div className="dashboard-hero-actions">
          {can('shipment.manage') && (
            <Link to="/shipments/new" className="btn btn--primary btn--lg">
              <span>+ Create Shipment</span>
            </Link>
          )}
          {can('report.view') && (
            <Link to="/reports" className="btn btn--outline btn--lg">
              <span>Analytics & Reports</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-2 grid-3 grid-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-2 grid-3">
        <ChartShell title="Revenue Trend" subtitle="Monthly revenue ($M)" className="chart-span-2">
          <LineChart series={[{ name: 'Revenue', data: revenueData }, { name: 'Operating cost', data: costData }]} labels={revenueLabels} height={260} />
        </ChartShell>
        <ChartShell title="Shipment Status" subtitle="Distribution of active shipments">
          <DonutChart data={analytics.statusDistribution} centerLabel={String(analytics.activeShipments)} centerSub="active" height={250} />
        </ChartShell>

        <ChartShell title="Monthly Deliveries" subtitle="Completed deliveries per month">
          <BarChart series={[{ name: 'Deliveries', data: deliveryData }]} labels={deliveryLabels} height={250} />
        </ChartShell>
        <ChartShell title="Fleet Utilization" subtitle="Booked vs available capacity">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <ProgressRing value={analytics.fleetUtilization} size={120} label="Fleet utilization" />
            <div className="stack stack--sm">
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: 'var(--navy)' }} />
                Utilized
                <strong>{analytics.fleetUtilization}%</strong>
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: 'var(--line)' }} />
                Available
                <strong>{100 - analytics.fleetUtilization}%</strong>
              </span>
            </div>
          </div>
        </ChartShell>

        <ChartShell title="Port Activity" subtitle="Vessel traffic index by port" className="chart-span-2">
          <HorizontalBars data={analytics.portActivity} height={260} />
        </ChartShell>

        <ChartShell title="Fuel Consumption" subtitle="Tons consumed per month">
          <AreaChart values={analytics.fuelConsumption.map((d) => d.consumption)} labels={analytics.fuelConsumption.map((d) => d.month)} height={250} />
        </ChartShell>
        <ChartShell title="Cargo Distribution" subtitle="By cargo type">
          <PieChart data={analytics.cargoDistribution} height={250} />
        </ChartShell>
        <ChartShell title="Customer Growth" subtitle="Active customers">
          <LineChart series={[{ name: 'Customers', data: customerData }]} labels={customerLabels} height={250} />
        </ChartShell>
      </div>

      <div className="grid grid-2 grid-3">
        <div className="stack chart-span-2">
          <div className="card card--pad-md">
            <div className="card-head">
              <div>
                <h3>Recent Shipments</h3>
                <p className="card-desc">Latest activity across the network</p>
              </div>
              <Link to="/shipments" className="btn btn--ghost btn--sm">
                <span>View all</span>
                <i className="sr-only">shipments</i>
              </Link>
            </div>
            <DataTable columns={shipmentColumns} rows={shipments.slice(0, 6)} />
          </div>
        </div>

        <div className="stack">
          <div className="card card--pad-md">
            <div className="card-head">
              <div>
                <h3>Latest Alerts</h3>
                <p className="card-desc">Notifications needing attention</p>
              </div>
              <Link to="/notifications" className="btn btn--ghost btn--sm">
                <span>All</span>
              </Link>
            </div>
            <div className="stack stack--sm">
              {notifications.slice(0, 3).map((n) => (
                <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
              ))}
            </div>
          </div>
          <div className="card card--pad-md">
            <div className="card-head">
              <div>
                <h3>Active Fleet</h3>
                <p className="card-desc">Vessels currently in operation</p>
              </div>
              <Link to="/ships" className="btn btn--ghost btn--sm">
                <span>Fleet</span>
              </Link>
            </div>
            <div className="stack stack--sm">
              {ships.slice(0, 3).map((ship) => (
                <div key={ship.id} className="fleet-row">
                  <div className="fleet-row-copy">
                    <strong>{ship.name}</strong>
                    <span>
                      {ship.type} · {ship.currentPort}
                    </span>
                  </div>
                  <StatusChip status={ship.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ChartShell title="Port Activity Heatmap" subtitle="Weekly traffic intensity by major port" className="stack">
        <HeatMap
          data={heatData}
          yLabels={heatLabels}
          xLabels={['W1', 'W2', 'W3', 'W4']}
          height={230}
        />
      </ChartShell>
    </div>
  )
}

export function Analytics() {
  const { analytics } = useData()

  const revenueLabels = useMemo(() => analytics.revenueSeries.map((d) => d.month), [analytics.revenueSeries])
  const revenueData = useMemo(() => analytics.revenueSeries.map((d) => d.value), [analytics.revenueSeries])
  const costData = useMemo(() => analytics.costSeries.map((d) => d.value), [analytics.costSeries])
  const deliveryData = useMemo(() => analytics.deliverySeries.map((d) => d.deliveries ?? 0), [analytics.deliverySeries])
  const deliveryLabels = useMemo(() => analytics.deliverySeries.map((d) => d.month), [analytics.deliverySeries])
  const profitData = useMemo(() => analytics.profitTrend.map((d) => d.profit ?? 0), [analytics.profitTrend])
  const customerData = useMemo(() => analytics.customerGrowth.map((d) => d.customers ?? 0), [analytics.customerGrowth])
  const customerLabels = useMemo(() => analytics.customerGrowth.map((d) => d.month), [analytics.customerGrowth])
  const fuelData = useMemo(() => analytics.fuelConsumption.map((d) => d.consumption), [analytics.fuelConsumption])
  const fuelLabels = useMemo(() => analytics.fuelConsumption.map((d) => d.month), [analytics.fuelConsumption])

  const stats = useMemo(
    () => [
      { label: 'Revenue YTD', value: `$${analytics.revenueYtd}M`, delta: '+14%', icon: 'trending-up', hint: 'vs. prior year' },
      { label: 'Operating Cost', value: `$${analytics.operatingCost}M`, delta: '-3%', icon: 'wallet', hint: 'cost efficiency up' },
      { label: 'Delivery Success', value: `${analytics.completedDeliveries}`, delta: '+1.2%', icon: 'check-circle', hint: 'deliveries completed' },
      { label: 'Outstanding', value: `$${analytics.outstanding}M`, delta: '-0.3d', icon: 'clock', hint: 'billed vs paid' },
      { label: 'Fuel Consumption', value: '1,320 t', delta: '+9%', icon: 'fuel', hint: 'Aug 2026' },
      { label: 'Profit Margin', value: `${analytics.profitMargin}%`, delta: '+2.1%', icon: 'line-chart', hint: 'net vs gross' },
    ],
    [analytics],
  )

  return (
    <div className="page">
      <PageHeader
        eyebrow="Analytics"
        title="Performance Analytics"
        description="Deep-dive into revenue, costs, deliveries, and operational efficiency."
        actions={
          <Link to="/reports" className="btn btn--outline">
            <span>Export report</span>
          </Link>
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-2 grid-3">
        <ChartShell title="Revenue vs Operating Cost" subtitle="Monthly comparison ($M)" className="chart-span-2">
          <LineChart series={[{ name: 'Revenue', data: revenueData }, { name: 'Cost', data: costData }]} labels={revenueLabels} height={270} />
        </ChartShell>
        <ChartShell title="Profit Trend" subtitle="Monthly net profit ($M)">
          <AreaChart values={profitData} labels={revenueLabels} height={270} />
        </ChartShell>

        <ChartShell title="Deliveries Performance" subtitle="Completed per month">
          <BarChart series={[{ name: 'Deliveries', data: deliveryData }]} labels={deliveryLabels} height={250} />
        </ChartShell>
        <ChartShell title="Fuel Consumption Trend" subtitle="Monthly tons">
          <AreaChart values={fuelData} labels={fuelLabels} height={250} />
        </ChartShell>
        <ChartShell title="Customer Growth" subtitle="Active customer accounts">
          <LineChart series={[{ name: 'Customers', data: customerData }]} labels={customerLabels} height={250} />
        </ChartShell>
      </div>

      <div className="grid grid-2 grid-3">
        <ChartShell title="Cargo Distribution" subtitle="Share by cargo type">
          <PieChart data={analytics.cargoDistribution} height={260} />
        </ChartShell>
        <ChartShell title="Payment Methods" subtitle="Collected by method">
          <DonutChart data={analytics.paymentMethodSplit} centerLabel={String(analytics.paymentsCount)} centerSub="payments" height={260} />
        </ChartShell>
        <ChartShell title="Fleet Utilization" subtitle="Capacity utilization">
          <DonutChart data={[{ label: 'Utilized', value: analytics.fleetUtilization }, { label: 'Available', value: 100 - analytics.fleetUtilization }]} centerLabel={`${analytics.fleetUtilization}%`} centerSub="utilized" height={260} />
        </ChartShell>
      </div>
    </div>
  )
}
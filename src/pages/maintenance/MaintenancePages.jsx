import { PageHeader, Card, StatCard, DataTable } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination, Breadcrumbs } from '../../components/ui/navigation'
import { StatusChip, Badge, ProgressBar, EmptyState } from '../../components/ui/feedback'
import { AreaChart, BarChart, ProgressRing } from '../../components/charts/Charts'
import { Calendar } from '../../components/domain/Timeline'
import { useData } from '../../store/DataProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import { useAuth } from '../../store/AuthProvider'
import { maintenanceHistory, maintenanceCostSeries } from '../../data'
import Icon from '../../components/Icon'

const statusOptions = ['All', 'Scheduled', 'In Progress', 'Completed', 'Pending', 'Overdue']

export function MaintenanceDashboard() {
  const { maintenance } = useData()
  const { can } = useAuth()
  const {
    search,
    setSearch,
    filters,
    setFilter,
    page,
    setPage,
    pageSize,
    pageItems,
    totalPages,
    total,
  } = useTableQuery(maintenance, {
    searchFields: ['ship', 'type'],
    filters: { status: 'All' },
    pageSize: 8,
  })

  const calendarEvents = maintenance.map((m) => ({ date: m.scheduledDate, type: 'maintenance', label: `${m.ship} — ${m.type}` }))

  const columns = [
    { label: 'Task', key: 'id' },
    { label: 'Ship', key: 'ship' },
    { label: 'Type', key: 'type' },
    { label: 'Status', key: 'status', status: true },
    { label: 'Priority', cell: (r) => <Badge tone={r.priority === 'Critical' ? 'danger' : r.priority === 'High' ? 'warning' : 'info'}>{r.priority}</Badge> },
    { label: 'Due', key: 'dueDate' },
    { label: 'Progress', cell: (r) => <div className="table-progress"><ProgressBar value={r.progress} size="sm" /></div> },
    { label: 'Cost', key: 'cost' },
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Fleet maintenance"
        title="Maintenance Dashboard"
        description="Scheduling, service status, and inspections across the fleet."
        breadcrumbs={[{ label: 'Business' }, { label: 'Maintenance' }]}
        actions={
          can('maintenance.manage') ? (
            <button type="button" className="btn btn--primary">
              <Icon name="plus" size={17} />
              <span>Schedule task</span>
            </button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Open Tasks" value={maintenance.length} delta="+4" icon="wrench" hint="across fleet" />
        <StatCard label="In Progress" value={maintenance.filter((m) => m.status === 'In Progress').length} icon="clock" hint="being worked" />
        <StatCard label="Overdue" value={maintenance.filter((m) => m.status === 'Overdue').length} delta="-1" icon="alert-triangle" hint="critical: 1" />
        <StatCard label="YTD Cost" value="$342K" delta="+9%" icon="credit-card" hint="maintenance spend" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Maintenance Cost Trend" eyebrow="Monthly spend ($K)" className="chart-span-2">
          <AreaChart values={maintenanceCostSeries.map((d) => d.cost)} labels={maintenanceCostSeries.map((d) => d.month)} height={250} />
        </Card>
        <Card title="Fleet Health" eyebrow="Overall readiness">
          <div style={{ display: 'grid', placeItems: 'center', gap: 12 }}>
            <ProgressRing value={84} size={130} label="Fleet health" color="var(--success)" />
            <p className="field-hint">84% of vessels ready for deployment</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-2 grid-3">
        <div className="stack chart-span-2">
          <div className="toolbar">
            <SearchBar value={search} onChange={setSearch} placeholder="Search ship or task…" />
            <Dropdown label="Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={statusOptions.map((s) => ({ value: s, label: s }))} icon="filter" />
          </div>
          <Card padding="none" bodyClassName="stack">
            {pageItems.length === 0 ? (
              <EmptyState icon="wrench" title="No maintenance tasks found" description="Adjust your search or filters." />
            ) : (
              <DataTable columns={columns} rows={pageItems} />
            )}
          </Card>
<Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
        <div className="stack">
          <Calendar events={calendarEvents} />
          <Card title="Service Queue" eyebrow="Next up">
            <div className="stack stack--sm">
              {maintenance.filter((m) => m.status !== 'Completed').slice(0, 4).map((m) => (
                <div key={m.id} className="queue-row">
                  <div className="fleet-row-copy">
                    <strong>{m.type}</strong>
                    <span>{m.ship} · due {m.dueDate}</span>
                  </div>
                  <StatusChip status={m.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function MaintenanceHistory() {
  const {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    pageItems,
    totalPages,
    total,
  } = useTableQuery(maintenanceHistory, {
    searchFields: ['ship', 'type'],
    pageSize: 8,
  })

  const columns = [
    { label: 'Reference', key: 'id' },
    { label: 'Ship', key: 'ship' },
    { label: 'Service', key: 'type' },
    { label: 'Completed', key: 'completed' },
    { label: 'Duration', key: 'duration' },
    { label: 'Result', cell: (r) => <Badge tone={r.result === 'Passed' ? 'success' : 'warning'} icon={r.result === 'Passed' ? 'check-circle' : 'alert-triangle'}>{r.result}</Badge> },
    { label: 'Cost', key: 'cost' },
  ]

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Maintenance', to: '/maintenance' }, { label: 'History' }]} />

      <PageHeader
        eyebrow="Maintenance"
        title="Maintenance History"
        description="Completed service records and inspection outcomes."
        actions={
          <button type="button" className="btn btn--outline">
            <Icon name="download" size={17} />
            <span>Export</span>
          </button>
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Completed Jobs" value={maintenanceHistory.length} icon="check-circle" hint="all time" />
        <StatCard label="Avg. Duration" value="4 days" delta="-1d" icon="clock" hint="per task" />
        <StatCard label="Pass Rate" value="88%" delta="+3%" icon="trending-up" hint="inspection results" />
        <StatCard label="Total Spent" value="$295K" icon="wallet" hint="year to date" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Maintenance Cost by Month" eyebrow="Historical spend" className="chart-span-2">
          <BarChart series={[{ name: 'Cost ($K)', data: maintenanceCostSeries.map((d) => d.cost) }]} labels={maintenanceCostSeries.map((d) => d.month)} height={260} />
        </Card>
        <Card title="Service Type Mix" eyebrow="Most common">
          <div className="stack stack--sm">
            {[['Engine services', 8], ['Hull & propeller', 6], ['Safety inspections', 5], ['Electrical', 4]].map(([type, count]) => (
              <div key={type} className="queue-row">
                <div className="fleet-row-copy">
                  <strong>{type}</strong>
                  <span>{count} completed this year</span>
                </div>
                <Badge tone="info">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search ship or service…" />
      </div>

      <Card padding="none" bodyClassName="stack">
        {pageItems.length === 0 ? (
          <EmptyState icon="wrench" title="No history found" description="Try a different search term." />
        ) : (
          <DataTable columns={columns} rows={pageItems} />
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
    </div>
  )
}

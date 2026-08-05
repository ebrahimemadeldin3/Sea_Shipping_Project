import { PageHeader, Card, StatCard, DataTable } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination } from '../../components/ui/navigation'
import { StatusChip, EmptyState } from '../../components/ui/feedback'
import { LineChart, DonutChart, BarChart } from '../../components/charts/Charts'
import { payments, invoices, revenueSeries, paymentMethodSplit } from '../../data'
import { useAuth } from '../../store/AuthProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import Icon from '../../components/Icon'

const paymentStatusOptions = ['All', 'Paid', 'Pending', 'Processing', 'Overdue', 'Refunded']
const invoiceStatusOptions = ['All', 'Paid', 'Pending', 'Outstanding', 'Overdue', 'Refunded']

export function Payments() {
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
  } = useTableQuery(payments, {
    searchFields: ['customer', 'reference'],
    filters: { status: 'All' },
    pageSize: 10,
  })

  const columns = [
    { label: 'Reference', cell: (r) => <strong className="cell-strong">{r.reference}</strong> },
    { label: 'Customer', key: 'customer' },
    { label: 'Amount', cell: (r) => <strong>{r.amount}</strong> },
    { label: 'Date', key: 'date' },
    { label: 'Method', key: 'method' },
    { label: 'Status', key: 'status', status: true },
    { label: 'Invoice', key: 'invoice' },
  ]

  const paid = payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + parseFloat(p.amount.replace(/[$,\s]/g, '')), 0)
  const outstanding = payments.filter((p) => p.status === 'Pending' || p.status === 'Processing' || p.status === 'Overdue').reduce((s, p) => s + parseFloat(p.amount.replace(/[$,\s]/g, '')), 0)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Monthly revenue, payment methods, and outstanding balances."
        breadcrumbs={[{ label: 'Business' }, { label: 'Payments' }]}
        actions={
          can('payment.manage') ? (
            <button type="button" className="btn btn--primary">
              <Icon name="plus" size={17} />
              <span>Record payment</span>
            </button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Collected" value={formatMoney(paid)} delta="+12%" icon="check-circle" hint="this period" />
        <StatCard label="Outstanding" value={formatMoney(outstanding)} delta="-6%" icon="clock" hint="4 accounts" />
        <StatCard label="Avg. Collection" value="14 days" delta="-2d" icon="trending-up" hint="days to settle" />
        <StatCard label="Success Rate" value="98%" delta="+0.5%" icon="wallet" hint="payment success" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Revenue Trend" eyebrow="Monthly revenue ($M)" className="chart-span-2">
          <LineChart series={[{ name: 'Revenue', data: revenueSeries.map((d) => d.revenue) }]} labels={revenueSeries.map((d) => d.month)} height={250} />
        </Card>
        <Card title="Payment Methods" eyebrow="Collection mix">
          <DonutChart data={paymentMethodSplit} height={250} />
        </Card>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customer or reference…" />
        <Dropdown label="Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={paymentStatusOptions.map((s) => ({ value: s, label: s }))} icon="filter" />
      </div>

      <Card padding="none" bodyClassName="stack">
        {pageItems.length === 0 ? (
          <EmptyState icon="credit-card" title="No payments found" description="Adjust your search or filters." />
        ) : (
          <DataTable columns={columns} rows={pageItems} />
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
    </div>
  )
}

export function Invoices() {
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
  } = useTableQuery(invoices, {
    searchFields: ['customer', 'id'],
    filters: { status: 'All' },
    pageSize: 10,
  })

  const columns = [
    { label: 'Invoice', cell: (r) => <strong className="cell-strong">{r.id}</strong> },
    { label: 'Customer', key: 'customer' },
    { label: 'Amount', cell: (r) => <strong>{r.amount}</strong> },
    { label: 'Issued', key: 'issued' },
    { label: 'Due', key: 'due' },
    { label: 'Status', key: 'status', status: true },
    { label: 'Actions', cell: () => (
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="btn--square btn btn--ghost btn--sm" aria-label="Download invoice"><Icon name="download" size={15} /></button>
          <button type="button" className="btn--square btn btn--ghost btn--sm" aria-label="Send invoice"><Icon name="send" size={15} /></button>
        </div>
      ) },
  ]

  const totalDue = invoices.filter((i) => i.status === 'Outstanding' || i.status === 'Overdue').reduce((s, i) => s + parseFloat(i.amount.replace(/[$,\s]/g, '')), 0)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Track issued invoices, payment status, and collections."
        breadcrumbs={[{ label: 'Business' }, { label: 'Invoices' }]}
        actions={
          can('invoice.manage') ? (
            <button type="button" className="btn btn--primary">
              <Icon name="plus" size={17} />
              <span>Create invoice</span>
            </button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Issued" value={invoices.length} icon="file-text" hint="this period" />
        <StatCard label="Amount Due" value={formatMoney(totalDue)} delta="-8%" icon="credit-card" hint="outstanding" />
        <StatCard label="Overdue" value={invoices.filter((i) => i.status === 'Overdue').length} delta="0" icon="alert-triangle" hint="needs follow-up" />
        <StatCard label="Collection Rate" value="91%" delta="+2%" icon="trending-up" hint="on-time payment" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Invoice Amounts by Status" eyebrow="Outstanding mix" className="chart-span-2">
          <BarChart
            series={[{ name: 'Paid', data: [284.5, 96.4, 74.9, 142.8, 198.9, 96.7] }, { name: 'Outstanding', data: [176.2, 412.3, 44.3, 198.9, 88.6] }]}
            labels={['INV-2210', 'INV-2212', 'INV-2215', 'INV-2217', 'INV-2204', 'INV-2211']}
            height={250}
          />
        </Card>
        <Card title="Status Overview" eyebrow="All invoices">
          <div className="stack stack--sm">
            {[['Paid', 5], ['Pending', 2], ['Outstanding', 2], ['Overdue', 1], ['Refunded', 1]].map(([label, count]) => (
              <div key={label} className="queue-row">
                <div className="fleet-row-copy"><strong>{label}</strong><span>{count} invoice{count > 1 ? 's' : ''}</span></div>
                <StatusChip status={label} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search invoice or customer…" />
        <Dropdown label="Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={invoiceStatusOptions.map((s) => ({ value: s, label: s }))} icon="filter" />
      </div>

      <Card padding="none" bodyClassName="stack">
        {pageItems.length === 0 ? (
          <EmptyState icon="file-text" title="No invoices found" description="Adjust your search or filters." />
        ) : (
          <DataTable columns={columns} rows={pageItems} />
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
    </div>
  )
}

function formatMoney(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

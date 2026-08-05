import { useState } from 'react'
import { useParams, Link } from '../../router/Router'
import { PageHeader, Card, StatCard, DataTable, Avatar } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination, Breadcrumbs, Tabs } from '../../components/ui/navigation'
import { StatusChip, Badge, EmptyState } from '../../components/ui/feedback'
import { Input, Select } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/overlay'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { LineChart } from '../../components/charts/Charts'
import { useData } from '../../store/DataProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import { NotFound } from '../../pages/system/SystemPages'
import Icon from '../../components/Icon'

const regions = ['Middle East', 'Asia Pacific', 'Europe', 'South Asia', 'South America', 'North America', 'Africa']
const tiers = ['Enterprise', 'Premium', 'Standard']
const statuses = ['Active', 'Overdue', 'Suspended']

const currency = (v) => (Number.isFinite(v) ? `$${v.toLocaleString()}` : v)

function toAmount(value) {
  const n = parseFloat(String(value || '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function CustomerForm({ open, onClose, initial }) {
  const { addCustomer, updateCustomer } = useData()
  const toast = useToast()
  const editing = Boolean(initial)
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    contact: initial?.contact || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    region: initial?.region || 'Middle East',
    tier: initial?.tier || 'Standard',
    status: initial?.status || 'Active',
    creditLimit: initial?.creditLimit || '$100,000',
    paymentMethod: initial?.paymentMethod || 'Bank Transfer',
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Customer name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.contact.trim()) next.contact = 'Primary contact is required.'
    if (!form.phone.trim()) next.phone = 'Phone is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    if (editing) {
      updateCustomer(initial.id, form)
      toast.success('Customer updated successfully.')
    } else {
      addCustomer({ ...form, balance: '$0', totalSpend: '$0', shipments: 0, openShipments: 0, satisfaction: 90, joined: new Date().toISOString().slice(0, 10) })
      toast.success('Customer created successfully.')
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit customer' : 'Add customer'} description={editing ? 'Update the account details below.' : 'Create a new customer account.'} size="lg">
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-2">
          <Input label="Customer name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Bluewave Trading Ltd" required />
          <Input label="Primary contact" value={form.contact} onChange={set('contact')} error={errors.contact} placeholder="Hana Al-Mansouri" required />
        </div>
        <div className="grid grid-2">
          <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="hana@example.com" required />
          <Input label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+971 50 000 0000" required />
        </div>
        <div className="grid grid-3">
          <Select label="Region" value={form.region} onChange={set('region')}>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select label="Tier" value={form.tier} onChange={set('tier')}>
            {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={set('status')}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="grid grid-2">
          <Input label="Credit limit" value={form.creditLimit} onChange={set('creditLimit')} placeholder="$500,000" />
          <Select label="Payment method" value={form.paymentMethod} onChange={set('paymentMethod')}>
            {['Bank Transfer', 'Credit', 'Card'].map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Create customer'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function CustomersList() {
  const { customers, analytics, removeCustomer } = useData()
  const { can } = useAuth()
  const toast = useToast()
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
  } = useTableQuery(customers, {
    searchFields: ['name', 'contact', 'email'],
    filters: { region: 'All', tier: 'All' },
    pageSize: 10,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const columns = [
    {
      label: 'Customer',
      sortKey: 'name',
      cell: (r) => (
        <div className="cell-customer">
          <Avatar name={r.name} size="sm" tone="ocean" />
          <div className="fleet-row-copy">
            <strong>{r.name}</strong>
            <span>{r.contact}</span>
          </div>
        </div>
      ),
    },
    { label: 'Region', sortKey: 'region', key: 'region' },
    { label: 'Tier', sortKey: 'tier', cell: (r) => <Badge tone={r.tier === 'Enterprise' ? 'brand' : r.tier === 'Premium' ? 'info' : 'neutral'}>{r.tier}</Badge> },
    { label: 'Status', key: 'status', status: true },
    { label: 'Shipments', sortKey: 'shipments', key: 'shipments' },
    { label: 'Balance', sortKey: 'balance', key: 'balance' },
    { label: 'Actions', cell: (r) => {
        if (!can('customer.manage')) return null
        return (
          <div className="row" style={{ gap: 4 }}>
            <Button variant="ghost" size="sm" icon="edit" aria-label="Edit" onClick={(e) => { e.stopPropagation(); setEditing(r); setFormOpen(true) }}>Edit</Button>
            <Button variant="danger" size="sm" icon="trash" aria-label="Delete" onClick={(e) => { e.stopPropagation(); setDeleting(r) }}>Delete</Button>
          </div>
        )
      },
    },
  ]

  const handleDelete = () => {
    setBusy(true)
    removeCustomer(deleting.id)
    toast.success('Customer deleted.')
    setBusy(false)
    setDeleting(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Customer relations"
        title="Customers"
        description="Manage customer accounts, shipments, and outstanding balances."
        breadcrumbs={[{ label: 'Relations' }, { label: 'Customers' }]}
        actions={
          can('customer.manage') ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>
              Add customer
            </Button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Total Customers" value={customers.length} delta="+8" icon="users" hint="this month" />
        <StatCard label="Enterprise Tier" value={customers.filter((c) => c.tier === 'Enterprise').length} icon="star" hint="strategic accounts" />
        <StatCard label="Satisfaction" value="89%" delta="+2%" icon="check-circle" hint="NPS survey" />
        <StatCard label="Outstanding" value="—" delta="-4%" icon="wallet" hint="billed vs paid" />
      </div>

      <Card title="Customer Growth" eyebrow="Active accounts" className="row">
        <LineChart series={[{ name: 'Customers', data: analytics.customerGrowth.map((d) => d.customers ?? 0) }]} labels={analytics.customerGrowth.map((d) => d.month)} height={250} />
      </Card>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customer or contact…" />
        <Dropdown label="Region" value={filters.region} onChange={(v) => setFilter('region', v)} options={['All', ...regions].map((r) => ({ value: r, label: r }))} icon="globe" />
        <Dropdown label="Tier" value={filters.tier} onChange={(v) => setFilter('tier', v)} options={['All', ...tiers].map((t) => ({ value: t, label: t }))} icon="star" />
      </div>

      <Card padding="none" bodyClassName="stack">
        {pageItems.length === 0 ? (
          <EmptyState icon="users" title="No customers found" description="Adjust your search or filters." />
        ) : (
          <DataTable columns={columns} rows={pageItems} onRowClick={(row) => (window.location.hash = `/customers/${row.id}`)} />
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />

      {can('customer.manage') && <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />}
      {can('customer.manage') && (
        <ConfirmDialog
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={busy}
          title={`Delete ${deleting?.name}?`}
          description="This customer will be removed permanently along with its account. This cannot be undone."
          confirmLabel="Delete customer"
        />
      )}
    </div>
  )
}

export function CustomerProfile() {
  const { id } = Object.fromEntries(useParams())
  const { customers, shipments } = useData()
  const { can } = useAuth()
  const [tab, setTab] = useState('shipments')
  const customer = customers.find((c) => c.id === id)

  if (!customer) return <NotFound />

  const customerShipments = shipments.filter((s) => {
    const cust = customer
    const name = (cust?.name || '').toLowerCase()
    const contact = (cust?.contact || '').toLowerCase()
    const shipCustomer = String(s.customer || '').toLowerCase()
    return (name && shipCustomer.includes(name)) || (contact && shipCustomer.includes(contact))
  })

  const tabs = [
    { id: 'shipments', label: 'Shipments', count: customer.shipments ?? customerShipments.length },
    { id: 'payments', label: 'Account Details' },
  ]

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Customers', to: '/customers' }, { label: customer.name }]} />

      <PageHeader
        eyebrow="Customer profile"
        title={customer.name}
        description={`${customer.contact} · ${customer.email}`}
        actions={
          <>
            <StatusChip status={customer.status} />
            {can('shipment.manage') && (
              <Link to="/shipments/new" className="btn btn--primary">
                <Icon name="plus" size={17} />
                <span>New shipment</span>
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-2 grid-3">
        <Card className="chart-span-2">
          <div className="customer-hero">
            <Avatar name={customer.name} size="lg" tone="ocean" />
            <div>
              <h3>{customer.name}</h3>
              <p>
                {customer.contact} · {customer.phone}
              </p>
              <div className="row" style={{ marginTop: 6 }}>
                <Badge tone="brand">{customer.tier}</Badge>
                <Badge tone="info" icon="globe">{customer.region}</Badge>
              </div>
            </div>
          </div>
        </Card>
        <div className="stack">
          <StatCard label="Total Spend" value={customer.totalSpend} delta="+14%" icon="credit-card" hint={`credit limit ${customer.creditLimit}`} />
          <StatCard label="Balance Due" value={customer.balance} icon="wallet" hint={`via ${customer.paymentMethod}`} />
          <StatCard label="Satisfaction" value={`${customer.satisfaction}%`} delta="+1%" icon="check-circle" hint="last 90 days" />
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="tab-panel">
        {tab === 'shipments' && (
          <Card padding="none" bodyClassName="stack">
            {customerShipments.length === 0 ? (
              <EmptyState icon="package" title="No shipments yet" description="Shipments for this customer will appear here." />
            ) : (
              <DataTable
                columns={[
                  { label: 'Shipment', key: 'id' },
                  { label: 'Route', sortKey: 'id', cell: (r) => `${r.origin} → ${r.destination}` },
                  { label: 'Cargo', key: 'cargo' },
                  { label: 'Status', key: 'status', status: true },
                  { label: 'ETA', key: 'eta' },
                ]}
                rows={customerShipments}
                onRowClick={(r) => (window.location.hash = `/shipments/${r.id}`)}
              />
            )}
          </Card>
        )}

        {tab === 'payments' && (
          <div className="grid grid-2">
            <Card title="Account Information" eyebrow="Profile">
              <dl className="spec-list">
                <div><dt>Primary contact</dt><dd>{customer.contact}</dd></div>
                <div><dt>Email</dt><dd>{customer.email}</dd></div>
                <div><dt>Phone</dt><dd>{customer.phone}</dd></div>
                <div><dt>Region</dt><dd>{customer.region}</dd></div>
                <div><dt>Customer since</dt><dd>{customer.joined}</dd></div>
                <div><dt>Account tier</dt><dd>{customer.tier}</dd></div>
              </dl>
            </Card>
            <Card title="Commercial Terms" eyebrow="Billing">
              <dl className="spec-list">
                <div><dt>Payment method</dt><dd>{customer.paymentMethod}</dd></div>
                <div><dt>Credit limit</dt><dd>{customer.creditLimit}</dd></div>
                <div><dt>Open shipments</dt><dd>{customer.openShipments}</dd></div>
                <div><dt>Total shipments</dt><dd>{customer.shipments}</dd></div>
                <div><dt>Status</dt><dd>{customer.status}</dd></div>
              </dl>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export { currency, toAmount }
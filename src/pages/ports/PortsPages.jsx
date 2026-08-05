import { useState } from 'react'
import { useParams, Link } from '../../router/Router'
import { PageHeader, Card, StatCard } from '../../components/ui/display'
import { PortCard } from '../../components/domain/cards'
import { SearchBar, Dropdown, Pagination, Breadcrumbs } from '../../components/ui/navigation'
import { StatusChip, EmptyState, Badge } from '../../components/ui/feedback'
import { Input, Select } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/overlay'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { HorizontalBars, LineChart } from '../../components/charts/Charts'
import { ShipMap } from '../../components/domain/ShipMap'
import { portActivity } from '../../data'
import { useData } from '../../store/DataProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import { NotFound } from '../../pages/system/SystemPages'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import Icon from '../../components/Icon'

const regions = ['All', 'Middle East', 'Asia Pacific', 'Europe', 'North America', 'South Asia', 'South America', 'Africa']

function PortForm({ open, onClose, initial }) {
  const { addPort, updatePort } = useData()
  const toast = useToast()
  const editing = Boolean(initial)
  const [form, setForm] = useState(() => ({
    id: initial?.id || `PT-${String(Date.now()).slice(-2).padStart(2, '0')}`,
    name: initial?.name || '',
    country: initial?.country || '',
    region: initial?.region || 'Middle East',
    berths: initial?.berths || '',
    capacity: initial?.capacity || '',
    depth: initial?.depth || '',
    congestion: initial?.congestion || 'Low',
    vesselsInPort: initial?.vesselsInPort ?? 0,
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Port name is required.'
    if (!form.country.trim()) next.country = 'Country is required.'
    if (!form.berths) next.berths = 'Number of berths is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    if (editing) {
      updatePort(initial.id, { ...form, vesselsInPort: Number(form.vesselsInPort) || 0 })
      toast.success('Port updated successfully.')
    } else {
      addPort({ ...form, berths: Number(form.berths) || 1, vesselsInPort: Number(form.vesselsInPort) || 0, throughput: '0', arrivals: 0, departures: 0, traffic: form.traffic || 20, coordinates: { lat: 25, lng: 55 } })
      toast.success('Port added successfully.')
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit port' : 'Add port'} description="Describe the port connection below." size="lg">
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-3">
          <Input label="Port name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Jebel Ali" required />
          <Input label="Country" value={form.country} onChange={set('country')} error={errors.country} placeholder="United Arab Emirates" required />
          <Select label="Region" value={form.region} onChange={set('region')}>
            {regions.filter((r) => r !== 'All').map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div className="grid grid-2 grid-3">
          <Input label="Berths" type="number" min="1" value={form.berths} onChange={set('berths')} error={errors.berths} placeholder="67" required />
          <Input label="Capacity" value={form.capacity} onChange={set('capacity')} placeholder="19.4 M TEU" />
          <Input label="Depth" value={form.depth} onChange={set('depth')} placeholder="18 m" />
        </div>
        <div className="grid grid-2 grid-3">
          <Select label="Congestion" value={form.congestion} onChange={set('congestion')}>
            {['Low', 'Moderate', 'High'].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Vessels in port" type="number" min="0" value={form.vesselsInPort} onChange={set('vesselsInPort')} />
          <Input label="Traffic index" type="number" min="0" max="100" value={form.traffic ?? 20} onChange={set('traffic')} />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Add port'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function PortsList() {
  const { ports, removePort } = useData()
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
  } = useTableQuery(ports, {
    searchFields: ['name', 'country'],
    filters: { region: 'All' },
    pageSize: 8,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleDelete = () => {
    setBusy(true)
    removePort(deleting.id)
    toast.success('Port removed from network.')
    setBusy(false)
    setDeleting(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Port operations"
        title="Ports"
        description="Traffic, berth availability, and activity across your network of ports."
        breadcrumbs={[{ label: 'Operations' }, { label: 'Ports' }]}
        actions={
          can('port.manage') ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>
              Add port
            </Button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Network Ports" value={ports.length} icon="anchor" hint="active calls" />
        <StatCard label="Vessels in Port" value={ports.reduce((s, p) => s + (p.vesselsInPort || 0), 0)} delta="+9" icon="ship" hint="right now" />
        <StatCard label="Total Berths" value={ports.reduce((s, p) => s + (p.berths || 0), 0)} icon="container" hint="across network" />
        <StatCard label="Avg. Congestion" value="Moderate" icon="alert-triangle" hint="2 ports high" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Port Activity" eyebrow="Traffic index" className="chart-span-2">
          <HorizontalBars data={portActivity} height={280} />
        </Card>
        <Card title="Weekly Arrivals" eyebrow="Network trend">
          <LineChart series={[{ name: 'Arrivals', data: [21, 33, 30, 46, 58, 24, 15, 36, 11, 27] }]} labels={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']} height={280} />
        </Card>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search port or country…" />
        <Dropdown label="Region" value={filters.region} onChange={(v) => setFilter('region', v)} options={regions.map((r) => ({ value: r, label: r }))} icon="globe" />
      </div>

      {pageItems.length === 0 ? (
        <Card>
          <EmptyState icon="anchor" title="No ports found" description="Try a different search term or region filter." />
        </Card>
      ) : (
        <>
          <div className="grid grid-2 grid-3 grid-4">
            {pageItems.map((port) => (
              <div key={port.id} className="stack stack--sm">
                <PortCard port={port} />
                {can('port.manage') && (
                  <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                    <Button variant="ghost" size="sm" icon="edit" onClick={() => { setEditing(port); setFormOpen(true) }}>Edit</Button>
                    <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(port)}>Delete</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </>
      )}

      {can('port.manage') && <PortForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />}
      {can('port.manage') && (
        <ConfirmDialog
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={busy}
          title={`Delete ${deleting?.name}?`}
          description="This port will be removed from the network permanently. This cannot be undone."
          confirmLabel="Delete port"
        />
      )}
    </div>
  )
}

export function PortDetails() {
  const { id } = Object.fromEntries(useParams())
  const { ports } = useData()
  const { can } = useAuth()
  const [editing, setEditing] = useState(false)
  const port = ports.find((p) => p.id === id)
  const { ships } = useData()
  const portShortName = port?.name?.replace(/^Port of /, '') || ''
  const berthedShips = ships.filter((s) => s.currentPort === portShortName)

  if (!port) return <NotFound />

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Ports', to: '/ports' }, { label: port.name }]} />

      <PageHeader
        eyebrow="Port profile"
        title={port.name}
        description={`${port.country} · ${port.region}`}
        actions={
          <>
            <StatusChip status={port.congestion === 'High' ? 'Warning' : port.congestion === 'Moderate' ? 'Loading' : 'Good'} />
            {can('port.manage') && (
              <Button variant="primary" icon="edit" onClick={() => setEditing(true)}>Edit</Button>
            )}
          </>
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Throughput" value={port.throughput} delta="+7%" icon="container" hint={`capacity ${port.capacity}`} />
        <StatCard label="Berths" value={port.berths} icon="anchor" hint={`depth ${port.depth}`} />
        <StatCard label="Vessels in Port" value={port.vesselsInPort} icon="ship" hint={`${port.arrivals} arrivals`} />
        <StatCard label="Traffic Index" value={`${port.traffic}`} icon="trending-up" hint={`${port.departures} departures`} />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Port Layout" eyebrow="Vessel positions" className="chart-span-2">
          <ShipMap
            height={360}
            ports={[{ id: port.id, name: portShortName, vesselsInPort: port.vesselsInPort, coordinates: port.coordinates }]}
            ships={berthedShips.length ? berthedShips.map((s, i) => ({ ...s, position: { lat: port.coordinates.lat + (i - 1) * 0.35, lng: port.coordinates.lng + (i - 1) * 0.2 } })) : []}
            routes={[]}
          />
          {berthedShips.length === 0 && (
            <p className="field-hint" style={{ padding: '0 16px 12px' }}>No fleet vessels currently berthed at this port.</p>
          )}
        </Card>
        <div className="stack">
          <Card title="Berth Activity" eyebrow="Terminal status">
            <div className="stack stack--sm">
              {['Container Terminal 1', 'Container Terminal 2', 'Bulk Terminal', 'Liquid Terminal'].map((terminal, i) => (
                <div key={terminal} className="berth-row">
                  <span className="berth-status berth-status--active" aria-hidden="true" />
                  <div className="fleet-row-copy">
                    <strong>{terminal}</strong>
                    <span>{i < 2 ? 'Operational · accepting vessels' : 'Operational · scheduling'}</span>
                  </div>
                  <Badge tone={i < 2 ? 'success' : 'info'}>{i < 2 ? 'Open' : 'Busy'}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Fleet Vessels Here" eyebrow={`${berthedShips.length} berthed`}>
            {berthedShips.length === 0 ? (
              <EmptyState icon="ship" title="No fleet vessels" description="AquaFlow vessels are not currently at this port." />
            ) : (
              <div className="stack stack--sm">
                {berthedShips.map((ship) => (
                  <Link key={ship.id} to={`/ships/${ship.id}`} className="vessel-link">
                    <span className="ship-card-icon" aria-hidden="true"><Icon name="ship" size={17} /></span>
                    <div className="fleet-row-copy">
                      <strong>{ship.name}</strong>
                      <span>{ship.type} · {ship.status}</span>
                    </div>
                    <StatusChip status={ship.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {can('port.manage') && <PortForm open={editing} onClose={() => setEditing(false)} initial={port} />}
    </div>
  )
}

import { useState } from 'react'
import { useParams, Link } from '../../router/Router'
import { PageHeader, Card, StatCard } from '../../components/ui/display'
import { ShipCard } from '../../components/domain/cards'
import { SearchBar, Dropdown, Pagination, Breadcrumbs } from '../../components/ui/navigation'
import { StatusChip, Badge, ProgressBar, EmptyState } from '../../components/ui/feedback'
import { Input, Select } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/overlay'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { AreaChart, BarChart } from '../../components/charts/Charts'
import { Timeline } from '../../components/domain/Timeline'
import { ShipMap } from '../../components/domain/ShipMap'
import { useData } from '../../store/DataProvider'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import { fuelConsumption, deliverySeries } from '../../data'
import { NotFound } from '../../pages/system/SystemPages'
import Icon from '../../components/Icon'

const shipTypes = ['All', 'Container', 'Bulk Carrier', 'Tanker', 'Feeder']
const shipStatuses = ['All', 'On Route', 'Loading', 'Maintenance', 'In Port', 'Delayed']

function ShipForm({ open, onClose, initial }) {
  const { addShip, updateShip } = useData()
  const toast = useToast()
  const editing = Boolean(initial)
  const [form, setForm] = useState(() => ({
    id: initial?.id || `AQ-${String(Date.now()).slice(-2).padStart(2, '0')}`,
    name: initial?.name || '',
    type: initial?.type || 'Container',
    imo: initial?.imo || '',
    capacity: initial?.capacity || '',
    speed: initial?.speed || '',
    captain: initial?.captain || 'Captain ',
    currentPort: initial?.currentPort || '',
    nextPort: initial?.nextPort || '',
    status: initial?.status || 'In Port',
    utilization: initial?.utilization ?? 50,
    health: initial?.health || 'In Service',
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Vessel name is required.'
    if (!form.imo.trim()) next.imo = 'IMO number is required.'
    if (!form.currentPort.trim()) next.currentPort = 'Current port is required.'
    if (!form.captain.trim() || form.captain.trim() === 'Captain') next.captain = 'Captain is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    if (editing) {
      updateShip(initial.id, form)
      toast.success('Vessel updated successfully.')
    } else {
      addShip({ ...form, eta: `Arriving ${new Date().toLocaleDateString('en-GB', { month: 'short' })} 24`, etd: `Due ${new Date().toLocaleDateString('en-GB', { month: 'short' })} 24` })
      toast.success('Vessel registered successfully.')
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit vessel' : 'Register vessel'} description="Complete the vessel details below." size="lg">
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-3">
          <Input label="Vessel name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Aqua Orion" required />
          <Input label="IMO number" value={form.imo} onChange={set('imo')} error={errors.imo} placeholder="IMO 9412098" required />
          <Select label="Type" value={form.type} onChange={set('type')}>
            {['Container', 'Bulk Carrier', 'Tanker', 'Feeder'].map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <div className="grid grid-3">
          <Input label="Capacity" value={form.capacity} onChange={set('capacity')} placeholder="14,800 TEU" />
          <Input label="Speed (kn)" value={form.speed} onChange={set('speed')} placeholder="22.4 kn" />
          <Input label="Captain" value={form.captain} onChange={set('captain')} error={errors.captain} placeholder="Captain Noor Rahman" required />
        </div>
        <div className="grid grid-3">
          <Input label="Current port" value={form.currentPort} onChange={set('currentPort')} error={errors.currentPort} placeholder="Jebel Ali, UAE" required />
          <Input label="Next port" value={form.nextPort} onChange={set('nextPort')} placeholder="Rotterdam, NL" />
          <Select label="Status" value={form.status} onChange={set('status')}>
            {shipStatuses.filter((s) => s !== 'All').map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="grid grid-3">
          <Input label="Utilization (%)" type="number" min="0" max="100" value={form.utilization} onChange={set('utilization')} />
          <Select label="Health" value={form.health} onChange={set('health')}>
            {['In Service', 'Needs Repair', 'Under Repair', 'Out of Service'].map((h) => <option key={h} value={h}>{h}</option>)}
          </Select>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Register vessel'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function ShipsList() {
  const { ships, removeShip } = useData()
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
  } = useTableQuery(ships, {
    searchFields: ['name', 'captain', 'currentPort'],
    filters: { type: 'All', status: 'All' },
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleDelete = () => {
    setBusy(true)
    removeShip(deleting.id)
    toast.success('Vessel removed from fleet.')
    setBusy(false)
    setDeleting(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Fleet management"
        title="Ships"
        description={`${ships.length} vessels in the active fleet`}
        breadcrumbs={[{ label: 'Fleet' }, { label: 'Ships' }]}
        actions={
          can('fleet.manage') ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>
              Register vessel
            </Button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Active Vessels" value={ships.length} delta="+2" icon="ship" hint="this quarter" />
        <StatCard label="On Route" value={ships.filter((s) => s.status === 'On Route').length} delta="+1" icon="waves" hint="currently sailing" />
        <StatCard label="In Port" value={ships.filter((s) => s.status === 'In Port' || s.status === 'Loading').length} delta="0" icon="anchor" hint="berthed" />
        <StatCard label="In Maintenance" value={ships.filter((s) => s.status === 'Maintenance').length} delta="0" icon="wrench" hint="2 scheduled" />
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search ships, captain, port…" />
        <Dropdown label="Type" value={filters.type} onChange={(v) => setFilter('type', v)} options={shipTypes.map((t) => ({ value: t, label: t }))} icon="container" />
        <Dropdown label="Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={shipStatuses.map((s) => ({ value: s, label: s }))} icon="filter" />
      </div>

      {pageItems.length === 0 ? (
        <Card>
          <EmptyState
            icon="ship"
            title="No vessels found"
            description="Try adjusting your search or filters to find the vessel you're looking for."
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-2 grid-3 grid-4 ship-grid">
            {pageItems.map((ship) => (
              <div key={ship.id} className="stack stack--sm">
                <ShipCard ship={ship} />
                {can('fleet.manage') && (
                  <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                    <Button variant="ghost" size="sm" icon="edit" onClick={() => { setEditing(ship); setFormOpen(true) }}>Edit</Button>
                    <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(ship)}>Delete</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </>
      )}

      {can('fleet.manage') && <ShipForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />}
      {can('fleet.manage') && (
        <ConfirmDialog
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={busy}
          title={`Delete ${deleting?.name}?`}
          description="This vessel will be removed from the active fleet permanently. This cannot be undone."
          confirmLabel="Remove vessel"
        />
      )}
    </div>
  )
}

export function ShipDetails() {
  const { id } = Object.fromEntries(useParams())
  const { ships } = useData()
  const ship = ships.find((s) => s.id === id)

  if (!ship) return <NotFound />

  const shipTimeline = [
    { label: 'Departed', date: ship.etd, time: '07:00', detail: `Departed ${ship.currentPort}.`, done: ship.status !== 'In Port' && ship.status !== 'Maintenance' },
    { label: 'In Transit', date: ship.etd, time: '—', detail: `Sailing to ${ship.nextPort} at ${ship.speed}.`, done: ship.status === 'On Route' || ship.status === 'Delayed' },
    { label: 'Arrival', date: ship.eta, time: '—', detail: `Expected arrival at ${ship.nextPort}.`, done: false },
  ]

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Fleet', to: '/ships' }, { label: ship.name }]} />

      <PageHeader
        eyebrow="Vessel profile"
        title={ship.name}
        description={`${ship.imo} · ${ship.type} · Flag: ${ship.flag}`}
        actions={
          <>
            <StatusChip status={ship.status} />
            <button type="button" className="btn btn--outline">
              <Icon name="share" size={17} />
              <span>Share</span>
            </button>
            <Link to={`/shipments?ship=${ship.id}`} className="btn btn--primary">
              <span>View shipments</span>
            </Link>
          </>
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Capacity" value={ship.capacity} icon="container" hint={`Length ${ship.length}`} />
        <StatCard label="Speed" value={ship.speed} icon="waves" hint={`Heading ${ship.heading}°`} />
        <StatCard label="Fuel Level" value={`${ship.fuelLevel}%`} icon="fuel" hint={`of ${ship.fuelCapacity}`} />
        <StatCard label="Utilization" value={`${ship.utilization}%`} icon="bar-chart" hint="capacity booked" />
      </div>

      <div className="grid grid-2 grid-3">
        <div className="stack chart-span-2">
          <Card title="Route & Position" eyebrow="Live tracking">
            <ShipMap
              height={380}
              ports={[
                { id: 'a', name: ship.currentPort, vesselsInPort: 1, coordinates: { lat: 26, lng: 57 } },
                { id: 'b', name: ship.nextPort, vesselsInPort: 1, coordinates: { lat: 52, lng: 4 } },
              ]}
              ships={[{ id: ship.id, name: ship.name, status: ship.status, speed: ship.speed, position: ship.position, heading: ship.heading }]}
              routes={[{ from: { lat: 26, lng: 57 }, to: { lat: 52, lng: 4 } }]}
            />
          </Card>

          <div className="grid grid-2">
            <Card title="Specifications" eyebrow="Vessel data">
              <dl className="spec-list">
                <div><dt>IMO</dt><dd>{ship.imo}</dd></div>
                <div><dt>Year built</dt><dd>{ship.yearBuilt}</dd></div>
                <div><dt>Draft</dt><dd>{ship.draft}</dd></div>
                <div><dt>Crew</dt><dd>{ship.crewCount} members</dd></div>
                <div><dt>Owner</dt><dd>{ship.owner}</dd></div>
                <div><dt>Cargo weight</dt><dd>{ship.cargoWeight}</dd></div>
              </dl>
            </Card>
            <Card title="Crew & Command" eyebrow="Onboard">
              <div className="stack stack--sm">
                <div className="crew-card">
                  <Icon name="user" size={18} />
                  <div>
                    <strong>{ship.captain}</strong>
                    <span>Master</span>
                  </div>
                </div>
                <div className="crew-card">
                  <Icon name="users" size={18} />
                  <div>
                    <strong>{ship.crewCount} crew</strong>
                    <span>Full complement</span>
                  </div>
                </div>
                <div className="crew-card">
                  <Icon name="wrench" size={18} />
                  <div>
                    <strong>Health: {ship.health}</strong>
                    <span>Next inspection due soon</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="stack">
          <Card title="Voyage Status" eyebrow="Current voyage">
            <div className="stack stack--sm">
              <div className="voyage-row">
                <span className="voyage-label">From</span>
                <strong>{ship.currentPort}</strong>
              </div>
              <div className="voyage-row">
                <span className="voyage-label">To</span>
                <strong>{ship.nextPort}</strong>
              </div>
              <div className="voyage-row">
                <span className="voyage-label">ETD</span>
                <strong>{ship.etd}</strong>
              </div>
              <div className="voyage-row">
                <span className="voyage-label">ETA</span>
                <strong>{ship.eta}</strong>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={ship.utilization} label="Voyage progress" showLabel />
            </div>
          </Card>

          <Card title="Fuel Trend" eyebrow="Monthly consumption">
            <AreaChart values={fuelConsumption.map((d) => d.consumption)} labels={fuelConsumption.map((d) => d.month)} height={180} />
          </Card>

          <Card title="Voyage Timeline" eyebrow="Milestones">
            <Timeline items={shipTimeline} />
          </Card>
        </div>
      </div>

      <div className="grid grid-2">
        <Card title="Recent Deliveries" eyebrow="Performance">
          <BarChart series={[{ name: 'Deliveries', data: deliverySeries.map((d) => d.deliveries) }]} labels={deliverySeries.map((d) => d.month)} height={220} />
        </Card>
        <Card title="Maintenance History" eyebrow="Service records">
          <div className="stack stack--sm">
            {['Engine overhaul', 'Hull cleaning', 'Boiler inspection', 'Propeller repair'].map((task, i) => (
              <div key={task} className="maintenance-row">
                <Badge tone={i === 0 ? 'warning' : 'success'} icon={i === 0 ? 'clock' : 'check-circle'}>
                  {i === 0 ? 'Due' : 'Completed'}
                </Badge>
                <div className="fleet-row-copy">
                  <strong>{task}</strong>
                  <span>{i === 0 ? 'Aug 14, 2026' : `${['Jun 21', 'May 30', 'Apr 27'][i - 1] || 'Jun 08'}, 2026`}</span>
                </div>
                <Icon name="chevron-right" size={16} className="muted-icon" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

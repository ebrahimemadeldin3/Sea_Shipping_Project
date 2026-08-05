import { useState } from 'react'
import { useParams, Link, useNavigate } from '../../router/Router'
import { PageHeader, Card, DataTable, StatCard } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination, Breadcrumbs } from '../../components/ui/navigation'
import { StatusChip, Badge, ProgressBar, EmptyState } from '../../components/ui/feedback'
import { DonutChart, LineChart } from '../../components/charts/Charts'
import { Timeline } from '../../components/domain/Timeline'
import { Input, Select, Textarea, Checkbox } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal, Drawer } from '../../components/ui/overlay'
import { FileUpload, ImageViewer } from '../../components/ui/FileUpload'
import { useData } from '../../store/DataProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import { useNotifications } from '../../store/NotificationsProvider'
import { shipmentTimeline } from '../../data'
import { NotFound } from '../../pages/system/SystemPages'
import { formatBytes } from '../../services/reporting'
import Icon from '../../components/Icon'

const statusOptions = ['All', 'In Transit', 'Delayed', 'Pending', 'Completed', 'Delivered', 'Cancelled']
const priorityOptions = ['All', 'High', 'Standard', 'Low']

export function ShipmentsList() {
  const { shipments } = useData()
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
  } = useTableQuery(shipments, {
    searchFields: ['id', 'customer', 'cargo'],
    filters: { status: 'All', priority: 'All' },
    pageSize: 10,
  })

  const columns = [
    { label: 'Shipment', cell: (r) => <strong className="cell-strong">{r.id}</strong> },
    { label: 'Customer', key: 'customer' },
    { label: 'Route', cell: (r) => <span className="route-pair">{r.origin} <Icon name="arrow-right" size={13} className="muted-icon" /> {r.destination}</span> },
    { label: 'Cargo', key: 'cargo' },
    { label: 'Status', key: 'status', status: true },
    { label: 'Priority', cell: (r) => <Badge tone={r.priority === 'High' ? 'danger' : r.priority === 'Standard' ? 'info' : 'neutral'}>{r.priority}</Badge> },
    { label: 'Cost', key: 'cost' },
  ]

  const counts = {
    all: shipments.length,
    transit: shipments.filter((s) => s.status === 'In Transit').length,
    delayed: shipments.filter((s) => s.status === 'Delayed').length,
    pending: shipments.filter((s) => s.status === 'Pending').length,
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Shipment operations"
        title="Shipments"
        description={`${counts.all} total · ${counts.transit} in transit · ${counts.delayed} delayed`}
        breadcrumbs={[{ label: 'Operations' }, { label: 'Shipments' }]}
        actions={
          can('shipment.manage') ? (
            <Link to="/shipments/new" className="btn btn--primary">
              <Icon name="plus" size={17} />
              <span>Create shipment</span>
            </Link>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Total" value={counts.all} icon="package" hint="all shipments" />
        <StatCard label="In Transit" value={counts.transit} delta="+12%" icon="waves" hint="moving now" />
        <StatCard label="Delayed" value={counts.delayed} delta="-2" icon="alert-triangle" hint="needs attention" />
        <StatCard label="Pending" value={counts.pending} icon="clock" hint="awaiting confirmation" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Shipment Status" eyebrow="Distribution" className="chart-span-2">
          <div className="chart-flex">
            <DonutChart
              data={[
                { label: 'In Transit', value: counts.transit },
                { label: 'Completed', value: 28 },
                { label: 'Delayed', value: counts.delayed },
                { label: 'Pending', value: counts.pending },
              ]}
              centerLabel={counts.all}
              centerSub="total"
              height={240}
            />
          </div>
        </Card>
        <Card title="Delivery Momentum" eyebrow="Weekly trend">
          <LineChart series={[{ name: 'Shipments', data: [14, 19, 24, 28, 33, 37, 41] }]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']} height={240} />
        </Card>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by ID, customer, cargo…" />
        <Dropdown label="Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={statusOptions.map((s) => ({ value: s, label: s }))} icon="filter" />
        <Dropdown label="Priority" value={filters.priority} onChange={(v) => setFilter('priority', v)} options={priorityOptions.map((p) => ({ value: p, label: p }))} icon="flag" />
      </div>

      <Card padding="none" bodyClassName="stack">
        {pageItems.length === 0 ? (
          <EmptyState icon="package" title="No shipments found" description="Adjust your search or filters, or create a new shipment." />
        ) : (
          <DataTable
            columns={columns}
            rows={pageItems}
            onRowClick={(row) => (window.location.hash = `/shipments/${row.id}`)}
          />
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
    </div>
  )
}

export function ShipmentDetails() {
  const { id } = Object.fromEntries(useParams())
  const db = useData()
  const { shipments, documents, addDocument, removeDocument } = db
  const [docOpen, setDocOpen] = useState(false)

  const shipment = shipments.find((s) => s.id === id)

  if (!shipment) return <NotFound />

  const progress = shipment.progress ?? (shipment.status === 'Delivered' || shipment.status === 'Completed' ? 100 : 0)

  const docs = [
    { name: 'Bill of Lading', ref: `BOL-${shipment.id}`, size: 'PDF · 1.2 MB' },
    { name: 'Packing List', ref: `PKL-${shipment.id}`, size: 'PDF · 640 KB' },
    { name: 'Insurance Certificate', ref: `INS-${shipment.id}`, size: 'PDF · 480 KB' },
    { name: 'Customs Declaration', ref: `CUS-${shipment.id}`, size: 'XLSX · 320 KB' },
  ]

  const uploadedDocs = (documents || []).filter((d) => d.shipmentId === id)

  const handleUpload = (meta, fileList) => {
    if (!fileList || fileList.length === 0) return
    Array.from(fileList).forEach((file) => {
      const isImage = file.type.startsWith('image/')
      const persist = (dataUrl) => {
        addDocument({
          id: `DOC-${String(Date.now()).slice(-6)}`,
          shipmentId: id,
          filename: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          dataUrl: isImage && dataUrl ? dataUrl : null,
          preview: isImage ? URL.createObjectURL(file) : null,
        })
      }
      if (isImage && file.size <= 4 * 1024 * 1024) {
        const reader = new FileReader()
        reader.onload = () => persist(String(reader.result || ''))
        reader.readAsDataURL(file)
      } else {
        persist(null)
      }
    })
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Shipments', to: '/shipments' }, { label: shipment.id }]} />

      <PageHeader
        eyebrow="Shipment profile"
        title={shipment.id}
        description={`${shipment.origin} → ${shipment.destination} · via ${shipment.ship}`}
        actions={
          <>
            <StatusChip status={shipment.status} />
            <button type="button" className="btn btn--outline" onClick={() => setDocOpen(true)}>
              <Icon name="file-text" size={17} />
              <span>Documents</span>
            </button>
            <Link to="/tracking" className="btn btn--primary">
              <Icon name="map-pin" size={17} />
              <span>Live track</span>
            </Link>
          </>
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Total Cost" value={shipment.cost} icon="credit-card" hint={shipment.type} />
        <StatCard label="Weight" value={shipment.weight} icon="box" hint={shipment.containers ? `${shipment.containers} containers` : 'bulk cargo'} />
        <StatCard label="Priority" value={shipment.priority} icon="flag" hint="service level" />
        <StatCard label="Progress" value={`${progress}%`} icon="trending-up" hint={`ETA ${shipment.eta}`} />
      </div>

      <div className="grid grid-2 grid-3">
        <div className="stack chart-span-2">
          <Card title="Shipment Progress" eyebrow="Route completion">
            <div style={{ marginBottom: 18 }}>
              <ProgressBar value={progress} tone={progress === 100 ? 'success' : 'brand'} showLabel label="Journey progress" size="lg" />
            </div>
            <div className="route-progress">
              <div className="route-endpoint">
                <strong>{shipment.origin}</strong>
                <span>Departure</span>
              </div>
              <div className="route-line-mid route-line-mid--long" aria-hidden="true">
                <span className="route-plane" style={{ left: `${progress}%` }} />
              </div>
              <div className="route-endpoint route-endpoint--dest">
                <strong>{shipment.destination}</strong>
                <span>Arrival</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-2">
            <Card title="Cargo Details" eyebrow="Shipment contents">
              <dl className="spec-list spec-list--single">
                <div><dt>Description</dt><dd>{shipment.cargo}</dd></div>
                <div><dt>Weight</dt><dd>{shipment.weight}</dd></div>
                <div><dt>Containers</dt><dd>{shipment.containers || '—'}</dd></div>
                <div><dt>Type</dt><dd>{shipment.type}</dd></div>
                <div><dt>Tracking ref</dt><dd className="mono">{shipment.tracking}</dd></div>
                <div><dt>Departure</dt><dd>{shipment.departure || 'Not departed'}</dd></div>
              </dl>
            </Card>
            <Card title="Vessel Assignment" eyebrow="Carrier">
              <div className="stack stack--sm">
                <Link to={`/ships/${shipment.vesselId}`} className="vessel-link">
                  <span className="ship-card-icon" aria-hidden="true"><Icon name="ship" size={18} /></span>
                  <div className="fleet-row-copy">
                    <strong>{shipment.ship}</strong>
                    <span>{shipment.vesselId} · View vessel profile</span>
                  </div>
                  <Icon name="chevron-right" size={17} className="muted-icon" />
                </Link>
                <div className="voyage-row">
                  <span className="voyage-label">ETA</span>
                  <strong>{shipment.eta}</strong>
                </div>
                <div className="voyage-row">
                  <span className="voyage-label">Customer</span>
                  <strong>{shipment.customer}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="stack">
          <Card title="Timeline" eyebrow="Event history">
            <Timeline items={shipmentTimeline} />
          </Card>
          <Card title="Documents" eyebrow={`${docs.length} files`}>
            <div className="stack stack--sm">
              {docs.map((doc) => (
                <div key={doc.name} className="doc-row">
                  <span className="doc-icon" aria-hidden="true"><Icon name="file-text" size={17} /></span>
                  <div className="fleet-row-copy">
                    <strong>{doc.name}</strong>
                    <span>{doc.ref} · {doc.size}</span>
                  </div>
                  <button type="button" className="btn--square btn btn--ghost btn--sm" aria-label={`Download ${doc.name}`} onClick={() => setDocOpen(true)}>
                    <Icon name="download" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Drawer open={docOpen} onClose={() => setDocOpen(false)} title="Shipment Documents" description={`Files attached to ${shipment.id}`}>
        <div className="stack stack--sm">
          {docs.map((doc) => (
            <div key={doc.name} className="doc-row">
              <span className="doc-icon" aria-hidden="true"><Icon name="file-text" size={18} /></span>
              <div className="fleet-row-copy">
                <strong>{doc.name}</strong>
                <span>{doc.ref} · {doc.size}</span>
              </div>
              <Button variant="outline" size="sm">
                <Icon name="download" size={15} />
                <span>Download</span>
              </Button>
            </div>
          ))}

          {uploadedDocs.length > 0 && (
            <>
              <div className="doc-row" style={{ justifyContent: 'space-between', padding: '10px 0 4px' }}>
                <strong>Uploaded files</strong>
              </div>
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="doc-row">
                  {doc.preview || doc.dataUrl ? (
                    <ImageViewer src={doc.dataUrl || doc.preview} alt={doc.filename} caption={doc.filename} />
                  ) : (
                    <span className="doc-icon" aria-hidden="true"><Icon name="file-text" size={18} /></span>
                  )}
                  <div className="fleet-row-copy">
                    <strong>{doc.filename}</strong>
                    <span>{formatBytes(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <button type="button" className="btn--square btn btn--ghost btn--sm" aria-label={`Delete ${doc.filename}`} onClick={() => removeDocument(doc.id)}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: 8 }}>
            <FileUpload label="Attach additional file" onFiles={handleUpload} />
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export function CreateShipment() {
  const { addShipment } = useData()
  const { addNotification } = useNotifications()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [form, setForm] = useState({
    customer: 'Bluewave Trading Ltd',
    origin: 'Jebel Ali',
    destination: 'Rotterdam',
    ship: 'Aqua Orion',
    cargo: '',
    cargoType: 'FCL',
    weight: '',
    containers: '',
    insurance: 'Full marine coverage',
    priority: 'Standard',
    notes: '',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const canNext = step === 1 ? form.customer && form.origin && form.destination : step === 2 ? form.ship && form.cargo : true

  const submit = () => {
    addShipment({
      customer: form.customer,
      ship: form.ship,
      origin: form.origin,
      destination: form.destination,
      cargo: form.cargo || 'General cargo',
      weight: form.weight ? `${form.weight} t` : '—',
      containers: form.containers ? Number(form.containers) : 0,
      status: 'Pending',
      eta: '2026-08-28',
      departure: null,
      cost: '$—',
      priority: form.priority,
      tracking: `TRK-${Math.floor(Math.random() * 9000 + 1000)}`,
      progress: 0,
      type: form.cargoType,
    })
    addNotification({
      id: `NT-${Date.now()}`,
      type: 'delay',
      title: 'New shipment created',
      message: `${form.cargo || 'General cargo'} booking created for ${form.customer}.`,
      time: 'Just now',
      read: false,
    })
    toast.success('Shipment booking created successfully.', { title: 'SH created' })
    navigate('/shipments')
  }

  const steps = ['Customer & Route', 'Vessel & Cargo', 'Confirm & Review']

  return (
    <div className="page page--narrow">
      <Breadcrumbs items={[{ label: 'Shipments', to: '/shipments' }, { label: 'Create Shipment' }]} />

      <PageHeader eyebrow="New booking" title="Create Shipment" description="Book a new shipment across your network." />

      <Card>
        <div className="stepper" role="tablist" aria-label="Create shipment steps">
          {steps.map((label, i) => {
            const stepNum = i + 1
            return (
              <div key={label} className={`stepper-item ${step >= stepNum ? 'is-active' : ''}`} role="tab" aria-selected={step === stepNum}>
                <span className="stepper-dot">{step > stepNum ? <Icon name="check" size={13} /> : stepNum}</span>
                <span className="stepper-label">{label}</span>
              </div>
            )
          })}
        </div>

        <div className="stepper-form">
          {step === 1 && (
            <div className="stack">
              <div className="grid grid-2">
                <Input label="Customer" value={form.customer} onChange={set('customer')} placeholder="Search customer…" icon="users" required />
                <Select label="Priority" value={form.priority} onChange={set('priority')}>
                  <option>Standard</option>
                  <option>High</option>
                  <option>Low</option>
                </Select>
              </div>
              <div className="grid grid-2">
                <Input label="Origin port" value={form.origin} onChange={set('origin')} placeholder="Loading port" icon="anchor" required />
                <Input label="Destination port" value={form.destination} onChange={set('destination')} placeholder="Discharge port" icon="map-pin" required />
              </div>
              <p className="field-hint">Provide the port of loading and port of discharge for this booking.</p>
            </div>
          )}

          {step === 2 && (
            <div className="stack">
              <div className="grid grid-2">
                <Select label="Vessel assignment" value={form.ship} onChange={set('ship')}>
                  <option>Aqua Orion</option>
                  <option>Maris Pearl</option>
                  <option>Pacific Meridian</option>
                  <option>Nordic Star</option>
                </Select>
                <Select label="Cargo type" value={form.cargoType} onChange={set('cargoType')}>
                  <option value="FCL">Full container load (FCL)</option>
                  <option value="LCL">Less than container load (LCL)</option>
                  <option value="Breakbulk">Breakbulk</option>
                  <option value="Reefer">Reefer</option>
                  <option value="Liquid">Liquid / bulk</option>
                </Select>
              </div>
              <Input label="Cargo description" value={form.cargo} onChange={set('cargo')} placeholder="e.g. Industrial components" icon="box" required />
              <div className="grid grid-2">
                <Input label="Total weight (tons)" type="number" value={form.weight} onChange={set('weight')} placeholder="e.g. 18400" icon="scale" />
                <Input label="Container count" type="number" value={form.containers} onChange={set('containers')} placeholder="e.g. 620" icon="container" />
              </div>
              <Select label="Insurance" value={form.insurance} onChange={set('insurance')}>
                <option>Full marine coverage</option>
                <option>All risk</option>
                <option>Total loss only</option>
              </Select>
              <Textarea label="Notes" value={form.notes} onChange={set('notes')} placeholder="Special instructions, customs notes, or references…" />
            </div>
          )}

          {step === 3 && (
            <div className="stack">
              <div className="review-card">
                <h4>Route & Customer</h4>
                <dl className="spec-list">
                  <div><dt>Customer</dt><dd>{form.customer}</dd></div>
                  <div><dt>Priority</dt><dd>{form.priority}</dd></div>
                  <div><dt>From</dt><dd>{form.origin}</dd></div>
                  <div><dt>To</dt><dd>{form.destination}</dd></div>
                </dl>
              </div>
              <div className="review-card">
                <h4>Vessel & Cargo</h4>
                <dl className="spec-list">
                  <div><dt>Vessel</dt><dd>{form.ship}</dd></div>
                  <div><dt>Cargo type</dt><dd>{form.cargoType}</dd></div>
                  <div><dt>Description</dt><dd>{form.cargo || 'General cargo'}</dd></div>
                  <div><dt>Weight</dt><dd>{form.weight ? `${form.weight} t` : '—'}</dd></div>
                  <div><dt>Containers</dt><dd>{form.containers || '—'}</dd></div>
                  <div><dt>Insurance</dt><dd>{form.insurance}</dd></div>
                </dl>
              </div>
              <Checkbox label="I confirm the booking details are accurate" required />
            </div>
          )}
        </div>

        <div className="modal-footer stepper-actions">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <span>Back</span>
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              <span>Continue</span>
              <Icon name="arrow-right" size={16} />
            </Button>
          ) : (
            <Button onClick={() => setConfirmOpen(true)}>
              <span>Submit booking</span>
            </Button>
          )}
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm booking"
        description="Review the shipment before submitting."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Confirm & create</Button>
          </>
        }
      >
        <p className="modal-copy">
          This will create shipment for <strong>{form.customer}</strong> from <strong>{form.origin}</strong> to <strong>{form.destination}</strong> on <strong>{form.ship}</strong>.
        </p>
      </Modal>
    </div>
  )
}

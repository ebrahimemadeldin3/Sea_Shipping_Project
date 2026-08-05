import { useState } from 'react'
import { PageHeader, Card, StatCard, DataTable } from '../../components/ui/display'
import { Tabs } from '../../components/ui/navigation'
import { Badge } from '../../components/ui/feedback'
import { Input, Select } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/overlay'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { LineChart, BarChart, DonutChart, HeatMap } from '../../components/charts/Charts'
import { revenueSeries, deliverySeries, fleetUtilization, portTrafficHeat } from '../../data'
import { useData } from '../../store/DataProvider'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import Icon from '../../components/Icon'
import { buildExport, triggerDownload, formatBytes } from '../../services/reporting'

function downloadExport(report, format, db) {
  const { blob, filename } = buildExport(report, format === 'Excel' ? 'CSV' : format, db)
  triggerDownload(blob, filename)
  return { size: blob.size, filename }
}

function recordExport(db, report, format) {
  const record = {
    id: `EX-${String(Date.now()).slice(-6)}`,
    report: report?.name || 'Report',
    format: format === 'Excel' ? 'Excel (CSV)' : format,
    generated: new Date().toLocaleString(),
    size: '—',
    status: 'Completed',
  }
  db.addExport?.(record)
  return record
}

function ReportForm({ open, onClose, initial }) {
  const { addReport, updateReport } = useData()
  const toast = useToast()
  const editing = Boolean(initial)
  const [form, setForm] = useState(() => ({
    id: initial?.id || `RP-${String(Date.now()).slice(-2).padStart(2, '0')}`,
    name: initial?.name || '',
    type: initial?.type || 'PDF',
    description: initial?.description || '',
    frequency: initial?.frequency || 'Weekly',
    enabled: initial?.enabled ?? true,
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Report name is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    if (editing) {
      updateReport(initial.id, { ...form, enabled: form.enabled !== 'false' })
      toast.success('Report template updated.')
    } else {
      addReport({ ...form, enabled: form.enabled !== 'false', lastRun: 'Never', metrics: [] })
      toast.success('Report template created.')
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit report' : 'New report'} description="Configure the report template below." size="lg">
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-3">
          <Input label="Report name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Operations Summary" required />
          <Select label="Format" value={form.type} onChange={set('type')}>
            {['PDF', 'Excel', 'CSV'].map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Frequency" value={form.frequency} onChange={set('frequency')}>
            {['Daily', 'Weekly', 'Monthly', 'On demand'].map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>
        <Input label="Description" value={form.description} onChange={set('description')} error={errors.description} placeholder="Fleet status, active shipments, delays and port activity snapshot." required />
        <Select label="Status" value={form.enabled === false ? 'false' : 'true'} onChange={set('enabled')}>
          <option value="true">Enabled</option>
          <option value="false">Paused</option>
        </Select>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Create report'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function Reports() {
  const db = useData()
  const { reportTemplates, exportHistory, removeReport } = db
  const { can } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('library')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleExport = (report, format) => {
    try {
      const { size, filename } = downloadExport(report, format, db)
      recordExport(db, report, format)
      toast.success(`${filename} downloaded (${formatBytes(size)}).`, { title: 'Export ready' })
    } catch (err) {
      toast.error(err.message || 'Export failed.', { title: 'Cannot export' })
    }
  }

  const handleDelete = () => {
    setBusy(true)
    removeReport(deleting.id)
    toast.success('Report template deleted.')
    setBusy(false)
    setDeleting(null)
  }

  const columns = [
    { label: 'Report', cell: (r) => (
        <div className="cell-customer">
          <span className="doc-icon" aria-hidden="true"><Icon name="file-chart" size={18} /></span>
          <div className="fleet-row-copy"><strong>{r.name}</strong><span>{r.description}</span></div>
        </div>
      ) },
    { label: 'Format', key: 'type' },
    { label: 'Frequency', key: 'frequency' },
    { label: 'Last Run', key: 'lastRun' },
    { label: 'Status', cell: (r) => r.enabled ? <Badge tone="success" dot>Enabled</Badge> : <Badge tone="neutral">Paused</Badge> },
    { label: 'Actions', cell: (r) =>
        can('report.manage') ? (
          <div className="row" style={{ gap: 6 }}>
            <Button variant="outline" size="sm" icon="download" onClick={(e) => { e.stopPropagation(); handleExport(r, r.type) }}>Export</Button>
            <Button variant="ghost" size="sm" icon="edit" onClick={() => { setEditing(r); setFormOpen(true) }}>Edit</Button>
            <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(r)}>Delete</Button>
          </div>
        ) : null },
  ]

  const historyColumns = [
    { label: 'File', key: 'report' },
    { label: 'Format', key: 'format' },
    { label: 'Generated', key: 'generated' },
    { label: 'Size', key: 'size' },
    { label: 'Status', key: 'status', status: true },
    { label: 'Actions', cell: (r) => (
        <button type="button" className="btn--square btn btn--ghost btn--sm" aria-label="Download file" onClick={() => handleExport({ name: r.report }, r.format.includes('JSON') ? 'JSON' : 'CSV')}>
          <Icon name="download" size={15} />
        </button>
      ) },
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Reporting"
        title="Reports & Exports"
        description="Generate, schedule, and download operational and financial reports."
        breadcrumbs={[{ label: 'Business' }, { label: 'Reports' }]}
        actions={
          can('report.manage') ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>
              New report
            </Button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Report Templates" value={reportTemplates.length} icon="file-chart" hint="configured" />
        <StatCard label="Enabled" value={reportTemplates.filter((r) => r.enabled).length} icon="check-circle" hint="active schedules" />
        <StatCard label="Exports This Month" value={exportHistory.length} delta="+2" icon="download" hint="completed" />
        <StatCard label="Scheduled" value="3" icon="calendar" hint="daily / weekly" />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Revenue Summary" eyebrow="YTD" className="chart-span-2">
          <LineChart series={[{ name: 'Revenue ($M)', data: revenueSeries.map((d) => d.revenue) }, { name: 'Cost ($M)', data: revenueSeries.map((d) => d.cost) }]} labels={revenueSeries.map((d) => d.month)} height={240} />
        </Card>
        <Card title="Deliveries" eyebrow="Monthly">
          <BarChart series={[{ name: 'Deliveries', data: deliverySeries.map((d) => d.deliveries) }]} labels={deliverySeries.map((d) => d.month)} height={240} />
        </Card>
      </div>

      <Tabs
        tabs={[{ id: 'library', label: 'Report Library', count: reportTemplates.length }, { id: 'exports', label: 'Export History', count: exportHistory.length }]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'library' ? (
        <Card padding="none" bodyClassName="stack">
          <DataTable columns={columns} rows={reportTemplates} />
        </Card>
      ) : (
        <Card padding="none" bodyClassName="stack">
          <DataTable columns={historyColumns} rows={exportHistory} />
        </Card>
      )}

      {can('report.manage') && <ReportForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />}
      {can('report.manage') && (
        <ConfirmDialog
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={busy}
          title={`Delete ${deleting?.name}?`}
          description="This report template will be removed permanently. This cannot be undone."
          confirmLabel="Delete report"
        />
      )}
    </div>
  )
}

export function Export() {
  const db = useData()
  const { reportTemplates } = db
  const toast = useToast()
  const [selected, setSelected] = useState(reportTemplates[0]?.id)
  const [format, setFormat] = useState('PDF')
  const [range, setRange] = useState('This month')

  const report = reportTemplates.find((r) => r.id === selected) || reportTemplates[0]

  const runExport = () => {
    if (!report) return toast.error('No report templates available.', { title: 'Cannot export' })
    try {
      const useFormat = format === 'Excel' ? 'CSV' : format
      const { size, filename } = downloadExport(report, useFormat, db)
      recordExport(db, report, useFormat)
      toast.success(`${filename} downloaded (${formatBytes(size)}).`, { title: 'Export ready' })
    } catch (err) {
      toast.error(err.message || 'Export failed.', { title: 'Cannot export' })
    }
  }

  return (
    <div className="page page--narrow">
      <PageHeader eyebrow="Reporting" title="Export Data" description="Choose a report template, format, and date range to export." />

      <Card>
        <div className="stack">
          <div className="export-tiles">
            {reportTemplates.map((r) => (
              <button key={r.id} type="button" className={`export-tile ${selected === r.id ? 'is-selected' : ''}`} onClick={() => setSelected(r.id)} aria-pressed={selected === r.id}>
                <span className="doc-icon" aria-hidden="true"><Icon name={r.type === 'Excel' ? 'bar-chart' : r.type === 'CSV' ? 'file-text' : 'file-chart'} size={19} /></span>
                <div className="fleet-row-copy">
                  <strong>{r.name}</strong>
                  <span>{r.frequency}</span>
                </div>
                <Icon name="check" size={16} className="export-tile-check" />
              </button>
            ))}
          </div>

          <div className="grid grid-2">
            <label className="field">
              <span className="field-label">Format</span>
              <div className="segmented">
                {['PDF', 'CSV', 'JSON'].map((f) => (
                  <button key={f} type="button" className={`segmented-item ${format === f ? 'is-active' : ''}`} onClick={() => setFormat(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </label>
            <label className="field">
              <span className="field-label">Date range</span>
              <div className="segmented">
                {['This month', 'Last month', 'Last quarter', 'Year to date'].map((r) => (
                  <button key={r} type="button" className={`segmented-item ${range === r ? 'is-active' : ''}`} onClick={() => setRange(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div className="export-summary">
            <span className="export-summary-icon" aria-hidden="true"><Icon name="info" size={18} /></span>
            <p>
              {report ? (
                <>Exporting <strong>{report.name}</strong> for <strong>{range}</strong> as <strong>{format}</strong>. The file will be generated immediately and download automatically.</>
              ) : (
                <>No report templates available. Add one to the library to start exporting.</>
              )}
            </p>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--outline" onClick={() => toast.info('Scheduled a recurring export.', { title: 'Scheduled' })}>
              <Icon name="calendar" size={17} />
              <span>Schedule</span>
            </button>
            <button type="button" className="btn btn--primary" onClick={runExport}>
              <Icon name="download" size={17} />
              <span>Export now</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-2 grid-3">
        <Card title="Port Activity" eyebrow="Heatmap" className="chart-span-2">
          <HeatMap data={portTrafficHeat.rows} xLabels={portTrafficHeat.labels} yLabels={portTrafficHeat.yLabels} height={220} />
        </Card>
        <Card title="Fleet Utilization" eyebrow="Snapshot">
          <DonutChart data={fleetUtilization} centerLabel="68%" centerSub="fleet" height={220} />
        </Card>
      </div>
    </div>
  )
}

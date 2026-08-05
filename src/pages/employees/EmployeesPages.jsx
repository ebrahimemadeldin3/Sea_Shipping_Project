import { useState } from 'react'
import { useParams, Link } from '../../router/Router'
import { PageHeader, Card, StatCard, Avatar } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination, Breadcrumbs } from '../../components/ui/navigation'
import { StatusChip, Badge, EmptyState, ProgressBar } from '../../components/ui/feedback'
import { Input, Select } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/overlay'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useData } from '../../store/DataProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import { NotFound } from '../../pages/system/SystemPages'
import Icon from '../../components/Icon'

const departments = ['Operations', 'Crew', 'Logistics', 'Ports', 'Finance', 'Engineering', 'Support', 'Legal', 'Sales', 'Marketing']

function EmployeeForm({ open, onClose, initial }) {
  const { addEmployee, updateEmployee } = useData()
  const toast = useToast()
  const editing = Boolean(initial)
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    role: initial?.role || '',
    department: initial?.department || 'Operations',
    email: initial?.email || '',
    phone: initial?.phone || '',
    location: initial?.location || '',
    status: initial?.status || 'Active',
    workload: initial?.workload ?? 50,
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required.'
    if (!form.role.trim()) next.role = 'Job title is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.phone.trim()) next.phone = 'Phone is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    if (editing) {
      updateEmployee(initial.id, form)
      toast.success('Employee updated successfully.')
    } else {
      addEmployee({ ...form, workload: Number(form.workload) || 50, joined: new Date().toISOString().slice(0, 10) })
      toast.success('Employee added successfully.')
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit employee' : 'Add employee'} description={editing ? 'Update the employee record below.' : 'Add a new employee to the workforce.'} size="lg">
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-2">
          <Input label="Full name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Amira Nasser" required />
          <Input label="Job title" value={form.role} onChange={set('role')} error={errors.role} placeholder="Operations Director" required />
        </div>
        <div className="grid grid-2">
          <Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="amira@aquaflow.com" required />
          <Input label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+971 50 000 0000" required />
        </div>
        <div className="grid grid-3">
          <Select label="Department" value={form.department} onChange={set('department')}>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="Dubai, UAE" />
          <Select label="Status" value={form.status} onChange={set('status')}>
            {['Active', 'On Leave', 'Onboard'].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <Input label="Workload (%)" type="number" min="0" max="100" value={form.workload} onChange={set('workload')} />
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Add employee'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export function EmployeesList() {
  const { employees, removeEmployee } = useData()
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
  } = useTableQuery(employees, {
    searchFields: ['name', 'role', 'email'],
    filters: { department: 'All' },
    pageSize: 9,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const departmentsList = ['All', ...new Set(employees.map((e) => e.department))]

  const handleDelete = () => {
    setBusy(true)
    removeEmployee(deleting.id)
    toast.success('Employee deleted.')
    setBusy(false)
    setDeleting(null)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workforce"
        title="Employees"
        description="People across operations, crew, logistics, ports, and finance."
        breadcrumbs={[{ label: 'Relations' }, { label: 'Employees' }]}
        actions={
          can('staff.manage') ? (
            <Button variant="primary" icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>
              Add employee
            </Button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Total Employees" value={employees.length} delta="+3" icon="users" hint="this quarter" />
        <StatCard label="Active" value={employees.filter((e) => e.status === 'Active').length} icon="check-circle" hint="on duty" />
        <StatCard label="Departments" value={new Set(employees.map((e) => e.department)).size} icon="user" hint="across company" />
        <StatCard label="Avg. Workload" value={employees.length ? `${Math.round(employees.reduce((s, e) => s + Number(e.workload || 0), 0) / employees.length)}%` : '0%'} delta="-4%" icon="bar-chart" hint="healthy level" />
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, role, email…" />
        <Dropdown label="Department" value={filters.department} onChange={(v) => setFilter('department', v)} options={departmentsList.map((d) => ({ value: d, label: d }))} icon="filter" />
      </div>

      {pageItems.length === 0 ? (
        <Card>
          <EmptyState icon="users" title="No employees found" description="Adjust your search or department filter." />
        </Card>
      ) : (
        <>
          <div className="grid grid-2 grid-3 employee-grid">
            {pageItems.map((employee) => (
              <article key={employee.id} className="employee-card">
                <div className="employee-card-top">
                  <Avatar name={employee.name} size="md" />
                  <div className="fleet-row-copy">
                    <h3>{employee.name}</h3>
                    <span>{employee.role}</span>
                  </div>
                  <StatusChip status={employee.status} />
                </div>
                <div className="employee-card-meta">
                  <span><Icon name="user" size={14} /> {employee.department}</span>
                  <span><Icon name="map-pin" size={14} /> {employee.location}</span>
                  <span><Icon name="mail" size={14} /> {employee.email}</span>
                </div>
                <ProgressBar value={employee.workload} label="Workload" showLabel tone={employee.workload > 80 ? 'warning' : 'brand'} />
                <div className="employee-card-footer">
                  <span className="voyage-label">Joined {employee.joined}</span>
                  <div className="row" style={{ gap: 4 }}>
                    <Link to={`/employees/${employee.id}`} className="btn btn--outline btn--sm"><span>Profile</span></Link>
                    {can('staff.manage') && (
                      <>
                        <Button variant="ghost" size="sm" icon="edit" onClick={() => { setEditing(employee); setFormOpen(true) }}>Edit</Button>
                        <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(employee)}>Delete</Button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </>
      )}

      {can('staff.manage') && <EmployeeForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />}
      {can('staff.manage') && (
        <ConfirmDialog
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={busy}
          title={`Delete ${deleting?.name}?`}
          description="This employee record will be removed permanently. This cannot be undone."
          confirmLabel="Delete employee"
        />
      )}
    </div>
  )
}

export function EmployeeProfile() {
  const { id } = Object.fromEntries(useParams())
  const { employees, removeEmployee } = useData()
  const { can } = useAuth()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const employee = employees.find((e) => e.id === id)

  if (!employee) return <NotFound />

  const handleProfileDelete = () => {
    setBusy(true)
    removeEmployee(employee.id)
    toast.success('Employee deleted.')
    setBusy(false)
    setDeleting(false)
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Employees', to: '/employees' }, { label: employee.name }]} />

      <PageHeader
        eyebrow="Employee profile"
        title={employee.name}
        description={`${employee.role} · ${employee.department}`}
        actions={
          <>
            <StatusChip status={employee.status} />
            {can('staff.manage') && (
              <>
                <Button variant="primary" icon="edit" onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="danger" icon="trash" onClick={() => setDeleting(true)}>Delete</Button>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-2 grid-3">
        <Card className="chart-span-2">
          <div className="customer-hero">
            <Avatar name={employee.name} size="xl" />
            <div>
              <h3>{employee.name}</h3>
              <p>{employee.role}</p>
              <div className="row" style={{ marginTop: 6 }}>
                <Badge tone="brand" icon="user">{employee.department}</Badge>
                <Badge tone="info" icon="map-pin">{employee.location}</Badge>
              </div>
              <dl className="employee-contact">
                <div><dt>Email</dt><dd>{employee.email}</dd></div>
                <div><dt>Phone</dt><dd>{employee.phone}</dd></div>
                <div><dt>Joined</dt><dd>{employee.joined}</dd></div>
              </dl>
            </div>
          </div>
        </Card>
        <div className="stack">
          <StatCard label="Current Workload" value={`${employee.workload}%`} delta={employee.workload < 80 ? '-5%' : '+4%'} icon="bar-chart" hint="team average 62%" />
          <StatCard label="Status" value={employee.status} icon="users" hint="direct manager" />
          <Card title="Capacity" eyebrow="Workload utilization">
            <ProgressBar value={employee.workload} showLabel label="This week" />
          </Card>
        </div>
      </div>

      <div className="grid grid-2">
        <Card title="Recent Assignments" eyebrow="Work log">
          <div className="stack stack--sm">
            {['Supervised SH-2401 loading at Jebel Ali', 'Coordinated Blue Horizon dry-dock', 'Reviewed monthly operations report', 'Onboard inspection — Aqua Orion'].map((task, i) => (
              <div key={task} className="activity-row">
                <span className="activity-dot" aria-hidden="true" />
                <div className="fleet-row-copy">
                  <strong>{task}</strong>
                  <span>{['2 days ago', '5 days ago', 'Last week', '2 weeks ago'][i]}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Certifications" eyebrow="Credentials">
          <div className="stack stack--sm">
            {['Master Mariner — Class I', 'Marine Operations Management', 'ISO 9001 Internal Auditor', 'Port Facility Security Officer'].map((cert) => (
              <div key={cert} className="cert-row">
                <span className="doc-icon" aria-hidden="true"><Icon name="check-circle" size={17} /></span>
                <div className="fleet-row-copy">
                  <strong>{cert}</strong>
                  <span>Verified · valid</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {can('staff.manage') && <EmployeeForm open={editing} onClose={() => setEditing(false)} initial={employee} />}
      {can('staff.manage') && (
        <ConfirmDialog
          open={deleting}
          onClose={() => setDeleting(false)}
          onConfirm={handleProfileDelete}
          loading={busy}
          title={`Delete ${employee.name}?`}
          description="This employee record will be removed permanently. This cannot be undone."
          confirmLabel="Delete employee"
        />
      )}
    </div>
  )
}
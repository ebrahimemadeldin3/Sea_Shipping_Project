import { useMemo, useState } from 'react'
import { PageHeader, Card, StatCard, DataTable, Avatar } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination } from '../../components/ui/navigation'
import { Badge, EmptyState } from '../../components/ui/feedback'
import { Input, Select, Textarea } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/overlay'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { faqs } from '../../data'
import { useData } from '../../store/DataProvider'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import { useTableQuery } from '../../hooks/useTableQuery'
import Icon from '../../components/Icon'

export function FAQ() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...new Set(faqs.map((f) => f.category))]

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const q = query.toLowerCase()
      const matchesQuery = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      const matchesCat = category === 'All' || f.category === category
      return matchesQuery && matchesCat
    })
  }, [query, category])

  return (
    <div className="page">
      <PageHeader
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        description="Find quick answers about shipments, tracking, payments, and more."
        breadcrumbs={[{ label: 'Help Center', to: '/support' }, { label: 'FAQ' }]}
      />

      <Card>
        <div className="faq-search">
          <SearchBar value={query} onChange={setQuery} placeholder="Search for answers…" />
          <Dropdown label="Category" value={category} onChange={setCategory} options={categories.map((c) => ({ value: c, label: c }))} icon="filter" />
        </div>
      </Card>

      <div className="faq-list">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon="help-circle" title="No answers found" description="Try a different search or reach out to support." action={<a className="btn btn--primary" href="#/support/tickets"><span>Open a ticket</span></a>} />
          </Card>
        ) : (
          filtered.map((faq, index) => (
            <details key={index} className="faq-item">
              <summary>
                <span>{faq.q}</span>
                <Icon name="chevron-down" size={18} className="faq-chevron" />
              </summary>
              <div className="faq-answer">
                <Badge tone="info">{faq.category}</Badge>
                <p>{faq.a}</p>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  )
}

function TicketForm({ open, onClose }) {
  const { addTicket } = useData()
  const toast = useToast()
  const [form, setForm] = useState({ subject: '', category: 'General', priority: 'Medium' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.subject.trim()) next.subject = 'Subject is required.'
    if (!form.description?.trim()) next.description = 'Description is required.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    addTicket({
      id: `TK-${Date.now().toString().slice(-3)}`,
      subject: form.subject,
      category: form.category,
      status: 'Open',
      priority: form.priority,
      assignee: 'Unassigned',
      created: new Date().toISOString().slice(0, 10),
      updated: 'Just now',
      messages: 0,
      description: form.description,
    })
    toast.success('Ticket created successfully.')
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New ticket" description="Describe your issue and our team will get back to you." size="lg">
      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <Input label="Subject" value={form.subject} onChange={set('subject')} error={errors.subject} placeholder="Summary of the issue…" required />
        <div className="grid grid-2 grid-3">
          <Select label="Category" value={form.category} onChange={set('category')}>
            {['General', 'Billing', 'Booking', 'Technical', 'Documentation', 'Claims'].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={set('priority')}>
            {['Low', 'Medium', 'High', 'Critical'].map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        <Textarea label="Description" value={form.description || ''} onChange={set('description')} error={errors.description} placeholder="Provide as much detail as possible…" required />
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" loading={saving}>Create ticket</Button>
        </div>
      </form>
    </Modal>
  )
}

export function Tickets() {
  const { tickets, updateTicket, removeTicket } = useData()
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
  } = useTableQuery(tickets, {
    searchFields: ['subject', 'id'],
    filters: { status: 'All' },
    pageSize: 8,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const cycleStatus = (t) => {
    const order = ['Open', 'In Progress', 'Closed']
    const next = order[(order.indexOf(t.status) + 1) % order.length]
    updateTicket(t.id, { status: next })
    toast.success(`Ticket ${t.id} moved to ${next}.`)
  }

  const handleDelete = () => {
    setBusy(true)
    removeTicket(deleting.id)
    toast.success('Ticket deleted.')
    setBusy(false)
    setDeleting(null)
  }

  const columns = [
    { label: 'Ticket', key: 'id' },
    { label: 'Subject', key: 'subject' },
    { label: 'Category', key: 'category' },
    { label: 'Priority', cell: (r) => <Badge tone={r.priority === 'Critical' ? 'danger' : r.priority === 'High' ? 'warning' : 'info'}>{r.priority}</Badge> },
    { label: 'Status', cell: (r) => { if (!can('ticket.manage')) return null; return <button type="button" className="status-action" onClick={() => cycleStatus(r)} title="Click to change status"><Badge tone={r.status === 'Closed' ? 'neutral' : r.status === 'In Progress' ? 'info' : 'warning'}>{r.status}</Badge></button> } },
    { label: 'Assignee', key: 'assignee' },
    { label: 'Updated', key: 'updated' },
    { label: 'Actions', cell: (r) => can('ticket.manage') ? (
        <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(r)}>Delete</Button>
      ) : null },
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Help Center"
        title="Support Tickets"
        description="Track and manage your support requests."
        breadcrumbs={[{ label: 'Help Center', to: '/support' }, { label: 'Tickets' }]}
        actions={
          can('ticket.manage') ? (
            <Button variant="primary" icon="plus" onClick={() => setFormOpen(true)}>
              New ticket
            </Button>
          ) : null
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Open Tickets" value={tickets.filter((t) => t.status === 'Open').length} icon="ticket" hint="needs response" />
        <StatCard label="In Progress" value={tickets.filter((t) => t.status === 'In Progress').length} icon="clock" hint="being worked" />
        <StatCard label="Critical" value={tickets.filter((t) => t.priority === 'Critical').length} delta="+1" icon="alert-triangle" hint="escalated" />
        <StatCard label="Avg. Response" value="34 min" delta="-8m" icon="trending-up" hint="SLA met" />
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tickets…" />
        <Dropdown label="Status" value={filters.status} onChange={(v) => setFilter('status', v)} options={['All', 'Open', 'In Progress', 'Closed'].map((s) => ({ value: s, label: s }))} icon="filter" />
      </div>

      <Card padding="none" bodyClassName="stack">
        {pageItems.length === 0 ? (
          <EmptyState icon="ticket" title="No tickets found" description="Adjust your search or filters." />
        ) : (
          <DataTable columns={columns} rows={pageItems} />
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />

      {can('ticket.manage') && <TicketForm open={formOpen} onClose={() => setFormOpen(false)} />}
      {can('ticket.manage') && (
        <ConfirmDialog
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={busy}
          title={`Delete ${deleting?.id}?`}
          description={`"${deleting?.subject}" will be removed permanently. This cannot be undone.`}
          confirmLabel="Delete ticket"
        />
      )}
    </div>
  )
}

export function LiveChat() {
  const toast = useToast()
  const [messages, setMessages] = useState([
    { id: 1, from: 'support', name: 'AquaFlow Support', text: 'Hi! Welcome to AquaFlow live support. How can we help you today?', time: '09:41' },
    { id: 2, from: 'support', name: 'AquaFlow Support', text: 'You can ask about shipments, tracking, billing, or anything else.', time: '09:41' },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)

  const send = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [...m, { id: Date.now(), from: 'user', name: 'You', text, time: now }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'support', name: 'AquaFlow Support', text: 'Thanks for your message! A specialist is looking into this and will reply shortly.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }])
      setTyping(false)
    }, 1400)
  }

  return (
    <div className="page page--narrow">
      <PageHeader
        eyebrow="Help Center"
        title="Live Chat"
        description="Chat with a support specialist in real time."
        breadcrumbs={[{ label: 'Help Center', to: '/support' }, { label: 'Live Chat' }]}
      />

      <Card padding="none" bodyClassName="chat-wrap">
        <div className="chat-head">
          <Avatar name="AquaFlow Support" size="sm" tone="green" />
          <div className="fleet-row-copy">
            <strong>AquaFlow Support</strong>
            <span><span className="status-dot" aria-hidden="true" /> Online · replies in ~1 min</span>
          </div>
          <button type="button" className="btn--square btn btn--ghost btn--sm" aria-label="End chat" onClick={() => toast.info('Chat session closed.')}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`chat-bubble chat-bubble--${message.from}`}>
              <p>{message.text}</p>
              <span className="chat-time">{message.time}</span>
            </div>
          ))}
          {typing && (
            <div className="chat-bubble chat-bubble--support chat-typing" aria-label="Support is typing">
              <span /><span /><span />
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={send}>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your message…" className="chat-input-field" aria-label="Chat message" />
          <Button type="submit" disabled={!draft.trim()} aria-label="Send message">
            <Icon name="send" size={17} />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </Card>
    </div>
  )
}

export function Support() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Help Center"
        title="How can we help?"
        description="Browse FAQs, chat live, or open a support ticket."
        breadcrumbs={[{ label: 'System' }, { label: 'Help Center' }]}
      />

      <div className="support-cards">
        <LinkCard to="/support/faq" icon="help-circle" title="FAQ" description="Answers to the most common questions about shipments, tracking, and billing." />
        <LinkCard to="/support/chat" icon="message-circle" title="Live Chat" description="Talk to a specialist in real time during business hours." />
        <LinkCard to="/support/tickets" icon="ticket" title="Tickets" description="Track and manage your open support requests." />
      </div>

      <div className="grid grid-2 grid-3">
        <Card title="Popular Questions" eyebrow="Quick answers" className="chart-span-2">
          <div className="faq-list faq-list--compact">
            {faqs.slice(0, 4).map((faq, index) => (
              <details key={index} className="faq-item">
                <summary>
                  <span>{faq.q}</span>
                  <Icon name="chevron-down" size={18} className="faq-chevron" />
                </summary>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </Card>
        <Card title="Contact Support" eyebrow="Direct line">
          <div className="stack stack--sm">
            <a href="mailto:support@aquaflow.com" className="contact-row">
              <span className="doc-icon" aria-hidden="true"><Icon name="mail" size={18} /></span>
              <div className="fleet-row-copy"><strong>Email</strong><span>support@aquaflow.com</span></div>
            </a>
            <a href="tel:+971500000000" className="contact-row">
              <span className="doc-icon" aria-hidden="true"><Icon name="phone" size={18} /></span>
              <div className="fleet-row-copy"><strong>Phone</strong><span>+971 50 000 0000</span></div>
            </a>
            <div className="contact-row">
              <span className="doc-icon" aria-hidden="true"><Icon name="clock" size={18} /></span>
              <div className="fleet-row-copy"><strong>Hours</strong><span>24/7 for urgent issues</span></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function LinkCard({ to, icon, title, description }) {
  return (
    <a href={`#${to}`} className="support-card">
      <span className="support-card-icon" aria-hidden="true"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="btn btn--outline btn--sm">
        <span>Open</span>
        <Icon name="arrow-right" size={15} />
      </span>
    </a>
  )
}

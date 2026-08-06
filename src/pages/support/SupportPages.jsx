import { useMemo, useRef, useState } from 'react'
import { PageHeader, Card, StatCard, DataTable, Avatar } from '../../components/ui/display'
import { SearchBar, Dropdown, Pagination } from '../../components/ui/navigation'
import { Badge, EmptyState, StatusChip } from '../../components/ui/feedback'
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

const CATEGORY_TONES = {
  Shipments: 'info',
  Tracking: 'info',
  Fleet: 'success',
  Payments: 'success',
  Account: 'warning',
  Reports: 'info',
  Support: 'danger',
}

const SUPPORT_ROWS = [
  { icon: 'mail', label: 'Email', value: 'support@aquaflow.com', href: 'mailto:support@aquaflow.com' },
  { icon: 'phone', label: 'Phone', value: '+971 50 000 0000', href: 'tel:+971500000000' },
  { icon: 'clock', label: 'Business hours', value: 'Mon–Sat · 08:00–22:00 GST' },
  { icon: 'zap', label: 'Avg. response', value: 'Under 34 minutes' },
]

const QUICK_ACTIONS = [
  { to: '/support/tickets', icon: 'ticket', label: 'Create Ticket', desc: 'Report an issue' },
  { to: '/support/chat', icon: 'message-circle', label: 'Start Live Chat', desc: 'Talk in real time' },
  { to: '/support/faq', icon: 'help-circle', label: 'Browse FAQs', desc: 'Find quick answers' },
  { to: '/tracking', icon: 'ship', label: 'Track Shipment', desc: 'Follow your cargo' },
]

const SYSTEM_STATUS = [
  { label: 'API', detail: 'All endpoints responding' },
  { label: 'Live Tracking', detail: 'AIS feed healthy' },
  { label: 'Notifications', detail: 'Delivery normal' },
]

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
                <Badge tone={CATEGORY_TONES[faq.category] || 'info'}>{faq.category}</Badge>
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

function HelpAccordionItem({ faq, open, onToggle }) {
  return (
    <div className={`help-accordion-item ${open ? 'is-open' : ''}`}>
      <button type="button" className="help-accordion-head" onClick={onToggle} aria-expanded={open}>
        <span className="help-accordion-title">{faq.q}</span>
        <span className="help-accordion-icon" aria-hidden="true"><Icon name="chevron-down" size={18} /></span>
      </button>
      <div className="help-accordion-body">
        <div className="help-accordion-inner">
          <Badge tone={CATEGORY_TONES[faq.category] || 'info'} className="help-accordion-badge">{faq.category}</Badge>
          <p>{faq.a}</p>
        </div>
      </div>
    </div>
  )
}

export function Support() {
  const { tickets } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [openKey, setOpenKey] = useState(null)
  const faqRef = useRef(null)

  const categories = useMemo(() => ['All', ...new Set(faqs.map((f) => f.category))], [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return faqs.filter((f) => {
      const matchesQuery = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      const matchesCat = category === 'All' || f.category === category
      return matchesQuery && matchesCat
    })
  }, [query, category])

  const popular = useMemo(
    () => [...faqs].sort((a, b) => b.a.length - a.a.length).slice(0, 4),
    [],
  )

  const recentTickets = useMemo(() => tickets.slice(0, 4), [tickets])

  const openArticle = (faq) => {
    setCategory(faq.category)
    setOpenKey(faq.q)
    faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const clearSearch = () => setQuery('')

  return (
    <div className="page page--support">
      <section className="help-hero" style={{ '--i': 0 }}>
        <div className="help-hero-glyph" aria-hidden="true"><Icon name="life-buoy" size={220} /></div>
        <p className="eyebrow help-hero-eyebrow">Help Center</p>
        <h1>How can we help?</h1>
        <p className="help-hero-desc">
          Browse the knowledge base, chat with a specialist, or open a ticket — support that ships with you.
        </p>

        <div className="help-hero-search">
          <Icon name="search" size={20} className="help-hero-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for answers, articles, or topics…"
            aria-label="Search the help center"
          />
          {query && (
            <button type="button" className="help-hero-search-clear" onClick={clearSearch} aria-label="Clear search">
              <Icon name="close" size={15} />
            </button>
          )}
          <button type="button" className="btn btn--primary help-hero-search-btn" onClick={() => faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <span>Search</span>
            <Icon name="arrow-right" size={15} />
          </button>
        </div>

        <div className="help-hero-meta">
          <span><span className="status-dot help-hero-live" aria-hidden="true" /> Live chat online</span>
          <span>Avg. response <strong>34 min</strong></span>
          <span>24/7 for urgent issues</span>
        </div>
      </section>

      <section className="help-actions" style={{ '--i': 1 }} aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <a key={action.label} href={`#${action.to}`} className="help-action">
            <span className="help-action-icon" aria-hidden="true"><Icon name={action.icon} size={22} /></span>
            <span className="help-action-copy">
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </span>
            <Icon name="arrow-right" size={16} className="help-action-arrow" aria-hidden="true" />
          </a>
        ))}
      </section>

      <section className="support-cards" style={{ '--i': 2 }}>
        <LinkCard to="/support/faq" icon="help-circle" title="FAQ" description="Answers to the most common questions about shipments, tracking, and billing." accent="royal" />
        <LinkCard to="/support/chat" icon="message-circle" title="Live Chat" description="Talk to a specialist in real time during business hours." accent="ocean" />
        <LinkCard to="/support/tickets" icon="ticket" title="Tickets" description="Track and manage your open support requests." accent="success" />
      </section>

      <div className="help-grid" style={{ '--i': 3 }}>
        <div className="help-main">
          <section className="help-card" aria-labelledby="help-articles-title">
            <div className="help-section-head">
              <div>
                <p className="eyebrow">Knowledge base</p>
                <h2 id="help-articles-title">Popular articles</h2>
              </div>
              <a className="help-section-link" href="#/support/faq">View all <Icon name="arrow-right" size={14} /></a>
            </div>
            <div className="help-articles">
              {popular.map((faq) => (
                <button key={faq.q} type="button" className="help-article" onClick={() => openArticle(faq)}>
                  <span className="help-article-icon" aria-hidden="true"><Icon name="file-text" size={18} /></span>
                  <span className="help-article-copy">
                    <strong>{faq.q}</strong>
                    <span>{faq.a.length > 90 ? `${faq.a.slice(0, 90)}…` : faq.a}</span>
                  </span>
                  <Badge tone={CATEGORY_TONES[faq.category] || 'info'} className="help-article-badge">{faq.category}</Badge>
                  <span className="help-article-read">4 min read</span>
                  <Icon name="arrow-right" size={15} className="help-article-arrow" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="help-card" ref={faqRef} id="support-faq" aria-labelledby="help-faq-title">
            <div className="help-section-head">
              <div>
                <p className="eyebrow">Knowledge base</p>
                <h2 id="help-faq-title">Frequently asked questions</h2>
              </div>
            </div>

            <div className="help-filters" role="group" aria-label="Filter FAQs by category">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`help-filter ${category === c ? 'is-active' : ''}`}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="help-empty">
                <EmptyState
                  icon="help-circle"
                  title="No answers found"
                  description="Try a different search or reach out to our team."
                  action={<a className="btn btn--primary" href="#/support/tickets"><span>Open a ticket</span></a>}
                />
              </div>
            ) : (
              <div className="help-accordion">
                {filtered.map((faq) => (
                  <HelpAccordionItem
                    key={faq.q}
                    faq={faq}
                    open={openKey === faq.q}
                    onToggle={() => setOpenKey(openKey === faq.q ? null : faq.q)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="help-side">
          <section className="help-card help-card--support" aria-labelledby="help-support-title">
            <div className="help-section-head">
              <div>
                <p className="eyebrow">Direct line</p>
                <h2 id="help-support-title">Contact support</h2>
              </div>
            </div>
            <div className="help-support-list">
              {SUPPORT_ROWS.map((row) => (
                <div key={row.label} className="help-support-row">
                  <span className="help-support-icon" aria-hidden="true"><Icon name={row.icon} size={17} /></span>
                  <div className="help-support-copy">
                    <span>{row.label}</span>
                    {row.href ? <a href={row.href}>{row.value}</a> : <strong>{row.value}</strong>}
                  </div>
                </div>
              ))}
            </div>
            <a href="mailto:support@aquaflow.com" className="btn btn--primary help-support-cta">
              <Icon name="mail" size={16} />
              <span>Contact support</span>
            </a>
          </section>

          <section className="help-card" aria-labelledby="help-tickets-title">
            <div className="help-section-head">
              <div>
                <p className="eyebrow">Your requests</p>
                <h2 id="help-tickets-title">Recent tickets</h2>
              </div>
              <a className="help-section-link" href="#/support/tickets">View all <Icon name="arrow-right" size={14} /></a>
            </div>
            <div className="help-tickets">
              {recentTickets.map((ticket) => (
                <a key={ticket.id} href="#/support/tickets" className="help-ticket">
                  <span className="help-ticket-top">
                    <strong>{ticket.id}</strong>
                    <StatusChip status={ticket.status} />
                  </span>
                  <span className="help-ticket-title">{ticket.subject}</span>
                  <span className="help-ticket-updated"><Icon name="clock" size={13} /> Updated {ticket.updated}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="help-card help-card--status" aria-labelledby="help-status-title">
            <div className="help-section-head">
              <div>
                <p className="eyebrow">Service health</p>
                <h2 id="help-status-title">System status</h2>
              </div>
              <span className="help-status-all"><span className="help-status-dot help-status-dot--ok" aria-hidden="true" /> All operational</span>
            </div>
            <div className="help-status-list">
              {SYSTEM_STATUS.map((item) => (
                <div key={item.label} className="help-status-row">
                  <span className="help-status-dot help-status-dot--ok" aria-hidden="true" />
                  <div className="help-status-copy">
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <Badge tone="success">Operational</Badge>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function LinkCard({ to, icon, title, description, accent = 'royal' }) {
  return (
    <a href={`#${to}`} className={`support-card support-card--${accent}`}>
      <span className="support-card-icon" aria-hidden="true"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="support-card-link">
        <span>Open</span>
        <Icon name="arrow-right" size={15} />
      </span>
    </a>
  )
}

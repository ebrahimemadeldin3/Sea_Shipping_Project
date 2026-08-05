import { useMemo } from 'react'
import { PageHeader, Card } from '../../components/ui/display'
import { StatusChip } from '../../components/ui/feedback'
import { EmptyState } from '../../components/ui/feedback'
import { Link, useParams } from '../../router/Router'
import { useData } from '../../store/DataProvider'
import Icon from '../../components/Icon'

export function SearchResults() {
  const { q = '' } = Object.fromEntries(useParams())
  const query = q.trim().toLowerCase()
  const { ships, shipments, customers, ports } = useData()

  const results = useMemo(() => {
    if (!query) return { ships: [], shipments: [], customers: [], ports: [] }
    const match = (value) => String(value ?? '').toLowerCase().includes(query)
    return {
      ships: ships.filter((s) => match(s.name) || match(s.imo) || match(s.currentPort) || match(s.type)),
      shipments: shipments.filter((s) => match(s.id) || match(s.customer) || match(s.origin) || match(s.destination) || match(s.cargo)),
      customers: customers.filter((c) => match(c.name) || match(c.contact) || match(c.email) || match(c.region)),
      ports: ports.filter((p) => match(p.name) || match(p.country) || match(p.region)),
    }
  }, [query, ships, shipments, customers, ports])

  const total = Object.values(results).reduce((sum, list) => sum + list.length, 0)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Global search"
        title={query ? `Results for “${q}”` : 'Search'}
        description={query ? `${total} match${total === 1 ? '' : 'es'} across ships, shipments, customers, and ports.` : 'Type a term in the search bar to find ships, shipments, customers, and ports.'}
        breadcrumbs={[{ label: 'System' }, { label: 'Search' }]}
      />

      {!query || total === 0 ? (
        <Card>
          <EmptyState
            icon="search"
            title={query ? 'No results found' : 'Start searching'}
            description={query ? `Nothing matched “${q}”. Try a vessel name, shipment ID, customer, or port.` : 'Use the search bar in the top navigation to look up anything across the platform.'}
          />
        </Card>
      ) : (
        <div className="stack">
          <ResultSection title="Ships" icon="ship" count={results.ships.length}>
            {results.ships.map((ship) => (
              <Link to={`/ships/${ship.id}`} key={ship.id} className="result-row">
                <span className="doc-icon" aria-hidden="true"><Icon name="ship" size={18} /></span>
                <div className="fleet-row-copy">
                  <strong>{ship.name}</strong>
                  <span>{ship.imo} · {ship.type}</span>
                </div>
                <StatusChip status={ship.status} />
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Shipments" icon="package" count={results.shipments.length}>
            {results.shipments.map((shipment) => (
              <Link to={`/shipments/${shipment.id}`} key={shipment.id} className="result-row">
                <span className="doc-icon" aria-hidden="true"><Icon name="package" size={18} /></span>
                <div className="fleet-row-copy">
                  <strong>{shipment.id}</strong>
                  <span>{shipment.cargo} · {shipment.origin} → {shipment.destination}</span>
                </div>
                <StatusChip status={shipment.status} />
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Customers" icon="users" count={results.customers.length}>
            {results.customers.map((customer) => (
              <Link to={`/customers/${customer.id}`} key={customer.id} className="result-row">
                <span className="doc-icon" aria-hidden="true"><Icon name="users" size={18} /></span>
                <div className="fleet-row-copy">
                  <strong>{customer.name}</strong>
                  <span>{customer.contact} · {customer.region}</span>
                </div>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Ports" icon="anchor" count={results.ports.length}>
            {results.ports.map((port) => (
              <Link to={`/ports/${port.id}`} key={port.id} className="result-row">
                <span className="doc-icon" aria-hidden="true"><Icon name="anchor" size={18} /></span>
                <div className="fleet-row-copy">
                  <strong>{port.name}</strong>
                  <span>{port.id} · {port.country}</span>
                </div>
              </Link>
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  )
}

function ResultSection({ title, icon, count, children }) {
  if (!count) return null
  return (
    <Card title={title} eyebrow={`${count} result${count === 1 ? '' : 's'}`}>
      <div className="stack stack--sm">
        <div className="result-row-head" aria-hidden="true">
          <Icon name={icon} size={16} />
          <strong>{title}</strong>
        </div>
        <div className="result-row-list">{children}</div>
      </div>
    </Card>
  )
}

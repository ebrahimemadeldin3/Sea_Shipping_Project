import { useEffect, useMemo, useState } from 'react'
import { PageHeader, StatCard } from '../../components/ui/display'
import { ShipMap } from '../../components/domain/ShipMap'
import { StatusChip, ProgressBar, Skeleton, EmptyState } from '../../components/ui/feedback'
import { Button } from '../../components/ui/Button'
import { useData } from '../../store/DataProvider'
import Icon from '../../components/Icon'

const EXTRA_PORTS = [
  { id: 'EXT-OSL', name: 'Oslo', vesselsInPort: 9, coordinates: { lat: 59.91, lng: 10.75 } },
  { id: 'EXT-BOM', name: 'Mumbai', vesselsInPort: 15, coordinates: { lat: 18.97, lng: 72.82 } },
  { id: 'EXT-TYO', name: 'Tokyo', vesselsInPort: 21, coordinates: { lat: 35.68, lng: 139.76 } },
]

const FILTER_OPTIONS = ['All', 'On Route', 'In Port', 'Loading', 'Maintenance', 'Delayed']

const EVENT_TYPES = ['Departed', 'Arrived', 'Delayed', 'Docked', 'Route Updated']
const EVENT_ICONS = {
  Departed: 'send',
  Arrived: 'check-circle',
  Delayed: 'alert-triangle',
  Docked: 'anchor',
  'Route Updated': 'compass',
}

const shortName = (name) => (name || '').replace(/^Port of\s+/i, '')

function daysUntil(eta) {
  if (!eta) return null
  const ms = new Date(`${eta}T00:00:00`).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

const eventKey = (type) => String(type || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')

const seedEvents = (list) =>
  list.slice(0, 7).map((s, i) => ({
    id: `ev-${i}`,
    type: EVENT_TYPES[(i * 2 + 1) % EVENT_TYPES.length],
    ship: s.name,
    route: `${s.currentPort} → ${s.nextPort}`,
    ts: Date.now() - (i + 1) * 11000,
  }))

export function LiveTracking() {
  const { ships, ports } = useData()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [liveShips, setLiveShips] = useState(ships)
  const [lastUpdate, setLastUpdate] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [events, setEvents] = useState(() => seedEvents(ships))

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setLiveShips(ships)
    setEvents(seedEvents(ships))
  }, [ships])

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000)
    const ais = setInterval(() => {
      setLastUpdate(Date.now())
      setLiveShips((prev) =>
        prev.map((s) => {
          if (s.status !== 'On Route' || !s.heading) return s
          const rad = (s.heading * Math.PI) / 180
          const step = 0.045
          return {
            ...s,
            position: {
              lat: s.position.lat + Math.cos(rad) * step,
              lng: s.position.lng + Math.sin(rad) * step,
            },
          }
        }),
      )
      setEvents((prev) => {
        const pool = ships.filter((s) => s.status === 'On Route')
        const ship = pool[Math.floor(Math.random() * pool.length)] || ships[0]
        const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
        if (!ship) return prev
        const next = [
          { id: Date.now(), type, ship: ship.name, route: `${ship.currentPort} → ${ship.nextPort}`, ts: Date.now() },
          ...prev,
        ]
        return next.slice(0, 9)
      })
    }, 4000)
    return () => {
      clearInterval(clock)
      clearInterval(ais)
    }
  }, [ships])

  const worldPorts = useMemo(() => {
    const result = []
    const seen = new Set()
    const add = (p) => {
      const key = shortName(p.name)
      if (seen.has(key)) return
      seen.add(key)
      result.push({ id: p.id, name: p.name, vesselsInPort: p.vesselsInPort || 0, coordinates: p.coordinates })
    }
    ports.forEach(add)
    EXTRA_PORTS.forEach(add)
    return result
  }, [ports])

  const routes = useMemo(() => {
    const out = []
    const seen = new Set()
    const lookup = (name) => {
      const key = shortName(name)
      const found = worldPorts.find((p) => shortName(p.name) === key)
      return found ? found.coordinates : null
    }
    ships.forEach((s) => {
      const from = lookup(s.currentPort)
      const to = lookup(s.nextPort)
      if (!from || !to) return
      const key = `${s.currentPort}|${s.nextPort}`
      if (seen.has(key)) return
      seen.add(key)
      out.push({ from, to, status: s.status, ship: s.name })
    })
    return out
  }, [ships, worldPorts])

  const visibleShips = useMemo(
    () => (filter === 'All' ? liveShips : liveShips.filter((s) => s.status === filter)),
    [liveShips, filter],
  )

  const activeShip = liveShips.find((s) => s.id === selected?.id)

  const inTransit = ships.filter((s) => s.status === 'On Route').length
  const delayed = ships.filter((s) => s.status === 'Delayed').length
  const lowFuel = ships.filter((s) => s.fuelLevel < 50).length
  const etaList = ships.map((s) => daysUntil(s.eta)).filter((n) => n != null)
  const avgEta = etaList.length ? (etaList.reduce((a, b) => a + b, 0) / etaList.length).toFixed(1) : '—'
  const weatherAlerts = Math.min(4, delayed + Math.ceil(lowFuel / 2))
  const secondsAgo = Math.max(0, Math.round((now - lastUpdate) / 1000))

  const refreshAis = () => {
    setLastUpdate(Date.now())
    setLiveShips([...ships])
    setEvents(seedEvents(ships))
  }

  const etaDays = activeShip ? daysUntil(activeShip.eta) : null

  const fmtAgo = (ts) => {
    const ago = Math.max(0, Math.round((now - ts) / 1000))
    if (ago < 5) return 'just now'
    if (ago < 60) return `${ago}s ago`
    return `${Math.round(ago / 60)}m ago`
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Live operations"
        title="Live Tracking"
        description="Real-time vessel positions, ETA, and route status across your fleet."
        actions={
          <Button variant="ghost" icon="refresh" onClick={refreshAis}>
            Refresh feed
          </Button>
        }
      />

      <div className="tracking-kpis" aria-label="Fleet overview">
        <StatCard label="Active Vessels" value={inTransit} delta={ships.length > 0 ? 1 : 0} icon="ship" hint={`${ships.length} total in fleet`} />
        <StatCard label="Delayed Shipments" value={delayed} delta={delayed ? 1 : 0} icon="alert-triangle" hint={delayed ? 'needs attention' : 'all on time'} />
        <StatCard label="Average ETA" value={`${avgEta} d`} delta={-1} icon="clock" hint="days to arrival" />
        <StatCard label="Ports Online" value={worldPorts.length} delta={2} icon="globe" hint="live AIS coverage" />
        <StatCard label="Weather Alerts" value={weatherAlerts} delta={0} icon="cloud-rain" hint="along active routes" />
      </div>

      <div className="tracking-ticker" role="log" aria-label="Live vessel activity">
        <span className="tracking-ticker-live">
          <span className="tracking-live-dot" aria-hidden="true" />
          <strong>Live</strong>
        </span>
        <div className="tracking-ticker-viewport">
          <div className="tracking-ticker-track">
            {[...events, ...events].map((ev, i) => (
              <span key={`${ev.id}-${i}`} className={`tracking-ticker-item tracking-ticker-item--${eventKey(ev.type)}`}>
                <Icon name={EVENT_ICONS[ev.type] || 'waves'} size={13} />
                <strong>{ev.ship}</strong> {ev.type}
                <span className="tracking-ticker-route">{ev.route}</span>
                <em>{fmtAgo(ev.ts)}</em>
              </span>
            ))}
          </div>
        </div>
        <span className="tracking-ticker-updated">Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}</span>
        <span className="tracking-ticker-count">
          {visibleShips.length}/{ships.length} vessels
        </span>
      </div>

      <div className="tracking-layout">
        <div className="tracking-map">
          {loading ? (
            <Skeleton height={560} radius={20} />
          ) : (
            <>
              <ShipMap
                ports={worldPorts}
                ships={visibleShips}
                routes={routes}
                height={560}
                live
                showPortLabels
                selectedShipId={activeShip?.id}
                onSelectShip={(ship) => setSelected(ship)}
              />

              <div className="map-chips" role="group" aria-label="Filter vessels by status">
                {FILTER_OPTIONS.map((opt) => {
                  const count = opt === 'All' ? ships.length : ships.filter((s) => s.status === opt).length
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`map-chip ${filter === opt ? 'is-active' : ''}`}
                      onClick={() => setFilter(opt)}
                      aria-pressed={filter === opt}
                    >
                      {opt}
                      <span className="map-chip-count">{count}</span>
                    </button>
                  )
                })}
              </div>

              {activeShip && (
                <div className="tracking-focus" role="dialog" aria-label={`Details for ${activeShip.name}`}>
                  <div className="tracking-focus-head">
                    <span className="tracking-focus-icon" aria-hidden="true">
                      <Icon name="ship" size={20} />
                    </span>
                    <div className="tracking-focus-title">
                      <h3>{activeShip.name}</h3>
                      <p>{activeShip.type} · {activeShip.imo} · {activeShip.flag}</p>
                    </div>
                    <StatusChip status={activeShip.status} />
                    <button type="button" className="tracking-focus-close" onClick={() => setSelected(null)} aria-label="Close vessel details">
                      <Icon name="close" size={16} />
                    </button>
                  </div>

                  <div className="tracking-focus-route">
                    <span>{activeShip.currentPort} → {activeShip.nextPort}</span>
                    <strong>{activeShip.utilization}%</strong>
                  </div>
                  <ProgressBar value={activeShip.utilization} showLabel label="Route progress" />

                  <div className="tracking-focus-grid">
                    <div className="voyage-cell">
                      <span className="voyage-cell-label"><Icon name="waves" size={13} /> Speed</span>
                      <strong>{activeShip.speed}</strong>
                    </div>
                    <div className="voyage-cell">
                      <span className="voyage-cell-label"><Icon name="compass" size={13} /> Heading</span>
                      <strong>{activeShip.heading}°</strong>
                    </div>
                    <div className="voyage-cell">
                      <span className="voyage-cell-label"><Icon name="clock" size={13} /> ETA</span>
                      <strong>
                        {activeShip.eta}
                        {etaDays != null && <span className="voyage-sub"> · {etaDays}d</span>}
                      </strong>
                    </div>
                    <div className="voyage-cell">
                      <span className="voyage-cell-label"><Icon name="flag" size={13} /> Next port</span>
                      <strong>{activeShip.nextPort}</strong>
                    </div>
                    <div className="voyage-cell">
                      <span className="voyage-cell-label"><Icon name="fuel" size={13} /> Fuel</span>
                      <strong>{activeShip.fuelLevel}%</strong>
                    </div>
                    <div className="voyage-cell">
                      <span className="voyage-cell-label"><Icon name="box" size={13} /> Cargo</span>
                      <strong>{activeShip.cargoWeight}</strong>
                    </div>
                  </div>

                  <div className="tracking-notes">
                    <span className="tracking-notes-icon" aria-hidden="true"><Icon name="cloud" size={17} /></span>
                    <p><strong>Weather:</strong> Calm seas, light wind · visibility excellent along the plotted route.</p>
                  </div>

                  <a href="#/fleet" className="btn btn--outline btn--sm tracking-focus-link">
                    <Icon name="arrow-right" size={14} />
                    Open vessel profile
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="tracking-side">
          <div className="tracking-side-head">
            <div>
              <p className="eyebrow">Fleet</p>
              <h2>Vessels <span className="tracking-side-count">{visibleShips.length}</span></h2>
            </div>
            <span className="tracking-side-hint">Click to focus on map</span>
          </div>

          {loading ? (
            <div className="tracking-ships">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="tracking-ship-skeleton">
                  <Skeleton height={54} radius={14} />
                </div>
              ))}
            </div>
          ) : visibleShips.length === 0 ? (
            <EmptyState icon="ship" title="No vessels match" description="Try a different filter to see more of the fleet." />
          ) : (
            <div className="tracking-ships">
              {visibleShips.map((ship, i) => {
                const selectedFlag = activeShip?.id === ship.id
                const shipAgo = Math.max(0, Math.round((now - lastUpdate) / 1000) + i * 7)
                return (
                  <button
                    key={ship.id}
                    type="button"
                    className={`tracking-ship ${selectedFlag ? 'is-selected' : ''}`}
                    onClick={() => setSelected(ship)}
                    aria-pressed={selectedFlag}
                  >
                    <span className="tracking-ship-top">
                      <span className={`tracking-ship-icon tracking-ship-icon--${ship.status ? String(ship.status).toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'on-route'}`} aria-hidden="true">
                        <Icon name="ship" size={18} />
                      </span>
                      <span className="tracking-ship-copy">
                        <strong>{ship.name}</strong>
                        <span className="tracking-ship-updated"><Icon name="clock" size={12} /> Updated {shipAgo < 60 ? `${shipAgo}s ago` : `${Math.round(shipAgo / 60)}m ago`}</span>
                      </span>
                      <StatusChip status={ship.status} />
                    </span>
                    <span className="tracking-ship-route">
                      <span>{ship.currentPort}</span>
                      <Icon name="arrow-right" size={14} />
                      <span>{ship.nextPort}</span>
                      <em>{ship.utilization}%</em>
                    </span>
                    <span className="tracking-ship-progress" aria-hidden="true">
                      <span className="tracking-ship-progress-bar" style={{ width: `${ship.utilization || 0}%` }} />
                    </span>
                    <span className="tracking-ship-meta">
                      <span><Icon name="clock" size={13} /> ETA {ship.eta} · {daysUntil(ship.eta) ?? '—'}d</span>
                      <span><Icon name="waves" size={13} /> {ship.speed}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

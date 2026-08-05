import { useEffect, useMemo, useState } from 'react'
import { PageHeader, Card, StatCard } from '../../components/ui/display'
import { ShipMap } from '../../components/domain/ShipMap'
import { StatusChip, Badge, ProgressBar, Skeleton, EmptyState } from '../../components/ui/feedback'
import { Dropdown } from '../../components/ui/navigation'
import { Button } from '../../components/ui/Button'
import { useData } from '../../store/DataProvider'
import Icon from '../../components/Icon'

const EXTRA_PORTS = [
  { id: 'EXT-OSL', name: 'Oslo', vesselsInPort: 9, coordinates: { lat: 59.91, lng: 10.75 } },
  { id: 'EXT-BOM', name: 'Mumbai', vesselsInPort: 15, coordinates: { lat: 18.97, lng: 72.82 } },
  { id: 'EXT-TYO', name: 'Tokyo', vesselsInPort: 21, coordinates: { lat: 35.68, lng: 139.76 } },
]

const FILTER_OPTIONS = ['All', 'On Route', 'Loading', 'In Port', 'Delayed', 'Maintenance']

const shortName = (name) => (name || '').replace(/^Port of\s+/i, '')

function daysUntil(eta) {
  if (!eta) return null
  const ms = new Date(`${eta}T00:00:00`).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

export function LiveTracking() {
  const { ships, ports } = useData()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [liveShips, setLiveShips] = useState(ships)
  const [lastUpdate, setLastUpdate] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setLiveShips(ships)
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
    }, 4000)
    return () => {
      clearInterval(clock)
      clearInterval(ais)
    }
  }, [])

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
      out.push({ from, to })
    })
    return out
  }, [ships, worldPorts])

  const visibleShips = useMemo(
    () => (filter === 'All' ? liveShips : liveShips.filter((s) => s.status === filter)),
    [liveShips, filter],
  )

  const activeShip = liveShips.find((s) => s.id === selected?.id)

  const speeds = ships.map((s) => parseFloat(s.speed)).filter((n) => !Number.isNaN(n))
  const avgSpeed = speeds.length ? (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1) : '—'
  const inTransit = ships.filter((s) => s.status === 'On Route').length
  const delayed = ships.filter((s) => s.status === 'Delayed').length
  const onSchedule = ships.length ? Math.round(((ships.length - delayed) / ships.length) * 100) : 0
  const lowFuel = ships.filter((s) => s.fuelLevel < 50).length
  const secondsAgo = Math.max(0, Math.round((now - lastUpdate) / 1000))

  const refreshAis = () => {
    setLastUpdate(Date.now())
    setLiveShips([...ships])
  }

  const etaDays = activeShip ? daysUntil(activeShip.eta) : null

  return (
    <div className="page">
      <PageHeader
        eyebrow="Live operations"
        title="Live Tracking"
        description="Real-time vessel positions, ETA, and route status across your fleet."
        actions={
          <Dropdown
            label="Show"
            value={filter}
            onChange={setFilter}
            options={FILTER_OPTIONS.map((s) => ({ value: s, label: s }))}
            icon="filter"
          />
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Vessels Tracked" value={ships.length} icon="ship" hint={`${inTransit} in transit now`} />
        <StatCard label="Avg. Speed" value={`${avgSpeed} kn`} icon="waves" hint="fleet live average" />
        <StatCard label="On Schedule" value={`${onSchedule}%`} icon="check-circle" hint={delayed ? `${delayed} vessel${delayed > 1 ? 's' : ''} delayed` : 'no vessels delayed'} />
        <StatCard label="Fuel Warning" value={lowFuel} icon="fuel" hint="vessels below 50% reserve" />
      </div>

      <Card padding="none" bodyClassName="stack">
        <div className="tracking-livebar" aria-live="polite">
          <span className="tracking-live-dot" aria-hidden="true" />
          <strong>Live AIS feed</strong>
          <span className="tracking-live-ago">
            Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
          </span>
          <span className="tracking-live-count">
            {visibleShips.length} of {ships.length} vessels shown
          </span>
          <Button variant="ghost" size="sm" icon="refresh" onClick={refreshAis}>
            Refresh
          </Button>
        </div>

        <div className="tracking-layout">
          <div className="tracking-map">
            {loading ? (
              <Skeleton height={480} radius={0} />
            ) : (
              <ShipMap
                ports={worldPorts}
                ships={visibleShips}
                routes={routes}
                height={480}
                live
                showPortLabels
                selectedShipId={activeShip?.id}
                onSelectShip={(ship) => setSelected(ship)}
              />
            )}
          </div>

          <aside className="tracking-side">
            <div className="tracking-ships">
              {visibleShips.slice(0, 6).map((ship) => (
                <button
                  key={ship.id}
                  type="button"
                  className={`tracking-ship ${activeShip?.id === ship.id ? 'is-selected' : ''}`}
                  onClick={() => setSelected(ship)}
                  aria-pressed={activeShip?.id === ship.id}
                >
                  <span className="tracking-ship-icon" aria-hidden="true"><Icon name="ship" size={17} /></span>
                  <span className="fleet-row-copy">
                    <strong>{ship.name}</strong>
                    <span>{ship.currentPort} → {ship.nextPort}</span>
                  </span>
                  <StatusChip status={ship.status} />
                  <span className="tracking-ship-progress" aria-hidden="true">
                    <span className="tracking-ship-progress-bar" style={{ width: `${ship.utilization || 0}%` }} />
                  </span>
                </button>
              ))}
            </div>

            {activeShip ? (
              <div className="tracking-detail">
                <div className="tracking-detail-head">
                  <div>
                    <h3>{activeShip.name}</h3>
                    <p className="tracking-detail-sub">
                      {activeShip.type} · {activeShip.imo} · {activeShip.flag}
                    </p>
                  </div>
                  <Badge tone="success" dot>Live</Badge>
                </div>

                <div className="tracking-detail-grid">
                  <div className="voyage-cell">
                    <span className="voyage-cell-label"><Icon name="waves" size={14} /> Speed</span>
                    <strong>{activeShip.speed}</strong>
                  </div>
                  <div className="voyage-cell">
                    <span className="voyage-cell-label"><Icon name="compass" size={14} /> Heading</span>
                    <strong>{activeShip.heading}°</strong>
                  </div>
                  <div className="voyage-cell">
                    <span className="voyage-cell-label"><Icon name="clock" size={14} /> ETA</span>
                    <strong>
                      {activeShip.eta}
                      {etaDays != null && <span className="voyage-sub"> · {etaDays} days</span>}
                    </strong>
                  </div>
                  <div className="voyage-cell">
                    <span className="voyage-cell-label"><Icon name="flag" size={14} /> Next port</span>
                    <strong>{activeShip.nextPort}</strong>
                  </div>
                  <div className="voyage-cell">
                    <span className="voyage-cell-label"><Icon name="fuel" size={14} /> Fuel</span>
                    <strong>{activeShip.fuelLevel}%</strong>
                  </div>
                  <div className="voyage-cell">
                    <span className="voyage-cell-label"><Icon name="box" size={14} /> Cargo</span>
                    <strong>{activeShip.cargoWeight}</strong>
                  </div>
                </div>

                <div>
                  <div className="voyage-row voyage-row--route">
                    <span className="voyage-label">{activeShip.currentPort} → {activeShip.nextPort}</span>
                    <span className="voyage-route-pct">{activeShip.utilization}%</span>
                  </div>
                  <ProgressBar value={activeShip.utilization} label="Route progress" showLabel />
                </div>

                <div className="tracking-notes">
                  <span className="tracking-notes-icon" aria-hidden="true"><Icon name="cloud" size={18} /></span>
                  <p><strong>Weather:</strong> Calm seas, light wind · visibility excellent along the plotted route.</p>
                </div>

                <a href="#/fleet" className="vessel-link">
                  Open vessel profile <Icon name="arrow-right" size={15} />
                </a>
              </div>
            ) : (
              <EmptyState icon="map-pin" title="Select a vessel" description="Choose a vessel on the map or from the list to see its live details." />
            )}
          </aside>
        </div>
      </Card>
    </div>
  )
}

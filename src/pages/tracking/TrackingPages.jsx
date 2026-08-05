import { useEffect, useMemo, useState } from 'react'
import { PageHeader, Card, StatCard } from '../../components/ui/display'
import { ShipMap } from '../../components/domain/ShipMap'
import { StatusChip, Badge, ProgressBar, Skeleton, EmptyState } from '../../components/ui/feedback'
import { Dropdown } from '../../components/ui/navigation'
import { useData } from '../../store/DataProvider'
import Icon from '../../components/Icon'

const worldPorts = [
  { id: 'PT-02', name: 'Singapore', vesselsInPort: 38, coordinates: { lat: 1.264, lng: 103.84 } },
  { id: 'PT-03', name: 'Rotterdam', vesselsInPort: 27, coordinates: { lat: 51.958, lng: 4.14 } },
  { id: 'PT-04', name: 'Shanghai', vesselsInPort: 51, coordinates: { lat: 30.627, lng: 122.065 } },
  { id: 'PT-05', name: 'Hamburg', vesselsInPort: 22, coordinates: { lat: 53.531, lng: 9.916 } },
  { id: 'PT-06', name: 'Los Angeles', vesselsInPort: 19, coordinates: { lat: 33.73, lng: -118.26 } },
  { id: 'PT-08', name: 'Alexandria', vesselsInPort: 12, coordinates: { lat: 31.2, lng: 29.88 } },
]

export function LiveTracking() {
  const { ships } = useData()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const visibleShips = useMemo(() => (filter === 'All' ? ships : ships.filter((s) => s.status === filter)), [ships, filter])

  const activeShip = ships.find((s) => s.id === selected?.id)

  const routes = [
    { from: { lat: 26, lng: 57 }, to: { lat: 51.95, lng: 4.04 } },
    { from: { lat: 30.6, lng: 122 }, to: { lat: 33.7, lng: -118 } },
    { from: { lat: 59, lng: 10 }, to: { lat: 51.95, lng: 4.04 } },
    { from: { lat: 53.5, lng: 10 }, to: { lat: 51.2, lng: 4.4 } },
  ]

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
            options={['All', 'On Route', 'Loading', 'In Port', 'Delayed'].map((s) => ({ value: s, label: s }))}
            icon="filter"
          />
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Vessels Tracked" value={ships.length} delta="live" icon="ship" hint="AIS feed" />
        <StatCard label="Avg. Speed" value="18.2 kn" delta="+0.4" icon="waves" hint="fleet average" />
        <StatCard label="On Schedule" value="96%" delta="+1.2%" icon="check-circle" hint="of active voyages" />
        <StatCard label="Weather" value="Calm" icon="cloud" hint="no major storms" />
      </div>

      <Card padding="none" bodyClassName="stack">
        <div className="stack" style={{ gap: 0 }}>
          {loading ? (
            <Skeleton height={400} radius={0} />
          ) : (
            <ShipMap
              ports={worldPorts}
              ships={visibleShips}
              routes={routes}
              height={460}
              selectedShipId={activeShip?.id}
              onSelectShip={(ship) => setSelected(ship)}
            />
          )}
        </div>
        <div className="tracking-panel">
          <div className="tracking-ships">
            {visibleShips.slice(0, 4).map((ship) => (
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
              </button>
            ))}
          </div>

          {activeShip ? (
            <div className="tracking-detail">
              <div className="tracking-detail-head">
                <div>
                  <h3>{activeShip.name}</h3>
                  <p>Selected vessel · AIS updated 15 min ago</p>
                </div>
                <Badge tone="success" dot>Live</Badge>
              </div>
              <div className="grid grid-2">
                <div className="voyage-row"><span className="voyage-label">Speed</span><strong>{activeShip.speed}</strong></div>
                <div className="voyage-row"><span className="voyage-label">Heading</span><strong>{activeShip.heading}°</strong></div>
                <div className="voyage-row"><span className="voyage-label">ETA</span><strong>{activeShip.eta}</strong></div>
                <div className="voyage-row"><span className="voyage-label">Fuel</span><strong>{activeShip.fuelLevel}%</strong></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <ProgressBar value={activeShip.utilization} label="Route progress" showLabel />
              </div>
              <div className="tracking-notes">
                <span className="tracking-notes-icon" aria-hidden="true"><Icon name="cloud" size={18} /></span>
                <p><strong>Weather:</strong> Calm seas, light wind · visibility excellent along the plotted route.</p>
              </div>
            </div>
          ) : (
            <EmptyState icon="map-pin" title="Select a vessel" description="Choose a vessel on the map or from the list to see its live details." />
          )}
        </div>
      </Card>
    </div>
  )
}

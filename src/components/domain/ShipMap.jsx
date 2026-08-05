import { useState } from 'react'
import Icon from '../Icon'

export function ShipMap({
  ports = [],
  ships = [],
  routes = [],
  height = 420,
  className = '',
  onSelectShip,
  selectedShipId,
  live = false,
  showPortLabels = false,
}) {
  const [tooltip, setTooltip] = useState(null)
  const W = 900
  const H = height

  const project = (lat, lng) => {
    const x = ((lng + 180) / 360) * W
    const y = ((90 - lat) / 180) * H
    return { x, y }
  }

  const gridV = 18
  const gridH = 14

  const routePath = (route) => {
    const pts = [project(route.from.lat, route.from.lng), ...(route.waypoints || []).map((p) => project(p.lat, p.lng)), project(route.to.lat, route.to.lng)]
    return pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `Q${(p.x + pts[i - 1].x) / 2},${p.y} ${p.x},${p.y}`)).join(' ')
  }

  const statusClass = (status) => String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <div className={`ship-map ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interactive map of active shipping routes and vessels" className="ship-map-svg">
        <rect width={W} height={H} className="ship-map-bg" rx={0} />
        {Array.from({ length: gridV + 1 }).map((_, i) => {
          const x = (i / gridV) * W
          return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H} className="ship-map-grid" />
        })}
        {Array.from({ length: gridH + 1 }).map((_, i) => {
          const y = (i / gridH) * H
          return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} className="ship-map-grid" />
        })}

        {routes.map((route, i) => (
          <path key={i} d={routePath(route)} className="ship-map-route" strokeWidth={2.4} strokeDasharray="6 6">
            <animate attributeName="stroke-dashoffset" from="24" to="0" dur="4s" repeatCount="indefinite" />
          </path>
        ))}

        {ports.map((port, i) => {
          const p = project(port.coordinates.lat, port.coordinates.lng)
          const active = (ships.filter((s) => s.currentPort === port.name).length || 0) > 0
          return (
            <g
              key={port.id || i}
              transform={`translate(${p.x},${p.y})`}
              onMouseEnter={() => setTooltip({ x: p.x, y: p.y, content: `${port.name} · ${port.vesselsInPort} vessels` })}
              onMouseLeave={() => setTooltip(null)}
              className={`ship-map-port ${active ? 'is-active' : ''}`}
            >
              <circle r={active ? 14 : 11} className="ship-map-port-halo" />
              <circle r={active ? 5 : 4} className="ship-map-port-core" />
              {showPortLabels && (
                <text y={22} textAnchor="middle" className="ship-map-port-label">
                  {port.name}
                </text>
              )}
            </g>
          )
        })}

        {ships.map((ship, i) => {
          const p = project(ship.position.lat, ship.position.lng)
          const selected = ship.id === selectedShipId
          return (
            <g
              key={ship.id || i}
              transform={`translate(${p.x},${p.y})`}
              onClick={() => onSelectShip?.(ship)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectShip?.(ship)}
              tabIndex={0}
              role="button"
              aria-label={`${ship.name}, ${ship.status}, heading ${ship.heading} degrees`}
              className={`ship-map-vessel is-${statusClass(ship.status)} ${selected ? 'is-selected' : ''} ${live ? 'is-live' : ''}`}
              onMouseEnter={() => setTooltip({ x: p.x, y: p.y, content: `${ship.name} · ${ship.status} · ${ship.speed}` })}
              onMouseLeave={() => setTooltip(null)}
            >
              <g transform={`rotate(${ship.heading || 0})`} className="ship-map-ship-icon">
                <path d="M0,-10 L4,8 L0,5 L-4,8 Z" />
              </g>
              {selected && <circle r={18} className="ship-map-selected-ring" />}
              {live && <circle r={10} className="ship-map-pulse" />}
              {selected && (
                <text y={30} textAnchor="middle" className="ship-map-vessel-label">
                  {ship.name}
                </text>
              )}
            </g>
          )
        })}

        {tooltip && (
          <g transform={`translate(${Math.min(Math.max(tooltip.x, 70), W - 140)},${Math.max(tooltip.y - 20, 16)})`} className="ship-map-tooltip">
            <rect x={-62} y={-26} width={124} height={26} rx={8} />
            <text x={0} y={-8} textAnchor="middle" className="ship-map-tooltip-text">
              {tooltip.content}
            </text>
          </g>
        )}
      </svg>
      <div className="ship-map-legend">
        <span><span className="legend-port" /> Port</span>
        <span><span className="legend-ship" /> Vessel</span>
        <span><span className="legend-route" /> Active route</span>
      </div>
    </div>
  )
}

export function MapPlaceholder({ icon = 'map-pin', title = 'Map unavailable', description = 'The interactive map could not be loaded.', className = '' }) {
  return (
    <div className={`map-placeholder ${className}`}>
      <Icon name={icon} size={30} />
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  )
}

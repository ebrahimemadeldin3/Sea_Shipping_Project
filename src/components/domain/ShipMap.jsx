import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../Icon'

const STATUS_COLORS = {
  'On Route': '#41d3ff',
  'In Port': '#6ea8ff',
  Loading: '#ffc457',
  Delayed: '#ff7a7a',
  Maintenance: '#9fb4cc',
}

const STATUS_LABELS = Object.keys(STATUS_COLORS)

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

const statusKey = (status) => String(status || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')

export function ShipMap({
  ports = [],
  ships = [],
  routes = [],
  height = 560,
  className = '',
  onSelectShip,
  selectedShipId,
  live = false,
  showPortLabels = true,
}) {
  const W = 900
  const H = height

  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const drag = useRef(null)
  const prevSelected = useRef(null)

  const [camera, setCamera] = useState({ k: 1, cx: W / 2, cy: H / 2 })
  const [smooth, setSmooth] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [layersOpen, setLayersOpen] = useState(false)
  const [layers, setLayers] = useState({ routes: true, ports: true, labels: true })

  const project = useCallback((lat, lng) => ({ x: ((lng + 180) / 360) * W, y: ((90 - lat) / 180) * H }), [H])

  const smoothMove = (next) => {
    setSmooth(true)
    setCamera(next)
    window.setTimeout(() => setSmooth(false), 620)
  }

  const centerOn = (position, zoom) => {
    const pt = project(position.lat, position.lng)
    smoothMove({ k: clamp(zoom || camera.k, 1, 4), cx: pt.x, cy: pt.y })
  }

  const fitAll = () => {
    const pts = ships.map((s) => project(s.position.lat, s.position.lng))
    if (!pts.length) {
      smoothMove({ k: 1, cx: W / 2, cy: H / 2 })
      return
    }
    const minX = Math.min(...pts.map((p) => p.x))
    const maxX = Math.max(...pts.map((p) => p.x))
    const minY = Math.min(...pts.map((p) => p.y))
    const maxY = Math.max(...pts.map((p) => p.y))
    const bw = Math.max(maxX - minX, 1)
    const bh = Math.max(maxY - minY, 1)
    const k = clamp(Math.min(W / bw, H / bh) * 0.82, 1, 3.2)
    smoothMove({ k, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 })
  }

  const resetView = () => smoothMove({ k: 1, cx: W / 2, cy: H / 2 })

  useEffect(() => {
    if (selectedShipId && selectedShipId !== prevSelected.current) {
      const ship = ships.find((s) => s.id === selectedShipId)
      if (ship) centerOn(ship.position, Math.max(1.9, camera.k))
    }
    prevSelected.current = selectedShipId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShipId, ships])

  const zoomStep = (dir) => {
    setCamera((c) => ({ ...c, k: clamp(c.k * (dir > 0 ? 1.35 : 1 / 1.35), 1, 4) }))
  }

  const zoomAt = (clientX, clientY, factor) => {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * W
    const py = ((clientY - rect.top) / rect.height) * H
    setCamera((c) => {
      const k = clamp(c.k * factor, 1, 4)
      const wx = (px - W / 2) / c.k + c.cx
      const wy = (py - H / 2) / c.k + c.cy
      return { k, cx: wx - (px - W / 2) / k, cy: wy - (py - H / 2) / k }
    })
  }

  const handlePointerDown = (e) => {
    if (e.target.closest('.ship-map-interactive')) return
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      cx: camera.cx,
      cy: camera.cy,
      k: camera.k,
    }
    setSmooth(false)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!drag.current) return
    setCamera((c) => ({
      ...c,
      cx: drag.current.cx - (e.clientX - drag.current.startX) / drag.current.k,
      cy: drag.current.cy - (e.clientY - drag.current.startY) / drag.current.k,
    }))
  }

  const handlePointerUp = (e) => {
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      wrapRef.current?.requestFullscreen?.()
    }
  }

  const markers = useMemo(() => {
    const items = ships.map((s) => {
      const pt = project(s.position.lat, s.position.lng)
      return { ship: s, x: pt.x, y: pt.y }
    })
    if (camera.k >= 1.6) return items.map((it) => ({ type: 'vessel', ...it }))
    const cell = 74 / camera.k
    const groups = new Map()
    items.forEach((it) => {
      const key = `${Math.floor(it.x / cell)}_${Math.floor(it.y / cell)}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(it)
    })
    return [...groups.values()].map((group) => {
      if (group.length === 1) return { type: 'vessel', ...group[0] }
      return {
        type: 'cluster',
        ships: group.map((g) => g.ship),
        x: group.reduce((a, g) => a + g.x, 0) / group.length,
        y: group.reduce((a, g) => a + g.y, 0) / group.length,
        count: group.length,
      }
    })
  }, [ships, camera.k, project])

  const portLabels = useMemo(() => {
    if (!showPortLabels || !layers.labels) return []
    const showAll = camera.k >= 1.25
    const placed = []
    const out = []
    ports.forEach((port) => {
      const pt = project(port.coordinates.lat, port.coordinates.lng)
      if (!showAll) {
        const active = ships.some((s) => s.currentPort === port.name || s.nextPort === port.name)
        if (!active) return
      }
      const w = port.name.length * 6.4 + 18
      const rect = { l: pt.x - w / 2, r: pt.x + w / 2, t: pt.y + 15, b: pt.y + 32 }
      if (placed.some((o) => rect.l < o.r && rect.r > o.l && rect.t < o.b && rect.b > o.t)) return
      placed.push(rect)
      out.push({ port, x: pt.x, y: pt.y })
    })
    return out
  }, [ports, ships, camera.k, showPortLabels, layers.labels, project])

  const routePath = (route) => {
    const pts = [project(route.from.lat, route.from.lng), ...(route.waypoints || []).map((p) => project(p.lat, p.lng)), project(route.to.lat, route.to.lng)]
    return pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `Q${(p.x + pts[i - 1].x) / 2},${p.y} ${p.x},${p.y}`)).join(' ')
  }

  const showTooltip = (clientX, clientY, data) => {
    const rect = wrapRef.current.getBoundingClientRect()
    const left = clamp(clientX - rect.left, 8, rect.width - 232)
    const top = clamp(clientY - rect.top, 8, rect.height - 168)
    setTooltip({ left, top, data })
  }

  const gridV = 22
  const gridH = 14

  return (
    <div ref={wrapRef} className={`ship-map ${className}`} style={{ height }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Interactive map of active shipping routes and vessels"
        className="ship-map-svg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={(e) => {
          e.preventDefault()
          zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15)
        }}
      >
        <rect width={W} height={H} className="ship-map-bg" />
        <defs>
          <radialGradient id="ship-map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2b6df0" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2b6df0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={W * 0.28} cy={H * 0.3} r={260} fill="url(#ship-map-glow)" />
        <circle cx={W * 0.78} cy={H * 0.68} r={300} fill="url(#ship-map-glow)" />

        <g className={`ship-map-world ${smooth ? 'is-smooth' : ''} ${drag.current ? 'is-dragging' : ''}`} transform={`translate(${W / 2} ${H / 2}) scale(${camera.k}) translate(${-camera.cx} ${-camera.cy})`}>
          {Array.from({ length: gridV + 1 }).map((_, i) => {
            const x = (i / gridV) * W
            return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H} className="ship-map-grid" />
          })}
          {Array.from({ length: gridH + 1 }).map((_, i) => {
            const y = (i / gridH) * H
            return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} className="ship-map-grid" />
          })}

          {layers.routes &&
            routes.map((route, i) => {
              const tone = route.status || 'On Route'
              return (
                <g key={`${route.ship || i}`} style={{ '--route-color': STATUS_COLORS[tone] || STATUS_COLORS['On Route'] }}>
                  <path d={routePath(route)} className="ship-map-route ship-map-route--glow" />
                  <path d={routePath(route)} className="ship-map-route ship-map-route--dash">
                    <animate attributeName="stroke-dashoffset" from="30" to="0" dur="3s" repeatCount="indefinite" />
                  </path>
                </g>
              )
            })}

          {layers.ports &&
            ports.map((port, i) => {
              const pt = project(port.coordinates.lat, port.coordinates.lng)
              const active = ships.some((s) => s.currentPort === port.name || s.nextPort === port.name)
              const label = portLabels.find((l) => l.port.id === port.id)
              return (
                <g
                  key={port.id || i}
                  transform={`translate(${pt.x},${pt.y})`}
                  className={`ship-map-port ${active ? 'is-active' : ''}`}
                  onMouseEnter={(e) => showTooltip(e.clientX, e.clientY, { kind: 'port', port, count: port.vesselsInPort })}
                  onMouseMove={(e) => showTooltip(e.clientX, e.clientY, { kind: 'port', port, count: port.vesselsInPort })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle r={active ? 15 : 12} className="ship-map-port-halo" />
                  <circle r={active ? 5.5 : 4.5} className="ship-map-port-core" />
                  {label && (
                    <text y={24} textAnchor="middle" className="ship-map-port-label">
                      {port.name}
                    </text>
                  )}
                </g>
              )
            })}

          {markers.map((m, i) => {
            if (m.type === 'cluster') {
              return (
                <g
                  key={`c${i}`}
                  transform={`translate(${m.x},${m.y})`}
                  className="ship-map-cluster ship-map-interactive"
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.count} vessels clustered`}
                  onClick={() => {
                    const k = clamp(camera.k * 1.8, 1.6, 4)
                    smoothMove({ k, cx: m.x, cy: m.y })
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && m.onClick && m.onClick()}
                  onMouseEnter={(e) => showTooltip(e.clientX, e.clientY, { kind: 'cluster', count: m.count, ships: m.ships })}
                  onMouseMove={(e) => showTooltip(e.clientX, e.clientY, { kind: 'cluster', count: m.count, ships: m.ships })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle r={20} className="ship-map-cluster-ring" />
                  <circle r={13} className="ship-map-cluster-core" />
                  <text className="ship-map-cluster-count">{m.count}</text>
                </g>
              )
            }
            const ship = m.ship
            const selected = ship.id === selectedShipId
            const onRoute = ship.status === 'On Route'
            const color = STATUS_COLORS[ship.status] || STATUS_COLORS['On Route']
            return (
              <g
                key={ship.id || i}
                transform={`translate(${m.x},${m.y})`}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectShip?.(ship)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                    onSelectShip?.(ship)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${ship.name}, ${ship.status}, heading ${ship.heading} degrees`}
                className={`ship-map-vessel ship-map-interactive is-${statusKey(ship.status)} ${selected ? 'is-selected' : ''} ${live && onRoute ? 'is-live' : ''}`}
                style={{ '--vessel-color': color }}
                onMouseEnter={(e) => showTooltip(e.clientX, e.clientY, { kind: 'vessel', ship })}
                onMouseMove={(e) => showTooltip(e.clientX, e.clientY, { kind: 'vessel', ship })}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle r={22} className="ship-map-hit" />
                <g transform={`rotate(${ship.heading || 0})`} className="ship-map-heading">
                  <path d="M0,-27 L0,-18 M0,-27 l3.4,3.6 M0,-27 l-3.4,3.6" />
                </g>
                <g transform={`rotate(${ship.heading || 0})`} className="ship-map-ship-icon">
                  <path d="M0,-14 C6,-11 10,-5 10,2 L7.5,9 L0,12 L-7.5,9 L-10,2 C-10,-5 -6,-11 0,-14 Z" />
                  <path d="M-6.5,1 L6.5,1" className="ship-map-deck" />
                  <rect x="-3.4" y="-5" width="6.8" height="4.6" rx="1.4" className="ship-map-bridge" />
                  <path d="M-2,-10 L2,-10 L1.4,-6.4 L-1.4,-6.4 Z" className="ship-map-funnel" />
                </g>
                {live && onRoute && <circle r={12} className="ship-map-pulse" />}
                {selected && <circle r={23} className="ship-map-selected-ring" />}
                {selected && (
                  <text y={36} textAnchor="middle" className="ship-map-vessel-label">
                    {ship.name}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      <div className="map-toolbar" role="toolbar" aria-label="Map controls">
        <button type="button" className="map-tool-btn" onClick={() => zoomStep(1)} aria-label="Zoom in" title="Zoom in">
          <Icon name="plus" size={17} />
        </button>
        <button type="button" className="map-tool-btn" onClick={() => zoomStep(-1)} aria-label="Zoom out" title="Zoom out">
          <Icon name="minus" size={17} />
        </button>
        <button type="button" className="map-tool-btn" onClick={() => { resetView(); setLayersOpen(false) }} aria-label="Reset view" title="Reset view">
          <Icon name="refresh" size={16} />
        </button>
        <button type="button" className="map-tool-btn" onClick={() => { fitAll(); setLayersOpen(false) }} aria-label="Fit all vessels" title="Fit all vessels">
          <Icon name="locate" size={16} />
        </button>
        <button
          type="button"
          className={`map-tool-btn ${layersOpen ? 'is-active' : ''}`}
          onClick={() => setLayersOpen((v) => !v)}
          aria-label="Map layers"
          aria-expanded={layersOpen}
          title="Map layers"
        >
          <Icon name="layers" size={16} />
        </button>
        <button type="button" className="map-tool-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen" title="Toggle fullscreen">
          <Icon name="maximize" size={15} />
        </button>
        {layersOpen && (
          <div className="map-layers" role="menu">
            {[
              ['routes', 'Routes'],
              ['ports', 'Ports'],
              ['labels', 'Labels'],
            ].map(([key, label]) => (
              <label key={key} className="map-layers-item">
                <input type="checkbox" checked={layers[key]} onChange={(e) => setLayers((l) => ({ ...l, [key]: e.target.checked }))} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="map-legend" aria-label="Map legend">
        {STATUS_LABELS.map((s) => (
          <span key={s} className="map-legend-item">
            <span className="map-legend-dot" style={{ background: STATUS_COLORS[s] }} />
            {s}
          </span>
        ))}
        <span className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--port" />
          Port
        </span>
        <span className="map-legend-item">
          <span className="map-legend-ship" style={{ color: STATUS_COLORS['On Route'] }}>
            <Icon name="ship" size={12} />
          </span>
          Vessel
        </span>
      </div>

      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.left, top: tooltip.top }}>
          {tooltip.data.kind === 'vessel' && (
            <>
              <div className="map-tooltip-head">
                <strong>{tooltip.data.ship.name}</strong>
                <span className="map-tooltip-status" style={{ color: STATUS_COLORS[tooltip.data.ship.status] || '#41d3ff' }}>
                  {tooltip.data.ship.status}
                </span>
              </div>
              <div className="map-tooltip-route">
                {tooltip.data.ship.currentPort} <Icon name="arrow-right" size={11} /> {tooltip.data.ship.nextPort}
              </div>
              <div className="map-tooltip-grid">
                <span>ETA</span>
                <strong>{tooltip.data.ship.eta}</strong>
                <span>Speed</span>
                <strong>{tooltip.data.ship.speed}</strong>
                <span>Cargo</span>
                <strong>{tooltip.data.ship.cargoWeight}</strong>
              </div>
            </>
          )}
          {tooltip.data.kind === 'port' && (
            <>
              <div className="map-tooltip-head">
                <strong>{tooltip.data.port.name}</strong>
              </div>
              <div className="map-tooltip-route">{tooltip.data.count} vessels in port</div>
            </>
          )}
          {tooltip.data.kind === 'cluster' && (
            <>
              <div className="map-tooltip-head">
                <strong>{tooltip.data.count} vessels here</strong>
              </div>
              <div className="map-tooltip-route">{tooltip.data.ships.slice(0, 3).map((s) => s.name).join(', ')}</div>
              <div className="map-tooltip-hint">Click to zoom in</div>
            </>
          )}
        </div>
      )}
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

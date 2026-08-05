/* eslint-disable react/only-export-components */
import { memo, useEffect, useRef, useState } from 'react'

export const CHART_COLORS = ['#0a5fd2', '#00a3bf', '#6c5ce7', '#f2994a', '#27ae60', '#eb5757', '#9b51e0', '#2d9cdb']

function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const measure = () => setWidth(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

const fmt = (n) => (Math.round(n * 10) / 10).toString()

function niceTicks(min, max, count = 4) {
  const span = max - min || 1
  const step = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step)))
  const norm = step / mag
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  const niceStep = nice * mag
  const ticks = []
  for (let t = Math.ceil(min / niceStep) * niceStep; t <= max + 0.0001; t += niceStep) ticks.push(t)
  return ticks
}

function buildSeries(values, width, height, min, max) {
  const range = max - min || 1
  return values.map((value, index) => {
    const x = width === 1 ? 0 : (index / (values.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return [x, y]
  })
}

function linePath(points) {
  return points.map((p, i) => (i === 0 ? `M${fmt(p[0])},${fmt(p[1])}` : `L${fmt(p[0])},${fmt(p[1])}`)).join(' ')
}

function smoothPath(points) {
  if (points.length < 2) return ''
  return points
    .slice(1)
    .reduce(
      (acc, p, i) => {
        const prev = points[i]
        const cx = (prev[0] + p[0]) / 2
        return `${acc} C${fmt(cx)},${fmt(prev[1])} ${fmt(cx)},${fmt(p[1])} ${fmt(p[0])},${fmt(p[1])}`
      },
      `M${fmt(points[0][0])},${fmt(points[0][1])}`,
    )
}

export const ChartShell = memo(function ChartShell({ title, subtitle, legend, height = 240, children, className = '', empty, style }) {
  return (
    <div className={`chart-shell ${className}`} style={style}>
      {(title || legend) && (
        <div className="chart-shell-head">
          <div>
            {title && <h4>{title}</h4>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {legend && <div className="chart-legend">{legend}</div>}
        </div>
      )}
      <div className="chart-canvas" style={{ minHeight: height }}>
        {empty ? <div className="chart-empty">{empty}</div> : children}
      </div>
    </div>
  )
})

export const ChartLegend = memo(function ChartLegend({ items }) {
  return (
    <div className="chart-legend" aria-hidden="true">
      {items.map((item) => (
        <span key={item.label} className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
})

export const LineChart = memo(function LineChart({ series, labels, height = 240, yLabel, smooth = true, showPoints = true, showGrid = true }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const H = height
  const pad = { top: 12, right: 12, bottom: 24, left: yLabel ? 38 : 28 }
  const plotW = Math.max(W - pad.left - pad.right, 0)
  const plotH = H - pad.top - pad.bottom

  const allValues = series.flatMap((s) => s.data)
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const ticks = niceTicks(min, max)
  const dataMin = ticks[0]
  const dataMax = ticks[ticks.length - 1]

  const built = series.map((s) => ({ ...s, points: buildSeries(s.data, plotW, plotH, dataMin, dataMax) }))

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => s.name).join(', ')}>
        {showGrid &&
          ticks.map((t, i) => {
            const y = pad.top + plotH - ((t - dataMin) / (dataMax - dataMin || 1)) * plotH
            return (
              <g key={i}>
                <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} className="chart-gridline" />
                <text x={pad.left - 8} y={y + 3} textAnchor="end" className="chart-axis-label">
                  {t}
                </text>
              </g>
            )
          })}
        {labels &&
          labels.map((label, i) => {
            const x = i === 0 ? pad.left : pad.left + (i / (labels.length - 1)) * plotW
            return (
              <text key={i} x={x} y={H - 6} textAnchor="middle" className="chart-axis-label">
                {label}
              </text>
            )
          })}
        {built.map((s, si) => (
          <g key={si}>
            <path d={smooth ? smoothPath(s.points) : linePath(s.points)} fill="none" pathLength={1} className={`chart-line chart-line--${si % 5}`} />
            {showPoints &&
              s.points.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={3.2} className="chart-point">
                  <title>{`${labels?.[i] ?? i}: ${s.data[i]}`}</title>
                </circle>
              ))}
          </g>
        ))}
      </svg>
    </div>
  )
})

export const AreaChart = memo(function AreaChart({ values, labels, height = 240, smooth = true, showGrid = true, yLabel, gradientId }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const H = height
  const pad = { top: 12, right: 12, bottom: 24, left: yLabel ? 38 : 28 }
  const plotW = Math.max(W - pad.left - pad.right, 0)
  const plotH = H - pad.top - pad.bottom
  const min = Math.min(...values)
  const max = Math.max(...values)
  const ticks = niceTicks(min, max)
  const dataMin = ticks[0]
  const dataMax = ticks[ticks.length - 1]
  const points = buildSeries(values, plotW, plotH, dataMin, dataMax)
  const topLine = smooth ? smoothPath(points) : linePath(points)
  const areaPath = `${topLine} L${fmt(points[points.length - 1][0])},${fmt(plotH)} L${fmt(points[0][0])},${fmt(plotH)} Z`
  const gid = gradientId || 'areaGrad'

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Area chart">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00a3bf" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#00a3bf" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {showGrid &&
          ticks.map((t, i) => {
            const y = pad.top + plotH - ((t - dataMin) / (dataMax - dataMin || 1)) * plotH
            return (
              <g key={i}>
                <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} className="chart-gridline" />
                <text x={pad.left - 8} y={y + 3} textAnchor="end" className="chart-axis-label">
                  {t}
                </text>
              </g>
            )
          })}
        <path d={areaPath} fill={`url(#${gid})`} pathLength={1} />
        <path d={topLine} fill="none" pathLength={1} className="chart-area-line" />
        {labels &&
          labels.map((label, i) => {
            const x = i === 0 ? pad.left : pad.left + (i / (labels.length - 1)) * plotW
            return (
              <text key={i} x={x} y={H - 6} textAnchor="middle" className="chart-axis-label">
                {label}
              </text>
            )
          })}
      </svg>
    </div>
  )
})

export const BarChart = memo(function BarChart({ series, labels, height = 240 }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const H = height
  const pad = { top: 12, right: 8, bottom: 24, left: 32 }
  const plotW = Math.max(W - pad.left - pad.right, 0)
  const plotH = H - pad.top - pad.bottom
  const flatMax = Math.max(...series.flatMap((s) => s.data))
  const ticks = niceTicks(0, flatMax)
  const dataMax = ticks[ticks.length - 1]
  const groupCount = series.length
  const groupW = plotW / Math.max(1, labels.length)
  const barW = Math.min(34, (groupW / Math.max(1, groupCount)) * 0.66)

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart">
        {ticks.map((t, i) => {
          const y = pad.top + plotH - (t / dataMax) * plotH
          return (
            <g key={i}>
              <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} className="chart-gridline" />
              <text x={pad.left - 8} y={y + 3} textAnchor="end" className="chart-axis-label">
                {t}
              </text>
            </g>
          )
        })}
        {labels.map((label, li) =>
          series.map((s, si) => {
            const value = s.data[li]
            const barH = (value / dataMax) * plotH
            const x = pad.left + li * groupW + (groupW / groupCount) * si + (barW < groupW / groupCount ? (groupW / groupCount - barW) / 2 : 0)
            const y = pad.top + plotH - barH
            return (
              <rect
                key={`${li}-${si}`}
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 0)}
                rx={Math.min(6, barW / 2)}
                className={`chart-bar-rect chart-bar--${si % 5}`}
              >
                <title>{`${label} · ${s.name}: ${value}`}</title>
              </rect>
            )
          }),
        )}
      </svg>
    </div>
  )
})

export const HorizontalBars = memo(function HorizontalBars({ data, height = 220, valueSuffix = '' }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const H = height
  const pad = { top: 10, right: 40, bottom: 10, left: 96 }
  const plotW = Math.max(W - pad.left - pad.right, 0)
  const max = Math.max(...data.map((d) => d.value))
  const rowH = Math.min(30, Math.max(18, (H - pad.top - pad.bottom) / data.length))

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Horizontal bars">
        {data.map((d, i) => {
          const y = pad.top + i * rowH + rowH / 2
          const barW = (d.value / max) * plotW
          return (
            <g key={i}>
              <text x={pad.left - 10} y={y + 4} textAnchor="end" className="chart-bar-label">
                {d.label}
              </text>
              <rect x={pad.left} y={y - rowH / 2 + 3} width={plotW} height={rowH - 6} rx={rowH / 2} className="chart-bar-track" />
              <rect x={pad.left} y={y - rowH / 2 + 3} width={Math.max(barW, 0)} height={rowH - 6} rx={rowH / 2} className={`chart-bar chart-bar--${i % 5}`} />
              <text x={pad.left + barW + 8} y={y + 4} className="chart-bar-value">
                {d.value}
                {valueSuffix}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
})

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, endAngle)
  const end = polar(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return `M${fmt(start.x)},${fmt(start.y)} A${r},${r} 0 ${largeArc} 0 ${fmt(end.x)},${fmt(end.y)}`
}

function polar(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export const DonutChart = memo(function DonutChart({ data, centerLabel, centerSub, height = 240, thickness = 22 }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const size = Math.min(W, height)
  const r = size / 2 - thickness / 2 - 6
  const cx = W / 2
  const cy = height / 2
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let start = 0

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Donut chart">
        {data.map((d, i) => {
          const sweep = (d.value / total) * 360
          const path = sweep >= 360 ? describeArc(cx, cy, r, 0.01, 359.99) : describeArc(cx, cy, r, start, start + sweep)
          start += sweep
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={d.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={thickness}
              strokeLinecap="round"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </path>
          )
        })}
        {(centerLabel || centerSub) && (
          <g>
            <text x={cx} y={cy - (centerSub ? 4 : -4)} textAnchor="middle" className="chart-donut-label">
              {centerLabel}
            </text>
            {centerSub && (
              <text x={cx} y={cy + 20} textAnchor="middle" className="chart-donut-sub">
                {centerSub}
              </text>
            )}
          </g>
        )}
      </svg>
      <div className="chart-donut-legend">
        {data.map((d, i) => (
          <span key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: d.color || CHART_COLORS[i % CHART_COLORS.length] }} />
            {d.label}
            <strong>{d.value}</strong>
          </span>
        ))}
      </div>
    </div>
  )
})

export const PieChart = memo(function PieChart({ data, height = 240 }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const size = Math.min(W, height)
  const r = size / 2 - 10
  const cx = W / 2
  const cy = height / 2
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let start = 0

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Pie chart">
        {data.map((d, i) => {
          const sweep = (d.value / total) * 360
          const path = describeArc(cx, cy, r, start, start + sweep)
          const mid = ((start + start + sweep) / 2) * (Math.PI / 180)
          const labelX = cx + Math.cos(mid) * (r * 0.62)
          const labelY = cy + Math.sin(mid) * (r * 0.62)
          start += sweep
          return (
            <g key={i}>
              <path d={path} fill={d.color || CHART_COLORS[i % CHART_COLORS.length]}>
                <title>{`${d.label}: ${d.value}`}</title>
              </path>
              {sweep > 8 && (
                <text x={labelX} y={labelY} textAnchor="middle" className="chart-pie-label">
                  {Math.round((d.value / total) * 100)}%
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="chart-donut-legend">
        {data.map((d, i) => (
          <span key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: d.color || CHART_COLORS[i % CHART_COLORS.length] }} />
            {d.label}
            <strong>{d.value}</strong>
          </span>
        ))}
      </div>
    </div>
  )
})

export const HeatMap = memo(function HeatMap({ data, xLabels, yLabels, height }) {
  const [ref, width] = useWidth()
  const W = Math.max(width, 10)
  const rows = data.length
  const cols = data[0]?.length || 0
  const cellGap = 6
  const H = height || Math.max(160, rows * 34 + 24)
  const cellW = Math.max(0, Math.min(56, (W - 40 - cellGap * cols) / cols))
  const cellH = Math.max(0, (H - 32) / rows - cellGap)

  return (
    <div ref={ref} className="chart-resize">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Heatmap">
        {data.map((row, r) =>
          row.map((value, c) => {
            const x = 40 + c * (cellW + cellGap)
            const y = 14 + r * (cellH + cellGap)
            const alpha = 0.16 + (value / 100) * 0.84
            return (
              <rect key={`${r}-${c}`} x={x} y={y} width={cellW} height={cellH} rx={8} fill="#00a3bf" opacity={alpha}>
                <title>{`${yLabels?.[r] ?? r} · ${xLabels?.[c] ?? c}: ${value}`}</title>
              </rect>
            )
          }),
        )}
        {yLabels?.map((label, r) => (
          <text key={r} x={34} y={14 + r * (cellH + cellGap) + cellH / 2 + 4} textAnchor="end" className="chart-bar-label">
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
})

export const Sparkline = memo(function Sparkline({ values, color = '#00a3bf', width = 110, height = 34 }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const points = buildSeries(values, width, height, min, max)
  const path = linePath(points)
  const area = `${path} L${width},${height} L0,${height} Z`
  const gid = `spark-${color.replace('#', '')}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sparkline" className="sparkline">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={3} fill={color} />
    </svg>
  )
})

export const ProgressRing = memo(function ProgressRing({ value = 0, max = 100, size = 84, color = '#00a3bf', label }) {
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const offset = c - (pct / 100) * c

  return (
    <div className="progress-ring" style={{ width: size, height: size }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <strong>{Math.round(pct)}%</strong>
    </div>
  )
})

export { smoothPath, linePath, niceTicks }

import { memo, useId, useEffect, useMemo, useState } from 'react'
import Icon from '../Icon'
import { StatusChip } from './feedback'
import { Breadcrumbs } from './navigation'

export function Card({ title, eyebrow, description, children, actions, className = '', bodyClassName = '', padding = 'md' }) {
  return (
    <section className={`card card--pad-${padding} ${className}`}>
      {(title || eyebrow || actions) && (
        <div className="card-head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h3>{title}</h3>}
            {description && <p className="card-desc">{description}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </section>
  )
}

export function PageHeader({ eyebrow, title, description, actions, breadcrumbs }) {
  return (
    <div className="page-head">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="page-head-row">
        <div className="page-head-copy">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="page-desc">{description}</p>}
        </div>
        {actions && <div className="page-head-actions">{actions}</div>}
      </div>
    </div>
  )
}

export const Avatar = memo(function Avatar({ name, src, size = 'md', tone = 'brand', className = '' }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span className={`avatar avatar--${size} avatar--${tone} ${className}`} aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" /> : initials}
    </span>
  )
})

function AnimatedStatValue({ value }) {
  const parsed = useMemo(() => {
    const m = String(value).match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/)
    if (!m) return null
    return {
      prefix: m[1],
      number: parseFloat(m[2].replace(/,/g, '')),
      suffix: m[3],
      decimals: (m[2].split('.')[1] || '').length,
    }
  }, [value])

  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!parsed) return
    let raf
    const start = performance.now()
    const duration = 900
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(parsed.number * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [parsed])

  if (!parsed) return <strong className="stat-value">{value}</strong>

  const formatted = parsed.decimals
    ? display.toFixed(parsed.decimals)
    : Math.round(display).toLocaleString('en-US')

  return (
    <strong className="stat-value">
      {parsed.prefix}
      {formatted}
      {parsed.suffix}
    </strong>
  )
}

export const StatCard = memo(function StatCard({ label, value, delta, icon, hint, chart, style }) {
  const positive = typeof delta === 'number' ? delta >= 0 : String(delta).startsWith('+')
  return (
    <div className="stat-card" style={style}>
      <div className="stat-card-top">
        <span className="stat-icon stat-icon--brand" aria-hidden="true">
          <Icon name={icon || 'chart'} size={19} />
        </span>
        {delta !== undefined && (
          <span className={`stat-delta ${positive ? 'is-up' : 'is-down'}`} aria-label={`${positive ? 'up' : 'down'} ${Math.abs(typeof delta === 'number' ? delta : parseFloat(delta) || 0)} percent`}>
            <Icon name={positive ? 'trending-up' : 'trending-down'} size={14} />
            {delta}
          </span>
        )}
      </div>
      <div className="stat-card-body">
        <span className="stat-label">{label}</span>
        <AnimatedStatValue value={value} />
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
      {chart}
    </div>
  )
})

export const DataTable = memo(function DataTable({ columns, rows, onRowClick, empty, loading, sort, onSort }) {
  const titleId = useId()
  const [localSort, setLocalSort] = useState(null)
  const activeSort = sort || localSort

  const displayedRows = useMemo(() => {
    if (onSort || !activeSort?.key) return rows
    const direction = activeSort.direction === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => {
      const av = a[activeSort.key]
      const bv = b[activeSort.key]
      if (av == null) return 1
      if (bv == null) return -1
      const result =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true })
      return result * direction
    })
  }, [activeSort, onSort, rows])

  const handleSort = (key) => {
    if (typeof onSort === 'function') {
      onSort(key)
      return
    }
    setLocalSort((current) => (current?.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }))
  }

  if (loading) {
    return (
      <div className="table-wrap" aria-busy="true">
        <div className="skeleton table-skeleton" style={{ height: 220 }} />
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="table-empty">
        <Icon name={empty?.icon || 'box'} size={26} />
        <p>{empty?.title || 'No data available'}</p>
        {empty?.description && <span>{empty.description}</span>}
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="data-table" aria-labelledby={titleId}>
        <caption id={titleId} className="sr-only">
          Data table
        </caption>
        <thead>
          <tr>
            {columns.map((col, i) => {
              const sortKey = col.sortKey || col.key
              const sortable = Boolean(sortKey)
              const active = sortable && activeSort?.key === sortKey
              return (
                <th
                  key={i}
                  scope="col"
                  style={{ width: col.width }}
                  className={sortable ? 'is-sortable' : ''}
                  onClick={sortable ? () => handleSort(sortKey) : undefined}
                  title={sortable ? 'Sort by this column' : undefined}
                  aria-sort={active ? (activeSort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="th-inner">
                    {col.label}
                    {sortable && (
                      <span className={`th-sort ${active ? 'is-active' : ''}`} aria-hidden="true">
                        <Icon name={active ? (activeSort.direction === 'asc' ? 'chevron-up' : 'chevron-down') : 'more-horizontal'} size={13} />
                      </span>
                    )}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row, rowIndex) => (
            <tr
              key={row.key || row.id || rowIndex}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              className={onRowClick ? 'is-clickable' : ''}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row, rowIndex) : undefined}
            >
              {columns.map((col, i) => {
                const cell = col.cell ? col.cell(row, rowIndex) : row[col.key]
                return (
                  <td key={i} data-label={col.label}>
                    {typeof cell === 'string' || typeof cell === 'number' ? (
                      col.status ? <StatusChip status={cell} /> : <span>{cell}</span>
                    ) : (
                      cell
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

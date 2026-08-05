import { useEffect, useRef, useState } from 'react'
import Icon from '../Icon'
import { useClickOutside, useEscape } from '../../hooks'
import { Link } from '../../router/Router'

export function Tabs({ tabs, active, onChange, id }) {
  const listRef = useRef(null)
  const baseId = id || 'tabs'

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === active)
    const el = listRef.current?.children[activeIndex]
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [active, tabs])

  const onKeyDown = (event) => {
    const currentIndex = tabs.findIndex((t) => t.id === active)
    let next = -1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (currentIndex + 1) % tabs.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (currentIndex - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    if (next === -1) return
    event.preventDefault()
    const target = tabs[next]
    onChange(target.id)
    const el = listRef.current?.children[next]
    el?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label="Tabs" ref={listRef} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${baseId}-panel`}
            tabIndex={isActive ? 0 : -1}
            className={`tabs-item ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <Icon name={tab.icon} size={16} aria-hidden="true" />}
            {tab.label}
            {tab.count !== undefined && <span className="tabs-count">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, children, active }) {
  return (
    <div
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={`${id}-${active}`}
      hidden={!active}
      className="tab-panel"
    >
      {children}
    </div>
  )
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className={isLast ? 'is-current' : ''} aria-current={isLast ? 'page' : undefined}>
              {item.to && !isLast ? (
                <Link to={item.to}>{item.icon && <Icon name={item.icon} size={14} aria-hidden="true" />}{item.label}</Link>
              ) : (
                <span>{item.icon && <Icon name={item.icon} size={14} aria-hidden="true" />}{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function Pagination({ page, totalPages, onChange, total, pageSize }) {
  if (totalPages <= 1 && total === undefined) return null
  const pages = []
  const windowSize = 2
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - windowSize && p <= page + windowSize)) {
      pages.push(p)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="pagination-btn" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <Icon name="chevron-left" size={17} />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pagination-btn ${p === page ? 'is-active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className="pagination-btn" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <Icon name="chevron-right" size={17} />
      </button>
      {total !== undefined && (
        <span className="pagination-total">
          {total} results · {pageSize} per page
        </span>
      )}
    </nav>
  )
}

export function SearchBar({ value, onChange, placeholder = 'Search…', className = '', debounceMs }) {
  const [local, setLocal] = useState(value)
  const timer = useRef(null)

  useEffect(() => setLocal(value), [value])

  const handleChange = (next) => {
    setLocal(next)
    if (debounceMs) {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => onChange(next), debounceMs)
    } else {
      onChange(next)
    }
  }

  return (
    <div className={`search-bar ${className}`}>
      <Icon name="search" size={17} className="search-icon" aria-hidden="true" />
      <input
        type="search"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="search-input"
      />
      {local && (
        <button type="button" className="search-clear" onClick={() => handleChange('')} aria-label="Clear search">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  )
}

export function Dropdown({ label, value, onChange, options, icon, className = '', name }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const selected = options.find((o) => o.value === value)

  const openMenu = () => {
    const idx = options.findIndex((o) => o.value === value)
    setActiveIndex(idx >= 0 ? idx : 0)
    setOpen(true)
  }

  const closeMenu = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const onKeyDown = (event) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openMenu()
      }
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      ref.current?.querySelector('.dropdown-trigger')?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i - 1 + options.length) % options.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (activeIndex >= 0) select(activeIndex)
    } else if (event.key === 'Tab') {
      closeMenu()
    }
  }

  const select = (index) => {
    if (index < 0 || index >= options.length) return
    onChange(options[index].value)
    closeMenu()
  }

  return (
    <div className={`dropdown ${className}`} ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => (open ? closeMenu() : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={name || label}
        aria-controls={open ? `${name || 'dropdown'}-menu` : undefined}
      >
        {icon && <Icon name={icon} size={16} aria-hidden="true" />}
        <span className="dropdown-label">{label}</span>
        {selected && <strong className="dropdown-value">{selected.label}</strong>}
        <Icon name="chevron-down" size={15} className="dropdown-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox" aria-label={label} id={`${name || 'dropdown'}-menu`}>
          {options.map((option, index) => (
            <li key={option.value} role="option" aria-selected={value === option.value} className={value === option.value ? 'is-selected' : ''}>
              <button
                type="button"
                className={index === activeIndex ? 'is-highlighted' : ''}
                onClick={() => select(index)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span>{option.label}</span>
                {value === option.value && <Icon name="check" size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [view, setView] = useState(() => (value ? new Date(value) : new Date()))
  const [selected, setSelected] = useState(value ? new Date(value) : null)
  useClickOutside(ref, () => setOpen(false))
  useEscape(() => setOpen(false), open)

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const pick = (day) => {
    const date = new Date(year, month, day)
    setSelected(date)
    onChange(date.toISOString().slice(0, 10))
    setOpen(false)
  }

  return (
    <div className={`datepicker ${open ? 'is-open' : ''}`} ref={ref}>
      <div className="input-wrap">
        <Icon name="calendar" size={17} className="input-icon" aria-hidden="true" />
        <input
          type="text"
          readOnly
          value={value || ''}
          placeholder={label}
          aria-label={label || 'Pick a date'}
          className="input input--date"
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="datepicker-pop" role="dialog" aria-label="Date picker">
          <div className="datepicker-nav">
            <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={() => setView(new Date(year, month - 1, 1))} aria-label="Previous month">
              <Icon name="chevron-left" size={16} />
            </button>
            <strong>{monthLabel}</strong>
            <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={() => setView(new Date(year, month + 1, 1))} aria-label="Next month">
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
          <div className="datepicker-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="datepicker-dow">
                {d}
              </span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`e-${i}`} />
              const date = new Date(year, month, day)
              const isSelected = selected && date.toDateString() === selected.toDateString()
              const isToday = date.toDateString() === today.toDateString()
              return (
                <button
                  key={day}
                  type="button"
                  className={`datepicker-day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                  onClick={() => pick(day)}
                  aria-label={date.toDateString()}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

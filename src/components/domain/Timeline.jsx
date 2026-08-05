import { useState } from 'react'
import Icon from '../Icon'

export function Timeline({ items }) {
  const latestDoneIndex = items.reduce((max, item, i) => (item.done ? i : max), -1)
  return (
    <ol className="timeline" aria-label="Shipment timeline">
      {items.map((item, index) => {
        const done = item.done !== undefined ? item.done : index <= latestDoneIndex
        const isCurrent = index === (item.done !== undefined ? items.findIndex((i) => !i.done) : latestDoneIndex + 1)
        return (
          <li key={index} className={`timeline-item ${done ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}>
            <div className="timeline-marker" aria-hidden="true">
              {done ? <Icon name="check" size={13} /> : <span />}
            </div>
            <div className="timeline-content">
              <div className="timeline-content-head">
                <h4>{item.label}</h4>
                <time>
                  {item.date}
                  {item.time && item.time !== '—' ? ` · ${item.time}` : ''}
                </time>
              </div>
              <p>{item.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function Calendar({ events = [], initialMonth = new Date().getMonth(), initialYear = new Date().getFullYear(), onSelectDate }) {
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [selected, setSelected] = useState(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const monthEvents = (day) => events.filter((e) => e.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)

  const goTo = (delta) => {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="calendar">
      <div className="calendar-head">
        <strong>
          {months[month]} {year}
        </strong>
        <div className="calendar-nav">
          <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={() => goTo(-1)} aria-label="Previous month">
            <Icon name="chevron-left" size={16} />
          </button>
          <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={() => goTo(1)} aria-label="Next month">
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="calendar-dow">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} className="calendar-empty" />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const evs = monthEvents(day)
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          const isSelected = selected === dateStr
          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => {
                setSelected(dateStr)
                onSelectDate?.(dateStr)
              }}
              aria-label={`${months[month]} ${day}, ${year}${evs.length ? `, ${evs.length} events` : ''}`}
              aria-pressed={isSelected}
            >
              <span className="calendar-day-num">{day}</span>
              {evs.length > 0 && <span className="calendar-event-dots" aria-hidden="true">{evs.slice(0, 3).map((e, j) => <i key={j} className={`calendar-event-dot calendar-event-dot--${e.type || 'default'}`} />)}</span>}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend">
        <span><i className="calendar-event-dot calendar-event-dot--maintenance" /> Maintenance</span>
        <span><i className="calendar-event-dot calendar-event-dot--arrival" /> Arrival</span>
        <span><i className="calendar-event-dot calendar-event-dot--departure" /> Departure</span>
      </div>
    </div>
  )
}

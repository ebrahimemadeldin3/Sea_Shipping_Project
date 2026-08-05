import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../Icon'
import { useEscape, useLockBody, useFocusTrap } from '../../hooks'

let modalSeq = 0

export function Modal({ open, onClose, title, description, children, footer, size = 'md', labelledBy }) {
  const dialogRef = useRef(null)
  const titleIdRef = useRef(labelledBy || (title ? `modal-title-${++modalSeq}` : undefined))

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const timer = setTimeout(() => dialogRef.current?.focus(), 40)
    return () => {
      clearTimeout(timer)
      previouslyFocused?.focus?.()
    }
  }, [open])

  useEscape(onClose, open)
  useLockBody(open)
  useFocusTrap(dialogRef, open)

  if (!open) return null

  const titleId = labelledBy || titleIdRef.current

  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? `${titleId}-desc` : undefined}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            {title && <h3 id={titleId}>{title}</h3>}
            {description && <p className="modal-desc" id={`${titleId}-desc`}>{description}</p>}
          </div>
          <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, description, children, footer, side = 'right', size = 'md' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const timer = setTimeout(() => panelRef.current?.focus(), 40)
    return () => {
      clearTimeout(timer)
      previouslyFocused?.focus?.()
    }
  }, [open])

  useEscape(onClose, open)
  useLockBody(open)
  useFocusTrap(panelRef, open)

  if (!open) return null

  return createPortal(
    <div className="drawer-layer">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`drawer drawer--${side} drawer--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="drawer-head">
          <div>
            {title && <h3>{title}</h3>}
            {description && <p className="modal-desc">{description}</p>}
          </div>
          <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={onClose} aria-label="Close panel">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Tooltip({ label, children, position = 'top' }) {
  return (
    <span className="tooltip-wrap">
      {children}
      <span className={`tooltip tooltip--${position}`} role="tooltip">
        {label}
      </span>
    </span>
  )
}

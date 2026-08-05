import { forwardRef, useId } from 'react'
import Icon from '../Icon'

export function Field({ label, htmlFor, hint, error, required, children, className = '' }) {
  const autoId = useId()
  const id = htmlFor || autoId
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
          {required && (
            <span className="field-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input({ label, error, hint, icon, className = '', id, required, ...rest }, ref) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <div className={`input-wrap ${icon ? 'input-wrap--icon' : ''} ${error ? 'is-invalid' : ''}`}>
        {icon && <Icon name={icon} size={17} className="input-icon" aria-hidden="true" />}
        <input ref={ref} id={inputId} className={`input ${className}`} required={required} aria-invalid={error ? 'true' : undefined} {...rest} />
      </div>
    </Field>
  )
})

export const Select = forwardRef(function Select({ label, error, hint, children, className = '', id, icon, ...rest }, ref) {
  const autoId = useId()
  const selectId = id || autoId
  return (
    <Field label={label} htmlFor={selectId} error={error} hint={hint}>
      <div className={`input-wrap ${error ? 'is-invalid' : ''}`}>
        {icon && <Icon name={icon} size={17} className="input-icon" aria-hidden="true" />}
        <select ref={ref} id={selectId} className={`input input--select ${className}`} aria-invalid={error ? 'true' : undefined} {...rest}>
          {children}
        </select>
        <Icon name="chevron-down" size={16} className="input-chevron" aria-hidden="true" />
      </div>
    </Field>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, hint, className = '', id, ...rest }, ref) {
  const autoId = useId()
  const textareaId = id || autoId
  return (
    <Field label={label} htmlFor={textareaId} error={error} hint={hint}>
      <textarea ref={ref} id={textareaId} className={`input input--textarea ${error ? 'is-invalid' : ''} ${className}`} aria-invalid={error ? 'true' : undefined} {...rest} />
    </Field>
  )
})

export function Checkbox({ label, description, className = '', ...rest }) {
  return (
    <label className={`checkbox ${className}`}>
      <input type="checkbox" {...rest} />
      <span className="checkbox-box" aria-hidden="true">
        <Icon name="check" size={13} />
      </span>
      {(label || description) && (
        <span className="checkbox-text">
          {label && <span className="checkbox-label">{label}</span>}
          {description && <span className="checkbox-desc">{description}</span>}
        </span>
      )}
    </label>
  )
}

export function Switch({ label, checked, onChange, description, id, disabled = false }) {
  return (
    <label className={`switch ${disabled ? 'is-disabled' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} id={id} />
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      {(label || description) && (
        <span className="switch-text">
          {label && <span className="switch-label">{label}</span>}
          {description && <span className="switch-desc">{description}</span>}
        </span>
      )}
    </label>
  )
}

export function Radio({ label, description, className = '', ...rest }) {
  return (
    <label className={`radio ${className}`}>
      <input type="radio" {...rest} />
      <span className="radio-dot" aria-hidden="true" />
      {(label || description) && (
        <span className="checkbox-text">
          {label && <span className="checkbox-label">{label}</span>}
          {description && <span className="checkbox-desc">{description}</span>}
        </span>
      )}
    </label>
  )
}

import { forwardRef } from 'react'
import Icon from '../Icon'

const variants = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  outline: 'btn btn--outline',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger',
  success: 'btn btn--success',
  link: 'btn btn--link',
}

const sizes = {
  sm: 'btn--sm',
  md: '',
  lg: 'btn--lg',
  icon: 'btn--icon',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, iconPosition = 'left', loading = false, disabled = false, className = '', children, type = 'button', ...rest },
  ref,
) {
  const classes = [variants[variant], sizes[size], className, loading && 'is-loading'].filter(Boolean).join(' ')
  const isDisabled = disabled || loading

  return (
    <button ref={ref} type={type} className={classes} disabled={isDisabled} aria-busy={loading || undefined} {...rest}>
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : icon && iconPosition === 'left' ? (
        <Icon name={icon} size={size === 'sm' ? 15 : size === 'lg' ? 20 : 17} aria-hidden="true" />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' ? <Icon name={icon} size={17} aria-hidden="true" /> : null}
    </button>
  )
})

export function IconButton({ icon, label, size = 'md', variant = 'ghost', className = '', ...rest }) {
  return (
    <Button variant={variant} size={size === 'sm' ? 'sm' : 'icon'} className={`btn--square ${className}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 15 : 19} aria-hidden="true" />
    </Button>
  )
}

export { Button }

export default Button

import { useState } from 'react'
import { Link, useNavigate } from '../../router/Router'
import { Button } from '../../components/ui/Button'
import { Input, Checkbox } from '../../components/ui/inputs'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import logo from '../../assets/logo.png'

function AuthHero() {
  return (
    <div className="auth-hero-panel">
      <div className="auth-logo-badge">
        <img src={logo} alt="AquaFlow Shipping" className="auth-hero-logo" />
      </div>
      <div className="auth-hero-copy">
        <h1>One command center for your entire maritime operation.</h1>
        <p>
          Fleet intelligence, live tracking, port coordination, and financial control — unified in a calm, enterprise-grade workspace.
        </p>
        <div className="auth-hero-stats">
          <div>
            <strong>148</strong>
            <span>Vessels in fleet</span>
          </div>
          <div>
            <strong>312</strong>
            <span>Active customers</span>
          </div>
          <div>
            <strong>1,284</strong>
            <span>Deliveries completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthFormPanel({ children }) {
  return (
    <div className="auth-form-panel">
      <div className="auth-card">{children}</div>
    </div>
  )
}

export function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <AuthHero />
      <AuthFormPanel>{children}</AuthFormPanel>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('amira@aquaflow.com')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      const result = login(email, password)
      if (!result.ok) {
        setLoading(false)
        setError(result.error || 'Unable to sign in.')
        return
      }
      toast.success(`Welcome back, ${result.user?.name?.split(' ')[0] || 'there'}!`, { title: 'Signed in' })
      navigate('/dashboard', { replace: true })
    }, 900)
  }

  return (
    <>
      <div className="auth-card-head">
        <h1>Sign in to AquaFlow</h1>
        <p>Access your operations, fleet, and analytics.</p>
      </div>

      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          icon="mail"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          icon="lock"
          autoComplete="current-password"
          required
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="auth-options">
          <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/forgot" className="btn btn--link btn--sm">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="auth-divider">or</div>

      <Button variant="outline" size="lg" icon="users" className="w-full">
        Sign in with SSO
      </Button>

      <p className="auth-footnote">
        New to AquaFlow?{' '}
        <Link to="/register" className="btn btn--link btn--sm">
          Create an account
        </Link>
      </p>
    </>
  )
}

export function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', company: '', password: '', terms: false })
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please complete all required fields.')
      return
    }
    if (!form.terms) {
      setError('You must accept the terms to continue.')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      register(form)
      toast.success('Your account has been created.', { title: 'Welcome aboard' })
      navigate('/dashboard', { replace: true })
    }, 900)
  }

  return (
    <>
      <div className="auth-card-head">
        <h1>Create your account</h1>
        <p>Start managing your fleet in minutes.</p>
      </div>

      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-2">
          <Input label="First name" value={form.firstName} onChange={set('firstName')} placeholder="Amira" autoComplete="given-name" required />
          <Input label="Last name" value={form.lastName} onChange={set('lastName')} placeholder="Nasser" autoComplete="family-name" required />
        </div>
        <Input label="Work email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" icon="mail" autoComplete="email" required />
        <Input label="Company" value={form.company} onChange={set('company')} placeholder="AquaFlow Shipping" icon="container" />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={set('password')}
          placeholder="Min. 8 characters"
          icon="lock"
          autoComplete="new-password"
          required
          hint="Use at least 8 characters with a mix of letters and numbers."
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <Checkbox label="I agree to the Terms of Service and Privacy Policy" checked={form.terms} onChange={(e) => setForm((f) => ({ ...f, terms: e.target.checked }))} required />
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="auth-footnote">
        Already have an account?{' '}
        <Link to="/login" className="btn btn--link btn--sm">
          Sign in
        </Link>
      </p>
    </>
  )
}

export function ForgotPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Enter the email associated with your account.')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      toast.success('A verification code has been sent to your email.', { title: 'Check your inbox' })
      navigate('/otp')
    }, 800)
  }

  return (
    <>
      <div className="auth-card-head">
        <h1>Forgot password?</h1>
        <p>Enter your email and we'll send you a verification code.</p>
      </div>

      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" icon="mail" required />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Send verification code
        </Button>
      </form>

      <p className="auth-footnote">
        Remembered your password?{' '}
        <Link to="/login" className="btn btn--link btn--sm">
          Back to sign in
        </Link>
      </p>
    </>
  )
}

export function OTP() {
  const toast = useToast()
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.some((d) => !d)) {
      setError('Please enter the 6-digit code.')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      toast.success('Code verified successfully.', { title: 'Verified' })
      navigate('/reset')
    }, 800)
  }

  return (
    <>
      <div className="auth-card-head">
        <h1>Verify your identity</h1>
        <p>We sent a 6-digit code to your email. It expires in 10 minutes.</p>
      </div>

      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <div className="otp-row" role="group" aria-label="Verification code">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => setDigit(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Verify code
        </Button>
        <Button type="button" variant="ghost" size="lg" className="w-full" onClick={() => toast.info('A new code has been sent.')}>
          Resend code
        </Button>
      </form>

      <p className="auth-footnote">
        <Link to="/login" className="btn btn--link btn--sm">
          Back to sign in
        </Link>
      </p>
    </>
  )
}

export function ResetPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      toast.success('Your password has been updated.', { title: 'Password reset' })
      navigate('/login', { replace: true })
    }, 800)
  }

  return (
    <>
      <div className="auth-card-head">
        <h1>Set a new password</h1>
        <p>Choose a strong password you haven't used before.</p>
      </div>

      <form className="auth-fields" onSubmit={handleSubmit} noValidate>
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" icon="lock" autoComplete="new-password" required />
        <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" icon="lock" autoComplete="new-password" required />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Update password
        </Button>
      </form>

      <p className="auth-footnote">
        <Link to="/login" className="btn btn--link btn--sm">
          Back to sign in
        </Link>
      </p>
    </>
  )
}

/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks'
import { findById, update, insert, where } from '../services/storage'
import { effectivePermissions } from './permissions'

const AuthContext = createContext(null)
const SESSION_KEY = 'aquaflow-session'
const RESET_KEY = 'aquaflow-reset-token'

const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  employee: 'Employee',
  customer: 'Customer',
}

function createToken() {
  return `tk_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export function AuthProvider({ children }) {
  const [session, setSession] = useLocalStorage(SESSION_KEY, { user: null, token: null })

  const login = useCallback(
    (email, password) => {
      const users = where('users', (u) => u.email.toLowerCase() === String(email).toLowerCase())
      const user = users[0]
      if (!user || user.password !== password) {
        return { ok: false, error: 'Invalid email or password.' }
      }
      const safeUser = omitSensitive(user)
      setSession({ user: safeUser, token: createToken() })
      return { ok: true, user: safeUser }
    },
    [setSession],
  )

  const register = useCallback(
    (payload) => {
      const { firstName, lastName, email, company, password } = payload
      const now = new Date().toISOString().slice(0, 10)
      const newUser = {
        id: `usr-${Date.now()}`,
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        company: company || 'AquaFlow Shipping',
        role: 'customer',
        department: 'Customer',
        title: 'Customer Account',
        location: '—',
        joinedAt: now,
        avatar: `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`,
        permissions: ['shipment.view'],
      }
      insert('users', newUser)
      const safeUser = omitSensitive(newUser)
      setSession({ user: safeUser, token: createToken() })
      return { ok: true, user: safeUser }
    },
    [setSession],
  )

  const logout = useCallback(() => setSession({ user: null, token: null }), [setSession])

  const updateProfile = useCallback(
    (patch) => {
      const current = session.user
      if (!current) return
      const updated = { ...current, ...patch }
      if (current.id) {
        const normalized = { ...patch }
        update('users', current.id, normalized)
      }
      setSession({ ...session, user: updated })
      return updated
    },
    [session, setSession],
  )

  const changePassword = useCallback(
    (currentPassword, newPassword) => {
      const current = session.user
      const user = findById('users', current?.id)
      if (!user || user.password !== currentPassword) {
        return { ok: false, error: 'Current password is incorrect.' }
      }
      update('users', user.id, { password: newPassword })
      return { ok: true }
    },
    [session],
  )

  const forgotPassword = useCallback((email) => {
    const users = where('users', (u) => u.email.toLowerCase() === String(email).toLowerCase())
    const user = users[0]
    if (!user) return { ok: false, error: 'No account found for that email.' }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    window.localStorage.setItem(`aquaflow:${RESET_KEY}`, JSON.stringify({ email, code, expires: Date.now() + 10 * 60 * 1000 }))
    return { ok: true, code }
  }, [])

  const verifyResetCode = useCallback((email, code) => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(`aquaflow:${RESET_KEY}`))
      if (!stored || stored.email.toLowerCase() !== String(email).toLowerCase() || stored.code !== code) {
        return { ok: false, error: 'Invalid or expired verification code.' }
      }
      if (Date.now() > stored.expires) return { ok: false, error: 'The verification code has expired.' }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Invalid or expired verification code.' }
    }
  }, [])

  const resetPassword = useCallback((email, code, newPassword) => {
    const verified = verifyResetCode(email, code)
    if (!verified.ok) return verified
    const users = where('users', (u) => u.email.toLowerCase() === String(email).toLowerCase())
    const user = users[0]
    if (!user) return { ok: false, error: 'No account found for that email.' }
    update('users', user.id, { password: newPassword })
    window.localStorage.removeItem(`aquaflow:${RESET_KEY}`)
    return { ok: true }
  }, [verifyResetCode])

  const user = session.user
  const isAuthenticated = Boolean(user && session.token)
  const permissions = useMemo(() => effectivePermissions(user?.role, user?.permissions), [user])
  const isAdmin = permissions.includes('admin')
  const hasPermission = useCallback(
    (permission) => isAdmin || permissions.includes(permission),
    [isAdmin, permissions],
  )
  /**
   * Convenience helper: `can('shipment', 'manage')` or `can('fleet.view')`.
   * Returns true for admins regardless of the requested permission.
   */
  const can = useCallback(
    (areaOrKey, action = 'view') => {
      const key = areaOrKey.includes('.') ? areaOrKey : `${areaOrKey}.${action}`
      return hasPermission(key)
    },
    [hasPermission],
  )

  const api = useMemo(
    () => ({
      user,
      isAuthenticated,
      permissions,
      hasPermission,
      can,
      isAdmin,
      role: user?.role || null,
      roleLabel: user ? ROLE_LABELS[user.role] || user.role : null,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      forgotPassword,
      verifyResetCode,
      resetPassword,
    }),
    [user, isAuthenticated, permissions, hasPermission, can, isAdmin, login, register, logout, updateProfile, changePassword, forgotPassword, verifyResetCode, resetPassword],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

function omitSensitive(user) {
  const { password: _password, ...safe } = user
  return safe
}

export function useAuth() {
  return useContext(AuthContext)
}

export { ROLE_LABELS }

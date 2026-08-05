import { useAuth } from '../store/AuthProvider'

/**
 * Conditionally renders `children` only when the current user holds the
 * requested permission. Falls back to `fallback` (or nothing) otherwise.
 *
 * Usage:
 *   <Can permission="fleet.manage">
 *     <Button>Edit vessel</Button>
 *   </Can>
 */
export function Can({ permission, action, children, fallback = null }) {
  const { can } = useAuth()
  if (!can(permission, action)) return fallback
  return children
}

export default Can
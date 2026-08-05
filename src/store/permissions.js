/* eslint-disable react/only-export-components */
/**
 * Central role → permission matrix.
 *
 * Every role has a base set of permissions (`.view` = read, `.manage` = mutate).
 * Admins are granted everything via the `admin` wildcard. Users may additionally
 * hold explicit per-user permissions stored on their record; effective permissions
 * are the union of role defaults and stored perms.
 */

export const ROLE_PERMISSIONS = {
  admin: ['admin'],
  manager: [
    'dashboard.view',
    'analytics.view',
    'fleet.view',
    'shipment.view',
    'shipment.manage',
    'tracking.view',
    'port.view',
    'customer.view',
    'customer.manage',
    'staff.view',
    'maintenance.view',
    'maintenance.manage',
    'payment.view',
    'payment.manage',
    'invoice.view',
    'invoice.manage',
    'report.view',
    'report.manage',
    'ticket.view',
    'ticket.manage',
    'settings.view',
  ],
employee: [
    'dashboard.view',
    'analytics.view',
    'fleet.view',
    'shipment.view',
    'shipment.manage',
    'tracking.view',
    'port.view',
    'customer.view',
    'customer.manage',
    'maintenance.view',
    'maintenance.manage',
    'report.view',
    'ticket.view',
    'ticket.manage',
    'staff.view',
  ],
  customer: [
    'dashboard.view',
    'shipment.view',
    'tracking.view',
    'port.view',
    'ticket.view',
    'ticket.manage',
  ],
}

/** Union of role defaults and any stored perms (admins only need `admin`). */
export function effectivePermissions(role, stored = []) {
  const base = ROLE_PERMISSIONS[role] || []
  if (base.includes('admin') || stored.includes('admin')) return ['admin']
  return [...new Set([...base, ...stored])]
}

export const ALL_PERMISSIONS = Object.values(ROLE_PERMISSIONS).flat()
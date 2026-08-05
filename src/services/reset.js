/* eslint-disable react/only-export-components */
import { clearAll } from './storage/localStorage'
import { resetDatabase } from './storage/database'

/**
 * Unified application reset.
 *
 * Clears every persisted value in one call:
 *  - database (ships, shipments, ports, customers, employees, payments,
 *    invoices, notifications, tickets, reports, documents, activity, …)
 *  - auth + session (signed-in user + token)
 *  - theme
 *  - settings & cached preferences (profile draft, notification prefs, security)
 *  - password-reset tokens
 *
 * The database is re-seeded to its default state and the page reloads so all
 * in-memory React state (session, theme, preferences) re-initializes from the
 * now-empty storage — preventing any inconsistent half-reset state.
 */
export function resetApplication() {
  // 1. Re-seed the database first so the in-memory store is consistent even
  //    before the reload.
  resetDatabase()

  // 2. Wipe every remaining persisted key (auth, session, theme, settings,
  //    prefs, reset tokens) from localStorage AND sessionStorage.
  clearAll()

  // 3. Reload so every provider re-initializes from clean storage.
  window.location.reload()
}

export function isResetPossible() {
  return typeof window !== 'undefined'
}

/* eslint-disable react/only-export-components */
import { useCallback, useMemo, useSyncExternalStore } from 'react'
import * as db from './index'

function useDatabaseSnapshot() {
  return useSyncExternalStore(
    useCallback((listener) => db.subscribe(listener), []),
    () => db.snapshot(),
    () => db.getServerSnapshot(),
  )
}

/**
 * React hook exposing the full local database + a curated CRUD API.
 * Re-renders automatically whenever any collection changes in localStorage.
 */
export function useDatabase() {
  const snapshot = useDatabaseSnapshot()

  const crud = useMemo(
    () => ({
      all: db.getAll,
      find: db.find,
      findById: db.findById,
      where: db.where,
      insert: db.insert,
      insertMany: db.insertMany,
      update: db.update,
      updateMany: db.updateMany,
      remove: db.remove,
      removeMany: db.removeMany,
      clearCollection: db.clearCollection,
      resetDatabase: db.resetDatabase,
      count: db.count,
      query: db.query,
    }),
    [],
  )

  const context = useMemo(() => ({ ...crud, ...crudCollections(snapshot) }), [snapshot, crud])
  return context
}

function crudCollections(snapshot) {
  const result = {}
  if (db.COLLECTIONS) {
    db.COLLECTIONS.forEach((name) => {
      result[name] = snapshot[name] || []
    })
  }
  return result
}

let _id = 0
export function nextId(prefix = 'ID') {
  _id += 1
  return `${prefix}-${Date.now().toString(36)}-${_id}`
}
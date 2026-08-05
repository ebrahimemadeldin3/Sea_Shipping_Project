import * as db from './index'
import { COLLECTIONS } from './seed'
import { nextId } from './useDatabase'

/**
 * Reusable per-collection CRUD facade.
 * Usage:
 *   const payments = collection('payments')
 *   payments.list()            -> all rows (live snapshot)
 *   payments.get(id)           -> single row
 *   payments.insert({...})     -> insert with generated id
 *   payments.update(id, patch) -> merge patch
 *   payments.remove(id)        -> delete
 *   payments.query(opts)       -> search/filter/sort/paginate
 *   payments.destroy()         -> empty the collection
 *   payments.count()           -> length
 */
export function collection(name) {
  return {
    list: () => db.getAll(name),
    get: (id) => db.findById(name, id),
    find: (predicate) => db.find(name, predicate),
    where: (predicate) => db.where(name, predicate),
    insert: (record) => {
      const id = record.id || nextId(name.toUpperCase().replace(/s$/, ''))
      return db.insert(name, { ...record, id })
    },
    insertMany: (records) => db.insertMany(name, records),
    update: (id, patch) => db.update(name, id, patch),
    updateMany: (predicate, patch) => db.updateMany(name, predicate, patch),
    remove: (id) => db.remove(name, id),
    removeMany: (ids) => db.removeMany(name, ids),
    clear: () => db.clearCollection(name),
    count: () => db.count(name),
    query: (options) => db.query(name, options),
  }
}

const COLLECTION_NAMES = COLLECTIONS

/**
 * Reusable registry of every persisted collection.
 * `crud.ships.insert(...)`, `crud.customers.list()`, etc.
 */
export const crud = Object.fromEntries(COLLECTION_NAMES.map((name) => [name, collection(name)]))

export default collection
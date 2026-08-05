import { getItem, setItem } from './localStorage'
import { buildSeed, COLLECTIONS } from './seed'

export const DB_KEY = 'database'
export const DB_VERSION = 2

const listeners = new Set()
let state = null
let timers = null

function emit() {
  listeners.forEach((listener) => listener())
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalize(data) {
  const result = {}
  COLLECTIONS.forEach((name) => {
    const rows = Array.isArray(data[name]) ? data[name] : []
    result[name] = rows.filter(isRecord)
  })
  return result
}

function isValidDatabase(existing) {
  return (
    existing &&
    typeof existing === 'object' &&
    existing.version === DB_VERSION &&
    existing.data &&
    typeof existing.data === 'object'
  )
}

function readOrSeed() {
  const existing = getItem(DB_KEY)
  if (isValidDatabase(existing)) {
    return normalize(existing.data)
  }
  return seedNow()
}

function seedNow() {
  const seeded = buildSeed()
  setItem(DB_KEY, { version: DB_VERSION, data: seeded })
  return seeded
}

export function snapshot() {
  if (!state) state = readOrSeed()
  return state
}

function commit(nextPartial) {
  state = Object.assign({}, snapshot(), nextPartial)
  emit()
  schedulePersist()
}

function schedulePersist() {
  if (timers) return
  timers = setTimeout(() => {
    timers = null
    setItem(DB_KEY, { version: DB_VERSION, data: snapshot() })
  }, 0)
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getServerSnapshot() {
  return snapshot()
}

export function getAll(collection) {
  return Array.isArray(snapshot()[collection]) ? snapshot()[collection] : []
}

export function find(collection, predicate) {
  return getAll(collection).find(predicate) || null
}

export function findById(collection, id) {
  return find(collection, (item) => item && item.id === id)
}

export function where(collection, predicate) {
  return getAll(collection).filter(predicate)
}

export function insert(collection, record) {
  const next = [...getAll(collection), record]
  commit({ [collection]: next })
  return record
}

export function insertMany(collection, records) {
  const next = [...getAll(collection), ...records]
  commit({ [collection]: next })
  return records
}

export function update(collection, id, patch) {
  const rows = getAll(collection)
  commit({ [collection]: rows.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  return findById(collection, id)
}

export function updateMany(collection, predicate, patch) {
  const rows = getAll(collection)
  const next = rows.map((item) => (predicate(item) ? { ...item, ...patch } : item))
  commit({ [collection]: next })
  return next.filter((item) => predicate(item)).length
}

export function remove(collection, id) {
  commit({ [collection]: getAll(collection).filter((item) => item.id !== id) })
}

export function removeMany(collection, ids) {
  const idSet = new Set(ids)
  commit({ [collection]: getAll(collection).filter((item) => !idSet.has(item.id)) })
}

export function clearCollection(collection) {
  commit({ [collection]: [] })
}

export function clearDatabase() {
  const empty = {}
  COLLECTIONS.forEach((name) => (empty[name] = []))
  commit(empty)
}

export function resetDatabase() {
  const seeded = seedNow()
  commit(seeded)
  return seeded
}

export function count(collection) {
  return getAll(collection).length
}

export function query(collection, { search, filters, sort, pageSize, page } = {}) {
  let rows = getAll(collection)
  if (search && search.term) {
    const term = String(search.term).toLowerCase()
    rows = rows.filter((item) =>
      (search.fields || ['id']).some((field) => String(item[field] ?? '').toLowerCase().includes(term)),
    )
  }
  if (filters) {
    Object.entries(filters).forEach(([field, value]) => {
      if (value && value !== 'All') rows = rows.filter((item) => item[field] === value)
    })
  }
  if (sort) {
    const dir = sort.direction === 'desc' ? -1 : 1
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null) return 1
      if (bv == null) return -1
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir
    })
  }
  if (page && pageSize) {
    const size = page.pageSize || 8
    const index = (page.page - 1) * size
    return { rows: rows.slice(index, index + size), total: rows.length }
  }
  return { rows, total: rows.length }
}
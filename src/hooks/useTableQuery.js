import { useMemo, useState } from 'react'

/**
 * Reusable table logic: search, filter, sort, pagination.
 *
 * @param items          source array (live collection)
 * @param options.searchFields  string[] or function(item)->string[] used for text search
 * @param options.filters       { field: value } initial
 * @param options.pageSize      rows per page (default 8)
 * @param options.defaultSort   { key, direction }
 */
export function useTableQuery(items, options = {}) {
  const { searchFields = [], filters: initialFilters = {}, pageSize = 8, defaultSort = null } = options

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState(defaultSort)
  const [page, setPage] = useState(1)

  const processed = useMemo(() => {
    const term = search.trim().toLowerCase()
    const predicate = typeof searchFields === 'function' ? searchFields : null

    let rows = items
    if (term) {
      rows = rows.filter((item) => {
        if (predicate) return predicate(item, term)
        return searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(term))
      })
    }

    Object.entries(filters).forEach(([field, value]) => {
      if (value && value !== 'All') rows = rows.filter((item) => item[field] === value)
    })

    if (sort) {
      const dir = sort.direction === 'desc' ? -1 : 1
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key]
        const bv = b[sort.key]
        if (av == null) return 1
        if (bv == null) return -1
        const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), undefined, { numeric: true })
        return result * dir
      })
    }

    return rows
  }, [items, search, searchFields, filters, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = processed.slice((safePage - 1) * pageSize, safePage * pageSize)

  const setFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPage(1)
  }

  const toggleSort = (key) => {
    setSort((prev) => (prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }))
  }

  return {
    search,
    setSearch: (v) => { setSearch(v); setPage(1) },
    filters,
    setFilter,
    sort,
    setSort,
    toggleSort,
    page,
    setPage,
    pageSize,
    pageItems,
    totalPages,
    total: processed.length,
    reset: () => { setSearch(''); setFilters(initialFilters); setSort(defaultSort); setPage(1) },
  }
}
const PREFIX = 'aquaflow'

export function storageKey(name) {
  return `${PREFIX}:${name}`
}

export function getItem(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(storageKey(key))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(storageKey(key))
  } catch {
    /* ignore */
  }
}

export function isAquaflowKey(key) {
  return Boolean(key) && (key.startsWith(`${PREFIX}:`) || key.startsWith(`${PREFIX}-`))
}

export function clearAll() {
  try {
    const keys = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (isAquaflowKey(k)) keys.push(k)
    }
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
  try {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i)
      if (isAquaflowKey(k)) window.sessionStorage.removeItem(k)
    }
  } catch {
    /* ignore */
  }
}

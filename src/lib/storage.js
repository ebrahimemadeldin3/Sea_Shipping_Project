// src/lib/storage.js
export const KEYS = {
  USERS: 'navora_users',
  SHIPMENTS: 'navora_shipments',
  SESSION: 'navora_session',
  NOTIFICATIONS: 'navora_notifications',
  INITIALIZED: 'navora_initialized',
};

export function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch (error) {
    console.error(`Error removing ${key} from localStorage`, error);
  }
}


// src/lib/auth-service.js
import { getStorageItem, setStorageItem, removeStorageItem, KEYS } from './storage';

export function getUsers() {
  return getStorageItem(KEYS.USERS, []);
}

export function getUserByEmail(email) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === normalizedEmail);
}

export function registerUser(userData) {
  const existingUser = getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const users = getUsers();
  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    fullName: userData.fullName,
    email: userData.email.trim(),
    phone: userData.phone,
    companyName: userData.companyName || '',
    country: userData.country,
    password: userData.password, // DEMO ONLY: raw password
    role: 'customer', // Always force customer on public registration
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setStorageItem(KEYS.USERS, users);

  return newUser;
}

export function updateUser(userId, updatedData) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error('User not found.');

  users[index] = { ...users[index], ...updatedData };
  setStorageItem(KEYS.USERS, users);
  
  // Trigger storage event so other tabs/components update
  window.dispatchEvent(new Event('storage'));
  
  return users[index];
}

export function login(email, password) {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const session = {
    userId: user.id,
    createdAt: new Date().toISOString()
  };
  
  setStorageItem(KEYS.SESSION, session);
  return user;
}

export function logout() {
  removeStorageItem(KEYS.SESSION);
}

export function getSession() {
  return getStorageItem(KEYS.SESSION, null);
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const users = getUsers();
  const user = users.find(u => u.id === session.userId);
  
  if (!user) {
    // Session is invalid (user deleted?)
    clearSession();
    return null;
  }
  return user;
}

export function clearSession() {
  removeStorageItem(KEYS.SESSION);
}

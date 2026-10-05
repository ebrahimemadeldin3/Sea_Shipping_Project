// src/lib/notification-service.js
import { getStorageItem, setStorageItem, KEYS } from './storage';

export function getNotifications() {
  return getStorageItem(KEYS.NOTIFICATIONS, []);
}

export function getUserNotifications(userId) {
  return getNotifications().filter(n => n.userId === userId);
}

export function getUnreadCount(userId) {
  return getUserNotifications(userId).filter(n => !n.read).length;
}

export function createNotification(userId, data) {
  const notifications = getNotifications();
  
  const newNotification = {
    ...data,
    id: `ntf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.unshift(newNotification);
  setStorageItem(KEYS.NOTIFICATIONS, notifications);
  
  return newNotification;
}

export function markAsRead(id) {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index > -1) {
    notifications[index].read = true;
    setStorageItem(KEYS.NOTIFICATIONS, notifications);
  }
}

export function markAllAsRead(userId) {
  const notifications = getNotifications();
  let updated = false;
  
  notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      updated = true;
    }
  });

  if (updated) {
    setStorageItem(KEYS.NOTIFICATIONS, notifications);
  }
}

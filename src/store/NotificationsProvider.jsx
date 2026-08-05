/* eslint-disable react/only-export-components */
import { createContext, useContext, useMemo } from 'react'
import { useData } from './DataProvider'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { notifications, addNotification, markNotificationRead, markAllNotificationsRead, removeNotification } = useData()

  const api = useMemo(
    () => ({
      notifications,
      markRead: markNotificationRead,
      markAllRead: markAllNotificationsRead,
      addNotification,
      removeNotification,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
    [notifications, markNotificationRead, markAllNotificationsRead, addNotification, removeNotification],
  )

  return <NotificationsContext.Provider value={api}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
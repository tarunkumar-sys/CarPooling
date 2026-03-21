import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Notification, NotificationType } from '../types/notification';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const { info } = useToast();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agraride_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }

    // Check notification permission
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('agraride_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    }

    return false;
  }, []);

  const showPushNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!hasPermission || !('Notification' in window)) return;

    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'agraride-notification',
        requireInteraction: false,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, [hasPermission]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      created_at: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show push notification
    showPushNotification(newNotification.title, newNotification.message);

    // Show toast for immediate feedback
    info(newNotification.message, 4000);
  }, [showPushNotification, info]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        requestPermission,
        hasPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

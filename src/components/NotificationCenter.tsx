import React, { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from './ui/utils';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface NotificationContextType {
  notify: (message: string, type?: Notification['type']) => void;
  notifications: Notification[];
  remove: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string, type: Notification['type'] = 'info') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    // Auto-remove after 4s
    setTimeout(() => remove(id), 4000);
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify, notifications, remove }}>
      {children}
      {/* Notification container */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'px-4 py-2 rounded-md shadow-lg animate-pulse-glow',
              n.type === 'info' && 'bg-[var(--neon-blue)] text-white',
              n.type === 'success' && 'bg-green-500 text-white',
              n.type === 'error' && 'bg-red-600 text-white',
              n.type === 'warning' && 'bg-yellow-500 text-white'
            )}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

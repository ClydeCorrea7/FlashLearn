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
              'px-4 py-3 rounded-xl shadow-2xl font-bold border-2 transition-all duration-300 max-w-[300px] text-xs',
              n.type === 'info' && 'cyber-gradient text-foreground border-border',
              n.type === 'success' && 'bg-emerald-500/90 text-white border-emerald-400',
              n.type === 'error' && 'bg-rose-500/90 text-white border-rose-400',
              n.type === 'warning' && 'bg-amber-500/90 text-black border-amber-400'
            )}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

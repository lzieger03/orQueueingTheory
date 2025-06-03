import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, AlertTriangle, Info, X, Award } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: { 
  notification: Notification; 
  onRemove: (id: string) => void; 
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(notification.id), 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onRemove]);

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-600/20 border-green-500/30 text-green-100';
      case 'warning':
        return 'bg-yellow-600/20 border-yellow-500/30 text-yellow-100';
      case 'achievement':
        return 'bg-purple-600/20 border-purple-500/30 text-purple-100';
      default:
        return 'bg-blue-600/20 border-blue-500/30 text-blue-100';
    }
  };

  const getIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div 
      className={`
        ${getNotificationStyle()}
        border rounded-lg p-4 mb-3 shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        animate-slide-in
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">
            {notification.title}
          </h4>
          <p className="text-sm opacity-90">
            {notification.message}
          </p>
        </div>
        
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

// Custom hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationCounter = useRef(0);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${++notificationCounter.current}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // Default 5 seconds
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper functions for different notification types
  const notifySuccess = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const notifyAchievement = useCallback((title: string, message: string, duration?: number) => {
    return addNotification({ 
      type: 'achievement', 
      title, 
      message, 
      duration: duration || 8000, // Achievements stay longer
      icon: <Award className="w-5 h-5 text-purple-400 animate-bounce" />
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifySuccess,
    notifyWarning,
    notifyInfo,
    notifyAchievement,
  };
}

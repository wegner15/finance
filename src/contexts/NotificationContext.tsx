
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    show: (type: Notification['type'], message: string, duration?: number) => void;
    dismiss: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const show = useCallback((type: Notification['type'], message: string, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, duration);
        }
    }, [dismiss]);

    const success = useCallback((message: string, duration?: number) => show('success', message, duration), [show]);
    const error = useCallback((message: string, duration?: number) => show('error', message, duration), [show]);
    const info = useCallback((message: string, duration?: number) => show('info', message, duration), [show]);

    return (
        <NotificationContext.Provider value={{ notifications, show, dismiss, success, error, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`
              pointer-events-auto
              flex items-start p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out
              ${notification.type === 'success' ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900 border-l-4 border-l-green-500' : ''}
              ${notification.type === 'error' ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 border-l-4 border-l-red-500' : ''}
              ${notification.type === 'info' ? 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900 border-l-4 border-l-blue-500' : ''}
            `}
                    >
                        <div className="flex-shrink-0 mr-3">
                            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className={`flex-1 text-sm font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-200' :
                                notification.type === 'error' ? 'text-red-800 dark:text-red-200' :
                                    'text-blue-800 dark:text-blue-200'
                            }`}>
                            {notification.message}
                        </div>
                        <button
                            onClick={() => dismiss(notification.id)}
                            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    metadata: {
        vehicle_id?: string;
        make?: string;
        model?: string;
        price?: number;
    };
}

export const NotificationComponent: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Fetch initial notifications
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
                return;
            }

            setNotifications(data || []);
        };

        fetchNotifications();

        // Subscribe to new notifications
        const subscription = supabase
            .channel('notifications')
            .on('postgres_changes', 
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, 
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error marking notification as read:', error);
            return;
        }

        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true } 
                    : notification
            )
        );
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        
        // If it's a vehicle notification, navigate to the vehicle page
        if (notification.type === 'new_vehicle' && notification.metadata.vehicle_id) {
            window.location.href = `/vehicles/${notification.metadata.vehicle_id}`;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                <BellIcon className="h-6 w-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {notifications.filter(n => !n.read).length}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                        !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {notification.message}
                                            </p>
                                            {notification.metadata.price && (
                                                <p className="mt-1 text-sm font-medium text-indigo-600">
                                                    ${notification.metadata.price.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(notification.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}; 
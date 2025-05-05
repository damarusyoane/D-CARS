import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  vehicle_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ChatProps {
  receiverId: string;
  vehicleId: string;
}

export default function Chat({ receiverId, vehicleId }: ChatProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const [isTyping, setIsTyping] = useState(false);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages', vehicleId, receiverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user?.id})`)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', vehicleId, receiverId] });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from('messages').insert({
        sender_id: user?.id,
        receiver_id: receiverId,
        vehicle_id: vehicleId,
        content,
        is_read: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', vehicleId, receiverId] });
      setNewMessage('');
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${vehicleId}:${receiverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `vehicle_id=eq.${vehicleId}`,
        },
        (payload) => {
          if (
            (payload.new.sender_id === user?.id && payload.new.receiver_id === receiverId) ||
            (payload.new.sender_id === receiverId && payload.new.receiver_id === user?.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ['messages', vehicleId, receiverId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicleId, receiverId, user?.id, queryClient]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    const unreadMessages = messages
      .filter((msg) => !msg.is_read && msg.sender_id === receiverId)
      .map((msg) => msg.id);

    if (unreadMessages.length > 0) {
      markAsRead.mutate(unreadMessages);
    }
  }, [messages, receiverId, markAsRead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[70%] ${
                message.sender_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <img
                src={message.sender.avatar_url || '/default-avatar.png'}
                alt={message.sender.full_name}
                className="h-8 w-8 rounded-full"
              />
              <div
                className={`rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span
                  className={`text-xs mt-1 block ${
                    message.sender_id === user?.id
                      ? 'text-primary-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('messages.typeMessage')}
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 
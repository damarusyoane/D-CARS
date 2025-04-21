import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftIcon} from '@heroicons/react/24/outline';
import Chat from './Chat';
import LoadingSpinner from '../common/LoadingSpinner';

interface Conversation {
  id: string;
  vehicle_id: string;
  last_message: {
    content: string;
    created_at: string;
    read: boolean;
  };
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    image_url: string | null;
  };
}

export default function ChatList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          vehicle_id,
          vehicle:vehicles(make, model, year, image_url),
          other_user:profiles!messages_receiver_id_fkey(id, full_name, avatar_url),
          last_message:last_message(content, created_at, read)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by vehicle and get the last message for each
      const groupedConversations = data.reduce((acc: Conversation[], curr: any) => {
        const existing = acc.find(c => c.vehicle_id === curr.vehicle_id);
        if (!existing) {
          acc.push({
            id: curr.vehicle_id,
            vehicle_id: curr.vehicle_id,
            last_message: curr.last_message,
            other_user: curr.other_user,
            vehicle: curr.vehicle
          });
        }
        return acc;
      }, []);

      return groupedConversations;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('messages.conversations')}
          </h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('messages.noConversations')}
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-primary-50 dark:bg-primary-900'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={conversation.other_user.avatar_url || '/default-avatar.png'}
                    alt={conversation.other_user.full_name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conversation.other_user.full_name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversation.last_message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.last_message.content}
                      </p>
                      {!conversation.last_message.read && (
                        <span className="h-2 w-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conversation.vehicle.year} {conversation.vehicle.make} {conversation.vehicle.model}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        {selectedConversation ? (
          <Chat
            receiverId={selectedConversation.other_user.id}
            vehicleId={selectedConversation.vehicle_id}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('messages.selectConversation')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('messages.selectConversationDescription')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
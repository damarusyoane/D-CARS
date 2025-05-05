import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSessionAwareRefresh } from '../hooks/useSessionAwareRefresh';
import {
  PaperAirplaneIcon,
  ChevronLeftIcon,
  ExclamationCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';

// Define types properly 
type Message = {
  id: string;
  vehicle_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

type Vehicle = {
  id: string;
  make?: string; // Using make instead of title to match your database schema
  images?: string[];
};

type Profile = {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
};

interface Conversation {
  vehicle: Vehicle;
  otherUser: Profile;
  lastMessage: Message;
  unreadCount: number;
}

export default function Messages() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('vehicle')
  );
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view your messages.</p>
      </div>
    );
  }

  // Fetch conversations with timeout and error handling
  const { data: conversations, isLoading: isLoadingConversations, isError: isConversationsError, refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) {
          return [];
        }
        
        // Fix the query to match your database schema
        const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, avatar_url),
          receiver:receiver_id(id, full_name, avatar_url),
          vehicle:vehicle_id(id)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (!messages) return [];
        
        // Group messages by vehicle and get the last message for each
        const conversationsMap = new Map<string, Conversation>();
        messages.forEach((message: any) => {
          const vehicleId = message.vehicle_id;
          const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
          if (!vehicleId || !otherUser) return;
          
          
          
          if (!conversationsMap.has(vehicleId)) {
            conversationsMap.set(vehicleId, {
              vehicle: {
                id: vehicleId,
                make: `Vehicle ${vehicleId.substring(0, 8)}...`, // Fallback make
              },
              otherUser,
              lastMessage: message,
              unreadCount: message.receiver_id === user.id && !message.read ? 1 : 0,
            });
          } else if (message.receiver_id === user.id && !message.read) {
            const conv = conversationsMap.get(vehicleId)!;
            conv.unreadCount += 1;
          }
        });
        
        // Optionally fetch additional vehicle information if needed
        const conversations = Array.from(conversationsMap.values());
        
        // If you need to fetch additional vehicle details, you could do it here
        // For example:
        const vehicleIds = conversations.map(conv => conv.vehicle.id);
        if (vehicleIds.length > 0) {
          const { data: vehicles } = await supabase
            .from('vehicles') // Adjust to your actual vehicle table name
            .select('id, make, images')
            .in('id', vehicleIds);
            
          if (vehicles) {
            vehicles.forEach((vehicle: any) => {
              const conversation = conversations.find(c => c.vehicle.id === vehicle.id);
              if (conversation) {
                conversation.vehicle.make = vehicle.make;
                conversation.vehicle.images = vehicle.images;
              }
            });
          }
        }
        
        return conversations;
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations. Please try again later.');
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30000,
    gcTime: 300000,
  });

  useSessionAwareRefresh(refetchConversations);

  // Fetch messages for selected conversation with better error handling
  const { data: messages, isLoading: isLoadingMessages, isError: isMessagesError } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      try {
        if (!selectedConversation) {
          return [];
        }
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('vehicle_id', selectedConversation)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('<p>Impossible de charger les messages. Veuillez réessayer.</p>');
        return [];
      }
    },
    enabled: !!selectedConversation && !!user?.id && !isAuthLoading,
    retry: 1,
    staleTime: 30000,
  });

  // Send message mutation with better error handling
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation || !content.trim() || !user?.id) {
        throw new Error('Missing required information to send message');
      }

      const conversation = conversations?.find(
        (c) => c.vehicle.id === selectedConversation
      );

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const message = {
        vehicle_id: selectedConversation,
        sender_id: user.id,
        receiver_id: conversation.otherUser.id,
        content: content.trim(),
        read: false
      };

      const { error } = await supabase.from('messages').insert([message]);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      setMessageInput('');
      setError(null);
    },
    onError: (err) => {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `vehicle_id=eq.${selectedConversation}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
          queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation, queryClient, user?.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage.mutate(messageInput);
    }
  };

  // Reset error state when changing conversations
  useEffect(() => {
    setError(null);
  }, [selectedConversation]);

  // Handle error state display
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{error}</p>
        <button 
          title="Reload page"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (isLoadingConversations && !conversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-full">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* --- Legacy Messaging UI Below --- */}
        {/* Conversations List */}
        <div className={`${
          selectedConversation ? 'hidden md:block md:w-1/3 lg:w-80' : 'w-full'
        } border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">{
            conversations && conversations.length > 0 ? (
              conversations.map((conversation) => (
                <button
                  key={conversation.vehicle.id}
                  onClick={() => setSelectedConversation(conversation.vehicle.id)}
                  className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedConversation === conversation.vehicle.id
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {conversation.vehicle.images?.[0] && (
                      <img
                        src={conversation.vehicle.images[0]}
                        alt={conversation.vehicle.make || 'Vehicle'}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conversation.vehicle.make || `Vehicle ${conversation.vehicle.id.substring(0, 8)}...`}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conversation.otherUser.full_name || conversation.otherUser.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))
            ) : isLoadingConversations ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : isConversationsError ? (
              <div className="p-4 text-center text-red-500 dark:text-red-400">
                <ExclamationCircleIcon className="w-6 h-6 mx-auto mb-2" />
                <p>Echec de chargement des conversations</p>
                <button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 underline"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucune conversation trouvée
              </div>
            )}
          </div>
        </div>

      {/* Selected Conversation */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Conversation Header */}
          <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center flex-shrink-0">
            <button
              title="Back to conversations"
              onClick={() => setSelectedConversation(null)}
              className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            {conversations?.find(c => c.vehicle.id === selectedConversation)?.vehicle && (
              <>
                <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden mr-2 md:mr-3">
                  {conversations.find(c => c.vehicle.id === selectedConversation)?.vehicle.images?.[0] && (
                    <img
                      src={conversations.find(c => c.vehicle.id === selectedConversation)?.vehicle.images?.[0]}
                      alt="Vehicle"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm md:text-base">
                    {conversations.find(c => c.vehicle.id === selectedConversation)?.vehicle.make || 
                    `Vehicle ${selectedConversation.substring(0, 8)}...`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {conversations.find(c => c.vehicle.id === selectedConversation)?.otherUser.full_name || 
                     conversations.find(c => c.vehicle.id === selectedConversation)?.otherUser.username || 
                     'Utilisateur Inconnu'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {isLoadingMessages ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner size="md" />
              </div>
            ) : isMessagesError ? (
              <div className="text-center text-red-500 dark:text-red-400 py-8 md:py-10 flex flex-col items-center">
                <ExclamationCircleIcon className="w-8 h-8 mb-2" />
                <p>Impossible de charger les messages. Veuillez réessayer.</p>
                <button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] })}
                  className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400 underline"
                >
                  Réessayer
                </button>
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 md:py-2 ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm md:text-base break-words">{message.content}</p>
                      <span className="text-xs text-gray-200 dark:text-gray-400 mt-1 block text-right">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8 md:py-10">
                Aucun message pour le moment. Commencez la conversation !
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sendMessage.isPending}
                className="p-2 bg-primary-600 text-white rounded-full disabled:opacity-50 hover:bg-primary-700 transition-colors flex-shrink-0"
              >
                {sendMessage.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md p-4 md:p-6">
            <ChatBubbleOvalLeftEllipsisIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-600 mb-3 md:mb-4" />
            <h2 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-2">Vos Messages</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
              Select a conversation from the list to view and send messages about vehicles.
            </p>
          </div>
        </div>
      )}
    </div> {/* Close flex-1 flex min-h-0 */}
  </div>
);
}
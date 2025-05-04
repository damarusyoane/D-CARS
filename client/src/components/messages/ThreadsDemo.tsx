import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { ChatBubbleLeftIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

// Define types (unchanged)
interface Thread {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

interface ThreadMessage {
  id: string;
  thread_id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function ThreadsDemo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  // Fetch threads with proper v5 syntax
  const { 
    data: threads, 
    isLoading: isLoadingThreads 
  } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch messages for selected thread with proper v5 syntax
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['threads', selectedThread],
    queryFn: async () => {
      if (!selectedThread) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', selectedThread)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedThread
  });

  // Create thread mutation with proper v5 syntax
  const createThread = useMutation({
    mutationFn: async (title: string) => {
      if (!user?.id || !title.trim()) {
        throw new Error('Informations manquantes');
      }
      const { data, error } = await supabase
        .from('threads')
        .insert([{ title: title.trim(), user_id: user.id }])
        .select();
      
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      setNewThreadTitle('');
      setIsCreatingThread(false);
    }
  });

  // Send message mutation with proper v5 syntax
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedThread || !user?.id || !content.trim()) {
        throw new Error('Informations manquantes');
      }
      const { error } = await supabase
        .from('messages')
        .insert([{ 
          thread_id: selectedThread, 
          user_id: user.id, 
          content: content.trim() 
        }]);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedThread] });
      setNewMessage('');
    }
  });

  // Handle submitting a new thread
  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (newThreadTitle.trim()) {
      createThread.mutate(newThreadTitle);
    }
  };

  // Handle submitting a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedThread) {
      sendMessage.mutate(newMessage);
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        Veuillez vous connecter pour utiliser la messagerie.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Threads List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Fils de Discussion</h3>
          <button
            onClick={() => setIsCreatingThread(!isCreatingThread)}
            className="p-1 text-primary-600 hover:text-primary-700 dark:text-primary-500 transition-colors"
            aria-label="Créer un nouveau fil de discussion"
          >
            <PlusCircleIcon className="h-5 w-5" />
          </button>
        </div>

        {isCreatingThread && (
  <form onSubmit={handleCreateThread} className="p-2 border-b border-gray-200 dark:border-gray-700">
    <input
      type="text"
      value={newThreadTitle}
      onChange={(e) => setNewThreadTitle(e.target.value)}
      placeholder="Titre du fil de discussion..."
      className="w-full p-2 text-sm border rounded 
        bg-gray-50 dark:bg-gray-800 
        border-gray-200 dark:border-gray-700 
        focus:ring-2 focus:ring-primary-500 
        focus:border-transparent 
        transition-all 
        text-gray-900 dark:text-gray-100 
        placeholder-gray-500 dark:placeholder-gray-400"
    />
    <div className="flex justify-end mt-2 space-x-2">
      <button
        type="button"
        onClick={() => setIsCreatingThread(false)}
        className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        Annuler
      </button>
      <button
        type="submit"
        disabled={!newThreadTitle.trim() || createThread.isPending}
        className="px-3 py-1 text-xs bg-primary-600 text-white rounded disabled:opacity-50 hover:bg-primary-700 transition-colors"
      >
        {createThread.isPending ? 'Création...' : 'Créer'}
      </button>
    </div>
  </form>
)}

        <div className="overflow-y-auto h-full max-h-[calc(100%-44px)]">
          {isLoadingThreads ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : threads && threads.length > 0 ? (
            threads.map((thread: Thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedThread === thread.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium truncate">{thread.title}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(thread.created_at).toLocaleDateString('fr-FR')}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucun fil de discussion trouvé. Créez-en un pour commencer.
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">
                {threads?.find((t: Thread) => t.id === selectedThread)?.title || 'Fil de Discussion'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {isLoadingMessages ? (
                <div className="flex justify-center p-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message: ThreadMessage) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg max-w-[75%] ${
                      message.user_id === user.id
                        ? 'ml-auto bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 text-sm py-8">
                  Aucun message pour le moment. Commencez la conversation !
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-200 dark:border-gray-700">
  <div className="flex space-x-2">
    <input
      type="text"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Tapez un message..."
      className="flex-1 p-2 text-sm border rounded 
        bg-gray-50 dark:bg-gray-800 
        border-gray-200 dark:border-gray-700 
        focus:ring-2 focus:ring-primary-500 
        focus:border-transparent 
        transition-all 
        text-gray-900 dark:text-gray-100 
        placeholder-gray-500 dark:placeholder-gray-400"
    />
    <button
      type="submit"
      disabled={!newMessage.trim() || sendMessage.isPending}
      className="px-3 bg-primary-600 text-white rounded disabled:opacity-50 hover:bg-primary-700 transition-colors"
    >
      {sendMessage.isPending ? (
        <LoadingSpinner size="sm" />
      ) : (
        'Envoyer'
      )}
    </button>
  </div>
</form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Sélectionnez un fil de discussion pour voir les messages
          </div>
        )}
      </div>
    </div>
  );
}

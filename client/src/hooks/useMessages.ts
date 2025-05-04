import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Message } from '../types/database';

export function useMessages(vehicleId: string) {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (newMessage: Omit<Message, 'id' | 'created_at' | 'updated_at' | 'is_read'>) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({ ...newMessage, is_read: false })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', vehicleId] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', vehicleId] });
    }
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', vehicleId] });
    }
  });

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    deleteMessage
  };
}

export function useConversations() {


  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          vehicle:vehicles(*),
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by vehicle_id and get the latest message for each
      const groupedMessages = messages.reduce((acc, message) => {
        if (!acc[message.vehicle_id]) {
          acc[message.vehicle_id] = {
            vehicle: message.vehicle,
            lastMessage: message,
            unreadCount: 0
          };
        }
        if (!message.is_read) {
          acc[message.vehicle_id].unreadCount++;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(groupedMessages);
    }
  });

  return {
    conversations,
    isLoading
  };
} 
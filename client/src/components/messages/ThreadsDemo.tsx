import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface Message {
  id: string;
  thread_id?: string;
  subject?: string;
  sender_id: string;
  receiver_id: string;
  vehicle_id: string;
  content: string;
  deleted_at?: string | null;
  created_at: string;
  sender?: { id: string; full_name?: string; avatar_url?: string };
  receiver?: { id: string; full_name?: string; avatar_url?: string };
}

interface Thread {
  threadId: string;
  subject?: string;
  messages: Message[];
  lastMessage: Message;
}

export default function ThreadsDemo() {
  const { user } = useAuth();
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const queryClient = useQueryClient();

  // 1. Fetch threads (grouped by thread_id, only not deleted)
  const { data: threads, isLoading } = useQuery(['threads', user?.id], async () => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`*, sender:sender_id (id, full_name, avatar_url), receiver:receiver_id (id, full_name, avatar_url), vehicle:vehicle_id (id, title)`)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Group messages by thread_id
    const threadsMap = new Map<string, Message[]>();
    messages.forEach((msg: Message) => {
      const threadId = msg.thread_id || msg.id;
      if (!threadsMap.has(threadId)) threadsMap.set(threadId, []);
      threadsMap.get(threadId)!.push(msg);
    });
    return Array.from(threadsMap.values()).map((msgs) => ({
      threadId: msgs[0].thread_id || msgs[0].id,
      subject: msgs[0].subject,
      messages: msgs,
      lastMessage: msgs[0],
    }));
  });

  // 2. Soft delete a message
  const deleteMessage = useMutation(
    async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['threads', user?.id]);
      }
    }
  );

  // 3. Create a new thread and message
  const createThreadAndMessage = useMutation(
    async ({ subject, content, receiverId, vehicleId }: { subject: string, content: string, receiverId: string, vehicleId: string }) => {
      // 1. Create thread
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert([{ subject }])
        .select()
        .single();
      if (threadError) throw threadError;
      // 2. Create message in that thread
      const { error: msgError } = await supabase
        .from('messages')
        .insert([{
          thread_id: thread.id,
          subject,
          content,
          sender_id: user.id,
          receiver_id: receiverId,
          vehicle_id: vehicleId
        }]);
      if (msgError) throw msgError;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['threads', user?.id]);
        setNewSubject('');
        setNewContent('');
      }
    }
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Threads Demo</h2>
      {/* New Thread Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          createThreadAndMessage.mutate({
            subject: newSubject,
            content: newContent,
            receiverId: selectedReceiverId,
            vehicleId: selectedVehicleId
          });
        }}
        className="mb-8"
      >
        <input
          value={newSubject}
          onChange={e => setNewSubject(e.target.value)}
          placeholder="Subject"
          className="border rounded px-2 py-1 mr-2"
        />
        <input
          value={selectedReceiverId}
          onChange={e => setSelectedReceiverId(e.target.value)}
          placeholder="Receiver ID"
          className="border rounded px-2 py-1 mr-2"
        />
        <input
          value={selectedVehicleId}
          onChange={e => setSelectedVehicleId(e.target.value)}
          placeholder="Vehicle ID"
          className="border rounded px-2 py-1 mr-2"
        />
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Message Content"
          className="border rounded px-2 py-1 mr-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Send</button>
      </form>

      {/* Threads List */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {threads && threads.length > 0 ? (
            threads.map(thread => (
              <div key={thread.threadId} className="mb-6 border-b pb-4">
                <div className="font-semibold text-lg mb-1">{thread.subject || 'No Subject'}</div>
                <div className="text-sm text-gray-600 mb-2">Last message: {thread.lastMessage.content}</div>
                <div>
                  {thread.messages.map(msg => (
                    <div key={msg.id} className="flex items-center mb-1">
                      <span className="mr-2">{msg.sender?.full_name || msg.sender_id}:</span>
                      <span>{msg.content}</span>
                      <button
                        onClick={() => deleteMessage.mutate(msg.id)}
                        className="ml-2 text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div>No threads found.</div>
          )}
        </div>
      )}
    </div>
  );
}

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../Chat';
import { supabase } from '../../../lib/supabase';

// Mock the Supabase query
vi.mocked(supabase.from).mockReturnValue({
  select: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  then: vi.fn().mockResolvedValue({
    data: [
      {
        id: '1',
        sender_id: 'sender1',
        receiver_id: 'receiver1',
        content: 'Hello there!',
        created_at: '2024-01-01T00:00:00Z',
        read: false,
        sender: {
          full_name: 'John Doe',
          avatar_url: '/avatar.jpg',
        },
      },
    ],
    error: null,
  }),
} as any);

describe('Chat', () => {
  const props = {
    receiverId: 'receiver1',
    vehicleId: 'vehicle1',
  };

  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <Chat {...props} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders messages after loading', async () => {
    render(
      <BrowserRouter>
        <Chat {...props} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('sends a new message', async () => {
    render(
      <BrowserRouter>
        <Chat {...props} />
      </BrowserRouter>
    );

    // Wait for initial messages to load
    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
    });

    // Type a new message
    const input = screen.getByPlaceholderText('messages.typeMessage');
    fireEvent.change(input, { target: { value: 'New message' } });

    // Submit the message
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    // Check if the message was sent
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.from('messages').insert).toHaveBeenCalledWith({
        sender_id: expect.any(String),
        receiver_id: 'receiver1',
        vehicle_id: 'vehicle1',
        content: 'New message',
        read: false,
      });
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockRejectedValue(new Error('API Error')),
    } as any);

    render(
      <BrowserRouter>
        <Chat {...props} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Hello there!')).not.toBeInTheDocument();
    });
  });
}); 
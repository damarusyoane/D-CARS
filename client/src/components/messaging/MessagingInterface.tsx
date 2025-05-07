import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'other';
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
}

const sampleConversations: Conversation[] = [
  {
    id: '1',
    name: 'Michael Anderson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Hello, I am interested in the Tesla Model 3. Is it available?',
    timestamp: '10:45 AM',
    unread: true,
    messages: [
      { id: 'm1', content: 'Hello, I am interested in the Tesla Model 3. Is it available?', timestamp: '10:45 AM', sender: 'other' },
      { id: 'm2', content: 'Yes, it is still available. Would you like to schedule a test drive?', timestamp: '10:50 AM', sender: 'user' },
      { id: 'm3', content: 'That would be great! Is it the 2021 LR AWD model?', timestamp: '11:05 AM', sender: 'other' },
      { id: 'm2', content: 'Of course! It\'s a 2020 BMW 330i with premium package.', timestamp: 'Yesterday', sender: 'user' },
      { id: 'm3', content: 'I\'d like to know more about the financing options for the BMW.', timestamp: 'Yesterday', sender: 'other' },
    ]
  },
  {
    id: '3',
    name: 'David Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/53.jpg',
    lastMessage: 'Thanks for the information! I\'ll get back to you soon.',
    timestamp: 'Jul 12',
    unread: false,
    messages: [
      { id: 'm1', content: 'Hello, is the Ford Mustang GT still for sale?', timestamp: 'Jul 10', sender: 'other' },
      { id: 'm2', content: 'Yes it is! It\'s in excellent condition with low mileage.', timestamp: 'Jul 11', sender: 'user' },
      { id: 'm3', content: 'What\'s the lowest price you can offer?', timestamp: 'Jul 12', sender: 'other' },
      { id: 'm4', content: 'The listed price is already very competitive, but I can offer a small discount if you\'re ready to move forward.', timestamp: 'Jul 12', sender: 'user' },
      { id: 'm5', content: 'Thanks for the information! I\'ll get back to you soon.', timestamp: 'Jul 12', sender: 'other' },
    ]
  },
];

const MessagingInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(sampleConversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const updatedMessage: Message = {
      id: `m${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user'
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          lastMessage: newMessage,
          timestamp: 'Just now',
          messages: [...conv.messages, updatedMessage]
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setActiveConversation(prevState => {
      if (!prevState) return null;
      return {
        ...prevState,
        lastMessage: newMessage,
        timestamp: 'Just now',
        messages: [...prevState.messages, updatedMessage]
      };
    });
    setNewMessage('');
  };

  return (
    <div className="flex-1 h-full overflow-hidden bg-card flex flex-col md:flex-row">
      {/* Conversation List */}
      <div className="w-full md:w-72 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-8 pr-2 py-2 bg-secondary border border-border rounded-md text-sm"
            />
            <svg className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversation(conversation)}
              className={`p-3 flex items-start gap-3 cursor-pointer border-b border-border hover:bg-secondary/30 ${
                activeConversation?.id === conversation.id ? 'bg-secondary/50' : ''
              }`}
            >
              <div className="flex-shrink-0 relative">
                <img src={conversation.avatar} alt={conversation.name} className="w-10 h-10 rounded-full object-cover" />
                {conversation.unread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-medium truncate">{conversation.name}</h4>
                  <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Detail */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Conversation Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={activeConversation.avatar} alt={activeConversation.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-medium">{activeConversation.name}</h3>
                <p className="text-xs text-muted-foreground">Derniere Activite: Aujourd'hui</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeConversation.messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'other' && (
                  <img src={activeConversation.avatar} alt={activeConversation.name} className="w-8 h-8 rounded-full object-cover mr-2 mt-1" />
                )}
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-secondary rounded-tl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <span className={`text-xs block mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-muted-foreground'}`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-secondary border border-border rounded-l-md text-sm focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium">Pas de conversations choisi</h3>
            <p className="text-muted-foreground">Choisir une conversation</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInterface;

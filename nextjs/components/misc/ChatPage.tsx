'use client';
import { User } from "@supabase/supabase-js";
import { Navbar } from "../landing/Navbar";
import { useState, useEffect } from "react";
import { createConversation, getConversations, updateConversation } from "@/utils/supabase/queries";
// import { supabase } from "@/utils/supabase/client";
import { Convo } from "@/types/convo.types";
import { Json } from "@/types_db";
import { createClient } from '@/utils/supabase/client';

interface Message {
  role: 'user' | 'bot' | 'error';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  content: Message[];
}

export default function ChatPage({ user }: { user: User }) {
  const [input, setInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data, error } = await getConversations(supabase, user.id);
      if (error) throw error;
      console.log("*********************RAW DOG****************************");
      console.log(data);

      const parsedConversations: Conversation[] = (data as Convo[])
        .filter((conv): conv is Convo & { id: string } => !!conv.id)
        .map(conv => ({
          id: conv.id,
          title: conv.title || "Untitled",
          content: parseMessages(conv.content)
        }));

      console.log("********************PARSED CONVERSATIONS*************************");
      console.log(parsedConversations);
      setConversations(parsedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const parseMessages = (message: Json | null): Message[] => {
    console.log("parsing messages");
    if (!message) return [];
    console.log("Message: ", message);
    try {
      const parsedMessage = JSON.parse(message as string);
      return Array.isArray(parsedMessage) ? parsedMessage : [];
    } catch (error) {
      console.error('Error parsing messages:', error);
      return [];
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput, isFirstMessage: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      const data = await response.json();
      const newMessages: Message[] = [{ role: 'bot', content: data.reply }];
      const newConversation: Omit<Convo, 'id'> = {
        userId: user.id,
        content: JSON.stringify(newMessages),
        title: `Email Check: ${emailInput}`,
      };
      const { data: savedConvo, error } = await createConversation(supabase, newConversation);
      if (error) throw error;
      const createdConversation: Conversation = {
        id: savedConvo.id,
        title: savedConvo.title,
        content: newMessages, 
      };
      setConversations(prev => [createdConversation, ...prev]);
      setCurrentConversation(createdConversation);
    } catch (error) {
      console.error('Error:', error);
      setCurrentConversation({
        id: 'error',
        title: 'Error',
        content: [{ role: 'error', content: 'Failed to check email security.' }],
      });
    } finally {
      setIsLoading(false);
      setEmailInput('');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation) return;
    setIsLoading(true);
    const updatedMessages: Message[] = [...currentConversation.content, { role: 'user', content: input }];
    setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, isFirstMessage: false }),
      });
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      const data = await response.json();
      updatedMessages.push({ role: 'bot', content: data.reply });
      setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
      await updateConversation(supabase, currentConversation.id, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error:', error);
      updatedMessages.push({ role: 'error', content: 'Failed to get response.' });
      setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  return (
    <>
      <Navbar user={user} />
      <div className="flex max-w-6xl mx-auto p-4">
        <div className="w-1/4 pr-4">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          <ul>
            {conversations.map(conv => (
              <li 
                key={conv.id} 
                className={`cursor-pointer p-2 rounded ${currentConversation?.id === conv.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => handleConversationClick(conv)}
              >
                {conv.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4">
          {!currentConversation ? (
            <form onSubmit={handleEmailSubmit} className="flex mb-4">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-grow p-2 border rounded-l-lg"
                placeholder="Enter an email address to check..."
                disabled={isLoading}
                required
              />
              <button 
                type="submit" 
                className="bg-blue-500 text-white p-2 rounded-r-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Checking...' : 'Check Email'}
              </button>
            </form>
          ) : (
            <>
              <div className="bg-gray-100 p-4 rounded-lg mb-4 h-96 overflow-y-auto">
                {currentConversation.content.map((message, index) => (
                  <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <span className={`inline-block p-2 rounded-lg ${
                      message.role === 'user' ? 'bg-blue-500 text-white' : 
                      message.role === 'bot' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {message.content}
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow p-2 border rounded-l-lg"
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white p-2 rounded-r-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
'use client';
import { User } from "@supabase/supabase-js";
import { Navbar } from "../landing/Navbar";
import { useState } from "react";
import { createConversation } from "@/utils/supabase/queries";

interface Message {
  type: 'user' | 'bot' | 'error';
  content: string;
}

export default function ChatPage({ user }: { user: User }) {
  const [input, setInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);

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
      setMessages([{ type: 'bot', content: data.reply }]);
      setIsEmailChecked(true);
    } catch (error) {
      console.error('Error:', error);
      setMessages([{ type: 'error', content: 'Failed to check email security.' }]);
    } finally {
      setIsLoading(false);
      setEmailInput('');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: input }]);
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
      setMessages(prev => [...prev, { type: 'bot', content: data.reply }]);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'error', content: 'Failed to get response.' }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto p-4">
        {!isEmailChecked ? (
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
              {messages.map((message, index) => (
                <div key={index} className={`mb-2 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <span className={`inline-block p-2 rounded-lg ${
                    message.type === 'user' ? 'bg-blue-500 text-white' : 
                    message.type === 'bot' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
    </>
  );
}
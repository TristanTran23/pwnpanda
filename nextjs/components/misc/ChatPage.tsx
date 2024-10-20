'use client';

import { User } from "@supabase/supabase-js";
import { Navbar } from "../landing/Navbar";
import { useState, useEffect, useRef, useCallback } from "react";
import { createConversation, getConversations, updateConversation } from "@/utils/supabase/queries";
import { Convo } from "@/types/convo.types";
import { Json } from "@/types_db";
import { createClient } from '@/utils/supabase/client';

// shadcn component imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";

interface Message {
  type: 'user' | 'bot' | 'error';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatPage({ user }: { user: User }) {
  const [input, setInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [newMessageReceived, setNewMessageReceived] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchConversations();
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (newMessageReceived) {
      scrollToBottom();
      setNewMessageReceived(false);
    }
  }, [newMessageReceived, scrollToBottom]);

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
          messages: parseMessages(conv.content)
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
    setShowConversations(false);
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
      const newMessages: Message[] = [{ type: 'bot', content: data.reply }];
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
        messages: newMessages,
      };
      setConversations(prev => [createdConversation, ...prev]);
      setCurrentConversation(createdConversation);
      setNewMessageReceived(true);
    } catch (error) {
      console.error('Error:', error);
      setCurrentConversation({
        id: 'error',
        title: 'Error',
        messages: [{ type: 'error', content: 'Failed to check email security.' }],
      });
      setNewMessageReceived(true);
    } finally {
      setIsLoading(false);
      setEmailInput('');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation) return;
    setIsLoading(true);
    const updatedMessages: Message[] = [...currentConversation.messages, { type: 'user', content: input }];
    setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
    setNewMessageReceived(true);
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
      updatedMessages.push({ type: 'bot', content: data.reply });
      setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
      await updateConversation(supabase, currentConversation.id, JSON.stringify(updatedMessages));
      setNewMessageReceived(true);
    } catch (error) {
      console.error('Error:', error);
      updatedMessages.push({ type: 'error', content: 'Failed to get response.' });
      setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
      setNewMessageReceived(true);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setShowConversations(false);
  };

  const handleNewCheck = () => {
    setCurrentConversation(null);
    setShowConversations(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={user} />
      <div className="flex-grow overflow-hidden relative">
        {!showConversations && (
          <Button
          onClick={handleNewCheck}
          variant="outline"
          size="sm"
          className="absolute top-2 left-2 z-10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        )}
        <div className="max-w-4xl mx-auto h-full overflow-y-auto pb-20 px-2 sm:px-4">
          {showConversations ? (
            <Card className="mt-2">
              <CardHeader className="pb-2">
                <h2 className="text-lg font-bold">Email Security Check</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter an email address to check..."
                    disabled={isLoading}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Checking...' : 'Check Email'}
                  </Button>
                </form>
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-1">Previous Conversations</h3>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {conversations.map(conv => (
                      <Button
                        key={conv.id}
                        variant="ghost"
                        className="w-full justify-start py-1 px-2 text-sm"
                        onClick={() => handleConversationClick(conv)}
                      >
                        {conv.title}
                      </Button>
                    ))}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col mt-2">
              {currentConversation && (
                <CardContent className="flex-grow overflow-y-auto p-2">
                  <ScrollArea className="h-[calc(100vh-160px)] w-full pr-2">
                    {currentConversation.messages.map((message, index) => (
                      <div key={index} className={`mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded-lg max-w-[85%] break-words text-sm ${
                          message.type === 'user' ? 'bg-blue-500 text-white' : 
                          message.type === 'bot' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>
      {currentConversation && (
        <div className="fixed bottom-2 left-0 right-0 px-2">
          <Card className="shadow-lg">
            <CardContent className="p-2">
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-grow text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, CloseIcon, ChatIcon, TicketIcon } from './Icons';
import { supabase } from '../src/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { List, MessageSquareIcon, TicketCheckIcon, TicketPlusIcon } from 'lucide-react';

interface ChatbotProps {
  user: { name: string; email: string } | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'layrr' | 'system'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const systemInstruction = "You are Layrr, an AI assistant for a platform that helps users manage projects, templates, and feedback. Provide helpful and concise answers. Encourage users to create tickets for specific issues or support requests. Do not generate code or complex technical solutions unless explicitly asked.";

  const genAI = new GoogleGenerativeAI('AIzaSyAtvPNSL7eAHL8RISX4NEUA8ajEeOTavPA');
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: {
      role: "system",
      parts: [{ text: systemInstruction }]
    }
  });

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ from: 'layrr', text: 'Hi — I\'m Layrr. Ask me anything or create a ticket for support.' }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage = { from: 'user' as const, text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setIsTyping(true);
    try {
      const conversationalTurns = messages.filter(m => m.from !== 'system');
      let historyForGeminiChat = [];
      let currentRole: 'user' | 'model' | null = null;

      for (const msg of conversationalTurns) {
        const role = msg.from === 'user' ? 'user' : 'model';

        if (msg === userMessage) {
            break;
        }

        if (historyForGeminiChat.length === 0) {
          if (role === 'user') {
            historyForGeminiChat.push({ role, parts: [{ text: msg.text }] });
            currentRole = 'user';
          } else {
            continue;
          }
        } else {
          if (role !== currentRole) {
            historyForGeminiChat.push({ role, parts: [{ text: msg.text }] });
            currentRole = role;
          } else {
            console.warn('Gemini history: Consecutive messages from the same role detected. Skipping message:', msg);
            continue;
          }
        }
      }

      const chat = model.startChat({
        history: historyForGeminiChat,
        generationConfig: { maxOutputTokens: 500 },
      });
      const result = await chat.sendMessage(text);
      const response = await result.response;
      const geminiText = response.text();
      setIsTyping(false);
      setMessages(prev => [...prev, { from: 'layrr', text: geminiText || 'Sorry, I had trouble responding.' }]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { from: 'system', text: 'Error: Could not reach the assistant. Try again later.' }]);
      console.error('Layrr API error', err);
    } finally {
      setIsSending(false);
    }
  };

  const openTicket = async (subject: string, description: string) => {
    try {
      const userId = (supabase.auth as any)?.user?.id || null;
      const payload = {
        user_id: userId,
        user_email: user?.email || null,
        subject,
        description,
        status: 'open',
      };
      const { data, error } = await supabase.from('tickets').insert([payload]).select().maybeSingle();
      if (error) throw error;
      setMessages(prev => [...prev, { from: 'system', text: `Ticket created: ${subject}. Our team will follow up at ${user?.email || 'your email'}.` }]);
      setShowTicketForm(false);
    } catch (err) {
      console.error('Ticket insert failed', err);
      setMessages(prev => [...prev, { from: 'system', text: 'Could not create ticket. Please try again later.' }]);
    }
  };

  return (
    <div className="pointer-events-auto" data-testid="chatbot-component">
      <div className="relative">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none"
          aria-label="Open Layrr chat"
        >
          {isOpen ? <CloseIcon className="h-5 w-5" /> : <ChatIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className={`fixed right-6 bottom-24 w-80 max-h-[70vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden transform transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-6 opacity-0 pointer-events-none'} sm:w-96 max-sm:right-4 max-sm:bottom-20 max-sm:w-[calc(100vw-2rem)] max-sm:max-h-[60vh]`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">L</div>
            <div>
              <div className="font-semibold text-base">Layrr — AI Assistant</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowTicketForm(s => !s)} title="Create ticket">
              <TicketPlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showTicketForm ? (
          <div className="p-4">
            <TicketForm onSubmit={openTicket} onCancel={() => setShowTicketForm(false)} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div ref={messagesRef} className="px-3 py-2 overflow-auto flex-1 min-h-0 space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.from !== 'user' && (
                    <div className="mr-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-700">{m.from === 'layrr' ? 'L' : 'S'}</div>
                    </div>
                  )}
                  <div className={`inline-block px-2 py-1 rounded-lg text-xs leading-snug ${m.from === 'user' ? 'bg-primary-500 text-white' : m.from === 'layrr' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200' : 'bg-yellow-50 text-slate-800'}`}> 
                    {m.from === 'layrr' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown> : m.text}
                  </div>
                  {m.from === 'user' && (
                    <div className="ml-2">
                      <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="mr-2">
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">L</div>
                  </div>
                  <div className="inline-block px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-xs">
                    <span className="animate-pulse">typing</span>
                    <span className="ml-1">...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 z-10">
              <div className="flex items-center space-x-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none text-sm"
                  placeholder="Ask Layrr a question or start a conversation..."
                />
                <button onClick={() => sendMessage(input)} disabled={isSending} className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white">
                  <SendIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TicketForm: React.FC<{ onSubmit: (s: string, d: string) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(subject, description); }} className="space-y-3">
      <div>
        <label className="text-sm">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
      </div>
      <div>
        <label className="text-sm">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" rows={4} />
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border">Cancel</button>
        <button type="submit" className="px-3 py-2 rounded-lg bg-primary-500 text-white">Create Ticket</button>
      </div>
    </form>
  );
};

export default Chatbot;

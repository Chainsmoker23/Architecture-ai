import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAssistant } from '../services/geminiService';
import type { Content } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Archie. Ask me about ArchiGen AI or for a prompt idea!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const history: Content[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: userInput }] });

      const responseText = await chatWithAssistant(history);
      const newModelMessage: Message = { role: 'model', text: responseText };
      setMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'model', text: error instanceof Error ? error.message : "Something went wrong." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const PromptDisplay = ({ text }: { text: string }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = text.match(/```prompt\n([\s\S]*?)\n```/);
  
    if (!match) {
      return <p className="text-sm text-[#333] whitespace-pre-wrap">{text}</p>;
    }
  
    const promptText = match[1];
  
    const handleCopy = () => {
      navigator.clipboard.writeText(promptText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    };
  
    return (
      <div className="bg-[#FFF0F5] border border-[#F9D7E3] p-3 rounded-lg mt-2">
        <p className="text-sm font-mono text-[#555] whitespace-pre-wrap">{promptText}</p>
        <button
          onClick={handleCopy}
          className="mt-3 text-xs font-semibold bg-[#F9D7E3] text-[#A61E4D] px-3 py-1 rounded-full hover:bg-[#F06292] hover:text-white transition-all"
        >
          {isCopied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-br from-[#E91E63] to-[#F06292] text-white rounded-full p-4 shadow-xl"
          aria-label="Toggle AI Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></motion.svg>
            ) : (
              <motion.svg key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50"
          >
            <div className="p-4 bg-gradient-to-r from-[#FFF0F5] to-white border-b border-gray-200">
              <h3 className="font-bold text-lg text-[#333]">Archie Assistant</h3>
              <p className="text-xs text-[#555]">Powered by Gemini</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-xl px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-[#F9D7E3] text-[#A61E4D]' : 'bg-gray-100 text-[#333]'}`}>
                    {msg.role === 'model' ? <PromptDisplay text={msg.text} /> : <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="rounded-xl px-4 py-2 bg-gray-100 text-[#333] flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full p-3 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#F06292] text-white hover:bg-[#E91E63] disabled:opacity-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssistantWidget;
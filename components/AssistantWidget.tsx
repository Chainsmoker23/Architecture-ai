import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAssistant } from '../services/geminiService';
import type { Content } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Custom hook for typewriter effect
const useTypewriter = (text: string, enabled: boolean, onComplete: () => void) => {
    const [displayedText, setDisplayedText] = useState('');
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (enabled && text) {
            setDisplayedText('');
            let i = 0;
            const intervalId = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i >= text.length) {
                    clearInterval(intervalId);
                    if (onCompleteRef.current) {
                      onCompleteRef.current();
                    }
                }
            }, 30); // Typing speed

            return () => clearInterval(intervalId);
        } else {
            setDisplayedText(text);
        }
    }, [text, enabled]);

    return displayedText;
};

const QuantumCore: React.FC<{ isGlowing: boolean; size?: number }> = ({ isGlowing, size = 80 }) => {
  return (
    <div className="quantum-core-wrapper" style={{ '--size': `${size}px` } as React.CSSProperties}>
      <style>{`
        .quantum-core-wrapper {
          width: var(--size, 80px);
          height: var(--size, 80px);
          perspective: 800px;
          position: relative;
          flex-shrink: 0;
          transform-style: preserve-3d;
        }
        
        .quantum-core-nucleus-container {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0; left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transform-style: preserve-3d;
        }

        .quantum-core-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0; left: 0;
          transform-style: preserve-3d;
          animation: core-rotate 30s infinite linear;
        }

        @keyframes core-rotate {
          from { transform: rotateY(0deg) rotateX(10deg); }
          to   { transform: rotateY(360deg) rotateX(10deg); }
        }

        .quantum-core-nucleus {
          position: relative;
          width: 45%;
          height: 45%;
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, #fbcfe8 50%, #f472b6 100%);
          box-shadow: 0 0 5px #fff, 0 0 10px #fbcfe8, 0 0 20px #f472b6, inset 0 0 5px #fff;
          animation: nucleus-pulse 3s infinite ease-in-out;
        }

        @keyframes nucleus-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.15); filter: brightness(1.15); }
        }

        .quantum-core-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 4px solid rgba(50, 50, 50, 0.8);
          box-shadow: 0 0 8px rgba(244, 114, 182, 0.3), inset 0 0 8px rgba(244, 114, 182, 0.2);
          transform-style: preserve-3d;
        }
        
        .ring-1 { transform: rotateX(70deg) rotateY(0deg); }
        .ring-2 { transform: rotateX(70deg) rotateY(60deg); }
        .ring-3 { transform: rotateX(70deg) rotateY(120deg); }
        
        /* Glowing state */
        .quantum-core-container.glowing { animation-duration: 10s; }
        .quantum-core-nucleus.glowing { animation: nucleus-pulse-fast 1.2s infinite ease-in-out; }

        @keyframes nucleus-pulse-fast {
          0%, 100% { 
            transform: scale(1.2); 
            filter: brightness(1.2); 
            box-shadow: 0 0 8px #fff, 0 0 20px #fbcfe8, 0 0 30px #f472b6, inset 0 0 8px #fff; 
          }
          50% { 
            transform: scale(1.35); 
            filter: brightness(1.5); 
            box-shadow: 0 0 12px #fff, 0 0 30px #fbcfe8, 0 0 45px #f472b6, inset 0 0 12px #fff;
          }
        }
        
        .glowing .quantum-core-ring {
            border-color: rgba(244, 114, 182, 1);
            box-shadow: 0 0 10px #f472b6, 0 0 20px #f472b6, inset 0 0 10px rgba(244, 114, 182, 0.5);
        }
      `}</style>
      <div className="quantum-core-nucleus-container">
        <div className={`quantum-core-nucleus ${isGlowing ? 'glowing' : ''}`}></div>
      </div>
      <div className={`quantum-core-container ${isGlowing ? 'glowing' : ''}`}>
        <div className="quantum-core-ring ring-1"></div>
        <div className="quantum-core-ring ring-2"></div>
        <div className="quantum-core-ring ring-3"></div>
      </div>
    </div>
  );
};


const PromptDisplay: React.FC<{ text: string }> = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = text.match(/```prompt\n([\s\S]*?)\n```/);

  if (!match) {
    return <p className="text-sm text-inherit whitespace-pre-wrap">{text}</p>;
  }

  const promptText = match[1];
  const precedingText = text.substring(0, match.index);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div>
      {precedingText && <p className="text-sm text-inherit whitespace-pre-wrap">{precedingText}</p>}
      <div className="bg-[#FFF0F5]/80 border border-[#F9D7E3] p-3 rounded-lg mt-2">
        <p className="text-sm font-mono text-[#555] whitespace-pre-wrap">{promptText}</p>
        <button
          onClick={handleCopy}
          className="mt-3 text-xs font-semibold bg-[#F9D7E3] text-[#A61E4D] px-3 py-1 rounded-full hover:bg-[#F06292] hover:text-white transition-all"
        >
          {isCopied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>
    </div>
  );
};

const MessageContent: React.FC<{ message: Message, isTyping: boolean, onTypingComplete: () => void }> = ({ message, isTyping, onTypingComplete }) => {
    const typedText = useTypewriter(message.text, isTyping, onTypingComplete);
    
    if (message.role === 'model') {
        return <PromptDisplay text={typedText} />;
    }
    return <p className="text-sm whitespace-pre-wrap">{message.text}</p>;
};

const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Archie. Ask me for a prompt idea!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiActive, setIsAiActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  useEffect(() => { if (isAiActive) scrollToBottom(); }, [isAiActive]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiActive) return;

    const currentInput = userInput;
    const newUserMessage: Message = { role: 'user', text: currentInput };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsAiActive(true);

    try {
      const history: Content[] = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: currentInput }] });

      const responseText = await chatWithAssistant(history);
      const newModelMessage: Message = { role: 'model', text: responseText };
      setMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'model', text: error instanceof Error ? error.message : "Something went wrong." };
      setMessages(prev => [...prev, errorMessage]);
      setIsAiActive(false);
    }
  };
  
  const handleTypingComplete = useCallback(() => {
    setIsAiActive(false);
  }, []);

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
                xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></motion.svg>
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
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.25),_0_0_10px_rgba(236,72,153,0.2)] border border-pink-500/20 flex flex-col overflow-hidden z-50"
          >
            <div className="p-3 py-6 border-b border-pink-500/20 flex justify-center items-center relative bg-transparent">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,114,182,0.15)_0%,_transparent_70%)] -z-1" />
              <QuantumCore isGlowing={isAiActive} size={80} />
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => {
                  const isLastMessage = index === messages.length - 1;
                  const enableTyping = isLastMessage && msg.role === 'model' && isAiActive;
                  
                  return (
                    <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-xl px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-pink-100/80 text-[#A61E4D]' : 'bg-white/60 text-[#333] border border-gray-200/50'}`}>
                        <MessageContent
                          message={msg}
                          isTyping={enableTyping}
                          onTypingComplete={handleTypingComplete}
                        />
                      </div>
                    </div>
                  );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-pink-500/20 bg-white/50">
              <div className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full p-3 pr-12 bg-gray-100/80 border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition"
                  disabled={isAiActive}
                />
                <button type="submit" disabled={isAiActive} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#F06292] text-white hover:bg-[#E91E63] disabled:opacity-50 transition">
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
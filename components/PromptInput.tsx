
import React from 'react';
// FIX: Import AnimatePresence from framer-motion to enable enter/exit animations.
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onCyclePrompt: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading, onCyclePrompt }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      onGenerate();
    }
  };

  return (
    <div className="glass-panel p-2 rounded-2xl shadow-lg flex items-center gap-2">
      <button 
        onClick={onCyclePrompt} 
        disabled={isLoading}
        title="Try an example"
        className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
      >
        <ArchitectureIcon type={IconType.Sparkles} className="w-5 h-5" />
      </button>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your architecture..."
        className="flex-1 w-full bg-transparent text-[var(--color-text-primary)] focus:outline-none placeholder:text-[var(--color-text-secondary)]"
        disabled={isLoading}
      />
      <motion.button
        onClick={onGenerate}
        disabled={isLoading}
        className={`generate-button font-semibold py-2 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-soft)] ${isLoading ? 'generate-button--loading px-8' : ''}`}
        style={{
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.05)'
        }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating
          </motion.span>
        ) : (
          <motion.span 
            key="generate"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center"
          >
            Generate
          </motion.span>
        )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default PromptInput;

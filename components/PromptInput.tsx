import React from 'react';
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Generate on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3">
       <h3 className="font-semibold text-[var(--color-text-primary)]">Describe Your Architecture</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., A 3-tier web app on AWS with a load balancer, EC2 instances, and an RDS database..."
        className="w-full flex-1 p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200 resize-none shadow-inner placeholder:text-[var(--color-text-secondary)] text-base min-h-[150px]"
        disabled={isLoading}
        aria-label="Architecture Prompt Input"
      />
      <div className="flex items-center justify-between">
        <button
          onClick={onCyclePrompt}
          disabled={isLoading}
          title="Try an example prompt (Inspire Me)"
          className="flex items-center gap-2 text-sm font-medium p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
        >
          <ArchitectureIcon type={IconType.Brain} className="w-5 h-5" />
          Inspire Me
        </button>
        <motion.button
          onClick={onGenerate}
          disabled={isLoading}
          className={`generate-button font-semibold py-2 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-soft)] ${isLoading ? 'generate-button--loading px-8' : ''}`}
          style={{ boxShadow: '0 4px 14px 0 rgba(0,0,0,0.05)' }}
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
                <Logo className="w-5 h-5 mr-2 logo-pulse-gentle" />
                Generate
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};

export default PromptInput;
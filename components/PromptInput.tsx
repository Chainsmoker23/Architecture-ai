import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col h-full">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A 3-tier web application on AWS with a load balancer, EC2 instances, and an RDS database."
        className="flex-1 w-full p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200 resize-none min-h-[150px] shadow-inner"
        disabled={isLoading}
      />
      <motion.button
        onClick={onGenerate}
        disabled={isLoading}
        className={`mt-4 w-full generate-button font-semibold py-3 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-soft)] ${isLoading ? 'generate-button--loading' : ''}`}
        style={{
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.05)'
        }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <Logo className="w-5 h-5 mr-2 logo-pulse-gentle" />
            Generate Diagram
          </>
        )}
      </motion.button>
    </div>
  );
};

export default PromptInput;
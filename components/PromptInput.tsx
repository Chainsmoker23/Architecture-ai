import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EXAMPLE_PROMPTS_LIST } from '../constants';
import { IconType } from '../types';
import ArchitectureIcon from './ArchitectureIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  const [promptIndex, setPromptIndex] = useState(0);

  const handleCyclePrompt = () => {
    const nextIndex = (promptIndex + 1) % EXAMPLE_PROMPTS_LIST.length;
    setPromptIndex(nextIndex);
    setPrompt(EXAMPLE_PROMPTS_LIST[nextIndex]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Describe Your Architecture</h2>
        <motion.button 
          title="Get a prompt idea"
          onClick={handleCyclePrompt}
          className="p-2 rounded-full text-[var(--color-accent-text)] hover:bg-[var(--color-accent-soft)] transition-colors"
          animate={{ scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h.01a1 1 0 100-2H11zM10 14a1 1 0 01.832.445l.5 1.5a.5.5 0 01-.866.5L10 15.586l-.466.909a.5.5 0 01-.866-.5l.5-1.5A1 1 0 0110 14zm-3 0a1 1 0 01.832.445l.5 1.5a.5.5 0 01-.866.5L7 15.586l-.466.909a.5.5 0 01-.866-.5l.5-1.5A1 1 0 017 14z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.032 10.968a5.976 5.976 0 011.66-3.235 5.97 5.97 0 014.242-1.732 5.97 5.97 0 014.243 1.732 5.976 5.976 0 011.66 3.235A6.03 6.03 0 0116 11.732V13a1 1 0 11-2 0v-1.268a4.018 4.018 0 00-1.032-2.734 4.01 4.01 0 00-2.828-1.032 4.01 4.01 0 00-2.828 1.032A4.018 4.018 0 006 11.732V13a1 1 0 11-2 0v-1.268a6.03 6.03 0 01.032-.764z" clipRule="evenodd" /></svg>
        </motion.button>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A 3-tier web application on AWS with a load balancer, EC2 instances, and an RDS database."
        className="flex-1 w-full p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200 resize-none min-h-[200px] shadow-inner"
        disabled={isLoading}
      />
      <motion.button
        onClick={onGenerate}
        disabled={isLoading}
        className="mt-4 w-full bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-accent)] text-[var(--color-accent-text-strong)] font-semibold py-3 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-soft)]"
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
            <ArchitectureIcon type={IconType.Sparkles} className="w-5 h-5 mr-2" />
            Generate Diagram
          </>
        )}
      </motion.button>
    </div>
  );
};

export default PromptInput;

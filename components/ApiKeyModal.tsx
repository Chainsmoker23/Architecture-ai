import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiKeyModalProps {
  onClose: () => void;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-[var(--color-panel-bg)] rounded-2xl shadow-xl w-full max-w-lg flex flex-col border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
            <h2 className="text-2xl font-bold">API Key Required</h2>
            <button
              onClick={onClose}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[var(--color-text-secondary)]">
              Looks like the shared API key has reached its usage limit for the day. To continue generating diagrams, please provide your own Google Gemini API key.
            </p>
            <div>
              <label htmlFor="api-key-modal-input" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Your Google Gemini API Key
              </label>
              <input
                id="api-key-modal-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your key here"
                className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
              />
              <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-accent-text)] hover:underline mt-2 inline-block">
                Don't have a key? Get one from Google AI Studio &rarr;
              </a>
            </div>
          </div>
           <div className="p-6 bg-[var(--color-bg-input)] border-t border-[var(--color-border)] flex justify-end items-center gap-3 rounded-b-2xl">
                <button onClick={onClose} className="px-4 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={!apiKey.trim()}
                    className="px-4 py-2 bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-text-strong)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save & Retry
                </button>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApiKeyModal;

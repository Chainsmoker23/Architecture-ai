
import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

interface InstallPromptToastProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPromptToast: React.FC<InstallPromptToastProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none md:bottom-6 md:right-6 md:left-auto">
      <motion.div
        layout
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pointer-events-auto bg-[var(--color-panel-bg)] rounded-2xl shadow-2xl border border-[var(--color-border)] p-4 w-full max-w-md flex items-center gap-4"
      >
        <div className="flex-shrink-0 p-3 bg-[var(--color-bg-input)] rounded-full border border-[var(--color-border)]">
          <Logo className="w-8 h-8 text-[#D6336C]" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-md text-[var(--color-text-primary)]">Install CubeGen AI</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">Add it to your home screen for quick and easy access.</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
            <button
                onClick={onInstall}
                className="px-4 py-2 bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-text-strong)] rounded-lg hover:opacity-90 transition-opacity"
            >
                Install
            </button>
             <button
                onClick={onDismiss}
                className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg-hover)] rounded-full transition-colors"
                aria-label="Dismiss install prompt"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InstallPromptToast;

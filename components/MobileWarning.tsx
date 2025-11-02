import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileWarningProps {
  onDismiss: () => void;
}

const MobileWarning: React.FC<MobileWarningProps> = ({ onDismiss }) => {
  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center p-4 md:hidden"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="bg-[var(--color-panel-bg)] w-full max-w-sm rounded-2xl shadow-xl border border-[var(--color-border)] p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-input)] border border-[var(--color-border)]">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
          Better on Desktop
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          For the best editing experience with all tools and features, we recommend using a larger screen.
        </p>
        <button
          onClick={onDismiss}
          className="mt-6 w-full bg-[var(--color-accent)] text-[var(--color-accent-text-strong)] font-semibold py-2.5 px-4 rounded-xl transition-opacity hover:opacity-90"
        >
          Continue Anyway
        </button>
      </motion.div>
    </div>
  );
};

export default MobileWarning;
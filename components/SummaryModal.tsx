
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SummaryModalProps {
  summary: string;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ summary, onClose }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };
  
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-[var(--color-accent-text)] mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-[var(--color-text-primary)] mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-[var(--color-text-primary)] mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-6">$1</li>')
      .replace(/^\* (.*$)/gim, '<ul><li class="list-disc ml-6">$1</li></ul>')
      .replace(/\n/g, '<br />');
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
          className="bg-[var(--color-panel-bg)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-[var(--color-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
            <h2 className="text-2xl font-bold">Architecture Explanation</h2>
            <button
              onClick={onClose}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto prose prose-sm max-w-none text-[var(--color-text-secondary)]">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(summary) }} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2000); // Shorter duration for quick actions

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="bg-[var(--color-panel-bg)] text-[var(--color-text-primary)] text-sm font-medium px-4 py-2 rounded-full shadow-lg border border-[var(--color-border)]">
        {message}
      </div>
    </motion.div>
  );
};

export default Toast;
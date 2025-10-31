

import React from 'react';
import { motion } from 'framer-motion';

interface ContextualActionBarProps {
    position: { x: number; y: number };
    onDelete: () => void;
    onDuplicate: () => void;
    selectedCount: number;
}

const ActionButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
    <button
        title={title}
        onClick={onClick}
        className="p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] transition-colors"
    >
        {children}
    </button>
);

const ContextualActionBar: React.FC<ContextualActionBarProps> = ({ position, onDelete, onDuplicate, selectedCount }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-10 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-lg flex items-center p-1 space-x-1"
            style={{ 
                top: position.y, 
                left: position.x,
                transform: 'translateX(-50%)', // Center the bar
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing selection
        >
            <ActionButton title="Duplicate" onClick={onDuplicate}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </ActionButton>

            <ActionButton title="Delete" onClick={onDelete}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </ActionButton>
        </motion.div>
    );
};

export default ContextualActionBar;

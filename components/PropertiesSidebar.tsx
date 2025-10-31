

import React, { useState, useEffect } from 'react';
import { Node, Container } from '../types';
import { motion } from 'framer-motion';

type Item = Node | Container;

interface PropertiesSidebarProps {
  item: Item | null;
  onPropertyChange: (itemId: string, newProps: Partial<Item>) => void;
  selectedCount: number;
// @-fix 11
  onNudge?: (itemId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
}

const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({ item, onPropertyChange, selectedCount, onNudge }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      setLabel(item.label);
      setDescription(item.description || '');
    }
  }, [item]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleBlur = () => {
    if (item && (item.label !== label || item.description !== description)) {
      onPropertyChange(item.id, { label, description });
    }
  };
  
  const NudgeControl = () => {
// @-fix 47
      if (!item || !('x' in item) || !onNudge) return null; // Only show for Nodes

      const NudgeButton = ({ dir }: { dir: 'up' | 'down' | 'left' | 'right' }) => {
        const icons = {
            up: <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />,
            down: <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />,
            left: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />,
            right: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />,
        };
        return (
            <button
                onClick={() => onNudge(item.id, dir)}
                className="bg-[var(--color-bg-input)] hover:bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] rounded-lg p-2 transition-colors"
                aria-label={`Nudge ${dir}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 {icons[dir]}
               </svg>
            </button>
        );
      }
      
      return (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Position</label>
            <div className="grid grid-cols-3 gap-1 w-32 mx-auto">
                <div></div> <NudgeButton dir="up" /> <div></div>
                <NudgeButton dir="left" /> <div></div> <NudgeButton dir="right" />
                <div></div> <NudgeButton dir="down" /> <div></div>
            </div>
        </div>
      );
  }


  if (selectedCount > 1) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center text-[var(--color-text-secondary)] p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
            <h3 className="mt-2 font-semibold text-[var(--color-text-primary)]">{selectedCount} items selected</h3>
            <p className="text-sm">Edit properties by selecting a single item, or use the contextual action bar for group actions.</p>
        </div>
    );
  }

  if (!item) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center text-[var(--color-text-secondary)] p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <h3 className="mt-2 font-semibold text-[var(--color-text-primary)]">Properties</h3>
            <p className="text-sm">Select an item on the canvas to view and edit its properties.</p>
        </div>
    );
  }

  return (
    <motion.div 
      key={item.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full"
    >
      <h2 className="text-xl font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <div>
            <label htmlFor="label" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Label</label>
            <input
                id="label"
                type="text"
                value={label}
                onChange={handleLabelChange}
                onBlur={handleBlur}
                className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
            <textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                onBlur={handleBlur}
                rows={4}
                className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] resize-none"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
            <p className="p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm capitalize">{item.type}</p>
        </div>
        <NudgeControl />
      </div>
    </motion.div>
  );
};

export default PropertiesSidebar;
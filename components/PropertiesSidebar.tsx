import React, { useState, useEffect } from 'react';
import { ArchNode, Container, Link } from '../types';
import { motion } from 'framer-motion';

type Item = ArchNode | Container | Link;

interface PropertiesSidebarProps {
  item: Item | null;
  onPropertyChange: (itemId: string, newProps: Partial<Item>) => void;
  selectedCount: number;
}

const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({ item, onPropertyChange, selectedCount }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [linkStyle, setLinkStyle] = useState<'solid' | 'dotted' | 'dashed' | 'double'>('solid');
  const [linkThickness, setLinkThickness] = useState<'thin' | 'medium' | 'thick'>('medium');
  const [nodeShape, setNodeShape] = useState<'rectangle' | 'ellipse' | 'diamond'>('rectangle');

  useEffect(() => {
    if (item) {
      if ('label' in item) {
        setLabel(item.label || '');
      }
      if ('description' in item) {
        setDescription(item.description || '');
      }
      if ('color' in item && item.color) {
        setColor(item.color);
      } else {
        if ('source' in item) setColor('#9ca3af');
        else setColor('#FFFFFF');
      }
      if ('style' in item && item.style) {
        setLinkStyle(item.style);
      }
      if ('thickness' in item && item.thickness) {
        setLinkThickness(item.thickness);
      }
      if ('shape' in item && item.shape) {
        setNodeShape(item.shape);
      } else if('type' in item) {
        setNodeShape('rectangle');
      }
    }
  }, [item]);
  
  const handlePropertyUpdate = (props: Partial<Item>) => {
    if (item) {
      onPropertyChange(item.id, props);
    }
  };

  const handleBlur = () => {
    if (item && 'label' in item && item.label !== label) {
       handlePropertyUpdate({ label });
    }
     if (item && 'description' in item && item.description !== description) {
       handlePropertyUpdate({ description });
    }
  };
  
  if (selectedCount > 1) {
    return (
        <div className="glass-panel rounded-2xl flex flex-col h-full items-center justify-center text-center text-[var(--color-text-secondary)] p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
            <h3 className="mt-2 font-semibold text-[var(--color-text-primary)]">{selectedCount} items selected</h3>
            <p className="text-sm">Edit properties by selecting a single item.</p>
        </div>
    );
  }

  if (!item) {
    return (
        <div className="glass-panel rounded-2xl flex flex-col h-full items-center justify-center text-center text-[var(--color-text-secondary)] p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <h3 className="mt-2 font-semibold text-[var(--color-text-primary)]">Properties</h3>
            <p className="text-sm">Select an item on the canvas to view and edit its properties.</p>
        </div>
    );
  }

  const isLink = 'source' in item;
  const isNode = 'type' in item && !('childNodeIds' in item);

  return (
    <motion.div 
      key={item.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full glass-panel p-6 rounded-2xl overflow-y-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Properties</h2>
      <div className="space-y-4">
        <div>
            <label htmlFor="label" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Label</label>
            <input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
        </div>
        {!isLink && (
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleBlur}
                    rows={4}
                    className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] resize-none"
                />
            </div>
        )}
        {isNode && (
          <div>
              <label htmlFor="nodeShape" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Shape</label>
              <select 
                  id="nodeShape"
                  value={nodeShape}
                  onChange={(e) => {
                      const newShape = e.target.value as typeof nodeShape;
                      setNodeShape(newShape);
                      handlePropertyUpdate({ shape: newShape });
                  }}
                  className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
              >
                  <option value="rectangle">Rectangle</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="diamond">Diamond</option>
              </select>
          </div>
        )}
        {!isLink && (
            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
                <p className="p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm capitalize">{item.type}</p>
            </div>
        )}

        <div>
            <label htmlFor="color" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">{isLink ? 'Link Color' : 'Fill Color'}</label>
            <div className="relative">
                <input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => {
                        setColor(e.target.value);
                        handlePropertyUpdate({ color: e.target.value });
                    }}
                    className="w-full p-1 h-10 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl cursor-pointer"
                />
            </div>
        </div>

        {isLink && (
          <>
            <div>
                <label htmlFor="linkStyle" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Link Style</label>
                <select 
                    id="linkStyle"
                    value={linkStyle}
                    onChange={(e) => {
                        const newStyle = e.target.value as typeof linkStyle;
                        setLinkStyle(newStyle);
                        handlePropertyUpdate({ style: newStyle });
                    }}
                    className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                >
                    <option value="solid">Solid</option>
                    <option value="dotted">Dotted</option>
                    <option value="dashed">Dashed</option>
                    <option value="double">Double</option>
                </select>
            </div>
            <div>
                <label htmlFor="linkThickness" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Thickness</label>
                <select 
                    id="linkThickness"
                    value={linkThickness}
                    onChange={(e) => {
                        const newThickness = e.target.value as typeof linkThickness;
                        setLinkThickness(newThickness);
                        handlePropertyUpdate({ thickness: newThickness });
                    }}
                    className="w-full p-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                >
                    <option value="thin">Thin</option>
                    <option value="medium">Medium</option>
                    <option value="thick">Thick</option>
                </select>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PropertiesSidebar;
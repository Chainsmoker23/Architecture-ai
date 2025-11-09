import React from 'react';
import { IconType } from '../types';
import { ICONS } from './content/iconConstants';
import { motion } from 'framer-motion';

interface ArchitectureIconProps {
  type: string;
  className?: string;
}

const ArchitectureIcon: React.FC<ArchitectureIconProps> = ({ type, className = 'w-6 h-6' }) => {
  const normalizedType = type.toLowerCase().replace(/[\s_]/g, '-') as IconType;
  
  // Directly get the icon from the local constants.
  // This is fast and removes all network requests, significantly improving performance.
  const displayIcon = ICONS[normalizedType] || ICONS[IconType.Generic];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor" // Set top-level fill
    >
      {/* 
        The motion.g wrapper is kept for a consistent pop-in animation,
        but it's simplified as we no longer switch between different icon sources.
      */}
      <motion.g
        key={normalizedType} // Keying by type can still give a nice re-render animation if the type changes.
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {displayIcon}
      </motion.g>
    </svg>
  );
};

export default ArchitectureIcon;
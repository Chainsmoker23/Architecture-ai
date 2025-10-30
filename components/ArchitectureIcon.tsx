
import React from 'react';
import { IconType } from '../types';
import { ICONS } from '../constants';

interface ArchitectureIconProps {
  type: string;
  className?: string;
}

const ArchitectureIcon: React.FC<ArchitectureIconProps> = ({ type, className = 'w-6 h-6' }) => {
  const normalizedType = type.toLowerCase().replace(/[\s_]/g, '-') as IconType;
  const icon = ICONS[normalizedType] || ICONS[IconType.Generic];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      {icon}
    </svg>
  );
};

export default ArchitectureIcon;

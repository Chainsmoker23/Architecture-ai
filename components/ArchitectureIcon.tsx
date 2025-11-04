import React, { useState, useEffect, useCallback } from 'react';
import { IconType } from '../types';
import { ICONS } from './constants';
import { motion } from 'framer-motion';

interface ArchitectureIconProps {
  type: string;
  className?: string;
}

// In-memory cache for the session
const iconCache = new Map<string, React.ReactNode>();

const ArchitectureIcon: React.FC<ArchitectureIconProps> = ({ type, className = 'w-6 h-6' }) => {
  const normalizedType = type.toLowerCase().replace(/[\s_]/g, '-') as IconType;
  
  const getInitialIcon = useCallback(() => {
    return iconCache.get(normalizedType) || ICONS[normalizedType] || ICONS[IconType.Generic];
  }, [normalizedType]);

  const [displayIcon, setDisplayIcon] = useState(getInitialIcon);
  const [isFetched, setIsFetched] = useState(
    iconCache.has(normalizedType) && iconCache.get(normalizedType) !== ICONS[normalizedType]
  );

  useEffect(() => {
    // If we've already fetched this icon, don't fetch again.
    if (isFetched) {
      return;
    }

    let isCancelled = false;

    const fetchIcon = async () => {
      try {
        // Clean up query for better search results, e.g., 'aws-ec2' -> 'ec2'
        const query = normalizedType
            .replace(/^(aws|gcp|azure)-/, '')
            .replace('-js', ' js');

        // --- Step 1: Search for an icon with Iconify ---
        const searchResponse = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=1`);
        if (!searchResponse.ok) {
            throw new Error(`Iconify search API error: ${searchResponse.status}`);
        }
        const searchData = await searchResponse.json();
        
        const iconName = searchData.icons?.[0];
        if (!iconName) {
            // console.warn(`[Iconify] No icons found for term: "${query}"`);
            return;
        }
        
        const iconSet = searchData.collections?.[Object.keys(searchData.collections)[0]]?.name || 'Material Design Icons';

        // --- Step 2: Fetch the SVG content ---
        const svgResponse = await fetch(`https://api.iconify.design/${iconName}.svg`);
         if (!svgResponse.ok) {
            throw new Error(`Failed to fetch SVG content for ${iconName}: ${svgResponse.statusText}`);
        }
        const svgText = await svgResponse.text();
        
        // Extract inner content from the full SVG document
        const svgContentMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
        const innerSvg = svgContentMatch ? svgContentMatch[1] : '';

        if (innerSvg) {
          // The fill="currentColor" is often missing, so we add it to a wrapper group
          const newIcon = <g fill="currentColor" dangerouslySetInnerHTML={{ __html: innerSvg }} />;
          iconCache.set(normalizedType, newIcon);
          if (!isCancelled) {
            setDisplayIcon(newIcon);
            setIsFetched(true);
          }
        }
      } catch (error) {
        // Silently fail to avoid cluttering the console
        // console.error(`Error fetching icon for ${normalizedType}:`, error);
      }
    };

    // Don't fetch for generic icons that don't need a specific visual
    if (![IconType.Generic, IconType.GroupLabel, IconType.LayerLabel, IconType.Neuron].includes(normalizedType)) {
        fetchIcon();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [normalizedType, isFetched]);
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor" // Set top-level fill
    >
      <motion.g
        key={isFetched ? 'fetched' : 'fallback'}
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
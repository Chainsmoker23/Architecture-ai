

import React from 'react';

interface ToolbarProps {
  onExport: (format: 'svg' | 'png' | 'json') => void;
  onExplain: () => void;
  isExplaining: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFitToScreen: () => void;
  onGoToPlayground: () => void;
  canGoToPlayground: boolean;
}

const ToolbarButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {children: React.ReactNode}> = ({ children, ...props }) => (
    <button
        {...props}
        className="p-2 bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ onExport, onExplain, isExplaining, onUndo, onRedo, canUndo, canRedo, onFitToScreen, onGoToPlayground, canGoToPlayground }) => {
  
  return (
    <div className="flex items-center space-x-2">
      <ToolbarButton onClick={onGoToPlayground} disabled={!canGoToPlayground} aria-label="Enter Playground Mode">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
      </ToolbarButton>
      <ToolbarButton onClick={onUndo} disabled={!canUndo} aria-label="Undo">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
      </ToolbarButton>
      <ToolbarButton onClick={onRedo} disabled={!canRedo} aria-label="Redo">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </ToolbarButton>
      <ToolbarButton onClick={onFitToScreen} aria-label="Fit to Screen">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
      </ToolbarButton>

      <div className="w-px h-6 bg-[var(--color-border)] mx-1"></div>

      <button 
        onClick={onExplain}
        disabled={isExplaining}
        className="px-3 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center disabled:opacity-50"
      >
        {isExplaining ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )}
        Explain
      </button>

      <div className="relative group">
        <button className="px-3 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
        </button>
        <div className="absolute right-0 mt-2 w-32 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 invisible group-hover:visible p-1">
            <a onClick={() => onExport('png')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">PNG</a>
            <a onClick={() => onExport('svg')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">SVG</a>
            <a onClick={() => onExport('json')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">JSON</a>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
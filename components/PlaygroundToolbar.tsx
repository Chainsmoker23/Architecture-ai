import React, { useState, useRef, useEffect } from 'react';
import { InteractionMode } from './DiagramCanvas';

interface PlaygroundToolbarProps {
    interactionMode: InteractionMode;
    onSetInteractionMode: (mode: InteractionMode) => void;
    onAddContainer: () => void;
    onFitToScreen: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onExplain: () => void;
    isExplaining: boolean;
    onExport: (format: 'png' | 'html' | 'json') => void;
}

const ToolButton: React.FC<{ 'aria-label': string; onClick?: () => void; isActive?: boolean; isDisabled?: boolean; children: React.ReactNode; className?: string }> =
 ({ 'aria-label': ariaLabel, title, onClick, isActive = false, isDisabled = false, children, className }) => (
    <button
        aria-label={ariaLabel}
        title={title}
        onClick={onClick}
        disabled={isDisabled}
        className={`flex items-center justify-center rounded-xl transition-colors
            ${isActive ? 'bg-[var(--color-accent)] text-[var(--color-accent-text-strong)]' : 'bg-transparent md:bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg-hover)]'}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
        `}
    >
        {children}
    </button>
);

const PlaygroundToolbar: React.FC<PlaygroundToolbarProps> = (props) => {
    const { interactionMode, onSetInteractionMode, onAddContainer, onFitToScreen } = props;
    const { onUndo, onRedo, canUndo, canRedo, onExplain, isExplaining, onExport } = props;

    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
            setIsMoreMenuOpen(false);
          }
           if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

     const handleExportClick = (format: 'png' | 'html' | 'json') => {
        onExport(format);
        setIsExportMenuOpen(false);
        setIsMoreMenuOpen(false);
    };

    const mobileMenu = (
        <div className="relative" ref={moreMenuRef}>
            <ToolButton aria-label="More" title="More" onClick={() => setIsMoreMenuOpen(p => !p)} className="w-14 h-14 md:w-12 md:h-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </ToolButton>
            {isMoreMenuOpen && (
                 <div className="absolute bottom-full mb-2 right-0 w-40 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-lg p-1 z-30">
                    <a onClick={() => { onFitToScreen(); setIsMoreMenuOpen(false); }} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">Fit to Screen</a>
                    <div className="h-px bg-[var(--color-border)] my-1" />
                    <a onClick={() => handleExportClick('png')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">Export PNG</a>
                    <a onClick={() => handleExportClick('html')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">Export HTML</a>
                    <a onClick={() => handleExportClick('json')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">Export JSON</a>
                    <div className="h-px bg-[var(--color-border)] my-1" />
                    <a onClick={() => { onExplain(); setIsMoreMenuOpen(false); }} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">Explain</a>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="
            fixed bottom-0 left-0 right-0 z-20 
            md:relative md:h-full md:w-auto md:flex-col md:border-r md:p-3 md:space-y-3
            bg-[var(--color-panel-bg)] border-t border-[var(--color-border)] 
            flex justify-around items-center
        ">
            {/* --- Primary Tools --- */}
            <ToolButton aria-label="Select (V)" title="Select (V)" onClick={() => onSetInteractionMode('select')} isActive={interactionMode === 'select'} className="w-14 h-14 md:w-12 md:h-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            </ToolButton>

            <ToolButton aria-label="Add Node (N)" title="Add Node (N)" onClick={() => onSetInteractionMode('addNode')} isActive={interactionMode === 'addNode'} className="w-14 h-14 md:w-12 md:h-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </ToolButton>

             <ToolButton aria-label="Add Container (B)" title="Add Container (B)" onClick={onAddContainer} className="w-14 h-14 md:w-12 md:h-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                </svg>
            </ToolButton>
            
            <div className="flex-grow hidden md:block" />
            
            {/* --- Secondary Tools (Desktop) --- */}
            <div className="hidden md:flex flex-col items-center space-y-3">
                <ToolButton aria-label="Undo (Cmd+Z)" title="Undo (Cmd+Z)" onClick={onUndo} isDisabled={!canUndo} className="w-12 h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                </ToolButton>
                <ToolButton aria-label="Redo (Cmd+Shift+Z)" title="Redo (Cmd+Shift+Z)" onClick={onRedo} isDisabled={!canRedo} className="w-12 h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </ToolButton>
                <div className="w-10/12 h-px bg-[var(--color-border)] my-1" />
                <ToolButton aria-label="Fit to Screen (F)" title="Fit to Screen (F)" onClick={onFitToScreen} className="w-12 h-12">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </ToolButton>
                <div className="relative" ref={exportMenuRef}>
                    <ToolButton aria-label="Export" title="Export" onClick={() => setIsExportMenuOpen(prev => !prev)} className="w-12 h-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </ToolButton>
                     {isExportMenuOpen && (
                        <div className="absolute left-full ml-2 top-0 w-32 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-lg p-1 z-20">
                            <a onClick={() => handleExportClick('png')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">PNG</a>
                            <a onClick={() => handleExportClick('html')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">HTML</a>
                            <a onClick={() => handleExportClick('json')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">JSON</a>
                        </div>
                    )}
                </div>
                <ToolButton aria-label="Explain Architecture" title="Explain Architecture" onClick={onExplain} isDisabled={isExplaining} className="w-12 h-12">
                    {isExplaining ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </ToolButton>
            </div>
            
            <div className="md:hidden">
                {mobileMenu}
            </div>

        </div>
    );
};

export default PlaygroundToolbar;
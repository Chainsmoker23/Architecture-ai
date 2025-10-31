
import React from 'react';
import { InteractionMode } from './DiagramCanvas';

interface PlaygroundToolbarProps {
    interactionMode: InteractionMode;
    onSetInteractionMode: (mode: InteractionMode) => void;
    onDeleteSelected: () => void;
    isPropertiesPanelOpen: boolean;
    onToggleProperties: () => void;
    onFitToScreen: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onExplain: () => void;
    isExplaining: boolean;
    onExport: (format: 'svg' | 'png' | 'json') => void;
}

const ToolButton: React.FC<{ title: string; onClick?: () => void; isActive?: boolean; isDisabled?: boolean; children: React.ReactNode }> =
 ({ title, onClick, isActive = false, isDisabled = false, children }) => (
    <button
        title={title}
        onClick={onClick}
        disabled={isDisabled}
        className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors
            ${isActive ? 'bg-[var(--color-accent)] text-[var(--color-accent-text-strong)]' : 'bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg-hover)]'}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        {children}
    </button>
);

const PlaygroundToolbar: React.FC<PlaygroundToolbarProps> = (props) => {
    const { interactionMode, onSetInteractionMode, onDeleteSelected, isPropertiesPanelOpen, onToggleProperties, onFitToScreen } = props;
    const { onUndo, onRedo, canUndo, canRedo, onExplain, isExplaining, onExport } = props;
    
    return (
        <aside className="h-full bg-[var(--color-panel-bg)] p-3 border-r border-[var(--color-border)] flex flex-col items-center space-y-3 z-10">
            <ToolButton title="Select (V)" onClick={() => onSetInteractionMode('select')} isActive={interactionMode === 'select'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
            </ToolButton>
            <ToolButton title="Add Node (N)" onClick={() => onSetInteractionMode('addNode')} isActive={interactionMode === 'addNode'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </ToolButton>
             <ToolButton title="Connect (L)" onClick={() => onSetInteractionMode('connect')} isActive={interactionMode === 'connect'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 9a3 3 0 100-6 3 3 0 000 6zM16 11a6 6 0 016 6h-2a4 4 0 00-4-4h-1a3 3 0 01-3-3 3.001 3.001 0 01.396-1.551A5.02 5.02 0 0116 11z" /></svg>
            </ToolButton>
            <ToolButton title="Delete (Backspace)" onClick={onDeleteSelected}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </ToolButton>
            <div className="flex-grow" />
            <ToolButton title="Undo (Cmd+Z)" onClick={onUndo} isDisabled={!canUndo}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
            </ToolButton>
            <ToolButton title="Redo (Cmd+Shift+Z)" onClick={onRedo} isDisabled={!canRedo}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </ToolButton>
            <div className="w-10/12 h-px bg-[var(--color-border)] my-1" />
            <ToolButton title="Fit to Screen (F)" onClick={onFitToScreen}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10a.01.01 0 01.01-.01H10a.01.01 0 010 .01z" /></svg>
            </ToolButton>
            <div className="relative group">
                <ToolButton title="Export">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </ToolButton>
                 <div className="absolute left-full ml-2 top-0 w-32 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible p-1">
                    <a onClick={() => onExport('png')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">PNG</a>
                    <a onClick={() => onExport('svg')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">SVG</a>
                    <a onClick={() => onExport('json')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">JSON</a>
                </div>
            </div>
            <ToolButton title="Explain Architecture" onClick={onExplain} isDisabled={isExplaining}>
                {isExplaining ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            </ToolButton>
            <div className="w-10/12 h-px bg-[var(--color-border)] my-1" />
            <ToolButton title={isPropertiesPanelOpen ? "Hide Properties" : "Show Properties"} onClick={onToggleProperties} isActive={isPropertiesPanelOpen}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </ToolButton>
        </aside>
    );
};

export default PlaygroundToolbar;

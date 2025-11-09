

import React, { useState, useMemo } from 'react';
import { ICONS } from './content/iconConstants';
import { IconType } from '../types';
import ArchitectureIcon from './ArchitectureIcon';

interface AddNodePanelProps {
    onSelectNodeType: (type: IconType) => void;
    onClose: () => void;
}

const AddNodePanel: React.FC<AddNodePanelProps> = ({ onSelectNodeType, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIcons = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return Object.keys(ICONS).filter(key => key.includes(term));
    }, [searchTerm]);

    return (
        <div className="h-full md:h-full w-screen max-w-[320px] md:w-80 bg-[var(--color-panel-bg)] md:border-r md:border-[var(--color-border)] p-4 flex flex-col rounded-t-2xl md:rounded-none">
            <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-4 md:hidden" />
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Add Node</h2>
                 <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--color-button-bg-hover)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            <input
                type="text"
                placeholder="Search components..."
                aria-label="Search components"
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
            />
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-2">
                    {filteredIcons.map(iconKey => (
                        <button
                            key={iconKey}
                            onClick={() => onSelectNodeType(iconKey as IconType)}
                            title={iconKey}
                            className="p-3 flex flex-col items-center justify-center space-y-2 bg-[var(--color-button-bg)] rounded-xl hover:bg-[var(--color-button-bg-hover)] transition-colors"
                        >
                            <ArchitectureIcon type={iconKey} className="w-8 h-8" />
                            <span className="text-xs text-center text-[var(--color-text-secondary)] truncate w-full">
                                {iconKey.replace('aws-', '').replace('gcp-', '').replace('azure-', '').replace(/-/g, ' ')}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddNodePanel;
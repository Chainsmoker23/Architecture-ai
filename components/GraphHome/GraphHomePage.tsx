import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from '../../types';
import ArchitectureIcon from '../ArchitectureIcon';
import SettingsSidebar from '../SettingsSidebar';
import { CHART_PREVIEWS } from '../content/iconConstants';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'sdk' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research' | 'graph';

interface GraphHomePageProps {
  onNavigate: (page: Page | string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export const GraphHomePage: React.FC<GraphHomePageProps> = ({ onNavigate }) => {

  return (
    <div className="min-h-screen text-[var(--color-text-primary)] flex flex-col transition-colors duration-300 app-bg">
      <SettingsSidebar userApiKey={null} setUserApiKey={() => {}} onNavigate={onNavigate} />
       <button
            onClick={() => onNavigate('landing')}
            className="fixed top-4 right-4 z-40 p-2 rounded-full bg-[var(--color-panel-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-sm hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Back to Home"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
      </button>

      <header className="text-center relative py-4 px-20">
        <div className="flex items-center justify-center gap-3">
            <ArchitectureIcon type={IconType.GraphLine} className="w-8 h-8 text-[var(--color-accent-text)]" />
            <div>
                <h1 className="text-xl font-bold">Graph Modeler</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">Generate charts and graphs from data descriptions.</p>
            </div>
        </div>
      </header>
      
      <div className="flex-1 p-6">
        <div className="glass-panel rounded-2xl h-full p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-center mb-2">Choose a Visualization Type</h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8">Select a chart to begin generating your visualization.</p>
            <motion.div 
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6 overflow-y-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {CHART_PREVIEWS.map((graph) => {
                    const isEnabled = graph.name === 'Pie Chart';
                    return (
                        <motion.button
                            key={graph.name}
                            variants={itemVariants}
                            whileHover={isEnabled ? { scale: 1.05, y: -5, zIndex: 10 } : {}}
                            whileTap={isEnabled ? { scale: 0.95 } : {}}
                            className={`relative p-4 flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-input)] rounded-xl border  transition-all
                                ${isEnabled 
                                    ? 'border-[var(--color-border)] hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent-soft)]'
                                    : 'border-[var(--color-border)] opacity-50 cursor-not-allowed'
                                }
                            `}
                            onClick={() => isEnabled && onNavigate('graph/pie')}
                            disabled={!isEnabled}
                            title={isEnabled ? graph.name : `${graph.name} (Coming Soon)`}
                        >
                            <div className="w-full h-32 flex items-center justify-center p-2">
                                {graph.preview}
                            </div>
                            <span className="text-sm font-semibold text-center">{graph.name}</span>
                             {!isEnabled && (
                                <span className="text-xs bg-[var(--color-button-bg-hover)] px-2 py-0.5 rounded-full">Soon</span>
                            )}
                        </motion.button>
                    );
                 })}
            </motion.div>
        </div>
      </div>
    </div>
  );
};
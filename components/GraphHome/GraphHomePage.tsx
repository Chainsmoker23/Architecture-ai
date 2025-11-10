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
    <div className="min-h-screen text-[var(--color-text-primary)] flex flex-col transition-colors duration-300 graph-home-bg">
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

      <div className="relative z-10 flex flex-col flex-1">
        <header className="text-center py-4 px-20">
            <div className="flex items-center justify-center gap-3">
                <ArchitectureIcon type={IconType.GraphLine} className="w-8 h-8 text-[var(--color-accent-text)]" />
                <div>
                    <h1 className="text-xl font-bold">Graph Modeler</h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">Generate charts and graphs from data descriptions.</p>
                </div>
            </div>
        </header>
        
        <main className="flex-1 container mx-auto px-6 py-8 flex flex-col">
            <h2 className="text-3xl font-bold text-center mb-2">Choose a Visualization Type</h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-10">Select a chart to begin generating your visualization.</p>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                            className={`glass-panel rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 group ${
                                isEnabled ? 'graph-card-enabled cursor-pointer' : 'graph-card-disabled cursor-not-allowed'
                            }`}
                            onClick={() => isEnabled && onNavigate('graph/pie')}
                            disabled={!isEnabled}
                            title={isEnabled ? graph.name : `${graph.name} (Coming Soon)`}
                        >
                            <div className="w-full h-36 flex items-center justify-center p-2 mb-3 bg-[var(--color-bg)] rounded-xl overflow-hidden border border-[var(--color-border)]">
                                {graph.preview}
                            </div>
                            <h3 className="font-semibold text-[var(--color-text-primary)]">{graph.name}</h3>
                            {!isEnabled && (
                                <span className="mt-2 text-xs bg-[var(--color-button-bg-hover)] px-2.5 py-1 rounded-full font-medium">Coming Soon</span>
                            )}
                            {isEnabled && (
                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </div>
                            )}
                        </motion.button>
                    );
                  })}
            </motion.div>
        </main>
      </div>
    </div>
  );
};
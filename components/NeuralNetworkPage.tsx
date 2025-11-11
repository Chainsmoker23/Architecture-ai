import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DiagramData, ArchNode } from '../types';
import { IconType } from '../types';
import { generateNeuralNetworkData } from '../services/geminiService';
import Loader from './Loader';
import ArchitectureIcon from './ArchitectureIcon';
import NeuralNetworkCanvas from './NeuralNetworkCanvas';
import ApiKeyModal from './ApiKeyModal';
import { useTheme } from '../contexts/ThemeProvider';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import SettingsSidebar from './SettingsSidebar';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'api' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research';

interface NeuralNetworkPageProps {
  onNavigate: (page: Page | string) => void;
}

const NeuralNetworkPage: React.FC<NeuralNetworkPageProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('A simple neural network with 3 input neurons, one hidden layer of 5 neurons, and 2 output neurons.');
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, refreshUser, updateCurrentUserMetadata } = useAuth();

  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(() => {
    try { return window.localStorage.getItem('user-api-key'); } catch { return null; }
  });

  const { theme, setTheme } = useTheme();
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'slate', label: 'Slate' },
    { value: 'midnight', label: 'Midnight' },
  ] as const;

  const svgRef = useRef<SVGSVGElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && event.target instanceof globalThis.Node && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExport = async (format: 'html' | 'json') => {
    setIsExportMenuOpen(false);
    if (!diagramData) return;
    const filename = diagramData.title.replace(/[\s/]/g, '_').toLowerCase();

    if (format === 'json') {
      const dataStr = JSON.stringify(diagramData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
      return;
    }
    
    const svgElement = svgRef.current;
    if (!svgElement) {
        setError("Export failed: SVG element not found.");
        return;
    }

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    const originalElements = Array.from(svgElement.querySelectorAll('*'));
    originalElements.unshift(svgElement);
    const clonedElements = Array.from(svgClone.querySelectorAll('*'));
    clonedElements.unshift(svgClone);

    originalElements.forEach((sourceEl, index) => {
        const targetEl = clonedElements[index] as SVGElement;
        if (targetEl && targetEl.style) {
            const computedStyle = window.getComputedStyle(sourceEl as globalThis.Element);
            let cssText = '';
            for (let i = 0; i < computedStyle.length; i++) {
                const prop = computedStyle[i];
                cssText += `${prop}: ${computedStyle.getPropertyValue(prop)};`;
            }
            targetEl.style.cssText = cssText;
        }
    });
    
    const contentGroup = svgElement.querySelector<SVGGElement>('#diagram-content');
    if (!contentGroup) {
        setError("Export failed: Diagram content not found.");
        return;
    }
    const bbox = contentGroup.getBBox();

    const padding = 20;
    const exportWidth = Math.round(bbox.width + padding * 2);
    const exportHeight = Math.round(bbox.height + padding * 2);
    
    svgClone.setAttribute('width', `${exportWidth}`);
    svgClone.setAttribute('height', `${exportHeight}`);
    svgClone.setAttribute('viewBox', `0 0 ${exportWidth} ${exportHeight}`);
    
    const exportRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const rootStyle = getComputedStyle(document.documentElement);
    const bgColor = rootStyle.getPropertyValue('--color-canvas-bg').trim() || '#FFF9FB';
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', bgColor);
    exportRoot.appendChild(bgRect);

    const clonedContentGroup = svgClone.querySelector<SVGGElement>('#diagram-content');
    if (clonedContentGroup) {
        clonedContentGroup.setAttribute('transform', `translate(${-bbox.x + padding}, ${-bbox.y + padding})`);
        exportRoot.appendChild(clonedContentGroup);
    }
    
    const clonedDefs = svgClone.querySelector<SVGDefsElement>('defs');
    if (clonedDefs) {
        exportRoot.insertBefore(clonedDefs, exportRoot.firstChild);
    }
    
    while (svgClone.firstChild) {
      svgClone.removeChild(svgClone.firstChild);
    }
    svgClone.appendChild(exportRoot);

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgClone);
    svgString = svgString.replace(/xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/g, '');

    if (format === 'html') {
      const htmlString = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${diagramData.title}</title>
          <style> body { margin: 0; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem; box-sizing: border-box; } svg { max-width: 100%; height: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 1rem; } </style>
        </head>
        <body>${svgString}</body>
        </html>`;
      const blob = new Blob([htmlString], { type: 'text/html' });
      downloadBlob(blob, `${filename}.html`);
      return;
    }
  };


  const handleGenerate = useCallback(async (keyOverride?: string) => {
    if (!prompt) {
      setError("Please enter a prompt describing the neural network.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagramData(null);

    try {
      const apiKeyToUse = keyOverride || userApiKey;
      const { diagram, newGenerationCount } = await generateNeuralNetworkData(prompt, apiKeyToUse || undefined);

      if (currentUser && newGenerationCount !== null && newGenerationCount !== undefined) {
        updateCurrentUserMetadata({ generation_count: newGenerationCount });
      } else if (currentUser) {
        await refreshUser();
      }
      
      setDiagramData(diagram);
    } catch (err: any) {
      console.error(String(err));
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";

      if (err.data && err.message.includes('GENERATION_LIMIT_EXCEEDED')) {
          const userPlan = currentUser?.user_metadata?.plan || 'free';
          const limit = userPlan === 'hobbyist' ? 50 : 30;
          const planName = String(userPlan).charAt(0).toUpperCase() + String(userPlan).slice(1);
          setError(`You've used all ${limit} generations for your ${planName} plan. Please upgrade to continue.`);
          // Live update the UI with the correct count from the backend
          if (typeof err.data.generationCount === 'number') {
              updateCurrentUserMetadata({ generation_count: err.data.generationCount });
          }
      } else if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
          setShowApiKeyModal(true);
          setError(null);
      } else {
          setError(errorMessage);
          setDiagramData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, userApiKey, currentUser, refreshUser, updateCurrentUserMetadata]);

  const handleSaveAndRetryApiKey = (key: string) => {
    setUserApiKey(key);
    setShowApiKeyModal(false);
    setError(null);
    handleGenerate(key);
  };

  return (
    <div className="min-h-screen text-[var(--color-text-primary)] flex flex-col transition-colors duration-300 app-bg">
      <SettingsSidebar userApiKey={userApiKey} setUserApiKey={setUserApiKey} onNavigate={onNavigate} />
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
            <ArchitectureIcon type={IconType.Brain} className="w-8 h-8 text-[var(--color-accent-text)]" />
            <div>
                <h1 className="text-xl font-bold">Neural Network Modeler</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">A dedicated canvas for perfect network diagrams.</p>
            </div>
        </div>
      </header>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 pt-0">
        <aside className="lg:col-span-3 p-6 rounded-2xl shadow-sm h-full flex flex-col glass-panel">
            <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Describe Your Network</h3>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A convolutional neural network with 2 conv layers and 1 fully connected layer."
                    className="flex-1 w-full p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200 resize-none min-h-[150px] shadow-inner"
                    disabled={isLoading}
                />
                <motion.button
                    onClick={() => handleGenerate()}
                    disabled={isLoading}
                    className={`mt-4 w-full generate-button font-semibold py-3 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-soft)] ${isLoading ? 'generate-button--loading' : ''}`}
                    style={{ boxShadow: '0 4px 14px 0 rgba(0,0,0,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                    ) : (
                    <>
                        <Logo className="w-5 h-5 mr-2 logo-pulse-gentle" />
                        Generate Network
                    </>
                    )}
                </motion.button>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Theme</h3>
                <div className="flex items-center space-x-2 bg-[var(--color-bg-input)] p-1 rounded-xl border border-[var(--color-border)]">
                    {themeOptions.map(option => (
                        <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            theme === option.value ? 'bg-[var(--color-panel-bg)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg)]'
                        }`}
                        >
                        {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </aside>

        <section className="lg:col-span-9 rounded-2xl shadow-sm flex flex-col relative min-h-[60vh] lg:min-h-0 glass-panel p-2">
            <AnimatePresence>
            {isLoading && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--color-panel-bg-translucent)] flex flex-col items-center justify-center z-20 rounded-2xl"
                >
                <Loader />
                </motion.div>
            )}
            </AnimatePresence>
            
            <AnimatePresence>
            {!diagramData && !isLoading && (
                <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                <ArchitectureIcon type={IconType.Neuron} className="h-20 w-20 text-[var(--color-text-tertiary)]" />
                <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">Your neural network will appear here</h3>
                <p className="mt-1 text-[var(--color-text-secondary)]">Describe its structure and click "Generate Network".</p>
                </motion.div>
            )}
            </AnimatePresence>

            {diagramData && (
                <NeuralNetworkCanvas data={diagramData} forwardedRef={svgRef} />
            )}
            {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg">{error}</div>}
        </section>
      </div>

       <AnimatePresence>
          {showApiKeyModal && (
              <ApiKeyModal
                  onClose={() => {
                      setShowApiKeyModal(false);
                      setError("Generation cancelled. Please provide an API key to proceed.");
                  }}
                  onSave={handleSaveAndRetryApiKey}
              />
          )}
        </AnimatePresence>
    </div>
  );
};

export default NeuralNetworkPage;
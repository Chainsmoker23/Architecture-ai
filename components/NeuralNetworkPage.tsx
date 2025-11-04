
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Use a type-only import for interfaces to prevent collision with the built-in DOM 'Node' type.
import type { DiagramData, Node } from '../types';
import { IconType } from '../types';
import { generateNeuralNetworkData } from '../services/geminiService';
import Loader from './Loader';
import ArchitectureIcon from './ArchitectureIcon';
import NeuralNetworkCanvas from './NeuralNetworkCanvas';
import ApiKeyModal from './ApiKeyModal';
import { useTheme } from '../contexts/ThemeProvider';
import Logo from './Logo';

interface NeuralNetworkPageProps {
  onBack: () => void;
}

const NeuralNetworkPage: React.FC<NeuralNetworkPageProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('A simple neural network with 3 input neurons, one hidden layer of 5 neurons, and 2 output neurons.');
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string | null>(() => {
    try { return window.localStorage.getItem('user-api-key'); } catch { return null; }
  });

  const { theme, setTheme } = useTheme();
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'dark', label: 'Dark' },
  ] as const;

  const svgRef = useRef<SVGSVGElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // FIX: Corrected typo 'exportMenu_ref' to 'exportMenuRef'
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

    // --- Create a deep clone to manipulate ---
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // --- Recursively inline all computed styles ---
    const originalElements = Array.from(svgElement.querySelectorAll('*'));
    originalElements.unshift(svgElement); // Add root SVG element
    const clonedElements = Array.from(svgClone.querySelectorAll('*'));
    clonedElements.unshift(svgClone); // Add root SVG element

    originalElements.forEach((sourceEl, index) => {
        const targetEl = clonedElements[index] as SVGElement;
        if (targetEl && targetEl.style) {
            const computedStyle = window.getComputedStyle(sourceEl);
            let cssText = '';
            for (let i = 0; i < computedStyle.length; i++) {
                const prop = computedStyle[i];
                cssText += `${prop}: ${computedStyle.getPropertyValue(prop)};`;
            }
            targetEl.style.cssText = cssText;
        }
    });
    
    // --- BBox Calculation on original content for accurate dimensions ---
    const contentGroup = svgElement.querySelector('#diagram-content');
    if (!contentGroup) {
        setError("Export failed: Diagram content not found.");
        return;
    }
    const bbox = (contentGroup as SVGGraphicsElement).getBBox();

    // --- Configure the cloned SVG for export ---
    const padding = 20; // Reduced padding for a tighter crop
    const exportWidth = Math.round(bbox.width + padding * 2);
    const exportHeight = Math.round(bbox.height + padding * 2);
    
    svgClone.setAttribute('width', `${exportWidth}`);
    svgClone.setAttribute('height', `${exportHeight}`);
    svgClone.setAttribute('viewBox', `0 0 ${exportWidth} ${exportHeight}`);
    
    // --- Create a new root group with background and transform ---
    const exportRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const rootStyle = getComputedStyle(document.documentElement);
    const bgColor = rootStyle.getPropertyValue('--color-canvas-bg').trim() || '#FFF9FB';
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', bgColor);
    exportRoot.appendChild(bgRect);

    // Use `instanceof globalThis.Element` to explicitly reference the DOM Element.
    // This resolves the type ambiguity caused by the imported `Node` interface,
    // which can confuse TypeScript's type checker for `appendChild`.
    const clonedContentGroup = svgClone.querySelector('#diagram-content');
    if (clonedContentGroup instanceof globalThis.Element) {
        clonedContentGroup.setAttribute('transform', `translate(${-bbox.x + padding}, ${-bbox.y + padding})`);
        // FIX: The imported 'Node' type can conflict with the DOM's 'Node' type.
        // The `instanceof globalThis.Element` type guard is sufficient to narrow the type
        // for `appendChild`, making the explicit cast `as Element` redundant.
        exportRoot.appendChild(clonedContentGroup);
    }
    
    const clonedDefs = svgClone.querySelector<SVGDefsElement>('defs');
    if (clonedDefs) {
        exportRoot.insertBefore(clonedDefs, exportRoot.firstChild);
    }
    
    // Replace clone's content with this new root
    while (svgClone.firstChild) {
      svgClone.removeChild(svgClone.firstChild);
    }
    svgClone.appendChild(exportRoot);

    // --- Serialize and download ---
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgClone);
    // Clean up namespace that can cause issues
    svgString = svgString.replace(/xmlns:xlink="http:\/\/www.w.org\/1999\/xlink"/g, '');

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
      const data = await generateNeuralNetworkData(prompt, apiKeyToUse || undefined);
      setDiagramData(data);
    } catch (err) {
      // FIX: Explicitly convert the unknown error object to a string for safe logging.
      console.error(String(err));
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
          setShowApiKeyModal(true);
          setError(null);
      } else {
          setError(errorMessage);
          setDiagramData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, userApiKey]);

  const handleSaveAndRetryApiKey = (key: string) => {
    setUserApiKey(key);
    setShowApiKeyModal(false);
    setError(null);
    handleGenerate(key);
  };

  return (
    <div className="min-h-screen text-[var(--color-text-primary)] flex flex-col transition-colors duration-300 app-bg">
      <header className="relative z-50 flex justify-between items-center p-4 border-b border-[var(--color-border)] bg-[var(--color-panel-bg)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <ArchitectureIcon type={IconType.Brain} className="w-8 h-8 text-[var(--color-accent-text)]" />
            <div>
                <h1 className="text-xl font-bold">Neural Network Modeler</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">A dedicated canvas for perfect network diagrams.</p>
            </div>
        </div>
         <div className="flex items-center gap-2">
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                disabled={!diagramData}
                className="px-3 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center disabled:opacity-50"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export
              </button>
              {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-xl shadow-lg z-30 p-1">
                      <a onClick={() => handleExport('html')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">HTML</a>
                      <a onClick={() => handleExport('json')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">JSON</a>
                  </div>
              )}
            </div>
            <div className="hidden sm:flex items-center space-x-1 bg-[var(--color-bg-input)] p-1 rounded-lg border border-[var(--color-border)]">
                {themeOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        theme === option.value ? 'bg-[var(--color-panel-bg)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg)]'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <button onClick={onBack} className="px-3 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                Main App
            </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        <aside className="lg:col-span-3 p-6 rounded-2xl shadow-sm h-full flex flex-col glass-panel">
          <h2 className="text-xl font-semibold mb-4">Describe Your Network</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A network with 2 inputs, two hidden layers of 4 neurons each, and 1 output neuron."
            className="flex-1 w-full p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-200 resize-none min-h-[150px] shadow-inner"
            disabled={isLoading}
          />
          <motion.button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className={`mt-4 w-full generate-button font-semibold py-3 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-soft)] ${isLoading ? 'generate-button--loading' : ''}`}
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
        </aside>

        <main className="lg:col-span-9 rounded-2xl shadow-sm flex flex-col relative min-h-[60vh] lg:min-h-0 glass-panel p-2">
            <AnimatePresence>
            {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--color-panel-bg-translucent)] flex flex-col items-center justify-center z-20 rounded-2xl">
                <Loader />
                </motion.div>
            )}
            </AnimatePresence>
            <AnimatePresence>
            {!diagramData && !isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <ArchitectureIcon type={IconType.Neuron} className="w-20 h-20 text-[var(--color-text-tertiary)]" />
                <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">Your neural network will appear here</h3>
                <p className="mt-1 text-[var(--color-text-secondary)]">Describe the layers and neurons to get started.</p>
                </motion.div>
            )}
            </AnimatePresence>

            {diagramData && (
                <NeuralNetworkCanvas forwardedRef={svgRef} data={diagramData} />
            )}
             {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg">{error}</div>}
        </main>
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

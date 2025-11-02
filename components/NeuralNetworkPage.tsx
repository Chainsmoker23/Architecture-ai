import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagramData, IconType } from '../types';
import { generateNeuralNetworkData } from '../services/geminiService';
import Loader from './Loader';
import ArchitectureIcon from './ArchitectureIcon';
import NeuralNetworkCanvas from './NeuralNetworkCanvas';
import ApiKeyModal from './ApiKeyModal';
import { useTheme } from '../contexts/ThemeProvider';
import Logo from './Logo';

// Helper function to recursively copy computed styles from a source element to a destination element.
const copyStylesInline = (destinationNode: SVGElement, sourceNode: SVGElement) => {
  const computedStyle = window.getComputedStyle(sourceNode);
  const styleProperties = Array.from(computedStyle);
  let styleValue = '';
  for (const property of styleProperties) {
    if (['fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'font-weight', 'opacity', 'visibility', 'text-anchor'].includes(property)) {
      styleValue += `${property}:${computedStyle.getPropertyValue(property)};`;
    }
  }
  destinationNode.setAttribute('style', styleValue);

  for (let i = 0; i < sourceNode.children.length; i++) {
    const sourceChild = sourceNode.children[i];
    const destinationChild = destinationNode.children[i];
    if (sourceChild instanceof SVGElement && destinationChild instanceof SVGElement) {
      copyStylesInline(destinationChild, sourceChild);
    }
  }
};

// Fix: Define props interface for the component.
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
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
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
  
  const handleExport = async (format: 'svg' | 'png' | 'json' | 'jpg') => {
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
    if (!svgElement) return;

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    copyStylesInline(svgClone, svgElement);
    
    const contentGroup = svgClone.querySelector('g[transform]');
    if (!contentGroup) return;

    const bbox = (contentGroup as SVGGraphicsElement).getBBox();
    
    const padding = 50;
    const exportWidth = bbox.width + padding * 2;
    const exportHeight = bbox.height + padding * 2;
    const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${exportWidth} ${exportHeight}`;

    svgClone.setAttribute('width', `${exportWidth}`);
    svgClone.setAttribute('height', `${exportHeight}`);
    svgClone.setAttribute('viewBox', viewBox);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgClone);
    const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas-bg').trim() || '#FFF9FB';
    source = source.replace('>', `><rect width="100%" height="100%" fill="${themeBg}"></rect>`);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });

    if (format === 'svg') {
        downloadBlob(svgBlob, `${filename}.svg`);
        return;
    }
    
    if (format === 'png' || format === 'jpg') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const img = new Image();
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = exportWidth * pixelRatio;
            canvas.height = exportHeight * pixelRatio;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            if (format === 'jpg') {
                context.fillStyle = themeBg;
                context.fillRect(0, 0, exportWidth, exportHeight);
            }

            context.drawImage(img, 0, 0, exportWidth, exportHeight);

            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const quality = format === 'jpg' ? 0.9 : undefined;
            
            canvas.toBlob((imageBlob) => {
                if (imageBlob) {
                    downloadBlob(imageBlob, `${filename}.${format}`);
                }
                URL.revokeObjectURL(url);
            }, mimeType, quality);
        };
        img.src = url;
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
      console.error(err);
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
      <header className="flex justify-between items-center p-4 border-b border-[var(--color-border)] bg-[var(--color-panel-bg)]/80 backdrop-blur-sm">
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
                      <a onClick={() => handleExport('png')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">PNG</a>
                      <a onClick={() => handleExport('jpg')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">JPG</a>
                      <a onClick={() => handleExport('svg')} className="block px-3 py-1.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-button-bg-hover)] rounded-md cursor-pointer">SVG</a>
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

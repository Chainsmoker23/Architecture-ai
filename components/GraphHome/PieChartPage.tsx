import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChartData, IconType } from '../../types';
import { generatePieChartData } from '../../services/geminiService';
import Loader from '../Loader';
import ArchitectureIcon from '../ArchitectureIcon';
import ApiKeyModal from '../ApiKeyModal';
import { useAuth } from '../../contexts/AuthContext';
import SettingsSidebar from '../SettingsSidebar';
import PieChartCanvas from './PieChartCanvas';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'sdk' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research' | 'graph';

interface PieChartPageProps {
  onNavigate: (page: Page | string) => void;
}

const PieChartPage: React.FC<PieChartPageProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('A pie chart showing browser market share: 65% for Chrome, 20% for Safari, 10% for Firefox, and 5% for others.');
  const [chartData, setChartData] = useState<PieChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, refreshUser } = useAuth();
  const [userApiKey, setUserApiKey] = useState<string | null>(() => {
    try { return window.localStorage.getItem('user-api-key'); } catch { return null; }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  
  const svgRef = useRef<SVGSVGElement>(null);

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
  
  const handleExport = async (format: 'png' | 'json') => {
    if (!chartData) return;
    const filename = chartData.title.replace(/[\s/]/g, '_').toLowerCase();

    if (format === 'json') {
      const dataStr = JSON.stringify(chartData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
      return;
    }

    if (format === 'png') {
        const svgElement = svgRef.current;
        if (!svgElement) {
            setError("Export failed: SVG element not found.");
            return;
        }
        
        // Temporarily set a specific size for export rendering
        const exportWidth = 800;
        const exportHeight = 600;

        // Clone the SVG to manipulate it without affecting the on-screen version
        const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('width', String(exportWidth));
        svgClone.setAttribute('height', String(exportHeight));
        
        // Embed all computed styles inline
        const originalElements = Array.from(svgElement.querySelectorAll('*'));
        const clonedElements = Array.from(svgClone.querySelectorAll('*'));
        originalElements.forEach((sourceEl, index) => {
            const computedStyle = window.getComputedStyle(sourceEl);
            if(clonedElements[index]) {
                (clonedElements[index] as SVGElement).style.cssText = computedStyle.cssText;
            }
        });
        
        const rootStyle = getComputedStyle(document.documentElement);
        const bgColor = rootStyle.getPropertyValue('--color-canvas-bg').trim() || '#FFFFFF';

        // Create an outer SVG with a background for the final image
        const svgString = `
            <svg width="${exportWidth}" height="${exportHeight}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="${bgColor}" />
                ${svgClone.outerHTML}
            </svg>
        `;

        const canvas = document.createElement('canvas');
        const scale = 2; // Render at 2x for higher resolution
        canvas.width = exportWidth * scale;
        canvas.height = exportHeight * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(scale, scale);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
            canvas.toBlob((blob) => {
                if (blob) downloadBlob(blob, `${filename}.png`);
            }, 'image/png');
        };
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    }
  };


  const handleGenerate = useCallback(async (keyOverride?: string) => {
    if (!prompt) {
      setError("Please enter a prompt describing the pie chart data.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setChartData(null);

    try {
      const apiKeyToUse = keyOverride || userApiKey;
      const data = await generatePieChartData(prompt, apiKeyToUse || undefined);
      if (currentUser) {
          await refreshUser();
      }
      setChartData(data);
    } catch (err) {
      console.error(String(err));
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes('GENERATION_LIMIT_EXCEEDED')) {
        const userPlan = currentUser?.user_metadata?.plan || 'free';
        const limit = userPlan === 'hobbyist' ? 50 : 30;
        setError(`You've used all ${limit} generations. Please upgrade to continue.`);
      } else if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
        setShowApiKeyModal(true);
        setError(null);
      } else {
        setError(errorMessage);
        setChartData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, userApiKey, currentUser, refreshUser]);

  const handleSaveAndRetryApiKey = (key: string) => {
    setUserApiKey(key);
    setShowApiKeyModal(false);
    setError(null);
    handleGenerate(key);
  };

  return (
    <div className="min-h-screen text-[var(--color-text-primary)] flex flex-col transition-colors duration-300 app-bg">
      <SettingsSidebar userApiKey={userApiKey} setUserApiKey={setUserApiKey} onNavigate={onNavigate} />
      <header className="text-center relative py-4 px-20">
        <div className="flex items-center justify-center gap-3">
            <ArchitectureIcon type={IconType.GraphPie} className="w-8 h-8 text-[var(--color-accent-text)]" />
            <div>
                <h1 className="text-xl font-bold">Pie Chart Generator</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">Create a pie chart from a data description.</p>
            </div>
        </div>
      </header>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 pt-0">
        <aside className="lg:col-span-3 p-6 rounded-2xl shadow-sm h-full flex flex-col glass-panel">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Describe Your Data</h3>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A chart showing browser market share: 65% Chrome, 20% Safari..."
                className="flex-1 w-full p-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-accent)] transition-all resize-none min-h-[150px] shadow-inner"
                disabled={isLoading}
            />
            <motion.button
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className={`mt-4 w-full generate-button font-semibold py-3 px-4 rounded-xl flex items-center justify-center disabled:opacity-60 ${isLoading ? 'generate-button--loading' : ''}`}
                whileTap={{ scale: 0.98 }}
            >
                {isLoading ? 'Generating...' : 'Generate Chart'}
            </motion.button>
        </aside>

        <section className="lg:col-span-9 rounded-2xl shadow-sm flex flex-col relative min-h-[60vh] lg:min-h-0 glass-panel app-bg">
          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--color-panel-bg-translucent)] flex items-center justify-center z-20 rounded-2xl">
                <Loader />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!chartData && !isLoading && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <ArchitectureIcon type={IconType.GraphPie} className="h-20 w-20 text-[var(--color-text-tertiary)]" />
                <h3 className="mt-4 text-xl font-semibold">Your pie chart will appear here</h3>
                <p className="mt-1 text-[var(--color-text-secondary)]">Describe its data points and click "Generate".</p>
              </motion.div>
            )}
          </AnimatePresence>

          {chartData && (
            <div className="w-full h-full flex flex-col">
              <div className="p-2 px-4 flex justify-between items-center gap-2 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-bold truncate">{chartData.title}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('png')} className="px-3 py-1.5 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)]">Export PNG</button>
                    <button onClick={() => handleExport('json')} className="px-3 py-1.5 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)]">Export JSON</button>
                </div>
              </div>
              <div className="flex-1 w-full h-full p-4">
                <PieChartCanvas data={chartData} forwardedRef={svgRef} />
              </div>
            </div>
          )}
          {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg">{error}</div>}
        </section>
      </div>

      <AnimatePresence>
        {showApiKeyModal && <ApiKeyModal onClose={() => setShowApiKeyModal(false)} onSave={handleSaveAndRetryApiKey} />}
      </AnimatePresence>
    </div>
  );
};

export default PieChartPage;
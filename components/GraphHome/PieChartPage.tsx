import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChartData, IconType } from '../../types';
import { generatePieChartData } from '../../services/geminiService';
import Loader from '../Loader';
import ArchitectureIcon from '../ArchitectureIcon';
import ApiKeyModal from '../ApiKeyModal';
import { useTheme } from '../../contexts/ThemeProvider';
import Logo from '../Logo';
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
  const { theme, setTheme } = useTheme();

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

        <section className="lg:col-span-9 rounded-2xl shadow-sm flex flex-col relative min-h-[60vh] lg:min-h-0 glass-panel p-2">
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

          {chartData && <PieChartCanvas data={chartData} />}
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

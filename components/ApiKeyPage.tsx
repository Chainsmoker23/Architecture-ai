import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import SharedFooter from './SharedFooter';
import { useAuth } from '../contexts/AuthContext';
import { getUserApiKey, generateUserApiKey, revokeUserApiKey } from '../services/geminiService';
import Loader from './Loader';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface ApiKeyPageProps {
  onBack: () => void;
  onLaunch: () => void;
  onNavigate: (page: Page) => void;
}

// --- SUB-COMPONENTS for enhanced creativity ---

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

const ParticleBackground = React.memo(() => {
    const [width] = useWindowSize();
    const particleCount = width < 768 ? 15 : 30; // Fewer particles on mobile
    const particles = useMemo(() => Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 3 + 1.5}px`,
        delay: `${Math.random() * 30}s`,
        duration: `${25 + Math.random() * 15}s`,
        drift: Math.random() - 0.5,
    })), [particleCount]);

    return (
        <div className="api-key-page-bg" aria-hidden="true">
            {particles.map(p => (
                <div key={p.id} className="api-key-particle" style={{
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                    animationDuration: p.duration,
                    '--drift-x': p.drift,
                } as React.CSSProperties} />
            ))}
        </div>
    );
});

const useUnscramble = (text: string, isEnabled: boolean) => {
    const [displayedText, setDisplayedText] = useState('');
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    useEffect(() => {
        if (!text) return;
        if (!isEnabled) {
            setDisplayedText(text);
            return;
        }

        let frame = 0;
        const frameRate = 25; // ms
        const totalDuration = 800;
        const totalFrames = totalDuration / frameRate;

        const intervalId = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const revealCount = Math.floor(text.length * progress);
            
            let output = text.substring(0, revealCount);
            for (let i = revealCount; i < text.length; i++) {
                output += chars[Math.floor(Math.random() * chars.length)];
            }
            setDisplayedText(output);

            if (frame >= totalFrames) {
                setDisplayedText(text);
                clearInterval(intervalId);
            }
        }, frameRate);

        return () => clearInterval(intervalId);
    }, [text, isEnabled]);

    return displayedText;
};


const CredentialCard: React.FC<{
    apiKey: string;
    isRevealing: boolean;
    onCopy: () => void;
    isCopied: boolean;
    onRevoke: () => void;
}> = ({ apiKey, isRevealing, onCopy, isCopied, onRevoke }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const unscrambledKey = useUnscramble(isRevealing ? apiKey : `cg_sk_${'•'.repeat(20)}${apiKey.slice(-4)}`, isRevealing);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <motion.div
            ref={cardRef}
            key="key-view"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="api-credential-card p-6 rounded-2xl relative overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <div className="relative z-10">
                <h2 className="text-2xl font-bold">Your Personal API Key</h2>
                <p className="text-sm text-gray-500 mt-1">Use this key in the app to bypass shared limits.</p>
                <div className="api-credential-display mt-4 flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="api-status-indicator flex-shrink-0" />
                        <span className="font-mono text-sm text-gray-700 truncate">
                            {unscrambledKey}
                        </span>
                    </div>
                    <button onClick={onCopy} className={`text-sm font-semibold px-3 py-1 rounded-md transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-[#A61E4D] hover:bg-pink-200'}`}>
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={onRevoke} className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors p-2 rounded-md hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Revoke Key
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ConfettiBurst: React.FC<{ isBursting: boolean }> = ({ isBursting }) => {
    const colors = ['#f472b6', '#ec4899', '#d946ef', '#a855f7'];
    const confetti = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            color: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 0.3}s`,
            duration: `${1.5 + Math.random()}s`,
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none">
            {isBursting && confetti.map(c => (
                <div key={c.id} className="confetti" style={{
                    '--bg': c.color,
                    left: c.left,
                    animationDelay: c.delay,
                    animationDuration: c.duration,
                } as React.CSSProperties} />
            ))}
        </div>
    );
};

const ApiKeyPage: React.FC<ApiKeyPageProps> = ({ onBack, onNavigate }) => {
    const { currentUser } = useAuth();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isKeyCopied, setIsKeyCopied] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isBursting, setIsBursting] = useState(false);

    const plan = currentUser?.user_metadata?.plan || 'free';
    const isPremiumUser = ['pro', 'business'].includes(plan);

    useEffect(() => {
        if (isPremiumUser) {
            setIsLoading(true);
            getUserApiKey()
                .then(setApiKey)
                .catch(err => setError(err.message || 'Failed to fetch API key.'))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [isPremiumUser]);

    const handleGenerateKey = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newKey = await generateUserApiKey();
            setApiKey(newKey);
            setIsRevealing(true);
            setIsBursting(true);
            setTimeout(() => setIsRevealing(false), 2000);
            setTimeout(() => setIsBursting(false), 2500);
        } catch (err: any) {
            setError(err.message || 'Failed to generate key.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeKey = async () => {
        if (window.confirm('Are you sure you want to revoke this key? It will immediately stop working and this action cannot be undone.')) {
            setIsLoading(true);
            setError(null);
            try {
                await revokeUserApiKey();
                setApiKey(null);
            } catch (err: any) {
                setError(err.message || 'Failed to revoke key.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleCopyKey = () => {
        if (apiKey && !isRevealing) {
            navigator.clipboard.writeText(apiKey);
            setIsKeyCopied(true);
            setTimeout(() => setIsKeyCopied(false), 2000);
        }
    };

  return (
    <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
        <header className="absolute top-0 left-0 w-full p-6 z-20">
            <button onClick={onBack} className="flex items-center gap-2 font-semibold text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Back to Home
            </button>
        </header>

        <main>
            <section className="relative flex items-center justify-center overflow-hidden api-hero-bg py-20 pt-32 md:pt-40">
                <ParticleBackground />
                <div className="container mx-auto px-6 z-10 text-center">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            Personal API Key
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                            Generate a personal key to use within the CubeGen app and bypass shared usage limits.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="relative py-16 sm:py-24 bg-white">
                <div className="container mx-auto px-6 max-w-2xl z-10">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                             <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64">
                                <Loader />
                             </motion.div>
                        ) : !isPremiumUser ? (
                            <motion.div key="upgrade" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="api-credential-card p-8 rounded-2xl text-center">
                                <ArchitectureIcon type={IconType.SecretsManager} className="w-16 h-16 text-gray-300 mx-auto opacity-50" />
                                <h2 className="text-2xl font-bold mt-4">Personal Keys are a Pro Feature</h2>
                                <p className="mt-2 text-gray-600">Upgrade to a Pro or Business plan to generate a key and bypass shared usage limits.</p>
                                <button onClick={() => onNavigate('api')} className="mt-6 shimmer-button text-[#A61E4D] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                    View Plans & Upgrade
                                </button>
                            </motion.div>
                        ) : apiKey ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                                <CredentialCard 
                                    apiKey={apiKey} 
                                    isRevealing={isRevealing}
                                    onCopy={handleCopyKey}
                                    isCopied={isKeyCopied}
                                    onRevoke={handleRevokeKey}
                                />
                            </motion.div>
                        ) : (
                             <motion.div key="generate-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="text-center api-credential-card p-10 rounded-2xl border-dashed">
                                    <ArchitectureIcon type={IconType.Api} className="w-16 h-16 text-gray-300 mx-auto" />
                                    <h2 className="text-2xl font-bold mt-4">You don't have a personal key yet.</h2>
                                    <p className="mt-2 text-gray-600 max-w-md mx-auto">Generate a key to use in the app's settings. This will give you unlimited generations and bypass any shared limits.</p>
                                    <motion.button 
                                      onClick={handleGenerateKey} 
                                      className="mt-6 shimmer-button text-[#A61E4D] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                        Generate Your Personal Key
                                        <ConfettiBurst isBursting={isBursting} />
                                    </motion.button>
                                </div>
                             </motion.div>
                        )}
                    </AnimatePresence>
                    {error && <p className="text-red-500 text-center mt-6">{error}</p>}
                </div>
            </section>
        </main>

        <SharedFooter onNavigate={onNavigate} />
    </div>
  );
};

export default ApiKeyPage;
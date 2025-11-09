import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
// FIX: Use a type-only import for interfaces to prevent collision with the built-in DOM 'Node' type.
import type { DiagramData, Node, Container, Link } from './types';
import { IconType } from './types';
import { generateDiagramData, explainArchitecture } from './services/geminiService';
import PromptInput from './components/PromptInput';
import DiagramCanvas from './components/DiagramCanvas';
import Toolbar from './components/Toolbar';
import SummaryModal from './components/SummaryModal';
import Loader from './components/Loader';
import PropertiesSidebar from './components/PropertiesSidebar';
import SettingsSidebar from './components/SettingsSidebar';
import { EXAMPLE_PROMPT, EXAMPLE_PROMPTS_LIST } from './constants';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import SdkPage from './components/SdkPage';
import AuthPage from './components/AuthPage';
import Playground from './components/Playground';
import ArchitectureIcon from './components/ArchitectureIcon';
import ApiKeyModal from './components/ApiKeyModal';
import ApiKeyPage from './components/ApiKeyPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import DocsPage from './components/DocsPage';
import Logo from './components/Logo';
import NeuralNetworkPage from './components/NeuralNetworkPage';
import CareersPage from './components/CareersPage';
import ResearchPage from './components/ResearchPage';
import { useAuth } from './contexts/AuthContext';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'sdk' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research';

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const pageItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', damping: 15, stiffness: 100 } 
  },
};

const getPageFromHash = (): Page => {
  const hash = window.location.hash.substring(1).split('?')[0];
  if (!hash) {
    return 'landing';
  }
  const validPages: Page[] = ['landing', 'auth', 'app', 'contact', 'about', 'sdk', 'apiKey', 'privacy', 'terms', 'docs', 'neuralNetwork', 'careers', 'research'];
  if (validPages.includes(hash as Page)) {
    return hash as Page;
  }
  return 'landing';
};


const App: React.FC = () => {
  const { currentUser, loading: authLoading, refreshUser } = useAuth();
  const [page, setPage] = useState<Page | null>(null);

  // State to reactively track the URL hash.
  const [hash, setHash] = useState(() => window.location.hash);

  // Effect to keep the `hash` state in sync with the browser's URL.
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const onNavigate = useCallback((targetPage: Page) => {
    const currentHashPage = getPageFromHash();
    if (currentHashPage !== targetPage) {
        window.scrollTo(0, 0);
        window.location.hash = targetPage;
    }
  }, []);

  useEffect(() => {
    // 1. Wait until authentication status is known.
    if (authLoading) {
      return;
    }

    // --- 2. INITIAL LOAD REDIRECT ---
    // On the very first load (when hash is empty), if the user is already
    // logged in, send them directly to the app. This avoids a flash of the
    // landing page for returning users but still allows them to navigate back later.
    if (currentUser && window.location.hash === '') {
        onNavigate('app');
        return; // Abort this run; the hash change will trigger the effect again.
    }
    
    const currentPage = getPageFromHash();

    // --- 3. PERSISTENT REDIRECT RULES ---
    // A logged-in user should never be able to navigate to the sign-in page.
    if (currentUser && currentPage === 'auth') {
      onNavigate('app');
      return; // Abort this run.
    }
    
    // A logged-out user should never be able to access protected pages.
    const isProtectedPage = currentPage === 'app' || currentPage === 'neuralNetwork';
    if (!currentUser && isProtectedPage) {
      onNavigate('landing');
      return; // Abort this run.
    }

    // --- 4. PAGE RESOLUTION ---
    // If no redirect was needed, this is the correct page to display.
    setPage(currentPage);

  }, [authLoading, currentUser, onNavigate, hash]); // Reruns when auth or URL changes.


  const [prompt, setPrompt] = useState<string>(EXAMPLE_PROMPT);
  const [promptIndex, setPromptIndex] = useState(0);

  const [history, setHistory] = useState<(DiagramData | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const diagramData = history[historyIndex];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPlaygroundMode, setIsPlaygroundMode] = useState<boolean>(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const fitScreenRef = useRef<(() => void) | null>(null);
  
  const [userApiKey, setUserApiKey] = useState<string | null>(() => {
    try { return window.localStorage.getItem('user-api-key'); } catch { return null; }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<{ type: 'generate' | 'explain', payload: any } | null>(null);

  useEffect(() => {
    try {
        if (userApiKey) {
            window.localStorage.setItem('user-api-key', userApiKey);
        } else {
            window.localStorage.removeItem('user-api-key');
        }
    } catch (error) {
        console.error("Could not access localStorage to save API key:", String(error));
    }
  }, [userApiKey]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  const handleExport = async (format: 'png' | 'json' | 'html') => {
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

    if (format === 'png') {
      const canvas = document.createElement('canvas');
      // Set a higher resolution for better quality, then scale down if needed
      const scale = 2;
      canvas.width = exportWidth * scale;
      canvas.height = exportHeight * scale;
      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
          setError("Export failed: Could not create canvas context.");
          return;
      }
      ctx.scale(scale, scale);
  
      const img = new Image();
      // Use btoa for binary data encoding, and encodeURIComponent for special characters in SVG.
      const svgUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  
      img.onload = () => {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
              if (blob) {
                  downloadBlob(blob, `${filename}.png`);
              } else {
                   setError("Export failed: Canvas returned empty blob for png.");
              }
          }, 'image/png');
      };
  
      img.onerror = () => {
          setError("Export failed: The generated SVG could not be loaded as an image. This can happen with complex gradients or filters.");
      };
  
      img.src = svgUrl;
    }
  };


  const handleDiagramUpdate = (newData: DiagramData, fromHistory = false) => {
    if (fromHistory) {
       setHistory(prev => {
         const newHistory = [...prev];
         newHistory[historyIndex] = newData;
         return newHistory;
       });
    } else {
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newData]);
      setHistoryIndex(newHistory.length);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSelectedIds([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSelectedIds([]);
    }
  };
  
  const handleFitToScreen = () => {
    fitScreenRef.current?.();
  };

  const handleGenerate = useCallback(async (keyOverride?: string) => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setHistory([null]);
    setHistoryIndex(0);
    setSelectedIds([]);

    try {
      const apiKeyToUse = keyOverride || userApiKey;
      const data = await generateDiagramData(prompt, apiKeyToUse || undefined);
      
      if (currentUser) {
        await refreshUser();
      }

      setHistory([data]);
      setHistoryIndex(0);
      // Add a small delay for the canvas to render before fitting
      setTimeout(() => handleFitToScreen(), 100);
    } catch (err) {
      // FIX: Explicitly convert the unknown error object to a string for safe logging.
      console.error(String(err));
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes('GENERATION_LIMIT_EXCEEDED')) {
          setError("You've used all 30 free generations. Please upgrade to continue.");
      } else if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
          const userPlan = currentUser?.user_metadata?.plan;
          const isPremiumUser = userPlan && ['pro', 'business'].includes(String(userPlan).toLowerCase());

          if (isPremiumUser) {
            setLastAction({ type: 'generate', payload: prompt });
            setShowApiKeyModal(true);
            setError(null);
          } else {
            setError("The shared API key has reached its daily limit. Please upgrade to a Pro plan to use your own key and continue generating.");
          }
      } else {
          setError(errorMessage);
          setHistory([null]);
          setHistoryIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, userApiKey, currentUser, refreshUser]);
  
  const handleExplain = useCallback(async (keyOverride?: string) => {
    if (!diagramData) return;
    setIsExplaining(true);
    setError(null);
    try {
      const apiKeyToUse = keyOverride || userApiKey;
      const explanation = await explainArchitecture(diagramData, apiKeyToUse || undefined);
      setSummary(explanation);
      setShowSummaryModal(true);
    } catch (err) {
       // FIX: Explicitly convert the unknown error object to a string for safe logging.
       console.error(String(err));
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
       if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
            const userPlan = currentUser?.user_metadata?.plan;
            const isPremiumUser = userPlan && ['pro', 'business'].includes(String(userPlan).toLowerCase());

            if (isPremiumUser) {
                setLastAction({ type: 'explain', payload: diagramData });
                setShowApiKeyModal(true);
                setError(null);
            } else {
                setError("The shared API key has reached its daily limit. Please upgrade to a Pro plan to use your own key and continue generating.");
            }
       } else {
           setError(errorMessage);
       }
    } finally {
        setIsExplaining(false);
    }
  }, [diagramData, userApiKey, currentUser]);

  const handleSaveAndRetryApiKey = (key: string) => {
    setUserApiKey(key);
    setShowApiKeyModal(false);
    setError(null);

    if (lastAction?.type === 'generate') {
      handleGenerate(key);
    } else if (lastAction?.type === 'explain') {
      handleExplain(key);
    }
    setLastAction(null);
  };

  const selectedItem = useMemo(() => {
    if (!diagramData || selectedIds.length !== 1) return null;
    const selectedId = selectedIds[0];
    const items: (Node | Container | Link)[] = [
        ...(diagramData.nodes || []),
        ...(diagramData.containers || []),
        ...(diagramData.links || []),
    ];
    return items.find(item => item.id === selectedId) || null;
  }, [diagramData, selectedIds]);

  const handlePropertyChange = (itemId: string, newProps: Partial<Node | Container | Link>) => {
    if (!diagramData) return;
    const newNodes = diagramData.nodes.map(n => n.id === itemId ? {...n, ...newProps} : n);
    const newContainers = diagramData.containers?.map(c => c.id === itemId ? {...c, ...newProps as Partial<Container>} : c);
    const newLinks = diagramData.links.map(l => l.id === itemId ? {...l, ...newProps as Partial<Link>} : l);
    handleDiagramUpdate({ ...diagramData, nodes: newNodes, containers: newContainers, links: newLinks }, true);
  }
  
  const handleTitleSave = () => {
    if (diagramData && editingTitle && editingTitle !== diagramData.title) {
        handleDiagramUpdate({ ...diagramData, title: editingTitle });
    }
    setIsEditingTitle(false);
  };

  const handleCyclePrompt = () => {
    const nextIndex = (promptIndex + 1) % EXAMPLE_PROMPTS_LIST.length;
    setPromptIndex(nextIndex);
    setPrompt(EXAMPLE_PROMPTS_LIST[nextIndex]);
  };
  
  // A single, unified loader for initial auth check and any in-progress redirects.
  // The page state is only set once the final, correct page is determined.
  if (page === null) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  // --- Page rendering logic ---
  // Now that redirects are handled, we can just render the page based on its state.
  if (page === 'landing') {
    return <LandingPage onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page === 'auth') {
    return <AuthPage onBack={() => onNavigate('landing')} />;
  }
  if (page === 'contact') {
    return <ContactPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'about') {
    return <AboutPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page === 'sdk') {
    return <SdkPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'apiKey') {
    return <ApiKeyPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page === 'privacy') {
    return <PrivacyPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'terms') {
    return <TermsPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'docs') {
    return <DocsPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigateToSdk={() => onNavigate('sdk')} onNavigate={onNavigate} />;
  }
  if (page === 'neuralNetwork') {
    return <NeuralNetworkPage onBack={() => onNavigate('app')} />;
  }
  if (page === 'careers') {
    return <CareersPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'research') {
    return <ResearchPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }

  if (page === 'app') {
    if (isPlaygroundMode && diagramData) {
      return (
        <Playground
          data={diagramData}
          onDataChange={handleDiagramUpdate}
          onExit={() => setIsPlaygroundMode(false)}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onExplain={handleExplain}
          isExplaining={isExplaining}
          onExport={handleExport}
        />
      );
    }

    const isPropertiesPanelOpen = selectedIds.length > 0;

    return (
      <div className="h-screen text-[var(--color-text-primary)] flex flex-col transition-colors duration-300 app-bg">
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
        <motion.div 
          variants={pageContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col"
        >
          <header className="w-full text-center relative py-4 px-20">
              <h1 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-x-2">
                  <span>CubeGen</span>
                  <div className="pulse-subtle">
                      <Logo className="h-6 w-6 text-[var(--color-accent-text)]" />
                  </div>
                  <span>AI</span>
              </h1>
          </header>
          
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 pb-4">
            <motion.aside variants={pageItemVariants} className="lg:col-span-3 rounded-2xl shadow-sm flex flex-col glass-panel">
               <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onGenerate={() => handleGenerate()}
                  isLoading={isLoading}
                  onCyclePrompt={handleCyclePrompt}
              />
            </motion.aside>
            
            <motion.section 
                variants={pageItemVariants} 
                className={`rounded-2xl shadow-sm flex flex-col relative min-h-[60vh] lg:min-h-0 glass-panel transition-all duration-300 ${isPropertiesPanelOpen ? 'lg:col-span-6' : 'lg:col-span-9'}`}
            >
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">Your diagram will appear here</h3>
                    <p className="mt-1 text-[var(--color-text-secondary)]">Describe your architecture and click "Generate".</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {diagramData && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col relative"
                >
                  <div className="p-4 border-b border-[var(--color-border-translucent)] flex justify-between items-center gap-4">
                    <div className="group min-w-0 flex items-center gap-2">
                      {isEditingTitle ? (
                         <input
                            ref={titleInputRef}
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            className="text-xl font-semibold bg-transparent border-b border-[var(--color-accent-soft)] focus:outline-none focus:border-[var(--color-accent-text)]"
                         />
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold truncate" title={diagramData.title}>{diagramData.title}</h2>
                          <button onClick={() => { setIsEditingTitle(true); setEditingTitle(diagramData.title); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArchitectureIcon type={IconType.Edit} className="w-4 h-4 text-[var(--color-text-secondary)]" />
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <Toolbar 
                          onExport={handleExport}
                          onExplain={() => handleExplain()}
                          isExplaining={isExplaining}
                          onUndo={handleUndo}
                          onRedo={handleRedo}
                          canUndo={historyIndex > 0}
                          canRedo={historyIndex < history.length - 1}
                          onFitToScreen={handleFitToScreen}
                          onGoToPlayground={() => setIsPlaygroundMode(true)}
                          canGoToPlayground={!!diagramData}
                      />
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <DiagramCanvas 
                      forwardedRef={svgRef}
                      fitScreenRef={fitScreenRef}
                      data={diagramData} 
                      onDataChange={handleDiagramUpdate} 
                      selectedIds={selectedIds}
                      setSelectedIds={setSelectedIds}
                    />
                  </div>
                </motion.div>
              )}

              {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg">{error}</div>}
            </motion.section>

            <AnimatePresence>
                {isPropertiesPanelOpen && (
                    <motion.aside 
                        key="properties-sidebar-desktop"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="lg:col-span-3 h-full flex-col hidden lg:flex"
                    >
                      <PropertiesSidebar 
                        item={selectedItem}
                        onPropertyChange={handlePropertyChange}
                        selectedCount={selectedIds.length}
                      />
                    </motion.aside>
                )}
            </AnimatePresence>

          </main>
        </motion.div>

        {/* Properties Bottom Sheet (Mobile only) */}
        <AnimatePresence>
            {isPropertiesPanelOpen && (
                <motion.div
                    key="properties-backdrop"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setSelectedIds([])}
                />
            )}
        </AnimatePresence>
        <AnimatePresence>
            {isPropertiesPanelOpen && (
                <motion.div
                    key="properties-sheet"
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="fixed bottom-0 left-0 right-0 h-[60vh] bg-[var(--color-panel-bg)] rounded-t-2xl border-t border-[var(--color-border)] shadow-2xl p-4 z-40 lg:hidden"
                >
                    <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-4" />
                    <div className="overflow-y-auto h-[calc(60vh-40px)] px-2">
                        <PropertiesSidebar
                            item={selectedItem}
                            onPropertyChange={handlePropertyChange}
                            selectedCount={selectedIds.length}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
          {showSummaryModal && summary && (
            <SummaryModal summary={summary} onClose={() => setShowSummaryModal(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showApiKeyModal && (
              <ApiKeyModal
                  onClose={() => {
                      setShowApiKeyModal(false);
                      setLastAction(null);
                      setError("Generation cancelled. Please provide an API key in settings to proceed.");
                  }}
                  onSave={handleSaveAndRetryApiKey}
              />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fallback for unknown pages
  return <LandingPage onLaunch={() => onNavigate('auth')} onNavigate={onNavigate} />;
};

export default App;
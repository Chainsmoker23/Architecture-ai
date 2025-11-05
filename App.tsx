import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
// FIX: Use a type-only import for interfaces to prevent collision with the built-in DOM 'Node' type.
import type { DiagramData, Node, Container, Link } from './types';
import { IconType } from './types';
import { generateDiagramData, explainArchitecture } from './services/geminiService';
import PromptInput from './components/PromptInput';
import DiagramCanvas from './components/DiagramCanvas';
import SummaryModal from './components/SummaryModal';
import Loader from './components/Loader';
import PropertiesSidebar from './components/PropertiesSidebar';
import SettingsSidebar from './components/SettingsSidebar';
import { EXAMPLE_PROMPT, EXAMPLE_PROMPTS_LIST } from './components/constants';
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

const App: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page>('landing');
 
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

  const onNavigate = useCallback((targetPage: Page) => {
    window.scrollTo(0, 0);
    setPage(targetPage);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    // If the user is logged in, redirect them away from the auth page.
    if (currentUser && page === 'auth') {
      onNavigate('app');
    } 
    // If the user is not logged in, they can't access the app page. Redirect to landing.
    else if (!currentUser && page === 'app') {
      onNavigate('landing');
    }
  }, [currentUser, authLoading, page, onNavigate]);


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

    if (format === 'png') {
      const canvas = document.createElement('canvas');
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
      setHistory([data]);
      setHistoryIndex(0);
      setTimeout(() => handleFitToScreen(), 100);
    } catch (err) {
      console.error(String(err));
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
          setLastAction({ type: 'generate', payload: prompt });
          setShowApiKeyModal(true);
          setError(null);
      } else {
          setError(errorMessage);
          setHistory([null]);
          setHistoryIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, userApiKey]);
 
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
       console.error(String(err));
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
       if (errorMessage.includes('SHARED_KEY_QUOTA_EXCEEDED')) {
            setLastAction({ type: 'explain', payload: diagramData });
            setShowApiKeyModal(true);
            setError(null);
       } else {
           setError(errorMessage);
       }
    } finally {
        setIsExplaining(false);
    }
  }, [diagramData, userApiKey]);

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

    return (
      <div className="min-h-screen text-[var(--color-text-primary)] flex transition-colors duration-300 app-bg overflow-hidden">
        <SettingsSidebar userApiKey={userApiKey} setUserApiKey={setUserApiKey} />
        
        <motion.div
          key="main-app"
          variants={pageContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 gap-4"
        >
          <motion.header variants={pageItemVariants} className="w-full max-w-7xl mx-auto text-center relative py-2">
              <div className="absolute top-6 right-0 z-40 flex items-center gap-2">
                {diagramData && (
                  <button
                    onClick={() => setIsPlaygroundMode(true)}
                    className="px-3 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center"
                    aria-label="Edit in Playground"
                    title="Edit in Playground"
                  >
                    <ArchitectureIcon type={IconType.Playground} className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Edit in Playground</span>
                  </button>
                )}
                <button
                    onClick={() => onNavigate('landing')}
                    className="p-2 bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors"
                    aria-label="Back to Home"
                    title="Back to Home"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </button>
              </div>

              <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                  <div className="header-glow-effect" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight flex items-center justify-center gap-x-2 sm:gap-x-4">
                  <span>CubeGen</span>
                  <div className="pulse-subtle">
                      <Logo className="h-8 w-8 sm:h-10 sm:w-10 text-[var(--color-accent-text)]" />
                  </div>
                  <span>AI</span>
              </h1>
              <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
                  Generate and edit software architecture diagrams from natural language.
              </p>
          </motion.header>

          <motion.main variants={pageItemVariants} className="flex-1 relative flex flex-col rounded-2xl glass-panel p-2">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[var(--color-panel-bg-translucent)] flex flex-col items-center justify-center z-20 rounded-2xl"
                  >
                      <Loader />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {!diagramData && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center text-center p-8"
                  >
                      <ArchitectureIcon type={IconType.Cloud} className="h-20 w-20 text-[var(--color-text-tertiary)]" />
                      <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">Your architecture diagram will appear here</h3>
                      <p className="mt-1 text-[var(--color-text-secondary)]">Enter a prompt below and click "Generate" to start.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {diagramData && (
                <DiagramCanvas
                    forwardedRef={svgRef}
                    fitScreenRef={fitScreenRef}
                    data={diagramData}
                    onDataChange={(newData) => handleDiagramUpdate(newData, true)}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                />
              )}
              
              {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg z-10">{error}</div>}
          </motion.main>
          
          <motion.div variants={pageItemVariants} className="w-full max-w-4xl mx-auto">
             <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={() => handleGenerate()}
                isLoading={isLoading}
                onCyclePrompt={handleCyclePrompt}
              />
          </motion.div>
        </motion.div>

        <AnimatePresence>
            {selectedIds.length > 0 && diagramData && (
                <motion.aside 
                    key="properties-sidebar-desktop"
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="w-[350px] bg-transparent p-4 hidden md:flex"
                >
                    <PropertiesSidebar 
                        item={selectedItem}
                        onPropertyChange={handlePropertyChange}
                        selectedCount={selectedIds.length}
                    />
                </motion.aside>
            )}
        </AnimatePresence>
        
        <AnimatePresence>
          {selectedIds.length > 0 && diagramData && (
            <>
              {/* Mobile: Bottom Sheet */}
              <motion.div
                key="properties-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-30 md:hidden"
                onClick={() => setSelectedIds([])}
              />
              <motion.div
                key="properties-sheet"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="fixed bottom-0 left-0 right-0 h-[60vh] bg-[var(--color-panel-bg)] rounded-t-2xl border-t border-[var(--color-border)] shadow-2xl z-40 md:hidden"
              >
                <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto my-3" />
                <div className="overflow-y-auto h-[calc(100%-30px)] px-4 pb-4">
                  <PropertiesSidebar 
                    item={selectedItem}
                    onPropertyChange={handlePropertyChange}
                    selectedCount={selectedIds.length}
                  />
                </div>
              </motion.div>
            </>
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
                      setError("Generation cancelled. Please provide an API key to proceed.");
                  }}
                  onSave={handleSaveAndRetryApiKey}
              />
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  return null;
};

export default App;
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
import { EXAMPLE_PROMPT, EXAMPLE_PROMPTS_LIST } from './components/constants';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import SdkPage from './components/SdkPage';
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
import AuthPage from './components/AuthPage';

type Page = 'landing' | 'app' | 'contact' | 'about' | 'sdk' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research' | 'auth';

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
  const { currentUser } = useAuth();
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
    if (targetPage === 'app' && !currentUser) {
        setPage('auth');
    } else {
        setPage(targetPage);
    }
  }, [currentUser]);

  useEffect(() => {
    if (page === 'app' && !currentUser) {
      onNavigate('auth');
    }
  }, [currentUser, page, onNavigate]);

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

    // FIX: Explicitly cast to `globalThis.Element` to resolve a TypeScript type collision
    // between the imported `Node` interface and the built-in DOM `Node` type, ensuring
    // `appendChild` receives a correctly typed argument.
    const clonedContentGroup = svgClone.querySelector('#diagram-content');
    if (clonedContentGroup) {
        clonedContentGroup.setAttribute('transform', `translate(${-bbox.x + padding}, ${-bbox.y + padding})`);
        exportRoot.appendChild(clonedContentGroup as globalThis.Element);
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
      setHistory([data]);
      setHistoryIndex(0);
      // Add a small delay for the canvas to render before fitting
      setTimeout(() => handleFitToScreen(), 100);
    } catch (err) {
      // FIX: Explicitly convert the unknown error object to a string for safe logging.
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
       // FIX: Explicitly convert the unknown error object to a string for safe logging.
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
    return <LandingPage onLaunch={() => onNavigate('app')} onNavigate={onNavigate} />;
  }
  if (page === 'contact') {
    return <ContactPage onBack={() => setPage('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'about') {
    return <AboutPage onBack={() => setPage('landing')} onLaunch={() => onNavigate('app')} onNavigate={onNavigate} />;
  }
  if (page === 'sdk') {
    return <SdkPage onBack={() => setPage('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'apiKey') {
    return <ApiKeyPage onBack={() => setPage('landing')} onLaunch={() => onNavigate('app')} onNavigate={onNavigate} />;
  }
  if (page === 'privacy') {
    return <PrivacyPage onBack={() => setPage('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'terms') {
    return <TermsPage onBack={() => setPage('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'docs') {
    return <DocsPage onBack={() => setPage('landing')} onLaunch={() => onNavigate('app')} onNavigateToSdk={() => setPage('sdk')} onNavigate={onNavigate} />;
  }
  if (page === 'neuralNetwork') {
    return <NeuralNetworkPage onBack={() => setPage('app')} />;
  }
  if (page === 'careers') {
    return <CareersPage onBack={() => setPage('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'research') {
    return <ResearchPage onBack={() => setPage('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'auth') {
      return <AuthPage onBack={() => setPage('landing')} />;
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
      <div className="min-h-screen text-[var(--color-text-primary)] flex transition-colors duration-300 app-bg">
        <SettingsSidebar userApiKey={userApiKey} setUserApiKey={setUserApiKey} />
        <button
            onClick={() => setPage('landing')}
            className="fixed top-6 right-6 z-40 p-2 rounded-full bg-[var(--color-panel-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-sm hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Back to Home"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 4.414V17a1 1 0 102 0V4.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
        </button>

        <main className="flex-1 flex flex-col items-center justify-center p-6 pt-20">
          <motion.div 
            className="w-full max-w-7xl flex-1 flex flex-col"
            variants={pageContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={pageItemVariants} 
              className="relative w-full max-w-3xl mx-auto flex flex-col items-center text-center"
            >
              <div className="absolute -top-12 inset-x-0 h-40 header-glow-effect -z-1" />
              <div className="flex items-center gap-2">
                  <Logo className="h-10 w-10 text-[var(--color-accent-text)]" />
                  <h1 className="text-4xl font-bold">Cube<span className="text-[var(--color-accent-text)]">Gen</span> AI</h1>
              </div>
              <p className="mt-2 text-[var(--color-text-secondary)]">Generate professional software architecture diagrams instantly from a single prompt.</p>
            </motion.div>
            
            <motion.div 
              variants={pageItemVariants} 
              className="mt-6 w-full max-w-2xl mx-auto"
            >
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={() => handleGenerate()}
                isLoading={isLoading}
              />
              <div className="mt-3 flex justify-center items-center gap-4">
                  <button onClick={handleCyclePrompt} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-medium flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.65-5.65l1.35 1.35M20 15a9 9 0 01-14.65 5.65l-1.35-1.35" /></svg>
                      Try an example
                  </button>
                  <span className="text-gray-300">|</span>
                   <button onClick={() => setPage('neuralNetwork')} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-medium flex items-center gap-1">
                      <ArchitectureIcon type={IconType.Brain} className="w-4 h-4" />
                      Neural Network Modeler
                  </button>
              </div>
            </motion.div>

            <motion.section
              variants={pageItemVariants} 
              className="flex-1 mt-6 w-full bg-[var(--color-panel-bg)] rounded-2xl shadow-sm flex flex-col border border-[var(--color-border)]"
            >
              <header className="flex justify-between items-center p-3 border-b border-[var(--color-border)]">
                 {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                        className="text-lg font-semibold bg-transparent rounded-md px-1 -mx-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                 ) : (
                    <div 
                      onDoubleClick={() => { if(diagramData) { setIsEditingTitle(true); setEditingTitle(diagramData.title); }}}
                      className="flex items-center gap-2 cursor-pointer"
                      title="Double-click to edit title"
                    >
                      <h2 className="text-lg font-semibold truncate pr-4">{diagramData?.title || 'Untitled Diagram'}</h2>
                       {diagramData && <ArchitectureIcon type={IconType.Edit} className="w-4 h-4 text-[var(--color-text-secondary)] opacity-50" />}
                    </div>
                 )}
                
                {diagramData && (
                  <Toolbar
                    onExport={handleExport}
                    onExplain={handleExplain}
                    isExplaining={isExplaining}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    onFitToScreen={handleFitToScreen}
                    onGoToPlayground={() => setIsPlaygroundMode(true)}
                    canGoToPlayground={!!diagramData}
                  />
                )}
              </header>
              <div className="flex-1 relative">
                <AnimatePresence>
                {(isLoading) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[var(--color-panel-bg-translucent)] flex flex-col items-center justify-center z-20 rounded-b-2xl"
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
                    className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full"
                  >
                    <ArchitectureIcon type={IconType.Cloud} className="h-20 w-20 text-[var(--color-text-tertiary)]" />
                    <h3 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">Your architecture diagram will appear here</h3>
                    <p className="mt-1 text-[var(--color-text-secondary)]">Enter a prompt above and click "Generate Diagram" to start.</p>
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
                
                {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg">{error}</div>}
              </div>
            </motion.section>
          </motion.div>
        </main>
        
        <AnimatePresence>
            {selectedIds.length > 0 && diagramData && (
                 <motion.aside 
                    key="sidebar"
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="fixed top-0 right-0 h-full w-[350px] bg-[var(--color-panel-bg)] p-6 z-30 shadow-2xl border-l border-[var(--color-border)]"
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
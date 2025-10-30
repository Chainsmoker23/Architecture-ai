
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { DiagramData, Node, Container } from './types';
import { generateDiagramData, explainArchitecture } from './services/geminiService';
import PromptInput from './components/PromptInput';
import DiagramCanvas from './components/DiagramCanvas';
import Toolbar from './components/Toolbar';
import SummaryModal from './components/SummaryModal';
import Loader from './components/Loader';
import PropertiesSidebar from './components/PropertiesSidebar';
import SettingsSidebar from './components/SettingsSidebar';
import { EXAMPLE_PROMPT } from './constants';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to fetch and embed fonts as data URIs to prevent canvas tainting
const getFontStyles = async (): Promise<string> => {
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  try {
      const cssResponse = await fetch(fontUrl);
      if (!cssResponse.ok) return '';
      let cssText = await cssResponse.text();
      const fontFileUrls = cssText.match(/url\(https?:\/\/[^)]+\)/g) || [];

      const dataUriPromises = fontFileUrls.map(async (urlString) => {
          const url = urlString.replace(/url\((['"]?)(.*?)\1\)/, '$2');
          try {
              const fontResponse = await fetch(url);
              if (!fontResponse.ok) return { original: urlString, dataUri: urlString };
              const blob = await fontResponse.blob();
              const dataUri = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
              });
              return { original: urlString, dataUri: `url(${dataUri})` };
          } catch (e) {
              return { original: urlString, dataUri: urlString };
          }
      });
      
      const resolvedUris = await Promise.all(dataUriPromises);

      for (const { original, dataUri } of resolvedUris) {
          cssText = cssText.replace(original, dataUri);
      }
      return cssText;
  } catch (e) {
      return '';
  }
};


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(EXAMPLE_PROMPT);
  const [history, setHistory] = useState<(DiagramData | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const diagramData = history[historyIndex];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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

  const handleExport = async (format: 'svg' | 'png' | 'json') => {
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
    
    const contentGroup = svgElement.querySelector('#diagram-content');
    if (!contentGroup) return;

    const originalTransform = contentGroup.getAttribute('transform');
    contentGroup.removeAttribute('transform');
    const bbox = (contentGroup as SVGGraphicsElement).getBBox();
    if (originalTransform) {
        contentGroup.setAttribute('transform', originalTransform);
    }

    const padding = 50;
    const exportWidth = bbox.width + padding * 2;
    const exportHeight = bbox.height + padding * 2;
    const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${exportWidth} ${exportHeight}`;

    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    
    const clonedContentGroup = svgClone.querySelector('#diagram-content');
    if (clonedContentGroup) clonedContentGroup.removeAttribute('transform');

    const gridRect = svgClone.querySelector('rect[fill="url(#grid)"]');
    if (gridRect) gridRect.remove();
    
    svgClone.setAttribute('width', `${exportWidth}`);
    svgClone.setAttribute('height', `${exportHeight}`);
    svgClone.setAttribute('viewBox', viewBox);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const fontStyles = await getFontStyles();
    const otherStyles = `
      .label-text { color: var(--color-text-primary); } 
      .label-desc { color: var(--color-text-secondary); }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .font-medium { font-weight: 500; } .leading-tight { line-height: 1.25; } .h-full { height: 100%; }
      .flex { display: flex; } .items-center { align-items: center; } .text-center { text-align: center; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = fontStyles + otherStyles;
    svgClone.querySelector('defs')?.appendChild(styleEl);

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });

    if (format === 'svg') {
        downloadBlob(svgBlob, `${filename}.svg`);
    } else if (format === 'png') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const img = new Image();
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            const pixelRatio = window.devicePixelRatio || 1;
            canvas.width = exportWidth * pixelRatio;
            canvas.height = exportHeight * pixelRatio;
            canvas.style.width = `${exportWidth}px`;
            canvas.style.height = `${exportHeight}px`;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            context.drawImage(img, 0, 0);

            canvas.toBlob((pngBlob) => {
                if (pngBlob) {
                    downloadBlob(pngBlob, `${filename}.png`);
                }
                URL.revokeObjectURL(url);
            });
        };
        img.onerror = (e) => {
          console.error("Error loading SVG for PNG conversion.", e);
          URL.revokeObjectURL(url);
        }
        img.src = url;
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

  const handleGenerate = useCallback(async () => {
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
      const data = await generateDiagramData(prompt);
      setHistory([data]);
      setHistoryIndex(0);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
      setHistory([null]);
      setHistoryIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);
  
  const handleExplain = useCallback(async () => {
    if (!diagramData) return;
    setIsExplaining(true);
    try {
      const explanation = await explainArchitecture(diagramData);
      setSummary(explanation);
      setShowSummaryModal(true);
    } catch (err) {
       console.error(err);
       setError(err instanceof Error ? err.message : "An unknown error occurred during explanation.");
    } finally {
        setIsExplaining(false);
    }
  }, [diagramData]);

  const selectedItem = useMemo(() => {
    if (!diagramData || selectedIds.length !== 1) return null;
    const selectedId = selectedIds[0];
    return [...(diagramData.nodes || []), ...(diagramData.containers || [])].find(
      (item) => item.id === selectedId
    );
  }, [diagramData, selectedIds]);

  const handlePropertyChange = (itemId: string, newProps: Partial<Node> | Partial<Container>) => {
    if (!diagramData) return;
    const newNodes = diagramData.nodes.map(n => n.id === itemId ? {...n, ...newProps} : n);
    const newContainers = diagramData.containers?.map(c => c.id === itemId ? {...c, ...newProps as Partial<Container>} : c);
    handleDiagramUpdate({ ...diagramData, nodes: newNodes, containers: newContainers }, true);
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex transition-colors duration-300">
      <SettingsSidebar />
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 gap-6">
        <header className="w-full max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Archi<span className="text-[var(--color-accent-text)]">Gen</span> AI
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            Generate and edit software architecture diagrams from natural language.
          </p>
        </header>
        
        <main className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 bg-[var(--color-panel-bg)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm h-full flex flex-col">
            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </aside>

          <section className="lg:col-span-6 bg-[var(--color-panel-bg)] rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col relative min-h-[60vh] lg:min-h-0">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[var(--color-panel-bg-translucent)] flex flex-col items-center justify-center z-20 rounded-2xl"
                >
                  <Loader />
                  <p className="mt-4 text-[var(--color-text-secondary)] font-medium">Generating your architecture...</p>
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
                  <p className="mt-1 text-[var(--color-text-secondary)]">Enter a prompt and click "Generate Diagram" to start.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {diagramData && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col relative"
              >
                <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{diagramData.title}</h2>
                  <Toolbar 
                      onExport={handleExport}
                      onExplain={handleExplain}
                      isExplaining={isExplaining}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={historyIndex > 0}
                      canRedo={historyIndex < history.length - 1}
                  />
                </div>
                <div className="flex-1 relative">
                  <DiagramCanvas 
                    forwardedRef={svgRef}
                    data={diagramData} 
                    onDataChange={handleDiagramUpdate} 
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                  />
                </div>
              </motion.div>
            )}

            {error && <div className="absolute bottom-4 left-4 bg-red-500/90 text-white p-3 rounded-xl text-sm shadow-lg">{error}</div>}
          </section>

          <aside className="lg:col-span-3 bg-[var(--color-panel-bg)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm h-full flex flex-col">
            <PropertiesSidebar 
              item={selectedItem}
              onPropertyChange={handlePropertyChange}
              selectedCount={selectedIds.length}
            />
          </aside>

        </main>
      </div>

      <AnimatePresence>
        {showSummaryModal && summary && (
          <SummaryModal summary={summary} onClose={() => setShowSummaryModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

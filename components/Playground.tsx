import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagramData, ArchNode, Link, Container, IconType } from '../types';
import DiagramCanvas, { InteractionMode } from './DiagramCanvas';
import PropertiesSidebar from './PropertiesSidebar';
import PlaygroundToolbar from './PlaygroundToolbar';
import ContextualActionBar from './ContextualActionBar';
import { customAlphabet } from 'nanoid';
import { zoomIdentity, ZoomTransform } from 'd3-zoom';
import AssistantWidget from './AssistantWidget';
import MobileWarning from './MobileWarning';
import Toast from './Toast';
import AddNodePanel from './AddNodePanel';

const nanoid = customAlphabet('1234567890abcdef', 10);

interface PlaygroundProps {
    data: DiagramData;
    onDataChange: (newData: DiagramData, fromHistory?: boolean) => void;
    onExit: () => void;
    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onExplain: () => void;
    isExplaining: boolean;
}

type HandleType = 'top' | 'right' | 'bottom' | 'left';

const Playground: React.FC<PlaygroundProps> = (props) => {
    const { data, onDataChange, onExit, selectedIds, setSelectedIds, canUndo, canRedo, onUndo, onRedo, onExplain, isExplaining } = props;

    const [interactionMode, setInteractionMode] = useState<InteractionMode>('select');
    const [actionBarPosition, setActionBarPosition] = useState<{ x: number; y: number } | null>(null);
    const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
    const [showMobileWarning, setShowMobileWarning] = useState(false);
    const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    // State for the new drag-to-connect feature
    const [linkingState, setLinkingState] = useState<{ sourceNodeId: string; startPos: { x: number, y: number } } | null>(null);
    const [previewLinkTarget, setPreviewLinkTarget] = useState<{ x: number; y: number; targetNodeId?: string } | null>(null);

    const isPropertiesPanelOpen = selectedIds.length > 0;

    const svgRef = useRef<SVGSVGElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const fitScreenRef = useRef<(() => void) | null>(null);

    const handleUndo = useCallback(() => {
      if (canUndo) {
        onUndo();
        setToastMessage('Action undone');
      }
    }, [canUndo, onUndo]);

    const handleRedo = useCallback(() => {
      if (canRedo) {
        onRedo();
        setToastMessage('Action redone');
      }
    }, [canRedo, onRedo]);

    const handleAddContainer = () => {
        if (!canvasContainerRef.current) return;
        const canvasRect = canvasContainerRef.current.getBoundingClientRect();
        
        // Calculate center of the current view
        const [viewX, viewY] = viewTransform.invert([canvasRect.width / 2, canvasRect.height / 2]);

        const newContainer: Container = {
            id: nanoid(),
            label: 'New Tier',
            type: 'tier',
            x: viewX - 200, // Center it
            y: viewY - 150,
            width: 400,
            height: 300,
            childNodeIds: [],
        };
        const newContainers = [...(data.containers || []), newContainer];
        const newData = { ...data, containers: newContainers };
        onDataChange(newData);
        setSelectedIds([newContainer.id]);
        setToastMessage('Container added');
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key === 'z' && !e.shiftKey;
            const isRedo = (isMac ? e.metaKey : e.ctrlKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey));

            if (isUndo) {
                e.preventDefault();
                handleUndo();
            } else if (isRedo) {
                e.preventDefault();
                handleRedo();
            } else if (e.key.toLowerCase() === 'v') {
                e.preventDefault();
                handleSetInteractionMode('select');
            } else if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                setInteractionMode(prev => prev === 'addNode' ? 'select' : 'addNode');
            } else if (e.key.toLowerCase() === 'b') {
                e.preventDefault();
                handleAddContainer();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    useEffect(() => {
        if (window.innerWidth < 768) {
            setShowMobileWarning(true);
        }
    }, []);
    
    const nodesAndContainersById = useMemo(() => {
        const map = new Map<string, ArchNode | Container | Link>();
        data.nodes.forEach(node => map.set(node.id, node));
        (data.containers || []).forEach(container => map.set(container.id, container));
        (data.links || []).forEach(link => map.set(link.id, link));
        return map;
    }, [data.nodes, data.containers, data.links]);

    useEffect(() => {
        if (selectedIds.length > 0 && data && svgRef.current && canvasContainerRef.current) {
            const selectedNodes = data.nodes.filter(n => selectedIds.includes(n.id));
            if (selectedNodes.length === 0) {
                setActionBarPosition(null);
                return;
            }

            let minX = Infinity, minY = Infinity;
            selectedNodes.forEach(node => {
                minX = Math.min(minX, node.x - node.width / 2);
                minY = Math.min(minY, node.y - node.height / 2);
            });
            
            const [screenX, screenY] = viewTransform.apply([minX, minY]);
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            
            setActionBarPosition({ x: screenX, y: screenY - canvasRect.top - 60 });

        } else {
            setActionBarPosition(null);
        }
    }, [selectedIds, data, viewTransform]);

    const handleFitToScreen = () => fitScreenRef.current?.();

    const handleSetInteractionMode = (mode: InteractionMode) => {
        setInteractionMode(mode);
        setSelectedIds([]);
        setResizingNodeId(null);
    };
    
    const handleNodeDoubleClick = useCallback((nodeId: string) => {
        setInteractionMode('select');
        setResizingNodeId(prevId => (prevId === nodeId ? null : nodeId));
        if (resizingNodeId !== nodeId) {
            setSelectedIds([nodeId]);
        }
    }, [resizingNodeId, setSelectedIds]);

    const handleCanvasClick = (event?: PointerEvent) => {
        setSelectedIds([]);
        setResizingNodeId(null);
    };
    
    const selectedItem = useMemo(() => {
        if (!data || selectedIds.length !== 1) return null;
        return nodesAndContainersById.get(selectedIds[0]) || null;
    }, [data, selectedIds, nodesAndContainersById]);

    const handlePropertyChange = (itemId: string, newProps: Partial<ArchNode> | Partial<Container> | Partial<Link>) => {
        if (!data) return;
        const newNodes = data.nodes.map(n => n.id === itemId ? { ...n, ...(newProps as Partial<ArchNode>) } : n);
        const newContainers = data.containers?.map(c => c.id === itemId ? { ...c, ...(newProps as Partial<Container>) } : c);
        const newLinks = data.links.map(l => l.id === itemId ? { ...l, ...(newProps as Partial<Link>) } : l);
        onDataChange({ ...data, nodes: newNodes, containers: newContainers, links: newLinks });
    };

    const handleDeleteSelected = useCallback(() => {
        if (selectedIds.length === 0) return;
        const selectedIdsSet = new Set(selectedIds);
        const newNodes = data.nodes.filter(n => !selectedIdsSet.has(n.id));
        const newContainers = (data.containers || []).filter(c => !selectedIdsSet.has(c.id));
        
        const remainingNodeIds = new Set(newNodes.map(n => n.id));
        const newLinks = data.links.filter(l => {
            if (selectedIdsSet.has(l.id)) return false;
            const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            return remainingNodeIds.has(sourceId) && remainingNodeIds.has(targetId);
        });

        onDataChange({ ...data, nodes: newNodes, containers: newContainers, links: newLinks });
        setSelectedIds([]);
    }, [data, onDataChange, selectedIds, setSelectedIds]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
                const activeEl = document.activeElement;
                if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                    return;
                }
                e.preventDefault();
                handleDeleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, handleDeleteSelected]);

    const handleDuplicateSelected = useCallback(() => {
        if (selectedIds.length === 0) return;
        const selectedNodes = data.nodes.filter(n => selectedIds.includes(n.id));
        if (selectedNodes.length === 0) return;

        const newNodes = selectedNodes.map(node => ({
            ...node,
            id: nanoid(),
            x: node.x + 30,
            y: node.y + 30,
        }));
        
        const allNewNodes = [...data.nodes, ...newNodes];
        onDataChange({ ...data, nodes: allNewNodes });
        setSelectedIds(newNodes.map(n => n.id)); // Select the new duplicated nodes

    }, [data, onDataChange, selectedIds, setSelectedIds]);

     const onAddNode = (type: IconType) => {
        if (!canvasContainerRef.current) return;
        const canvasRect = canvasContainerRef.current.getBoundingClientRect();
        
        const [viewX, viewY] = viewTransform.invert([canvasRect.width / 2, canvasRect.height / 2]);

        const newNode: ArchNode = {
            id: nanoid(),
            label: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: type,
            x: viewX,
            y: viewY,
            width: 150,
            height: 80,
        };
        const newData = { ...data, nodes: [...data.nodes, newNode] };
        onDataChange(newData);
        setInteractionMode('select');
        setSelectedIds([newNode.id]);
    };

    const handleLinkStart = useCallback((sourceNodeId: string, startPos: { x: number, y: number }) => {
        setLinkingState({ sourceNodeId, startPos });
    }, []);

    const handleLinkEnd = useCallback((targetNodeId?: string) => {
        if (linkingState && targetNodeId && linkingState.sourceNodeId !== targetNodeId) {
            const newLink: Link = {
                id: nanoid(),
                source: linkingState.sourceNodeId,
                target: targetNodeId,
            };
            onDataChange({ ...data, links: [...data.links, newLink] });
        }
        setLinkingState(null);
        setPreviewLinkTarget(null);
    }, [linkingState, data, onDataChange]);

    const handleLinkMove = useCallback((e: MouseEvent) => {
        if (!linkingState || !canvasContainerRef.current) return;
        const canvasRect = canvasContainerRef.current.getBoundingClientRect();
        const [x, y] = viewTransform.invert([e.clientX - canvasRect.left, e.clientY - canvasRect.top]);
        
        let targetNodeId: string | undefined = undefined;
        if (e.target instanceof SVGElement) {
            const parentGroup = e.target.closest('g.diagram-node');
            if (parentGroup) {
                 targetNodeId = Array.from(parentGroup.classList).find(c => c.startsWith('node-id-'))?.replace('node-id-', '');
            }
        }
        
        setPreviewLinkTarget({ x, y, targetNodeId });
    }, [linkingState, viewTransform]);

    useEffect(() => {
        if (linkingState) {
            const handleMouseUp = (e: MouseEvent) => {
                let targetNodeId: string | undefined;
                // Check if the mouse is released over a node
                if (e.target instanceof SVGElement) {
                    const parentGroup = e.target.closest('g.diagram-node');
                    if (parentGroup) {
                        targetNodeId = Array.from(parentGroup.classList).find(c => c.startsWith('node-id-'))?.replace('node-id-', '');
                    }
                }
                handleLinkEnd(targetNodeId);
            };

            window.addEventListener('mousemove', handleLinkMove);
            window.addEventListener('mouseup', handleMouseUp);
    
            return () => {
                window.removeEventListener('mousemove', handleLinkMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [linkingState, handleLinkMove, handleLinkEnd]);

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
        if (!data) return;
        const filename = data.title.replace(/[\s/]/g, '_').toLowerCase();

        if (format === 'json') {
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            downloadBlob(blob, `${filename}.json`);
            return;
        }

        const svgElement = svgRef.current;
        if (!svgElement) {
            setToastMessage("Export failed: SVG element not found.");
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
                const computedStyle = window.getComputedStyle(sourceEl);
                let cssText = '';
                for (let i = 0; i < computedStyle.length; i++) {
                    const prop = computedStyle[i];
                    cssText += `${prop}: ${computedStyle.getPropertyValue(prop)};`;
                }
                targetEl.style.cssText = cssText;
            }
        });

        const contentGroup = svgElement.querySelector('#diagram-content');
        if (!contentGroup) {
            setToastMessage("Export failed: Diagram content not found.");
            return;
        }
        const bbox = (contentGroup as SVGGraphicsElement).getBBox();

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

        const clonedContentGroup = svgClone.querySelector('#diagram-content');
        if (clonedContentGroup instanceof globalThis.Element) {
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
            const htmlString = `...`; // Same as GeneralArchitecturePage
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
                setToastMessage("Export failed: Could not create canvas context.");
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
                        setToastMessage("Export failed: Canvas returned empty blob for png.");
                    }
                }, 'image/png');
            };

            img.onerror = () => {
                setToastMessage("Export failed: The generated SVG could not be loaded as an image.");
            };

            img.src = svgUrl;
        }
    };

    return (
        <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col md:flex-row z-30">
            <AnimatePresence>
              {toastMessage && (
                <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
              )}
            </AnimatePresence>
            <AnimatePresence>
                {showMobileWarning && (
                    <MobileWarning onDismiss={() => setShowMobileWarning(false)} />
                )}
            </AnimatePresence>

            <div className="order-2 md:order-1 h-full flex flex-col md:flex-row">
                 <PlaygroundToolbar
                    interactionMode={interactionMode}
                    onSetInteractionMode={handleSetInteractionMode}
                    onAddContainer={handleAddContainer}
                    onFitToScreen={handleFitToScreen}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onExplain={onExplain}
                    isExplaining={isExplaining}
                    onExport={handleExport}
                 />
                <AnimatePresence>
                {interactionMode === 'addNode' && (
                     <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="fixed bottom-0 left-0 right-0 z-20 md:relative md:bottom-auto md:left-auto md:right-auto"
                     >
                        <AddNodePanel onSelectNodeType={onAddNode} onClose={() => setInteractionMode('select')} />
                     </motion.div>
                 )}
                </AnimatePresence>
            </div>
            
            <main className="order-1 md:order-2 flex-1 flex flex-col relative" ref={canvasContainerRef}>
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                    <button onClick={onExit} className="bg-[var(--color-panel-bg)] text-[var(--color-text-primary)] font-semibold py-2 px-4 rounded-full shadow-lg border border-[var(--color-border)] pointer-events-auto hover:bg-[var(--color-button-bg-hover)] transition-colors">
                        &larr; Exit Playground
                    </button>
                    {actionBarPosition && selectedIds.length > 0 && (
                        <ContextualActionBar position={actionBarPosition} onDelete={handleDeleteSelected} onDuplicate={handleDuplicateSelected} selectedCount={selectedIds.length} />
                    )}
                </div>
                <DiagramCanvas
                    forwardedRef={svgRef}
                    fitScreenRef={fitScreenRef}
                    data={data}
                    onDataChange={onDataChange}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    isEditable={true}
                    interactionMode={interactionMode}
                    onTransformChange={setViewTransform}
                    resizingNodeId={resizingNodeId}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    onCanvasClick={handleCanvasClick}
                    onLinkStart={handleLinkStart}
                    linkingState={linkingState}
                    previewLinkTarget={previewLinkTarget}
                />
            </main>

            <AnimatePresence>
                {isPropertiesPanelOpen && (
                    <motion.aside
                        key="properties-sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="order-3 w-screen max-w-sm md:w-80 h-full bg-[var(--color-panel-bg)] border-l border-[var(--color-border)] shadow-2xl z-20"
                    >
                        <PropertiesSidebar
                            item={selectedItem}
                            onPropertyChange={handlePropertyChange}
                            selectedCount={selectedIds.length}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>
            <AssistantWidget />
        </div>
    );
};

export default Playground;
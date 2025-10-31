

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagramData, Node, Link, Container, IconType } from '../types';
import DiagramCanvas, { InteractionMode } from './DiagramCanvas';
import PropertiesSidebar from './PropertiesSidebar';
import PlaygroundToolbar from './PlaygroundToolbar';
import AddNodePanel from './AddNodePanel';
import ContextualActionBar from './ContextualActionBar';
import { customAlphabet } from 'nanoid';

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
    onExport: (format: 'svg' | 'png' | 'json') => void;
}

const Playground: React.FC<PlaygroundProps> = (props) => {
    const { data, onDataChange, onExit, selectedIds, setSelectedIds } = props;

    const [interactionMode, setInteractionMode] = useState<InteractionMode>('select');
    const [isAddNodePanelOpen, setIsAddNodePanelOpen] = useState(false);
    const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
    const [nodeToPlace, setNodeToPlace] = useState<IconType | null>(null);
    const [linkSourceNodeId, setLinkSourceNodeId] = useState<string | null>(null);
    const [linkPreviewCoords, setLinkPreviewCoords] = useState<{x: number, y: number} | null>(null);
    const [lassoRect, setLassoRect] = useState<{x: number, y: number, width: number, height: number} | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);
    const fitScreenRef = useRef<(() => void) | null>(null);
    const centerViewRef = useRef<(() => void) | null>(null);
    
    const nodesAndContainersById = useMemo(() => {
        const map = new Map<string, Node | Container>();
        data.nodes.forEach(node => map.set(node.id, node));
        (data.containers || []).forEach(container => map.set(container.id, container));
        return map;
    }, [data.nodes, data.containers]);

    const handleFitToScreen = () => fitScreenRef.current?.();
    const handleCenterView = () => centerViewRef.current?.();

    const handleSetInteractionMode = (mode: InteractionMode) => {
        setInteractionMode(mode);
        setIsAddNodePanelOpen(mode === 'addNode');
        setLinkSourceNodeId(null);
        if (mode !== 'addNode') {
            setNodeToPlace(null);
        }
    };
    
    const handleSelectNodeType = (type: IconType) => {
        setNodeToPlace(type);
        setIsAddNodePanelOpen(false);
    };

    const handleCanvasClick = (coords: { x: number; y: number }) => {
        if (interactionMode === 'addNode' && nodeToPlace) {
            const newNode: Node = {
                id: `${nodeToPlace}-${nanoid()}`,
                label: `${nodeToPlace.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
                type: nodeToPlace,
                description: 'A new component.',
                x: Math.round(coords.x / 10) * 10,
                y: Math.round(coords.y / 10) * 10,
                width: 150,
                height: 60,
                locked: false,
            };
            const newData = { ...data, nodes: [...data.nodes, newNode] };
            onDataChange(newData);
            setNodeToPlace(null);
            setInteractionMode('select');
        }
    };

    const handleNodeClick = (nodeId: string) => {
        if (interactionMode === 'connect') {
            if (!linkSourceNodeId) {
                setLinkSourceNodeId(nodeId);
            } else if (linkSourceNodeId !== nodeId) {
                const newLink: Link = {
                    id: `link-${nanoid()}`,
                    source: linkSourceNodeId,
                    target: nodeId,
                    style: 'solid',
                };
                const newData = { ...data, links: [...data.links, newLink] };
                onDataChange(newData);
                setLinkSourceNodeId(null);
                setInteractionMode('select');
            }
        }
    };
    
    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        
        const newNodes = data.nodes.filter(n => !selectedIds.includes(n.id));
        const newContainers = data.containers?.filter(c => !selectedIds.includes(c.id)) || [];
        const newLinks = data.links.filter(l => 
            !selectedIds.includes(typeof l.source === 'string' ? l.source : l.source.id) &&
            !selectedIds.includes(typeof l.target === 'string' ? l.target : l.target.id)
        );

        onDataChange({ ...data, nodes: newNodes, containers: newContainers, links: newLinks });
        setSelectedIds([]);
    };
    
    const handleDuplicateSelected = () => {
        if (selectedIds.length === 0) return;
        const newNodes: Node[] = [];
        const newContainers: Container[] = [];
        const newSelectedIds: string[] = [];
        const offset = 20;

        selectedIds.forEach(id => {
            const item = nodesAndContainersById.get(id);
            if (!item) return;

            if (!('childNodeIds' in item)) { // It's a Node
                const newNode: Node = {
                    ...(item as Node),
                    id: `${item.type}-${nanoid()}`,
                    x: (item as Node).x + offset,
                    y: (item as Node).y + offset,
                };
                newNodes.push(newNode);
                newSelectedIds.push(newNode.id);
            }
        });
        
        onDataChange({ ...data, nodes: [...data.nodes, ...newNodes], containers: [...(data.containers || []), ...newContainers] });
        setSelectedIds(newSelectedIds);
    };
    
    const selectedItem = useMemo(() => {
        if (!data || selectedIds.length !== 1) return null;
        return nodesAndContainersById.get(selectedIds[0]) || null;
    }, [data, selectedIds, nodesAndContainersById]);

    const handlePropertyChange = (itemId: string, newProps: Partial<Node> | Partial<Container>) => {
        if (!data) return;
        const newNodes = data.nodes.map(n => n.id === itemId ? { ...n, ...(newProps as Partial<Node>) } : n);
        const newContainers = data.containers?.map(c => c.id === itemId ? { ...c, ...(newProps as Partial<Container>) } : c);
        onDataChange({ ...data, nodes: newNodes, containers: newContainers }, true);
    };
    
    const handleNudge = (itemId: string, direction: 'up' | 'down' | 'left' | 'right') => {
         if (!data) return;
         const nudgeAmount = 5;
         const newNodes = data.nodes.map(n => {
             if (n.id === itemId) {
                 const updatedNode = {...n};
                 if (direction === 'up') updatedNode.y -= nudgeAmount;
                 if (direction === 'down') updatedNode.y += nudgeAmount;
                 if (direction === 'left') updatedNode.x -= nudgeAmount;
                 if (direction === 'right') updatedNode.x += nudgeAmount;
                 return updatedNode;
             }
             return n;
         });
         onDataChange({ ...data, nodes: newNodes }, true);
    };

    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (interactionMode === 'connect' && linkSourceNodeId && svgRef.current) {
            const svgNode = svgRef.current;
            const svgPoint = svgNode.createSVGPoint();
            svgPoint.x = event.clientX;
            svgPoint.y = event.clientY;
            const transformedPoint = svgPoint.matrixTransform((svgNode.getScreenCTM() as DOMMatrix).inverse());
            setLinkPreviewCoords(transformedPoint);
        } else {
            setLinkPreviewCoords(null);
        }
    }, [interactionMode, linkSourceNodeId]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    const linkPreview = useMemo(() => {
        if (!linkSourceNodeId || !linkPreviewCoords) return null;
        const sourceNode = data.nodes.find(n => n.id === linkSourceNodeId);
        if (!sourceNode) return null;
        return { sourceNode, targetCoords: linkPreviewCoords };
    }, [linkSourceNodeId, linkPreviewCoords, data.nodes]);
    
    const actionBarPosition = useMemo(() => {
        if (selectedIds.length === 0) return null;
        let minX = Infinity, minY = Infinity;
        
        selectedIds.forEach(id => {
            const item = nodesAndContainersById.get(id);
            if (!item) return;
            const itemX = 'x' in item && 'width' in item ? (item as Node).x - (item as Node).width / 2 : (item as Container).x;
            const itemY = 'y' in item && 'height' in item ? (item as Node).y - (item as Node).height / 2 : (item as Container).y;
            if(itemX < minX) minX = itemX;
            if(itemY < minY) minY = itemY;
        });

        if (minX === Infinity) return null;

        return { x: minX, y: minY - 50 };
    }, [selectedIds, nodesAndContainersById]);

    return (
        <div className="w-screen h-screen bg-[var(--color-bg)] flex flex-col md:flex-row overflow-hidden">
            <PlaygroundToolbar
                interactionMode={interactionMode}
                onSetInteractionMode={handleSetInteractionMode}
                onDeleteSelected={handleDeleteSelected}
                isPropertiesPanelOpen={isPropertiesPanelOpen}
                onToggleProperties={() => setIsPropertiesPanelOpen(p => !p)}
                onFitToScreen={handleFitToScreen}
                onCenterView={handleCenterView}
                {...props}
            />

            <main className="flex-1 flex flex-col relative">
                <header className="flex justify-between items-center p-3 border-b border-[var(--color-border)] bg-[var(--color-panel-bg)]">
                    <h1 className="text-lg font-semibold truncate pr-4">{data.title}</h1>
                    <button onClick={onExit} className="px-3 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center flex-shrink-0">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span className="hidden md:inline">Exit Playground</span>
                    </button>
                </header>
                <div className="flex-1 relative pb-20 md:pb-0">
                     <DiagramCanvas
                        forwardedRef={svgRef}
                        fitScreenRef={fitScreenRef}
                        centerViewRef={centerViewRef}
                        data={data}
                        onDataChange={onDataChange}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        interactionMode={interactionMode === 'addNode' && nodeToPlace ? 'addNode' : interactionMode}
                        onInteractionCanvasClick={handleCanvasClick}
                        onInteractionNodeClick={handleNodeClick}
                        linkPreview={linkPreview}
                        lassoRect={lassoRect}
                        setLassoRect={setLassoRect}
                    />
                     {actionBarPosition && (
                        <ContextualActionBar 
                            position={actionBarPosition}
                            onDelete={handleDeleteSelected}
                            onDuplicate={handleDuplicateSelected}
                            onToggleProperties={() => setIsPropertiesPanelOpen(p => !p)}
                            selectedCount={selectedIds.length}
                        />
                    )}
                </div>
            </main>
            
            {/* Desktop Sidebars & Mobile Overlays */}
            <AnimatePresence>
                {isAddNodePanelOpen && (
                    <motion.div 
                        key="add-node-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-20 md:hidden"
                        onClick={() => { setIsAddNodePanelOpen(false); setInteractionMode('select'); }}
                    />
                )}
            </AnimatePresence>
            <div className="fixed md:relative inset-0 md:inset-auto z-30 md:z-10 pointer-events-none">
                 <AnimatePresence>
                    {isAddNodePanelOpen && (
                        <motion.div
                            key="add-node-panel"
                            initial={{ x: '-100%', y: '0%' }}
                            animate={{ x: 0, y: 0 }}
                            exit={{ x: '-100%', y: '0%' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                            className="absolute bottom-0 left-0 md:relative md:h-full pointer-events-auto"
                        >
                            <div className="md:h-full w-screen max-w-[320px] md:w-80">
                                <AddNodePanel onSelectNodeType={handleSelectNodeType} onClose={() => { setIsAddNodePanelOpen(false); setInteractionMode('select'); }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            <AnimatePresence>
                {isPropertiesPanelOpen && (
                     <motion.aside 
                        key="properties-sidebar"
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="w-[350px] bg-[var(--color-panel-bg)] p-6 border-l border-[var(--color-border)] shadow-sm h-full flex-col hidden md:flex"
                     >
                        <PropertiesSidebar
                            item={selectedItem}
                            onPropertyChange={handlePropertyChange}
                            selectedCount={selectedIds.length}
                            onNudge={handleNudge}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isPropertiesPanelOpen && (
                    <motion.div
                        key="properties-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-30 md:hidden"
                        onClick={() => setIsPropertiesPanelOpen(false)}
                    />
                )}
                {isPropertiesPanelOpen && (
                    <motion.div
                        key="properties-sheet"
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="fixed bottom-0 left-0 right-0 h-[60vh] bg-[var(--color-panel-bg)] rounded-t-2xl border-t border-[var(--color-border)] shadow-2xl p-4 z-40 md:hidden"
                    >
                         <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-4" />
                         <div className="overflow-y-auto h-[calc(60vh-40px)] px-2">
                             <PropertiesSidebar
                                item={selectedItem}
                                onPropertyChange={handlePropertyChange}
                                selectedCount={selectedIds.length}
                                onNudge={handleNudge}
                            />
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Playground;

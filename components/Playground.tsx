
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagramData, Node, Link, Container, IconType } from '../types';
import DiagramCanvas, { InteractionMode } from './DiagramCanvas';
import PropertiesSidebar from './PropertiesSidebar';
import PlaygroundToolbar from './PlaygroundToolbar';
import AddNodePanel from './AddNodePanel';
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

    const svgRef = useRef<SVGSVGElement>(null);
    const fitScreenRef = useRef<(() => void) | null>(null);
    
    const nodesById = useMemo(() => new Map(data.nodes.map(node => [node.id, node])), [data.nodes]);

    const handleFitToScreen = () => fitScreenRef.current?.();

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
    
    const selectedItem = useMemo(() => {
        if (!data || selectedIds.length !== 1) return null;
        const selectedId = selectedIds[0];
        return [...(data.nodes || []), ...(data.containers || [])].find(item => item.id === selectedId);
    }, [data, selectedIds]);

    const handlePropertyChange = (itemId: string, newProps: Partial<Node> | Partial<Container>) => {
        if (!data) return;
        const newNodes = data.nodes.map(n => n.id === itemId ? { ...n, ...newProps } : n);
        const newContainers = data.containers?.map(c => c.id === itemId ? { ...c, ...newProps as Partial<Container> } : c);
        onDataChange({ ...data, nodes: newNodes, containers: newContainers }, true);
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

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    const linkPreview = useMemo(() => {
        if (!linkSourceNodeId || !linkPreviewCoords) return null;
        const sourceNode = nodesById.get(linkSourceNodeId);
        if (!sourceNode) return null;
        return { sourceNode, targetCoords: linkPreviewCoords };
    }, [linkSourceNodeId, linkPreviewCoords, nodesById]);

    return (
        <div className="w-screen h-screen bg-[var(--color-bg)] flex overflow-hidden">
            <PlaygroundToolbar
                interactionMode={interactionMode}
                onSetInteractionMode={handleSetInteractionMode}
                onDeleteSelected={handleDeleteSelected}
                isPropertiesPanelOpen={isPropertiesPanelOpen}
                onToggleProperties={() => setIsPropertiesPanelOpen(p => !p)}
                onFitToScreen={handleFitToScreen}
                {...props}
            />
            <AnimatePresence>
                {isAddNodePanelOpen && (
                    <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}>
                        <AddNodePanel onSelectNodeType={handleSelectNodeType} onClose={() => { setIsAddNodePanelOpen(false); setInteractionMode('select'); }} />
                    </motion.div>
                )}
            </AnimatePresence>
            <main className="flex-1 flex flex-col relative">
                <header className="flex justify-between items-center p-3 border-b border-[var(--color-border)] bg-[var(--color-panel-bg)]">
                    <h1 className="text-lg font-semibold">{data.title}</h1>
                    <button onClick={onExit} className="px-4 py-2 bg-[var(--color-button-bg)] text-sm font-medium text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        Exit Playground
                    </button>
                </header>
                <div className="flex-1 relative">
                     <DiagramCanvas
                        forwardedRef={svgRef}
                        fitScreenRef={fitScreenRef}
                        data={data}
                        onDataChange={onDataChange}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        interactionMode={interactionMode === 'addNode' && nodeToPlace ? 'addNode' : interactionMode}
                        onInteractionCanvasClick={handleCanvasClick}
                        onInteractionNodeClick={handleNodeClick}
                        linkPreview={linkPreview}
                    />
                </div>
            </main>
            <AnimatePresence>
                {isPropertiesPanelOpen && (
                     <motion.aside 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="w-[350px] bg-[var(--color-panel-bg)] p-6 border-l border-[var(--color-border)] shadow-sm h-full flex flex-col"
                     >
                        <PropertiesSidebar
                            item={selectedItem}
                            onPropertyChange={handlePropertyChange}
                            selectedCount={selectedIds.length}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Playground;



import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { select, pointer } from 'd3-selection';
import { drag, D3DragEvent } from 'd3-drag';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import { DiagramData, Node, Link, Container } from '../types';
import ArchitectureIcon from './ArchitectureIcon';
import ContextMenu from './ContextMenu';
import { motion } from 'framer-motion';

const GRID_SIZE = 10;

export type InteractionMode = 'select' | 'pan' | 'addNode' | 'connect' | 'addContainer';

interface DiagramCanvasProps {
  data: DiagramData;
  onDataChange: (newData: DiagramData, fromHistory?: boolean) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  forwardedRef: React.RefObject<SVGSVGElement>;
  fitScreenRef: React.RefObject<(() => void) | null>;
  interactionMode?: InteractionMode;
  onInteractionCanvasClick?: (coords: { x: number, y: number }) => void;
  onInteractionNodeClick?: (nodeId: string) => void;
  linkPreview?: { sourceNode: Node; targetCoords: { x: number; y: number } } | null;
  onTransformChange?: (transform: ZoomTransform) => void;
  onContainerCreation?: (rect: Rect) => void;
  onLinkDragStart?: (nodeId: string, event: D3DragEvent<any, any, any>) => void;
  onLinkDrag?: (event: D3DragEvent<any, any, any>) => void;
  onLinkDragEnd?: (nodeId: string, event: D3DragEvent<any, any, any>) => void;
  hoveredNodeId?: string | null;
}

interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ 
    data, onDataChange, selectedIds, setSelectedIds, forwardedRef, fitScreenRef,
    interactionMode = 'select', onInteractionCanvasClick, onInteractionNodeClick, linkPreview,
    onTransformChange, onContainerCreation, onLinkDragStart, onLinkDrag, onLinkDragEnd, hoveredNodeId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: Node | Link | Container; } | null>(null);
  const [containerCreationRect, setContainerCreationRect] = useState<{ start: Point, end: Point } | null>(null);
  
  const nodesById = useMemo(() => new Map(data.nodes.map(node => [node.id, node])), [data.nodes]);
  const isSelected = (id: string) => selectedIds.includes(id);

  const tierColors = useMemo(() => {
    const colors = [
      'var(--color-tier-1)', 'var(--color-tier-2)', 'var(--color-tier-3)',
      'var(--color-tier-4)', 'var(--color-tier-5)', 'var(--color-tier-6)',
    ];
    const tiers = data.containers?.filter(c => c.type === 'tier').sort((a, b) => a.y - b.y) || [];
    const colorMap = new Map<string, string>();
    tiers.forEach((tier, index) => {
      colorMap.set(tier.id, colors[index % colors.length]);
    });
    return colorMap;
  }, [data.containers]);

  const handleItemSelection = (e: React.MouseEvent, id: string) => {
    if (interactionMode !== 'select' && interactionMode !== 'pan') return;
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    } else {
      setSelectedIds([id]);
    }
  };

  useEffect(() => {
    if (!forwardedRef.current) return;
    const svg = select(forwardedRef.current);
    const parent = containerRef.current;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter(event => {
        const isHandle = (event.target as HTMLElement).classList.contains('connection-handle');
        if (isHandle || interactionMode === 'addContainer' || event.defaultPrevented) return false;
        if (interactionMode === 'pan') return event.type === 'wheel' || event.type === 'mousedown';
        return event.type === 'wheel' || event.button === 2 || (interactionMode === 'select' && (event.target as HTMLElement)?.tagName === 'svg');
      })
      .on('zoom', (event) => {
        setViewTransform(event.transform);
        if (onTransformChange) onTransformChange(event.transform);
      });
      
    svg.call(zoomBehavior).on("dblclick.zoom", null);
    
    if (interactionMode === 'addContainer' && onContainerCreation) {
        const containerDrag = drag<SVGSVGElement, unknown>()
            .on('start', event => {
                const [x, y] = pointer(event, svg.node()!);
                setContainerCreationRect({ start: { x, y }, end: { x, y } });
            })
            .on('drag', event => {
                const [x, y] = pointer(event, svg.node()!);
                setContainerCreationRect(prev => prev ? { ...prev, end: { x, y } } : null);
            })
            .on('end', () => {
                if (containerCreationRect) {
                    const { start, end } = containerCreationRect;
                    const newRect = {
                        x: Math.round(Math.min(start.x, end.x)),
                        y: Math.round(Math.min(start.y, end.y)),
                        width: Math.round(Math.abs(start.x - end.x)),
                        height: Math.round(Math.abs(start.y - end.y)),
                    };
                    if (newRect.width > 20 && newRect.height > 20) {
                        onContainerCreation(newRect);
                    }
                }
                setContainerCreationRect(null);
            });
        svg.call(containerDrag);
    } else {
        svg.on('.drag', null);
    }
    
    const fitToScreen = () => {
      const contentGroup = svg.select<SVGGElement>('#diagram-content').node();
      if (!contentGroup || !parent || data.nodes.length === 0) return;
      const bounds = contentGroup.getBBox();
      const parentWidth = parent.clientWidth; const parentHeight = parent.clientHeight;
      const { width: diagramWidth, height: diagramHeight, x: diagramX, y: diagramY } = bounds;
      if (diagramWidth <= 0 || diagramHeight <= 0) return;
      const scale = Math.min(4, 0.95 / Math.max(diagramWidth / parentWidth, diagramHeight / parentHeight));
      const tx = parentWidth / 2 - (diagramX + diagramWidth / 2) * scale;
      const ty = parentHeight / 2 - (diagramY + diagramHeight / 2) * scale;
      svg.transition().duration(750).call(zoomBehavior.transform, zoomIdentity.translate(tx, ty).scale(scale));
    };
    
    if (fitScreenRef) fitScreenRef.current = fitToScreen;
    
    const handleCanvasClick = (event: PointerEvent) => {
        if (!event.defaultPrevented && (event.target as SVGSVGElement).tagName === 'svg') {
            const transformedPoint = pointer(event, svg.node());
            if (interactionMode === 'addNode' && onInteractionCanvasClick) {
                onInteractionCanvasClick({ x: transformedPoint[0], y: transformedPoint[1] });
            } else {
                setSelectedIds([]);
                setContextMenu(null);
            }
        }
    };
    
    const svgNode = svg.node();
    if (svgNode) svgNode.addEventListener('click', handleCanvasClick as EventListener);

    return () => {
      if (svgNode) svgNode.removeEventListener('click', handleCanvasClick as EventListener);
      svg.on('.zoom', null).on('.drag', null);
      if (fitScreenRef) fitScreenRef.current = null;
    }
  }, [forwardedRef, setSelectedIds, data, fitScreenRef, interactionMode, onInteractionCanvasClick, onTransformChange, onContainerCreation]);

  const handleItemContextMenu = (e: React.MouseEvent, item: Node | Link | Container) => {
    e.preventDefault(); e.stopPropagation();
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, item });
    }
  };
  
  const handleDeleteItem = (item: Node | Link | Container) => {
    const { id } = item;
    const newNodes = data.nodes.filter(n => n.id !== id);
    const newContainers = data.containers?.filter(c => c.id !== id);
    const remainingNodeIds = new Set(newNodes.map(n => n.id));
    const newLinks = data.links.filter(l => l.id !== id && remainingNodeIds.has(typeof l.source === 'string' ? l.source : l.source.id) && remainingNodeIds.has(typeof l.target === 'string' ? l.target : l.target.id));
    onDataChange({ ...data, nodes: newNodes, containers: newContainers, links: newLinks }, true);
    setContextMenu(null);
  }

  const obstacles = useMemo(() => {
    return [
        ...(data.nodes.map(n => ({ x: n.x - n.width / 2, y: n.y - n.height / 2, width: n.width, height: n.height }))),
        ...(data.containers?.map(c => ({ x: c.x, y: c.y, width: c.width, height: c.height })) || [])
    ];
  }, [data.nodes, data.containers]);
  
  const handleNodeClick = (e: React.MouseEvent, id: string) => {
      if (interactionMode === 'connect' && onInteractionNodeClick) {
          e.stopPropagation();
          onInteractionNodeClick(id);
      } else {
          handleItemSelection(e, id);
      }
  };
  
  const getCursor = () => {
    switch(interactionMode) {
      case 'addNode': case 'addContainer': return 'crosshair';
      case 'connect': return 'pointer';
      case 'pan': return 'grab';
      case 'select': return 'default';
      default: return 'default';
    }
  };

  const finalContainerCreationRect = useMemo(() => {
    if (!containerCreationRect) return null;
    const { start, end } = containerCreationRect;
    return {
        x: Math.min(start.x, end.x), y: Math.min(start.y, end.y),
        width: Math.abs(start.x - end.x), height: Math.abs(start.y - end.y),
    };
  }, [containerCreationRect]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[var(--color-canvas-bg)] rounded-b-2xl">
      <svg ref={forwardedRef} className={`w-full h-full absolute inset-0 ${interactionMode === 'pan' ? 'active:cursor-grabbing' : ''}`} style={{ cursor: getCursor() }}>
        <defs>
          <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--color-grid-dot)"></circle>
          </pattern>
          <marker id="arrowhead" viewBox="-0 -5 10 10" refX="5" refY="0" orient="auto" markerWidth="6" markerHeight="6" overflow="visible">
            <path d="M 0,-5 L 10 ,0 L 0,5" style={{ stroke: 'none' }}></path>
          </marker>
          <marker id="arrowhead-reverse" viewBox="-10 -5 10 10" refX="-5" refY="0" orient="auto" markerWidth="6" markerHeight="6" overflow="visible">
            <path d="M 0,-5 L -10 ,0 L 0,5" style={{ stroke: 'none' }}></path>
          </marker>
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="var(--color-shadow)" floodOpacity="0.1" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g id="diagram-content" transform={viewTransform.toString()}>
            <g> {/* Containers Layer */}
                {data.containers?.map(container => ( <DiagramContainer key={container.id} container={container} data={data} onDataChange={onDataChange} isSelected={isSelected(container.id)} onSelect={handleItemSelection} onContextMenu={handleItemContextMenu} selectedIds={selectedIds} fillColor={container.color || (container.type === 'tier' ? tierColors.get(container.id) || 'var(--color-tier-default)' : 'var(--color-tier-default)')} interactionMode={interactionMode} /> ))}
            </g>
            <g> {/* Links Layer */}
                {data.links.map((link) => {
                    const sourceNode = nodesById.get(typeof link.source === 'string' ? link.source : link.source.id);
                    const targetNode = nodesById.get(typeof link.target === 'string' ? link.target : link.target.id);
                    if (!sourceNode || !targetNode) return null;
                    return <DiagramLink key={link.id} link={link} source={sourceNode} target={targetNode} obstacles={obstacles.filter(o => o.x !== (sourceNode.x - sourceNode.width/2) && o.x !== (targetNode.x - targetNode.width/2))} onContextMenu={handleItemContextMenu} isSelected={isSelected(link.id)} onSelect={handleItemSelection} />;
                })}
            </g>
            <g> {/* Nodes Layer */}
                {data.nodes.map(node => ( <DiagramNode key={node.id} node={node} data={data} onDataChange={onDataChange} isSelected={isSelected(node.id)} onSelect={handleNodeClick} onContextMenu={handleItemContextMenu} selectedIds={selectedIds} interactionMode={interactionMode} onLinkDragStart={onLinkDragStart} onLinkDrag={onLinkDrag} onLinkDragEnd={onLinkDragEnd} hoveredNodeId={hoveredNodeId} /> ))}
            </g>
            {linkPreview && ( <path d={`M ${linkPreview.sourceNode.x} ${linkPreview.sourceNode.y} L ${linkPreview.targetCoords.x} ${linkPreview.targetCoords.y}`} stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 6" className="pointer-events-none" markerEnd="url(#arrowhead)" /> )}
            {finalContainerCreationRect && ( <rect x={finalContainerCreationRect.x} y={finalContainerCreationRect.y} width={finalContainerCreationRect.width} height={finalContainerCreationRect.height} fill="rgba(249, 215, 227, 0.3)" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 4" className="pointer-events-none"/> )}
        </g>
      </svg>
      {contextMenu && ( <ContextMenu x={contextMenu.x} y={contextMenu.y} options={[{ label: 'Delete', onClick: () => handleDeleteItem(contextMenu.item) }]} onClose={() => setContextMenu(null)} /> )}
    </div>
  );
};

// --- Sub-components ---
interface DraggableProps { data: DiagramData; onDataChange: (data: DiagramData, fromHistory?: boolean) => void; selectedIds: string[]; interactionMode: InteractionMode; }

// Fix: Implemented the DiagramContainer component which was previously empty.
const DiagramContainer = memo<{ container: Container; isSelected: boolean; onSelect: (e: React.MouseEvent, id: string) => void; onContextMenu: (e: React.MouseEvent, item: Container) => void; fillColor: string; } & DraggableProps>(({ container, isSelected, onSelect, onContextMenu, fillColor, data, onDataChange, interactionMode }) => {
    const ref = useRef<SVGGElement>(null);

    useEffect(() => {
        if (!ref.current || interactionMode !== 'select') {
            select(ref.current).on('.drag', null);
            return;
        }
        const g = select(ref.current);
        let startPositions = new Map<string, { x: number, y: number }>();
        
        const dragHandler = drag<SVGGElement, unknown>()
            .on('start', function (event) {
                startPositions.clear();
                const childNodes = data.nodes.filter(n => container.childNodeIds.includes(n.id));
                startPositions.set(container.id, { x: container.x, y: container.y });
                childNodes.forEach(n => startPositions.set(n.id, { x: n.x, y: n.y }));
                // select(this).raise(); // This was causing rendering issues.
                event.sourceEvent.stopPropagation();
            })
            .on('drag', function (event) {
                const dx = event.x - event.subject.x;
                const dy = event.y - event.subject.y;

                const newNodes = data.nodes.map(n => {
                    const startPos = startPositions.get(n.id);
                    if (startPos) return { ...n, x: startPos.x + dx, y: startPos.y + dy };
                    return n;
                });

                const newContainers = (data.containers || []).map(c => {
                    const startPos = startPositions.get(c.id);
                    if (startPos) return { ...c, x: startPos.x + dx, y: startPos.y + dy };
                    return c;
                });

                onDataChange({ ...data, nodes: newNodes, containers: newContainers }, true);
            });
        g.call(dragHandler);
    }, [container.id, container.x, container.y, container.childNodeIds, data, onDataChange, interactionMode]);
    
    return (
        <g
            ref={ref}
            transform={`translate(${container.x}, ${container.y})`}
            onClick={(e) => onSelect(e, container.id)}
            onContextMenu={(e) => onContextMenu(e, container)}
            style={{ cursor: interactionMode === 'select' ? 'move' : 'default' }}
        >
            <rect
                width={container.width}
                height={container.height}
                rx={16}
                ry={16}
                fill={fillColor}
                stroke={isSelected ? 'var(--color-accent)' : 'transparent'}
                strokeWidth={isSelected ? 3 : 0}
                strokeDasharray={container.type === 'availability-zone' ? "8 4" : undefined}
            />
            <text
                x={20}
                y={30}
                fill="var(--color-text-secondary)"
                style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', pointerEvents: 'none' }}
            >
                {container.label}
            </text>
        </g>
    );
});

// Fix: Implemented the NodeShape component which was previously empty.
const NodeShape: React.FC<{node: Node, isSelected: boolean}> = ({ node, isSelected }) => {
    const commonProps = {
        width: node.width,
        height: node.height,
        fill: node.color || 'var(--color-node-bg)',
        stroke: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
        strokeWidth: isSelected ? 3 : 2,
    };

    if (node.shape === 'diamond') {
        const path = `M ${node.width / 2} 0 L ${node.width} ${node.height / 2} L ${node.width / 2} ${node.height} L 0 ${node.height / 2} Z`;
        return <path d={path} {...commonProps} />;
    }
    
    if (node.shape === 'ellipse') {
      return <ellipse cx={node.width/2} cy={node.height/2} rx={node.width/2} ry={node.height/2} {...commonProps} />;
    }

    return <rect rx={12} ry={12} {...commonProps} />;
};

// Fix: Implemented the ConnectionHandle component which was previously empty.
const ConnectionHandle = memo<{ node: Node; position: 'top' | 'right' | 'bottom' | 'left'; onLinkDragStart: (nodeId: string, event: D3DragEvent<any, any, any>) => void; onLinkDrag: (event: D3DragEvent<any, any, any>) => void; onLinkDragEnd: (nodeId: string, event: D3DragEvent<any, any, any>) => void; }>(({ node, position, onLinkDragStart, onLinkDrag, onLinkDragEnd }) => {
    const ref = useRef<SVGCircleElement>(null);
    const getPosition = () => {
        switch(position) {
            case 'top': return { cx: node.width / 2, cy: 0 };
            case 'right': return { cx: node.width, cy: node.height / 2 };
            case 'bottom': return { cx: node.width / 2, cy: node.height };
            case 'left': return { cx: 0, cy: node.height / 2 };
        }
    };

    useEffect(() => {
        if (!ref.current) return;
        const circle = select(ref.current);
        const dragHandler = drag<SVGCircleElement, unknown>()
            .on('start', event => {
                event.sourceEvent.stopPropagation();
                onLinkDragStart(node.id, event);
            })
            .on('drag', event => {
                onLinkDrag(event);
            })
            .on('end', event => {
                onLinkDragEnd(node.id, event);
            });
        circle.call(dragHandler);
    }, [node.id, onLinkDragStart, onLinkDrag, onLinkDragEnd]);
    
    return (
        <circle
            ref={ref}
            {...getPosition()}
            r="8"
            fill="var(--color-accent)"
            stroke="var(--color-panel-bg)"
            strokeWidth="2"
            className="connection-handle cursor-pointer"
        />
    );
});

const DiagramNode = memo<{ node: Node; isSelected: boolean; onSelect: (e: React.MouseEvent, id: string) => void; onContextMenu: (e: React.MouseEvent, item: Node) => void; hoveredNodeId?: string | null; onLinkDragStart?: (nodeId: string, event: D3DragEvent<any, any, any>) => void; onLinkDrag?: (event: D3DragEvent<any, any, any>) => void; onLinkDragEnd?: (nodeId: string, event: D3DragEvent<any, any, any>) => void; } & DraggableProps>(({ node, isSelected, onSelect, onContextMenu, onLinkDragStart, onLinkDrag, onLinkDragEnd, hoveredNodeId, ...props }) => {
    const ref = useRef<SVGGElement>(null);
    const isDropTarget = hoveredNodeId === node.id;
    useEffect(() => {
        if (!ref.current || node.locked || props.interactionMode !== 'select') { select(ref.current).on('.drag', null); return; }
        const g = select(ref.current);
        let startPositions = new Map<string, {x: number, y: number}>();
        const dragHandler = drag<SVGGElement, unknown>()
            .on('start', function(event) {
                if ((event.sourceEvent.target as HTMLElement).classList.contains('connection-handle')) return; 
                startPositions.clear();
                const { selectedIds } = props;
                const isDraggingSelected = selectedIds.includes(node.id);
                const idsToMove = isDraggingSelected ? selectedIds : [node.id];
                props.data.nodes.forEach(n => { if (idsToMove.includes(n.id)) startPositions.set(n.id, { x: n.x, y: n.y }); });
                select(this).raise(); event.sourceEvent.stopPropagation();
            })
            .on('drag', function(event) {
                 if ((event.sourceEvent.target as HTMLElement).classList.contains('connection-handle')) return; 
                 const dx = event.x - event.subject.x; const dy = event.y - event.subject.y;
                const { data, onDataChange } = props;
                const newNodes = data.nodes.map(n => { const startPos = startPositions.get(n.id); if (startPos && !n.locked) return { ...n, x: startPos.x + dx, y: startPos.y + dy }; return n; });
                onDataChange({ ...data, nodes: newNodes }, true);
            });
        g.call(dragHandler);
    }, [node.id, props.data.nodes, props.selectedIds, node.locked, props.interactionMode, props.onDataChange]);
    const getCursorStyle = () => { if (node.locked) return 'default'; if (props.interactionMode === 'connect') return 'pointer'; if (props.interactionMode === 'select') return 'move'; return 'default'; };
    if (node.type === 'neuron') { return ( <g id={`node-g-${node.id}`} ref={ref} transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`} style={{ cursor: getCursorStyle() }} data-node-id={node.id} onClick={(e) => onSelect(e, node.id)} onContextMenu={(e) => onContextMenu(e, node)} > <circle cx={node.width / 2} cy={node.height / 2} r={Math.min(node.width, node.height) / 2} fill={node.color || "#CCCCCC"} stroke={isSelected ? 'var(--color-accent)' : '#000000'} strokeWidth={isSelected ? 2 : 1} /> </g> ); }
    if (node.type === 'layer-label' || node.type === 'group-label') { return ( <g id={`node-g-${node.id}`} ref={ref} transform={`translate(${node.x}, ${node.y})`} style={{ cursor: getCursorStyle(), pointerEvents: 'none' }} > <text textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-primary)" fontSize={node.type === 'group-label' ? "18" : "16"} fontWeight="600">{node.label}</text> </g> ); }
    return (
        <motion.g id={`node-g-${node.id}`} ref={ref} transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`} style={{ cursor: getCursorStyle(), filter: 'url(#drop-shadow)' }} data-node-id={node.id} onClick={(e) => onSelect(e, node.id)} onContextMenu={(e) => onContextMenu(e, node)} whileHover={props.interactionMode === 'select' ? { scale: 1.05 } : {}} animate={{ scale: isDropTarget ? 1.1 : 1, transition: { type: 'spring', stiffness: 400, damping: 15 } }} >
            <NodeShape node={node} isSelected={isSelected} />
             {isDropTarget && ( <motion.rect x={-5} y={-5} width={node.width + 10} height={node.height + 10} rx={16} ry={16} fill="none" stroke="var(--color-accent)" strokeWidth="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ pointerEvents: 'none' }} /> )}
            <foreignObject x="12" y="12" width="32" height="32"> <ArchitectureIcon type={node.type} className="w-8 h-8" /> </foreignObject>
            <foreignObject x="52" y="10" width={node.width - 60} height={node.height - 20} > <div className="label-text text-sm font-medium leading-tight h-full flex items-center" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{node.label}</div> </foreignObject>
            {node.locked && ( <path d="M12 1.5A3.5 3.5 0 008.5 5v1.5H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1.5V5A3.5 3.5 0 0012 1.5zM12 3a2 2 0 012 2v1.5H10V5a2 2 0 012-2z" fill="var(--color-text-tertiary)" transform={`translate(${node.width - 20}, 4) scale(0.7)`} /> )}
            {isSelected && props.selectedIds.length === 1 && onLinkDragStart && onLinkDrag && onLinkDragEnd && ( <> <ConnectionHandle node={node} position="top" onLinkDragStart={onLinkDragStart} onLinkDrag={onLinkDrag} onLinkDragEnd={onLinkDragEnd}/> <ConnectionHandle node={node} position="right" onLinkDragStart={onLinkDragStart} onLinkDrag={onLinkDrag} onLinkDragEnd={onLinkDragEnd}/> <ConnectionHandle node={node} position="bottom" onLinkDragStart={onLinkDragStart} onLinkDrag={onLinkDrag} onLinkDragEnd={onLinkDragEnd}/> <ConnectionHandle node={node} position="left" onLinkDragStart={onLinkDragStart} onLinkDrag={onLinkDrag} onLinkDragEnd={onLinkDragEnd}/> </> )}
        </motion.g>
    );
});

// Fix: Implemented the getOrthogonalPath function.
const getOrthogonalPath = (source: Node, target: Node, obstacles: Rect[]): Point[] => {
    const sourcePoints = {
        top: { x: source.x, y: source.y - source.height / 2 },
        bottom: { x: source.x, y: source.y + source.height / 2 },
        left: { x: source.x - source.width / 2, y: source.y },
        right: { x: source.x + source.width / 2, y: source.y },
    };
    const targetPoints = {
        top: { x: target.x, y: target.y - target.height / 2 },
        bottom: { x: target.x, y: target.y + target.height / 2 },
        left: { x: target.x - target.width / 2, y: target.y },
        right: { x: target.x + target.width / 2, y: target.y },
    };

    const sourcePoint = source.x < target.x ? sourcePoints.right : sourcePoints.left;
    const targetPoint = source.x < target.x ? targetPoints.left : targetPoints.right;
    
    const midX = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 2;

    const p1 = sourcePoint;
    const p2 = { x: midX, y: sourcePoint.y };
    const p3 = { x: midX, y: targetPoint.y };
    const p4 = targetPoint;
    
    // This is a simplified implementation and does not use the obstacles.
    // A full pathfinding algorithm (like A*) would be needed for obstacle avoidance.
    return [p1, p2, p3, p4];
};
// Fix: Implemented the pointsToPath function.
const pointsToPath = (points: Point[], radius: number): string => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const p1 = points[i-1];
        const p2 = points[i];
        const p3 = points[i+1];

        if (p3 && radius > 0) {
            const dx1 = p2.x - p1.x;
            const dy1 = p2.y - p1.y;
            const dx2 = p3.x - p2.x;
            const dy2 = p3.y - p2.y;

            const x1 = p2.x - Math.sign(dx1) * radius;
            const y1 = p2.y - Math.sign(dy1) * radius;
            path += ` L ${x1} ${y1}`;

            const x2 = p2.x + Math.sign(dx2) * radius;
            const y2 = p2.y + Math.sign(dy2) * radius;
            path += ` Q ${p2.x} ${p2.y}, ${x2} ${y2}`;

        } else {
            path += ` L ${p2.x} ${p2.y}`;
        }
    }
    return path;
};
// Fix: Implemented the getDashArray function.
const getDashArray = (style?: 'solid' | 'dotted' | 'dashed' | 'double') => {
    switch (style) {
        case 'dotted': return '2 6';
        case 'dashed': return '8 8';
        default: return 'none';
    }
};
// Fix: Implemented the getStrokeWidth function.
const getStrokeWidth = (thickness?: 'thin' | 'medium' | 'thick', isSelected?: boolean) => {
    let width = 2;
    switch (thickness) {
        case 'thin': width = 1; break;
        case 'medium': width = 2; break;
        case 'thick': width = 3.5; break;
    }
    return isSelected ? width + 1.5 : width;
};

const DiagramLink = memo<{ link: Link, source: Node, target: Node, obstacles: Rect[], onContextMenu: (e: React.MouseEvent, item: Link) => void, onSelect: (e: React.MouseEvent, id: string) => void, isSelected: boolean }>(({ link, source, target, obstacles, onContextMenu, onSelect, isSelected }) => {
    const isNeuronLink = source.type === 'neuron' && target.type === 'neuron';
    const pathPoints = useMemo(() => getOrthogonalPath(source, target, obstacles), [source, target, obstacles]);
    if (pathPoints.length < 2) return null;
    const startPoint = pathPoints[0]; const nextToStartPoint = pathPoints[1]; const endPoint = pathPoints[pathPoints.length - 1]; const prevPoint = pathPoints[pathPoints.length - 2]; if(!prevPoint) return null;
    const dxEnd = endPoint.x - prevPoint.x; const dyEnd = endPoint.y - prevPoint.y; const lengthEnd = Math.sqrt(dxEnd*dxEnd + dyEnd*dyEnd);
    if (lengthEnd > 0) { const unitDx = dxEnd/lengthEnd; const unitDy = dyEnd/lengthEnd; const targetRadius = isNeuronLink ? target.width / 2 : Math.max(target.width, target.height) / 2; const inset = isNeuronLink ? 0 : 0.5; pathPoints[pathPoints.length - 1] = { x: endPoint.x - unitDx * (targetRadius * inset), y: endPoint.y - unitDy * (targetRadius * inset) }; }
    const dxStart = startPoint.x - nextToStartPoint.x; const dyStart = startPoint.y - nextToStartPoint.y; const lengthStart = Math.sqrt(dxStart * dxStart + dyStart * dyStart);
    if (link.bidirectional && lengthStart > 0) { const unitDx = dxStart / lengthStart; const unitDy = dyStart / lengthStart; const sourceRadius = isNeuronLink ? source.width / 2 : Math.max(source.width, source.height) / 2; const inset = isNeuronLink ? 0 : 0.5; pathPoints[0] = { x: startPoint.x - unitDx * (sourceRadius * inset), y: startPoint.y - unitDy * (sourceRadius * inset) }; }
    const pathD = useMemo(() => pointsToPath(pathPoints, isNeuronLink ? 0 : 10), [pathPoints, isNeuronLink]);
    const midIndex = Math.floor(pathPoints.length / 2); const midPoint1 = pathPoints[midIndex-1]; const midPoint2 = pathPoints[midIndex]; if(!midPoint1 || !midPoint2) return null;
    const midX = (midPoint1.x + midPoint2.x) / 2; const midY = (midPoint1.y + midPoint2.y) / 2;
    const strokeColor = link.color || (isNeuronLink ? '#000000' : 'var(--color-link)');
    const strokeWidth = getStrokeWidth(isNeuronLink ? 'thin' : link.thickness, isSelected);
    return (
        <g onContextMenu={(e) => onContextMenu(e, link)} onClick={(e) => onSelect(e, link.id)}>
            {link.style === 'double' ? (
                <>
                 <motion.path d={pathD} transform="translate(-2, -2)" stroke={strokeColor} strokeWidth={strokeWidth / 2} fill="none" className="transition-all" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7, ease: "easeInOut" }} />
                 <motion.path d={pathD} transform="translate(2, 2)" stroke={strokeColor} strokeWidth={strokeWidth / 2} fill="none" className="transition-all" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.7, ease: "easeInOut" }} />
                </>
            ) : (
                <motion.path d={pathD} stroke={strokeColor} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={getDashArray(link.style)}
                    markerStart={link.bidirectional ? "url(#arrowhead-reverse)" : undefined}
                    markerEnd={isNeuronLink ? undefined : "url(#arrowhead)"}
                    className="transition-all" 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                />
            )}
            <path d={pathD} stroke="transparent" strokeWidth="15" fill="none" className="cursor-pointer" />
            {link.label && ( <foreignObject x={midX - 75} y={midY - 15} width="150" height="30" style={{ pointerEvents: 'none' }}> <div className="flex items-center justify-center h-full"> <div className="text-center text-xs text-[var(--color-link)] bg-[var(--color-canvas-bg)] px-1 font-medium">{link.label}</div></div> </foreignObject> )}
        </g>
    );
});

export default DiagramCanvas;
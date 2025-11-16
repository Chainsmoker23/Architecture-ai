import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import { DiagramData, ArchNode, Link, Container } from '../types';
import ArchitectureIcon from './ArchitectureIcon';
import ContextMenu from './ContextMenu';
import { motion } from 'framer-motion';

const GRID_SIZE = 10;

export type InteractionMode = 'select' | 'pan' | 'addNode';
type HandleType = 'top' | 'right' | 'bottom' | 'left';

interface DiagramCanvasProps {
  data: DiagramData;
  onDataChange: (newData: DiagramData, fromHistory?: boolean) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  forwardedRef: React.RefObject<SVGSVGElement>;
  fitScreenRef: React.RefObject<(() => void) | null>;
  isEditable?: boolean;
  interactionMode?: InteractionMode;
  onTransformChange?: (transform: ZoomTransform) => void;
  resizingNodeId?: string | null;
  onNodeDoubleClick?: (nodeId: string) => void;
  onCanvasClick?: (event?: PointerEvent) => void;
  onLinkStart: (sourceNodeId: string, startPos: { x: number, y: number }) => void;
  linkingState: { sourceNodeId: string; startPos: { x: number, y: number } } | null;
  previewLinkTarget: { x: number; y: number; targetNodeId?: string } | null;
}

// ====================================================================================
// --- Main Canvas Component ---
// ====================================================================================
// This component orchestrates the rendering of the entire diagram, including nodes,
// links, and containers. It also manages the main zoom and pan behavior.
// ====================================================================================

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ 
    data, onDataChange, selectedIds, setSelectedIds, forwardedRef, fitScreenRef,
    isEditable = false,
    interactionMode = 'select',
    onTransformChange, resizingNodeId = null, onNodeDoubleClick, onCanvasClick,
    onLinkStart, linkingState, previewLinkTarget,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: ArchNode | Link | Container; } | null>(null);
  
  const nodesById = useMemo(() => new Map(data.nodes.map(node => [node.id, node])), [data.nodes]);

  const linkGroups = useMemo(() => {
    const groups = new Map<string, { fwd: string[], bwd: string[] }>();
    data.links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        const key = [sourceId, targetId].sort().join('--');
        if (!groups.has(key)) {
            groups.set(key, { fwd: [], bwd: [] });
        }
        const group = groups.get(key)!;
        if (sourceId < targetId) {
            group.fwd.push(link.id);
        } else {
            group.bwd.push(link.id);
        }
    });
    return groups;
  }, [data.links]);

  const renderableLinks = useMemo(() => {
    return data.links.map(link => {
      const sourceNode = nodesById.get(typeof link.source === 'string' ? link.source : link.source.id);
      const targetNode = nodesById.get(typeof link.target === 'string' ? link.target : link.target.id);

      if (!sourceNode || !targetNode) return null;

      const sourceId = sourceNode.id;
      const targetId = targetNode.id;
      
      const LINK_SPACING = 20;
      const key = [sourceId, targetId].sort().join('--');
      const group = linkGroups.get(key) || { fwd: [], bwd: [] };
      
      const allLinksInGroup = [...group.fwd, ...group.bwd];
      const linkIndex = allLinksInGroup.indexOf(link.id);
      const totalLinks = allLinksInGroup.length;

      const offset = (linkIndex - (totalLinks - 1) / 2) * LINK_SPACING;
      
      const isNeuronLink = sourceNode.type === 'neuron' && targetNode.type === 'neuron';

      // --- Path & Label Calculation ---
      let pathD: string;
      let labelPos = null;

      if (isNeuronLink) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) {
              pathD = '';
          } else {
              const sourceRadius = sourceNode.width / 2;
              const targetRadius = targetNode.width / 2;
              const p1 = { x: sourceNode.x + (dx / dist) * sourceRadius, y: sourceNode.y + (dy / dist) * sourceRadius };
              const p4 = { x: targetNode.x - (dx / dist) * targetRadius, y: targetNode.y - (dy / dist) * targetRadius };
              pathD = `M ${p1.x} ${p1.y} L ${p4.x} ${p4.y}`;
          }
      } else {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const isPrimarilyHorizontal = Math.abs(dx) > Math.abs(dy);
          const cornerRadius = 10;
          let p1: {x: number, y: number}, p2: {x: number, y: number}, p3: {x: number, y: number}, p4: {x: number, y: number};
          
          const isForward = group.fwd.includes(link.id);
          const hasBidirectionalPair = group.fwd.length > 0 && group.bwd.length > 0;
          const directionMultiplier = hasBidirectionalPair ? (isForward ? -1 : 1) : -1;

          if (isPrimarilyHorizontal) {
              // H-V-H path
              const sourceExitX = dx > 0 ? sourceNode.x + sourceNode.width / 2 : sourceNode.x - sourceNode.width / 2;
              const targetEntryX = dx > 0 ? targetNode.x - targetNode.width / 2 : targetNode.x + targetNode.width / 2;
          
              p1 = { x: sourceExitX, y: sourceNode.y };
              p4 = { x: targetEntryX, y: targetNode.y };
          
              const midX = (p1.x + p4.x) / 2 + offset; // Apply offset to the vertical segment
              p2 = { x: midX, y: p1.y };
              p3 = { x: midX, y: p4.y };
          
              pathD = `M ${p1.x} ${p1.y} H ${p2.x - cornerRadius * Math.sign(p2.x - p1.x)} Q ${p2.x} ${p2.y}, ${p2.x} ${p2.y + cornerRadius * Math.sign(p3.y - p2.y)} V ${p3.y - cornerRadius * Math.sign(p3.y - p2.y)} Q ${p3.x} ${p3.y}, ${p3.x + cornerRadius * Math.sign(p4.x - p3.x)} ${p3.y} H ${p4.x}`;
              
              if (link.label) {
                  const labelX = p2.x;
                  const labelY = (p2.y + p3.y) / 2;
                  const xOffset = 18 * directionMultiplier;
                  labelPos = { x: labelX + xOffset, y: labelY };
              }
          } else {
              // V-H-V path
              const sourceExitY = dy > 0 ? sourceNode.y + sourceNode.height / 2 : sourceNode.y - sourceNode.height / 2;
              const targetEntryY = dy > 0 ? targetNode.y - targetNode.height / 2 : targetNode.y + targetNode.height / 2;
          
              p1 = { x: sourceNode.x, y: sourceExitY };
              p4 = { x: targetNode.x, y: targetEntryY };
              
              const midY = (p1.y + p4.y) / 2 + offset; // Apply offset to the horizontal segment
              p2 = { x: p1.x, y: midY };
              p3 = { x: p4.x, y: midY };
          
              pathD = `M ${p1.x} ${p1.y} V ${p2.y - cornerRadius * Math.sign(p2.y - p1.y)} Q ${p2.x} ${p2.y}, ${p2.x + cornerRadius * Math.sign(p3.x - p2.x)} ${p2.y} H ${p3.x - cornerRadius * Math.sign(p3.x - p2.x)} Q ${p3.x} ${p3.y}, ${p3.x} ${p3.y + cornerRadius * Math.sign(p4.y - p3.y)} V ${p4.y}`;
              
              if (link.label) {
                  const labelX = (p2.x + p3.x) / 2;
                  const labelY = p2.y;
                  const yOffset = 18 * directionMultiplier;
                  labelPos = { x: labelX, y: labelY + yOffset };
              }
          }
      }

      return { link, pathD, labelPos, isNeuronLink };
    }).filter(Boolean) as { link: Link; pathD: string; labelPos: {x: number, y: number} | null; isNeuronLink: boolean }[];
  }, [data.links, nodesById, linkGroups]);


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
    if (interactionMode !== 'select') return;
    
    if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    } else {
      if (!selectedIds.includes(id)) {
        setSelectedIds([id]);
      }
    }
  };

  useEffect(() => {
    if (!forwardedRef.current) return;
    const svg = select(forwardedRef.current);
    const parent = containerRef.current;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter(event => {
        if (!isEditable) return event.type === 'wheel'; // Allow zoom only if not editable
        if (event.defaultPrevented) return false;
        const isBackgroundDrag = (event.target as HTMLElement)?.tagName === 'svg';
        return event.type === 'wheel' || event.button === 2 || (interactionMode === 'select' && isBackgroundDrag);
      })
      .on('zoom', (event) => {
        setViewTransform(event.transform);
        if (onTransformChange) onTransformChange(event.transform);
      });
      
    svg.call(zoomBehavior).on("dblclick.zoom", null);
    
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
            if (onCanvasClick) {
                onCanvasClick(event);
            } else {
                setSelectedIds([]);
            }
            setContextMenu(null);
        }
    };
    
    const svgNode = svg.node();
    if (svgNode) svgNode.addEventListener('pointerdown', handleCanvasClick as EventListener);

    return () => {
      if (svgNode) svgNode.removeEventListener('pointerdown', handleCanvasClick as EventListener);
      svg.on('.zoom', null);
      if (fitScreenRef) fitScreenRef.current = null;
    }
  }, [forwardedRef, setSelectedIds, data, fitScreenRef, isEditable, interactionMode, onTransformChange, onCanvasClick]);

  const handleItemContextMenu = (e: React.MouseEvent, item: ArchNode | Link | Container) => {
    e.preventDefault(); e.stopPropagation();
    if (isEditable && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, item });
    }
  };
  
  const handleDeleteItem = (item: ArchNode | Link | Container) => {
    const { id } = item;
    const newNodes = data.nodes.filter(n => n.id !== id);
    const newContainers = data.containers?.filter(c => c.id !== id);
    const remainingNodeIds = new Set(newNodes.map(n => n.id));
    const newLinks = data.links.filter(l => l.id !== id && remainingNodeIds.has(typeof l.source === 'string' ? l.source : l.source.id) && remainingNodeIds.has(typeof l.target === 'string' ? l.target : l.target.id));
    onDataChange({ ...data, nodes: newNodes, containers: newContainers, links: newLinks });
    setContextMenu(null);
  }
  
  const getCursor = () => {
    if (!isEditable) return 'default';
    if (linkingState) return 'crosshair';
    switch(interactionMode) {
      default: return 'default';
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[var(--color-canvas-bg)] rounded-b-2xl">
      <svg ref={forwardedRef} className="w-full h-full absolute inset-0" style={{ cursor: getCursor() }}>
        <defs>
          <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--color-grid-dot)"></circle>
          </pattern>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" orient="auto" markerWidth="6" markerHeight="6">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
          </marker>
          <marker id="arrowhead-reverse" viewBox="0 0 10 10" refX="2" refY="5" orient="auto" markerWidth="6" markerHeight="6">
            <path d="M 10 0 L 0 5 L 10 10 z" fill="currentColor"/>
          </marker>
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="var(--color-shadow)" floodOpacity="0.1" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g id="diagram-content" transform={viewTransform.toString()}>
            {/* Containers Layer */}
            <g>
                {data.containers?.map(container => ( <DiagramContainer key={container.id} container={container} data={data} onDataChange={onDataChange} isSelected={isSelected(container.id)} setSelectedIds={setSelectedIds} onContextMenu={handleItemContextMenu} selectedIds={selectedIds} fillColor={container.color || (container.type === 'tier' ? tierColors.get(container.id) || 'var(--color-tier-default)' : 'var(--color-tier-default)')} interactionMode={interactionMode} isEditable={isEditable} /> ))}
            </g>
            
            {/* Link Paths Layer */}
            <g>
                {renderableLinks.map(({ link, pathD, isNeuronLink }) => {
                    const selected = isSelected(link.id);
                    const thicknessMap = { thin: isNeuronLink ? 0.5 : 1.5, medium: 2.5, thick: 4 };
                    const thicknessPx = thicknessMap[link.thickness || 'medium'];
                    const color = link.color || (selected ? 'var(--color-accent-text)' : 'var(--color-link)');
                    const dashArray = link.style === 'dashed' ? '8 6' : (link.style === 'dotted' ? '2 4' : 'none');

                    return (
                        <g key={link.id} onClick={(e) => handleItemSelection(e, link.id)} onContextMenu={(e) => handleItemContextMenu(e, link)} style={{ cursor: 'pointer' }}>
                            <path d={pathD} stroke="transparent" strokeWidth={20} fill="none" />
                            <path d={pathD} stroke={color} strokeWidth={thicknessPx} strokeDasharray={dashArray} fill="none" markerEnd={isNeuronLink ? undefined : `url(#arrowhead)`} markerStart={link.bidirectional ? `url(#arrowhead-reverse)` : undefined} />
                        </g>
                    );
                })}
            </g>
            
            {/* Nodes Layer */}
            <g>
                {data.nodes.map(node => ( <DiagramNode key={node.id} node={node} data={data} onDataChange={onDataChange} isSelected={isSelected(node.id)} setSelectedIds={setSelectedIds} onContextMenu={handleItemContextMenu} selectedIds={selectedIds} interactionMode={interactionMode} isEditable={isEditable} resizingNodeId={resizingNodeId} onNodeDoubleClick={onNodeDoubleClick} onLinkStart={onLinkStart} isLinkHoverTarget={previewLinkTarget?.targetNodeId === node.id} /> ))}
            </g>

            {/* Preview Link (on top of nodes) */}
            {linkingState && previewLinkTarget && (
              <path
                d={`M ${linkingState.startPos.x} ${linkingState.startPos.y} L ${previewLinkTarget.x} ${previewLinkTarget.y}`}
                stroke="var(--color-accent-text)"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
                markerEnd="url(#arrowhead)"
                style={{ pointerEvents: 'none' }}
              />
            )}
            
            {/* Link Labels Layer (On Top) */}
            <g>
                {renderableLinks.map(({ link, labelPos }) => {
                    if (!link.label || !labelPos) return null;

                    const labelText = link.label;
                    const labelWidth = labelText.length * 6.5 + 16;
                    const labelHeight = 22;

                    return (
                        <g key={`${link.id}-label`} style={{ pointerEvents: 'none' }}>
                            <rect
                                x={labelPos.x - labelWidth / 2}
                                y={labelPos.y - labelHeight / 2}
                                width={labelWidth}
                                height={labelHeight}
                                rx={6}
                                ry={6}
                                fill="var(--color-canvas-bg)"
                                stroke="var(--color-border)"
                                strokeWidth="1.5"
                            />
                            <text
                                x={labelPos.x}
                                y={labelPos.y}
                                dy=".3em"
                                textAnchor="middle"
                                fill="var(--color-text-primary)"
                                fontSize="12px"
                                fontWeight="600"
                            >
                                {labelText}
                            </text>
                        </g>
                    );
                })}
            </g>
        </g>
      </svg>
      {contextMenu && ( <ContextMenu x={contextMenu.x} y={contextMenu.y} options={[{ label: 'Delete', onClick: () => handleDeleteItem(contextMenu.item) }]} onClose={() => setContextMenu(null)} /> )}
    </div>
  );
};

// ====================================================================================
// --- Draggable Container Component ---
// ====================================================================================
// This component renders a single background container (e.g., a "Tier" or "Region").
// It manages its own drag-and-drop behavior, including moving its child nodes.
// ====================================================================================

interface DraggableProps { data: DiagramData; onDataChange: (data: DiagramData, fromHistory?: boolean) => void; selectedIds: string[]; setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>; interactionMode: InteractionMode; }

const DiagramContainer = memo<{ container: Container; isSelected: boolean; onContextMenu: (e: React.MouseEvent, item: Container) => void; fillColor: string; isEditable: boolean; } & DraggableProps>((props) => {
    const { container, onContextMenu, fillColor, interactionMode, isEditable } = props;
    const ref = useRef<SVGGElement>(null);
    const dataRef = useRef(props.data);
    dataRef.current = props.data;

    useEffect(() => {
      if (!ref.current || !isEditable) return;
      const selection = select(ref.current);
      let currentData: DiagramData;

      const dragBehavior = drag<SVGGElement, unknown>()
          .filter(event => {
            const isHandle = (event.sourceEvent.target as SVGElement)?.dataset?.handle === 'true';
            return !isHandle && (interactionMode === 'select' || interactionMode === 'pan') && !event.button;
          })
          .on('start', (event) => {
              if (event.sourceEvent.shiftKey) {
                props.setSelectedIds(prev => prev.includes(container.id) ? prev.filter(sid => sid !== container.id) : [...prev, container.id]);
              } else {
                if (!props.selectedIds.includes(container.id)) {
                    props.setSelectedIds([container.id]);
                }
              }
              currentData = dataRef.current;
              selection.raise();
          })
          .on('drag', (event) => {
              const { dx, dy } = event;
              const { selectedIds, container } = props;

              const containerIdsToMove = new Set(selectedIds.filter(id => currentData.containers?.some(c => c.id === id)));
              containerIdsToMove.add(container.id);

              const childNodeIdsToMove = new Set<string>();
              currentData.containers?.forEach(c => {
                  if (containerIdsToMove.has(c.id)) {
                      (c.childNodeIds || []).forEach(childId => childNodeIdsToMove.add(childId));
                  }
              });
              
              const newContainers = currentData.containers?.map(c => {
                  if (containerIdsToMove.has(c.id)) {
                      return { ...c, x: c.x + dx, y: c.y + dy };
                  }
                  return c;
              });

              const newNodes = currentData.nodes.map(n => {
                  if (childNodeIdsToMove.has(n.id)) {
                      return { ...n, x: n.x + dx, y: n.y + dy };
                  }
                  return n;
              });

              currentData = { ...currentData, nodes: newNodes, containers: newContainers };
              props.onDataChange(currentData, true);
          })
          .on('end', () => {
             if (currentData) {
                props.onDataChange(currentData, false);
             }
          });
      selection.call(dragBehavior);
      return () => { selection.on('.drag', null); }
    }, [props.onDataChange, props.selectedIds, isEditable, interactionMode, container.id, props.setSelectedIds]);

    const handleResize = (dx: number, dy: number, handle: 'br' | 'bl' | 'tr' | 'tl') => {
        const { onDataChange, container } = props;
        const currentData = dataRef.current;
        const minSize = 100;
        const newContainers = currentData.containers?.map(c => {
            if (c.id === container.id) {
                let { x, y, width, height } = c;
                if (handle.includes('r')) width = Math.max(minSize, width + dx);
                if (handle.includes('l')) {
                    const newWidth = Math.max(minSize, width - dx);
                    x += width - newWidth; width = newWidth;
                }
                if (handle.includes('b')) height = Math.max(minSize, height + dy);
                if (handle.includes('t')) {
                    const newHeight = Math.max(minSize, height - dy);
                    y += height - newHeight; height = newHeight;
                }
                return { ...c, x, y, width, height };
            }
            return c;
        });
        const newData = { ...currentData, containers: newContainers };
        onDataChange(newData, true);
        dataRef.current = newData;
    };

    const ResizeHandle: React.FC<{ handle: 'br' | 'bl' | 'tr' | 'tl' }> = ({ handle }) => {
        const handleRef = useRef<SVGRectElement>(null);
        useEffect(() => {
            if (!handleRef.current) return;
            const selection = select(handleRef.current);
            const dragBehavior = drag<SVGRectElement, unknown>()
                .on('start', (e) => { e.sourceEvent.preventDefault(); e.sourceEvent.stopPropagation(); dataRef.current = props.data; })
                .on('drag', (event) => handleResize(event.dx, event.dy, handle))
                .on('end', () => props.onDataChange(dataRef.current, false));
            selection.call(dragBehavior);
            return () => { selection.on('.drag', null); };
        }, [handle]);

        const getCoords = () => {
          const size = 10;
          let x = container.x - size/2;
          let y = container.y - size/2;
          if (handle.includes('r')) x += container.width;
          if (handle.includes('b')) y += container.height;
          return { x, y };
        };

        const getCursor = () => {
          if (handle === 'tl' || handle === 'br') return 'nwse-resize';
          if (handle === 'tr' || handle === 'bl') return 'nesw-resize';
          return 'default';
        }

        return <rect ref={handleRef} data-handle="true" {...getCoords()} width={10} height={10} fill="var(--color-accent-text)" stroke="var(--color-node-bg)" strokeWidth={2} cursor={getCursor()} />;
    };
    
    return (
      <g ref={ref} onContextMenu={(e) => onContextMenu(e, container)} style={{ cursor: isEditable ? 'move' : 'default' }}>
        <rect
          x={container.x}
          y={container.y}
          width={container.width}
          height={container.height}
          rx={16}
          ry={16}
          fill={fillColor}
          stroke={props.isSelected ? "var(--color-accent-text)" : "var(--color-border)"}
          strokeWidth={props.isSelected ? 2 : 1}
          strokeDasharray={container.type === 'availability-zone' ? '6 4' : 'none'}
        />
         <foreignObject x={container.x + 12} y={container.y + 8} width={container.width - 24} height={30} style={{ pointerEvents: 'none' }}>
            <div className="font-semibold text-[var(--color-text-secondary)]">
                {container.label}
            </div>
        </foreignObject>
        {props.isSelected && isEditable && interactionMode === 'select' && (
            <>
                <ResizeHandle handle="tl" />
                <ResizeHandle handle="tr" />
                <ResizeHandle handle="bl" />
                <ResizeHandle handle="br" />
            </>
        )}
      </g>
    );
});

// ====================================================================================
// --- Draggable Node Component ---
// ====================================================================================
// This component renders a single component box (e.g., a "Database" or "User").
// It manages its own drag-and-drop behavior and displays connection handles.
// This is where the conflict between dragging and connecting is resolved.
// ====================================================================================

const DiagramNode = memo<{ node: ArchNode; isSelected: boolean; onContextMenu: (e: React.MouseEvent, item: ArchNode) => void; isEditable: boolean; resizingNodeId: string | null; onNodeDoubleClick?: (nodeId: string) => void; onLinkStart: (sourceNodeId: string, startPos: { x: number, y: number }) => void; isLinkHoverTarget: boolean;} & DraggableProps>((props) => {
    const { node, isSelected, onContextMenu, interactionMode, isEditable, resizingNodeId, onNodeDoubleClick, onLinkStart, isLinkHoverTarget } = props;
    const ref = useRef<SVGGElement>(null);
    const dataRef = useRef(props.data);
    dataRef.current = props.data;

    const handlePositions: Record<HandleType, { x: number; y: number }> = useMemo(() => ({
      top: { x: node.x, y: node.y - node.height / 2 },
      right: { x: node.x + node.width / 2, y: node.y },
      bottom: { x: node.x, y: node.y + node.height / 2 },
      left: { x: node.x - node.width / 2, y: node.y },
    }), [node.x, node.y, node.width, node.height]);

    useEffect(() => {
        if (!ref.current || !isEditable) return;
        const selection = select(ref.current);
        let currentData: DiagramData;

        const dragBehavior = drag<SVGGElement, unknown>()
            .filter(event => (interactionMode === 'select' || interactionMode === 'pan') && !event.button)
            .on('start', (event) => {
                const originalTarget = event.sourceEvent.target as SVGElement;
                const isHandle = originalTarget.classList.contains('connection-handle');

                if (isHandle) {
                    event.sourceEvent.stopPropagation();
                    const handleType = originalTarget.dataset.handle as HandleType | undefined;
                    if (handleType) {
                        onLinkStart(node.id, handlePositions[handleType]);
                    }
                    event.on('drag', null).on('end', null);
                    return;
                }
                
                if (event.sourceEvent.shiftKey) {
                    props.setSelectedIds(prev => prev.includes(node.id) ? prev.filter(sid => sid !== node.id) : [...prev, node.id]);
                } else {
                    if (!props.selectedIds.includes(node.id)) {
                        props.setSelectedIds([node.id]);
                    }
                }
                
                currentData = dataRef.current;
                selection.raise();
            })
            .on('drag', (event) => {
                const { dx, dy } = event;
                const { selectedIds, node } = props;
                
                const idsToMove = new Set(selectedIds);
                idsToMove.add(node.id);

                const newNodes = currentData.nodes.map(n => {
                    if (idsToMove.has(n.id) && !n.locked) {
                        return { ...n, x: n.x + dx, y: n.y + dy };
                    }
                    return n;
                });
                currentData = { ...currentData, nodes: newNodes };
                props.onDataChange(currentData, true);
            })
            .on('end', () => {
                if (currentData) {
                    props.onDataChange(currentData, false);
                }
            });
            
        selection.call(dragBehavior);
        return () => { selection.on('.drag', null); };
    }, [props.onDataChange, props.selectedIds, isEditable, interactionMode, node.id, props.setSelectedIds, onLinkStart, handlePositions]);

    const handleResize = (dx: number, dy: number, handle: 'br' | 'bl' | 'tr' | 'tl') => {
        const { onDataChange } = props;
        const currentData = dataRef.current;
        const minSize = 40;
        const newNodes = currentData.nodes.map(n => {
            if (n.id === node.id) {
                const newWidth = Math.max(minSize, handle.includes('r') ? n.width + dx : n.width - dx);
                const newHeight = Math.max(minSize, handle.includes('b') ? n.height + dy : n.height - dy);
                const newX = n.x + (handle.includes('r') ? dx / 2 : -dx / 2);
                const newY = n.y + (handle.includes('b') ? dy / 2 : -dy / 2);
                return { ...n, width: newWidth, height: newHeight, x: newX, y: newY };
            }
            return n;
        });
        const newData = { ...currentData, nodes: newNodes };
        onDataChange(newData, true);
        dataRef.current = newData;
    };

    const ResizeHandle: React.FC<{ handle: 'br' | 'bl' | 'tr' | 'tl' }> = ({ handle }) => {
        const handleRef = useRef<SVGRectElement>(null);
        useEffect(() => {
            if (!handleRef.current) return;
            const selection = select(handleRef.current);
            const dragBehavior = drag<SVGRectElement, unknown>()
                .on('start', (e) => { e.sourceEvent.preventDefault(); e.sourceEvent.stopPropagation(); dataRef.current = props.data; })
                .on('drag', (event) => handleResize(event.dx, event.dy, handle))
                .on('end', () => props.onDataChange(dataRef.current, false));
            selection.call(dragBehavior);
            return () => { selection.on('.drag', null); };
        }, []);

        const getCoords = () => {
          const size = 8;
          let x = node.x - node.width/2 - size/2;
          let y = node.y - node.height/2 - size/2;
          if (handle.includes('r')) x += node.width;
          if (handle.includes('b')) y += node.height;
          return { x, y };
        };

        return <rect ref={handleRef} {...getCoords()} width={8} height={8} fill="var(--color-accent-text)" stroke="var(--color-node-bg)" strokeWidth={2} cursor={`${handle.includes('b') ? 's' : 'n'}${handle.includes('r') ? 'e' : 'w'}-resize`} />;
    };
    
    const isResizing = resizingNodeId === node.id;
    const isCustomIcon = !!node.customIcon;
    
    const nodeBody = (() => {
        const commonProps = {
            width: node.width,
            height: node.height,
            fill: node.color || "var(--color-node-bg)",
            stroke: isLinkHoverTarget ? "var(--color-accent-text)" : (isSelected ? "var(--color-accent-text)" : "var(--color-border)"),
            strokeWidth: isLinkHoverTarget ? 3 : (isSelected ? 2.5 : 1.5),
            style: { filter: 'url(#drop-shadow)', transition: 'stroke 0.2s ease-in-out' }
        };

        switch (node.shape) {
            case 'ellipse':
                return <ellipse cx={node.width / 2} cy={node.height / 2} rx={node.width / 2} ry={node.height / 2} {...commonProps} />;
            case 'diamond':
                const points = `${node.width / 2},0 ${node.width},${node.height / 2} ${node.width / 2},${node.height} 0,${node.height / 2}`;
                return <polygon points={points} {...commonProps} />;
            default: // rectangle
                return <rect rx={12} ry={12} {...commonProps} />;
        }
    })();

    return (
        <g ref={ref} onDoubleClick={() => onNodeDoubleClick?.(node.id)} onContextMenu={(e) => onContextMenu(e, node)} style={{ cursor: isEditable && (interactionMode === 'select' || interactionMode === 'pan') ? 'move' : 'default' }} className={`diagram-node node-id-${node.id}`}>
          {node.description && <title>{node.description}</title>}
          <motion.g animate={{ x: node.x - node.width/2, y: node.y - node.height/2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            {nodeBody}
            
            {isCustomIcon ? (
              (() => {
                const iconSizePercent = node.customIconSize || 60;
                const labelHeight = node.label ? 24 : 8;
                const availableWidth = node.width - 16;
                const availableHeight = node.height - 8 - labelHeight;
                const baseSize = Math.min(availableWidth, availableHeight);
                const iconSize = (baseSize * iconSizePercent) / 100;
                
                const iconX = (node.width - iconSize) / 2;
                const iconY = (availableHeight - iconSize) / 2 + 8;

                return (
                  <>
                    <image
                      href={node.customIcon!}
                      x={iconX}
                      y={iconY}
                      width={iconSize}
                      height={iconSize}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ pointerEvents: 'none' }}
                    />
                    {node.label && (
                      <foreignObject x={8} y={node.height - labelHeight} width={node.width - 16} height={labelHeight - 4} style={{ pointerEvents: 'none' }}>
                        <div className="w-full h-full flex items-center justify-center text-center">
                           <span className="label-text font-medium leading-tight text-xs" style={{ wordBreak: 'break-word' }}>{node.label}</span>
                        </div>
                      </foreignObject>
                    )}
                  </>
                );
              })()
            ) : (
              <foreignObject x={8} y={8} width={node.width - 16} height={node.height - 16} style={{ pointerEvents: 'none' }}>
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 gap-1">
                   {node.type !== 'layer-label' && node.type !== 'group-label' && <ArchitectureIcon type={node.type} className="w-8 h-8 flex-shrink-0" />}
                   <span className="label-text font-medium leading-tight text-sm" style={{ wordBreak: 'break-word' }}>{node.label}</span>
                </div>
              </foreignObject>
            )}
          </motion.g>
          {isResizing && isSelected && ['tl', 'tr', 'bl', 'br'].map(h => <ResizeHandle key={h} handle={h as 'br' | 'bl' | 'tr' | 'tl'} />)}
          
          {/* Connection Handles */}
          {isSelected && isEditable && (Object.keys(handlePositions) as HandleType[]).map(handle => (
              <g key={handle}>
                  <circle
                      className="connection-handle"
                      data-handle={handle}
                      cx={handlePositions[handle].x}
                      cy={handlePositions[handle].y}
                      r={8}
                      fill="transparent"
                      strokeWidth={10}
                      stroke="transparent"
                      cursor="crosshair"
                  />
                   <motion.circle
                      cx={handlePositions[handle].x}
                      cy={handlePositions[handle].y}
                      r={4}
                      fill="var(--color-accent-text)"
                      stroke="var(--color-node-bg)"
                      strokeWidth={1.5}
                      style={{ pointerEvents: 'none' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  />
              </g>
          ))}
        </g>
    );
});

export default DiagramCanvas;
import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { select, pointer } from 'd3-selection';
import { drag } from 'd3-drag';
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
  isEditable?: boolean;
  interactionMode?: InteractionMode;
  onInteractionNodeClick?: (nodeId: string) => void;
  onTransformChange?: (transform: ZoomTransform) => void;
  resizingNodeId?: string | null;
  onNodeDoubleClick?: (nodeId: string) => void;
  onCanvasClick?: () => void;
}

interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ 
    data, onDataChange, selectedIds, setSelectedIds, forwardedRef, fitScreenRef,
    isEditable = false,
    interactionMode = 'select', onInteractionNodeClick,
    onTransformChange, resizingNodeId = null, onNodeDoubleClick, onCanvasClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: Node | Link | Container; } | null>(null);
  
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
    if (!isEditable || (interactionMode !== 'select' && interactionMode !== 'pan')) return;
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
        if (!isEditable) return event.type === 'wheel'; // Allow zoom only if not editable
        if (event.defaultPrevented) return false;
        return event.type === 'wheel' || event.button === 2 || (interactionMode === 'select' && (event.target as HTMLElement)?.tagName === 'svg');
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
                onCanvasClick();
            } else {
                setSelectedIds([]);
            }
            setContextMenu(null);
        }
    };
    
    const svgNode = svg.node();
    if (svgNode) svgNode.addEventListener('click', handleCanvasClick as EventListener);

    return () => {
      if (svgNode) svgNode.removeEventListener('click', handleCanvasClick as EventListener);
      svg.on('.zoom', null);
      if (fitScreenRef) fitScreenRef.current = null;
    }
  }, [forwardedRef, setSelectedIds, data, fitScreenRef, isEditable, interactionMode, onTransformChange, onCanvasClick]);

  const handleItemContextMenu = (e: React.MouseEvent, item: Node | Link | Container) => {
    e.preventDefault(); e.stopPropagation();
    if (isEditable && containerRef.current) {
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
    onDataChange({ ...data, nodes: newNodes, containers: newContainers, links: newLinks });
    setContextMenu(null);
  }

  const obstacles = useMemo(() => {
    return [
        ...(data.nodes.map(n => ({ x: n.x - n.width / 2, y: n.y - n.height / 2, width: n.width, height: n.height }))),
        ...(data.containers?.map(c => ({ x: c.x, y: c.y, width: c.width, height: c.height })) || [])
    ];
  }, [data.nodes, data.containers]);
  
  const handleNodeClick = (e: React.MouseEvent, id: string) => {
      if (isEditable && interactionMode === 'connect' && onInteractionNodeClick) {
          e.stopPropagation();
          onInteractionNodeClick(id);
      } else {
          handleItemSelection(e, id);
      }
  };
  
  const getCursor = () => {
    if (!isEditable) return 'default';
    switch(interactionMode) {
      case 'connect': return 'pointer';
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
            <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
          </marker>
          <marker id="arrowhead-reverse" viewBox="0 0 10 10" refX="2" refY="5" orient="auto" markerWidth="6" markerHeight="6">
            <path d="M 10 0 L 0 5 L 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
          </marker>
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="var(--color-shadow)" floodOpacity="0.1" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g id="diagram-content" transform={viewTransform.toString()}>
            <g> {/* Containers Layer */}
                {data.containers?.map(container => ( <DiagramContainer key={container.id} container={container} data={data} onDataChange={onDataChange} isSelected={isSelected(container.id)} onSelect={handleItemSelection} onContextMenu={handleItemContextMenu} selectedIds={selectedIds} fillColor={container.color || (container.type === 'tier' ? tierColors.get(container.id) || 'var(--color-tier-default)' : 'var(--color-tier-default)')} interactionMode={interactionMode} isEditable={isEditable} /> ))}
            </g>
            <g> {/* Links Layer */}
                {data.links.map((link) => {
                    const sourceNode = nodesById.get(typeof link.source === 'string' ? link.source : link.source.id);
                    const targetNode = nodesById.get(typeof link.target === 'string' ? link.target : link.target.id);
                    if (!sourceNode || !targetNode) return null;

                    const sourceId = sourceNode.id;
                    const targetId = targetNode.id;
                    
                    const LINK_SPACING = 40;
                    const key = [sourceId, targetId].sort().join('--');
                    const group = linkGroups.get(key) || { fwd: [], bwd: [] };
                    
                    const allLinksInGroup = [...group.fwd, ...group.bwd];
                    const linkIndex = allLinksInGroup.indexOf(link.id);
                    const totalLinks = allLinksInGroup.length;

                    const offset = (linkIndex - (totalLinks - 1) / 2) * LINK_SPACING;

                    return <DiagramLink key={link.id} link={link} source={sourceNode} target={targetNode} obstacles={obstacles.filter(o => o.x !== (sourceNode.x - sourceNode.width/2) && o.x !== (targetNode.x - targetNode.width/2))} onContextMenu={handleItemContextMenu} isSelected={isSelected(link.id)} onSelect={handleItemSelection} offset={offset} />;
                })}
            </g>
            <g> {/* Nodes Layer */}
                {data.nodes.map(node => ( <DiagramNode key={node.id} node={node} data={data} onDataChange={onDataChange} isSelected={isSelected(node.id)} onSelect={handleNodeClick} onContextMenu={handleItemContextMenu} selectedIds={selectedIds} interactionMode={interactionMode} isEditable={isEditable} resizingNodeId={resizingNodeId} onNodeDoubleClick={onNodeDoubleClick} /> ))}
            </g>
        </g>
      </svg>
      {contextMenu && ( <ContextMenu x={contextMenu.x} y={contextMenu.y} options={[{ label: 'Delete', onClick: () => handleDeleteItem(contextMenu.item) }]} onClose={() => setContextMenu(null)} /> )}
    </div>
  );
};

// --- Sub-components ---
interface DraggableProps { data: DiagramData; onDataChange: (data: DiagramData, fromHistory?: boolean) => void; selectedIds: string[]; interactionMode: InteractionMode; }

const DiagramContainer = memo<{ container: Container; isSelected: boolean; onSelect: (e: React.MouseEvent, id: string) => void; onContextMenu: (e: React.MouseEvent, item: Container) => void; fillColor: string; isEditable: boolean; } & DraggableProps>((props) => {
    const { container, onSelect, onContextMenu, fillColor, interactionMode, isEditable } = props;
    const ref = useRef<SVGGElement>(null);

    useEffect(() => {
      if (!ref.current || !isEditable || (interactionMode !== 'select' && interactionMode !== 'pan')) return;
      const selection = select(ref.current);
      const dragBehavior = drag<SVGGElement, unknown>()
          .on('start', (event) => {
              if (interactionMode !== 'select' && interactionMode !== 'pan') return;
              selection.raise();
          })
          .on('drag', (event) => {
              if (interactionMode !== 'select' && interactionMode !== 'pan') return;
              const { dx, dy } = event;
              const { data, onDataChange, selectedIds } = props;
              const selectedContainers = new Set(data.containers?.filter(c => selectedIds.includes(c.id)).map(c => c.id) || []);
              
              const newContainers = data.containers?.map(c => {
                  if (selectedIds.includes(c.id)) {
                      return { ...c, x: c.x + dx, y: c.y + dy };
                  }
                  return c;
              });

              const childNodeIdsToMove = new Set(newContainers?.filter(c => selectedContainers.has(c.id)).flatMap(c => c.childNodeIds) || []);
              const newNodes = data.nodes.map(n => {
                  if (childNodeIdsToMove.has(n.id)) {
                      return { ...n, x: n.x + dx, y: n.y + dy };
                  }
                  return n;
              });

              onDataChange({ ...data, nodes: newNodes, containers: newContainers }, true);
          })
          .on('end', () => {
             // onDataChange(props.data); // This triggers a final history update
          });
      selection.call(dragBehavior);
      return () => { selection.on('.drag', null); }
    }, [props, isEditable, interactionMode]);
    
    return (
      <g ref={ref} onClick={(e) => onSelect(e, container.id)} onContextMenu={(e) => onContextMenu(e, container)}>
        <rect
          x={container.x}
          y={container.y}
          width={container.width}
          height={container.height}
          rx={16}
          ry={16}
          fill={fillColor}
          stroke="var(--color-border)"
          strokeWidth={props.isSelected ? 2 : 1}
          strokeDasharray={container.type === 'availability-zone' ? '6 4' : 'none'}
        />
         <foreignObject x={container.x + 12} y={container.y + 8} width={container.width - 24} height={30}>
            <div className="font-semibold text-[var(--color-text-secondary)]">
                {container.label}
            </div>
        </foreignObject>
      </g>
    );
});

const DiagramNode = memo<{ node: Node; isSelected: boolean; onSelect: (e: React.MouseEvent, id: string) => void; onContextMenu: (e: React.MouseEvent, item: Node) => void; isEditable: boolean; resizingNodeId: string | null; onNodeDoubleClick?: (nodeId: string) => void;} & DraggableProps>((props) => {
    const { node, isSelected, onSelect, onContextMenu, interactionMode, isEditable, resizingNodeId, onNodeDoubleClick } = props;
    const ref = useRef<SVGGElement>(null);
    
    const isResizing = resizingNodeId === node.id;

    useEffect(() => {
        if (!ref.current || !isEditable) return;
        const selection = select(ref.current);
        const dragBehavior = drag<SVGGElement, unknown>()
            .filter(event => interactionMode === 'select' || interactionMode === 'pan')
            .on('start', (event) => { selection.raise(); })
            .on('drag', (event) => {
                const { dx, dy } = event;
                const { data, onDataChange, selectedIds } = props;
                
                const newNodes = data.nodes.map(n => {
                    if (selectedIds.includes(n.id) && !n.locked) {
                        return { ...n, x: n.x + dx, y: n.y + dy };
                    }
                    return n;
                });
                onDataChange({ ...data, nodes: newNodes }, true);
            });
        selection.call(dragBehavior);
        return () => { selection.on('.drag', null); };
    }, [props, isEditable, interactionMode]);

    const handleResize = (dx: number, dy: number, handle: 'br' | 'bl' | 'tr' | 'tl') => {
        const { data, onDataChange } = props;
        const minSize = 40;
        const newNodes = data.nodes.map(n => {
            if (n.id === node.id) {
                const newWidth = Math.max(minSize, handle.includes('r') ? n.width + dx : n.width - dx);
                const newHeight = Math.max(minSize, handle.includes('b') ? n.height + dy : n.height - dy);
                const newX = n.x + (handle.includes('r') ? dx / 2 : -dx / 2);
                const newY = n.y + (handle.includes('b') ? dy / 2 : -dy / 2);
                return { ...n, width: newWidth, height: newHeight, x: newX, y: newY };
            }
            return n;
        });
        onDataChange({ ...data, nodes: newNodes }, true);
    };

    const ResizeHandle: React.FC<{ handle: 'br' | 'bl' | 'tr' | 'tl' }> = ({ handle }) => {
        const ref = useRef<SVGRectElement>(null);
        useEffect(() => {
            if (!ref.current) return;
            const selection = select(ref.current);
            const dragBehavior = drag<SVGRectElement, unknown>()
                .on('drag', (event) => handleResize(event.dx, event.dy, handle));
            selection.call(dragBehavior);
            return () => selection.on('.drag', null);
        }, []);

        const getCoords = () => {
          const size = 8;
          let x = node.x - node.width/2 - size/2;
          let y = node.y - node.height/2 - size/2;
          if (handle.includes('r')) x += node.width;
          if (handle.includes('b')) y += node.height;
          return { x, y };
        };

        return <rect ref={ref} {...getCoords()} width={8} height={8} fill="var(--color-accent-text)" stroke="var(--color-node-bg)" strokeWidth={2} cursor={`${handle.includes('b') ? 's' : 'n'}${handle.includes('r') ? 'e' : 'w'}-resize`} />;
    };

    return (
        <g ref={ref} onClick={(e) => onSelect(e, node.id)} onDoubleClick={() => onNodeDoubleClick?.(node.id)} onContextMenu={(e) => onContextMenu(e, node)} style={{ cursor: isEditable && (interactionMode === 'select' || interactionMode === 'pan') ? 'move' : (interactionMode === 'connect' ? 'pointer' : 'default')}}>
          <motion.g animate={{ x: node.x - node.width/2, y: node.y - node.height/2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
            <rect width={node.width} height={node.height} rx={node.shape === 'ellipse' ? Math.max(node.width, node.height)/2 : (node.shape === 'diamond' ? 8 : 12)} fill={node.color || "var(--color-node-bg)"} stroke={isSelected ? "var(--color-accent-text)" : "var(--color-border)"} strokeWidth={isSelected ? 2.5 : 1.5} style={{ filter: 'url(#drop-shadow)', transform: node.shape === 'diamond' ? `rotate(45 ${node.width/2} ${node.height/2})` : 'none'}}/>
            <foreignObject x={8} y={8} width={node.width - 16} height={node.height - 16} style={{ pointerEvents: 'none' }}>
              <div className="w-full h-full flex items-center justify-center text-center p-1">
                 <div className="flex items-center gap-2">
                    {node.type !== 'layer-label' && node.type !== 'group-label' && <ArchitectureIcon type={node.type} className="w-6 h-6 flex-shrink-0" />}
                    <div className="flex flex-col">
                      <span className="label-text font-medium leading-tight">{node.label}</span>
                      {node.description && <span className="label-desc text-sm leading-tight">{node.description}</span>}
                    </div>
                  </div>
              </div>
            </foreignObject>
          </motion.g>
          {isResizing && isSelected && ['tl', 'tr', 'bl', 'br'].map(h => <ResizeHandle key={h} handle={h as 'br'|'bl'|'tr'|'tl'} />)}
        </g>
    );
});

const DiagramLink = memo<{ link: Link; source: Node; target: Node; obstacles: Rect[]; onContextMenu: (e: React.MouseEvent, item: Link) => void; isSelected: boolean; onSelect: (e: React.MouseEvent, id: string) => void; offset: number; }>(({ link, source, target, obstacles, onContextMenu, isSelected, onSelect, offset }) => {
    
    const buildPathFromPoints = (points: Point[]): string => {
        if (points.length < 2) return '';
        if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

        const [p1, p2, p3, p4] = points;
        if (!p2 || !p3 || !p4) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

        if (p1.y === p4.y) return `M ${p1.x} ${p1.y} L ${p4.x} ${p4.y}`;

        // Use straight lines for sharp 90-degree corners
        return `M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y}`;
    };
    
    const generateOrthogonalPathD = (source: Node, target: Node, obstacles: Rect[], offset: number = 0): string => {
        const sourceEdgeXRight = source.x + source.width / 2;
        const sourceEdgeXLeft = source.x - source.width / 2;
        const targetEdgeXLeft = target.x - target.width / 2;
        const targetEdgeXRight = target.x - target.width / 2;

        const p1 = { x: source.x < target.x ? sourceEdgeXRight : sourceEdgeXLeft, y: source.y + offset };
        const p4 = { x: target.x > source.x ? targetEdgeXLeft : targetEdgeXRight, y: target.y };

        const midX = p1.x + 60 * Math.sign(p4.x - p1.x);

        const p2 = { x: midX, y: p1.y };
        const p3 = { x: midX, y: p4.y };

        return buildPathFromPoints([p1, p2, p3, p4]);
    };

    const pathD = useMemo(() => generateOrthogonalPathD(source, target, obstacles, offset), [source, target, obstacles, offset]);
    const pathRef = useRef<SVGPathElement>(null);
    const [labelPos, setLabelPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (pathRef.current && link.label) {
            const pathLength = pathRef.current.getTotalLength();
            const midPoint = pathRef.current.getPointAtLength(pathLength / 2);
            setLabelPos({ x: midPoint.x, y: midPoint.y });
        }
    }, [pathD, link.label]);
    
    const thicknessMap = { thin: 1.5, medium: 2, thick: 3 };
    const thicknessPx = thicknessMap[link.thickness || 'medium'];
    const color = link.color || (isSelected ? 'var(--color-accent-text)' : 'var(--color-link)');
    const dashArray = link.style === 'dashed' ? '8 6' : (link.style === 'dotted' ? '2 4' : 'none');

    return (
        <g onClick={(e) => onSelect(e, link.id)} onContextMenu={(e) => onContextMenu(e, link)} style={{ cursor: 'pointer' }}>
            <path ref={pathRef} d={pathD} stroke="transparent" strokeWidth={15} fill="none" />
            <path d={pathD} stroke={color} strokeWidth={thicknessPx} strokeDasharray={dashArray} fill="none" markerEnd={`url(#arrowhead)`} markerStart={link.bidirectional ? `url(#arrowhead-reverse)` : undefined} />
            {link.label && labelPos.x > 0 && (
                <text x={labelPos.x} y={labelPos.y - 8} textAnchor="middle" fill={color} fontSize="12" fontWeight="500">
                    {link.label}
                </text>
            )}
        </g>
    );
});

export default DiagramCanvas;
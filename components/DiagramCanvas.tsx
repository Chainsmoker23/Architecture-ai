import React, { useEffect, useRef, useState, useMemo } from 'react';
import { select, pointer } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import { DiagramData, Node, Link, Container } from '../types';
import ArchitectureIcon from './ArchitectureIcon';
import ContextMenu from './ContextMenu';

const GRID_SIZE = 10;

export type InteractionMode = 'select' | 'addNode' | 'connect';

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
}

interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ 
    data, onDataChange, selectedIds, setSelectedIds, forwardedRef, fitScreenRef,
    interactionMode = 'select', onInteractionCanvasClick, onInteractionNodeClick, linkPreview,
    onTransformChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; link: Link; } | null>(null);
  
  const nodesById = useMemo(() => new Map(data.nodes.map(node => [node.id, node])), [data.nodes]);
  const isSelected = (id: string) => selectedIds.includes(id);

  const tierColors = useMemo(() => {
    const colors = [
      'var(--color-tier-1)',
      'var(--color-tier-2)',
      'var(--color-tier-3)',
      'var(--color-tier-4)',
      'var(--color-tier-5)',
      'var(--color-tier-6)',
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
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
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
        // Allow wheel zoom and right-click pan, but prevent left-click pan unless on background
        return event.type === 'wheel' || event.button === 2 || (event.type === 'mousedown' && (event.target as HTMLElement)?.tagName === 'svg');
      })
      .on('zoom', (event) => {
        setViewTransform(event.transform);
        if (onTransformChange) {
            onTransformChange(event.transform);
        }
      });
      
    svg.call(zoomBehavior).on("dblclick.zoom", null);
    
    const fitToScreen = () => {
      const contentGroup = svg.select<SVGGElement>('#diagram-content').node();
      if (!contentGroup || !parent || data.nodes.length === 0) return;

      const bounds = contentGroup.getBBox();
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      const { width: diagramWidth, height: diagramHeight, x: diagramX, y: diagramY } = bounds;

      if (diagramWidth <= 0 || diagramHeight <= 0) return;

      const scale = Math.min(
        4, // max zoom from scaleExtent
        0.95 / Math.max(diagramWidth / parentWidth, diagramHeight / parentHeight)
      );

      const tx = parentWidth / 2 - (diagramX + diagramWidth / 2) * scale;
      const ty = parentHeight / 2 - (diagramY + diagramHeight / 2) * scale;

      svg.transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity.translate(tx, ty).scale(scale));
    };
    
    if (fitScreenRef) {
      fitScreenRef.current = fitToScreen;
    }
    
    const handleCanvasClick = (event: PointerEvent) => {
        // Prevent deselecting when panning
        if (event.detail > 0 && (event.target as SVGSVGElement).tagName === 'svg') {
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
    if (svgNode) {
      svgNode.addEventListener('click', handleCanvasClick as EventListener);
    }

    return () => {
      if (svgNode) {
         svgNode.removeEventListener('click', handleCanvasClick as EventListener);
      }
      svg.on('.zoom', null);
      if (fitScreenRef) fitScreenRef.current = null;
    }
  }, [forwardedRef, setSelectedIds, data, fitScreenRef, interactionMode, onInteractionCanvasClick, onTransformChange]);

  const handleLinkContextMenu = (e: React.MouseEvent, link: Link) => {
    e.preventDefault();
    e.stopPropagation();
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, link });
    }
  };
  
  const handleLinkStyleToggle = (link: Link) => {
    const newLinks = data.links.map((l): Link => l.id === link.id ? { ...l, style: l.style === 'dotted' ? 'solid' : 'dotted' } : l);
    onDataChange({ ...data, links: newLinks }, true);
    setContextMenu(null);
  }

  const handleLinkDelete = (link: Link) => {
    const newLinks = data.links.filter(l => l.id !== link.id);
    onDataChange({ ...data, links: newLinks }, true);
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
      case 'addNode': return 'crosshair';
      case 'connect': return 'pointer';
      default: return 'grab';
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[var(--color-canvas-bg)] rounded-b-2xl">
      <svg ref={forwardedRef} className="w-full h-full absolute inset-0 active:cursor-grabbing" style={{ cursor: getCursor() }}>
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
          {data.containers?.map(container => {
              const fillColor = container.color || (container.type === 'tier'
                  ? tierColors.get(container.id) || 'var(--color-tier-default)'
                  : 'var(--color-tier-default)');
              return (
                  <DiagramContainer 
                      key={container.id} 
                      container={container}
                      data={data}
                      onDataChange={onDataChange}
                      isSelected={isSelected(container.id)}
                      onSelect={handleItemSelection}
                      selectedIds={selectedIds}
                      fillColor={fillColor}
                      interactionMode={interactionMode}
                  />
              );
          })}
          {data.links.map((link) => {
            const sourceNode = nodesById.get(typeof link.source === 'string' ? link.source : link.source.id);
            const targetNode = nodesById.get(typeof link.target === 'string' ? link.target : link.target.id);
            if (!sourceNode || !targetNode) return null;
            return <DiagramLink 
              key={link.id} 
              link={link} 
              source={sourceNode} 
              target={targetNode} 
              obstacles={obstacles.filter(o => o.x !== (sourceNode.x - sourceNode.width/2) && o.x !== (targetNode.x - targetNode.width/2))}
              onContextMenu={handleLinkContextMenu}
              isSelected={isSelected(link.id)}
              onSelect={handleItemSelection}
            />;
          })}
          {data.nodes.map(node => (
            <DiagramNode
              key={node.id}
              node={node}
              data={data}
              onDataChange={onDataChange}
              isSelected={isSelected(node.id)}
              onSelect={handleNodeClick}
              selectedIds={selectedIds}
              interactionMode={interactionMode}
            />
          ))}
          {linkPreview && (
            <path 
                d={`M ${linkPreview.sourceNode.x} ${linkPreview.sourceNode.y} L ${linkPreview.targetCoords.x} ${linkPreview.targetCoords.y}`}
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="pointer-events-none"
            />
          )}
        </g>
      </svg>
      {contextMenu && (
        <ContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y}
            options={[
                { label: `Style: ${contextMenu.link.style === 'dotted' ? 'Solid' : 'Dotted'}`, onClick: () => handleLinkStyleToggle(contextMenu.link) },
                { label: 'Delete', onClick: () => handleLinkDelete(contextMenu.link) },
            ]}
            onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

// --- Sub-components ---
interface DraggableProps {
    data: DiagramData;
    onDataChange: (data: DiagramData, fromHistory?: boolean) => void;
    selectedIds: string[];
    interactionMode: InteractionMode;
}

const DiagramContainer: React.FC<{
    container: Container;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent, id: string) => void;
    fillColor: string;
} & DraggableProps> = ({ container, isSelected, onSelect, fillColor, ...props }) => {
    const ref = useRef<SVGGElement>(null);
    const { label, type, x, y, width, height } = container;
    
    useEffect(() => {
        if (!ref.current || props.interactionMode !== 'select') return;

        const g = select(ref.current);
        let startX = 0, startY = 0;
        let childStartPositions = new Map<string, {x: number, y: number}>();
        
        const dragHandler = drag<SVGGElement, unknown>()
            .on('start', (event) => {
                startX = container.x;
                startY = container.y;
                childStartPositions.clear();
                container.childNodeIds.forEach(id => {
                    const node = props.data.nodes.find(n => n.id === id);
                    if (node) childStartPositions.set(id, { x: node.x, y: node.y });
                });
                g.raise();
                event.sourceEvent.stopPropagation();
            })
            .on('drag', (event) => {
                const dx = event.x - event.subject.x;
                const dy = event.y - event.subject.y;
                g.attr('transform', `translate(${startX + dx}, ${startY + dy})`);
                
                // This part is tricky for performance without full state update
            })
            .on('end', (event) => {
                const finalDx = event.x - event.subject.x;
                const finalDy = event.y - event.subject.y;
                const { data, onDataChange } = props;

                const newNodes = data.nodes.map(n => {
                    if (container.childNodeIds.includes(n.id) && !n.locked) {
                        const startPos = childStartPositions.get(n.id);
                        return { ...n, x: (startPos?.x || n.x) + finalDx, y: (startPos?.y || n.y) + finalDy };
                    }
                    return n;
                });
                
                const newContainers = data.containers?.map(c => {
                    if (c.id === container.id) {
                         return { ...c, x: startX + finalDx, y: startY + finalDy };
                    }
                    return c;
                }) || [];

                onDataChange({ ...data, nodes: newNodes, containers: newContainers });
            });
        g.call(dragHandler);
    }, [container, props]);

    const style: React.SVGProps<SVGRectElement> = {
        fill: fillColor,
        stroke: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
        strokeWidth: isSelected ? 2 : 1.5,
        rx: 12, ry: 12,
    };
    
    if(type === 'tier' || type === 'region' || type === 'availability-zone') {
        style.strokeDasharray = '8 4';
    }

    return (
        <g ref={ref} transform={`translate(${x}, ${y})`} onClick={(e) => onSelect(e, container.id)} style={{ cursor: props.interactionMode === 'select' ? 'move' : 'default', filter: 'url(#drop-shadow)' }}>
            <rect width={width} height={height} {...style} />
            <text x="15" y="25" fill="var(--color-text-secondary)" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</text>
        </g>
    );
}

const DiagramNode: React.FC<{
    node: Node;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent, id: string) => void;
} & DraggableProps> = ({ node, isSelected, onSelect, ...props }) => {
    const ref = useRef<SVGGElement>(null);

    useEffect(() => {
        if (!ref.current || node.locked || props.interactionMode !== 'select') {
            select(ref.current).on('.drag', null);
            return;
        }

        const g = select(ref.current);
        let startPositions = new Map<string, {x: number, y: number}>();
        
        const dragHandler = drag<SVGGElement, unknown>()
            .on('start', function(event) {
                startPositions.clear();
                const { selectedIds } = props;
                const isDraggingSelected = selectedIds.includes(node.id);
                const idsToMove = isDraggingSelected ? selectedIds : [node.id];
                
                props.data.nodes.forEach(n => {
                    if (idsToMove.includes(n.id)) {
                        startPositions.set(n.id, { x: n.x, y: n.y });
                    }
                });
                
                select(this).raise();
                event.sourceEvent.stopPropagation();
            })
            .on('drag', function(event) {
                const dx = event.x - event.subject.x;
                const dy = event.y - event.subject.y;
                
                startPositions.forEach((startPos, id) => {
                    const el = select<SVGGElement, Node>(`#node-g-${id}`).node();
                    if(el) {
                        const n = props.data.nodes.find(node => node.id === id);
                        if (n) {
                           select(el).attr('transform', `translate(${startPos.x + dx - n.width / 2}, ${startPos.y + dy - n.height / 2})`);
                        }
                    }
                });
            })
            .on('end', function(event) {
                const finalDx = event.x - event.subject.x;
                const finalDy = event.y - event.subject.y;
                const { data, onDataChange } = props;
                
                const newNodes = data.nodes.map(n => {
                    const startPos = startPositions.get(n.id);
                    if (startPos && !n.locked) {
                        return { ...n, x: startPos.x + finalDx, y: startPos.y + finalDy };
                    }
                    return n;
                });
                onDataChange({ ...data, nodes: newNodes });
            });
            
        g.call(dragHandler);

    }, [node.id, props.data.nodes, props.selectedIds, node.locked, props.interactionMode, props.onDataChange]);


    const getCursor = () => {
        if (node.locked) return 'default';
        if (props.interactionMode === 'connect') return 'pointer';
        if (props.interactionMode === 'select') return 'move';
        return 'default';
    };

    if (node.type === 'neuron') {
        return (
            <g id={`node-g-${node.id}`} ref={ref} transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
               style={{ cursor: getCursor() }}
               onClick={(e) => onSelect(e, node.id)} >
                <circle 
                    cx={node.width / 2} 
                    cy={node.height / 2} 
                    r={Math.min(node.width, node.height) / 2} 
                    fill={node.color || "#CCCCCC"}
                    stroke={isSelected ? 'var(--color-accent)' : '#000000'}
                    strokeWidth={isSelected ? 2 : 1}
                />
            </g>
        );
    }

    if (node.type === 'layer-label' || node.type === 'group-label') {
        return (
             <g id={`node-g-${node.id}`} ref={ref} transform={`translate(${node.x}, ${node.y})`}
               style={{ cursor: getCursor(), pointerEvents: 'none' }} >
                <text 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill="var(--color-text-primary)"
                    fontSize={node.type === 'group-label' ? "18" : "16"}
                    fontWeight="600"
                >
                    {node.label}
                </text>
            </g>
        );
    }

    return (
        <g id={`node-g-${node.id}`} ref={ref} transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
           style={{ cursor: getCursor(), filter: 'url(#drop-shadow)' }}
           onClick={(e) => onSelect(e, node.id)} >
            <rect width={node.width} height={node.height} rx={12} ry={12} fill={node.color || "var(--color-node-bg)"}
                  stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'} strokeWidth={2} className="transition-all" />
            <foreignObject x="12" y="12" width="32" height="32">
                <ArchitectureIcon type={node.type} className="w-8 h-8" />
            </foreignObject>
            <foreignObject x="52" y="10" width={node.width - 60} height={node.height - 20} >
                <div className="label-text text-sm font-medium leading-tight h-full flex items-center" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                    {node.label}
                </div>
            </foreignObject>
            {node.locked && (
                <path d="M12 1.5A3.5 3.5 0 008.5 5v1.5H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1.5V5A3.5 3.5 0 0012 1.5zM12 3a2 2 0 012 2v1.5H10V5a2 2 0 012-2z" fill="var(--color-text-tertiary)" transform={`translate(${node.width - 20}, 4) scale(0.7)`} />
            )}
        </g>
    );
};

const getOrthogonalPath = (source: Node, target: Node, obstacles: Rect[]): Point[] => {
    const start: Point = { x: source.x, y: source.y };
    const end: Point = { x: target.x, y: target.y };

    // For neuron-to-neuron connections, draw a straight line.
    if(source.type === 'neuron' && target.type === 'neuron') {
        return [start, end];
    }
    
    const pathH: Point[] = [start, { x: end.x, y: start.y }, end];
    const pathV: Point[] = [start, { x: start.x, y: end.y }, end];

    const intersects = (p1: Point, p2: Point, rect: Rect) => {
        const minX = Math.min(p1.x, p2.x), maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y), maxY = Math.max(p1.y, p2.y);
        return rect.x < maxX && rect.x + rect.width > minX && rect.y < maxY && rect.y + rect.height > minY;
    };
    
    const isPathClear = (path: Point[]) => {
      for (let i = 0; i < path.length - 1; i++) {
        for (const obs of obstacles) {
          if(intersects(path[i], path[i+1], obs)) return false;
        }
      }
      return true;
    };

    if (isPathClear(pathH)) return pathH;
    if (isPathClear(pathV)) return pathV;

    const dx = Math.abs(start.x - end.x);
    const dy = Math.abs(start.y - end.y);
    return dx > dy ? pathH : pathV;
};

const pointsToPath = (points: Point[], radius: number): string => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const p3 = points[i + 1];
        
        if (p3 && radius > 0) {
            const dx1 = p2.x - p1.x;
            const dy1 = p2.y - p1.y;
            const dx2 = p3.x - p2.x;
            const dy2 = p3.y - p2.y;
            
            const nextX = p2.x + Math.sign(dx2) * radius;
            const nextY = p2.y + Math.sign(dy2) * radius;

            if (dx1 !== 0) {
                path += ` L ${p2.x - Math.sign(dx1) * radius} ${p2.y}`;
            } else {
                path += ` L ${p2.x} ${p2.y - Math.sign(dy1) * radius}`;
            }
            path += ` A ${radius} ${radius} 0 0 ${dy1 * dx2 > 0 ? 1 : 0} ${nextX} ${nextY}`;
        } else {
            path += ` L ${p2.x} ${p2.y}`;
        }
    }
    return path;
};

const getDashArray = (style?: 'solid' | 'dotted' | 'dashed') => {
    switch (style) {
        case 'dotted': return '2 5';
        case 'dashed': return '10 5';
        case 'solid':
        default: return 'none';
    }
}

const getStrokeWidth = (thickness?: 'thin' | 'medium' | 'thick', isSelected?: boolean) => {
    const baseWidth = { thin: 1.5, medium: 2, thick: 3.5 }[thickness || 'medium'];
    return isSelected ? baseWidth + 1.5 : baseWidth;
}

const DiagramLink: React.FC<{ link: Link, source: Node, target: Node, obstacles: Rect[], onContextMenu: (e: React.MouseEvent, link: Link) => void, onSelect: (e: React.MouseEvent, id: string) => void, isSelected: boolean }> = ({ link, source, target, obstacles, onContextMenu, onSelect, isSelected }) => {
    const isNeuronLink = source.type === 'neuron' && target.type === 'neuron';
    const pathPoints = useMemo(() => getOrthogonalPath(source, target, obstacles), [source, target, obstacles]);
    
    if (pathPoints.length < 2) return null;

    const startPoint = pathPoints[0];
    const nextToStartPoint = pathPoints[1];
    const endPoint = pathPoints[pathPoints.length - 1];
    const prevPoint = pathPoints[pathPoints.length - 2];
    
    const dxEnd = endPoint.x - prevPoint.x;
    const dyEnd = endPoint.y - prevPoint.y;
    const lengthEnd = Math.sqrt(dxEnd*dxEnd + dyEnd*dyEnd);
    
    if (lengthEnd > 0) {
        const unitDx = dxEnd/lengthEnd;
        const unitDy = dyEnd/lengthEnd;
        const targetRadius = isNeuronLink ? target.width / 2 : Math.max(target.width, target.height) / 2;
        const inset = isNeuronLink ? 0 : 0.5;
        pathPoints[pathPoints.length - 1] = {
            x: endPoint.x - unitDx * (targetRadius * inset),
            y: endPoint.y - unitDy * (targetRadius * inset)
        };
    }

    const dxStart = startPoint.x - nextToStartPoint.x;
    const dyStart = startPoint.y - nextToStartPoint.y;
    const lengthStart = Math.sqrt(dxStart * dxStart + dyStart * dyStart);

    if (link.bidirectional && lengthStart > 0) {
        const unitDx = dxStart / lengthStart;
        const unitDy = dyStart / lengthStart;
        const sourceRadius = isNeuronLink ? source.width / 2 : Math.max(source.width, source.height) / 2;
        const inset = isNeuronLink ? 0 : 0.5;
        pathPoints[0] = {
            x: startPoint.x - unitDx * (sourceRadius * inset),
            y: startPoint.y - unitDy * (sourceRadius * inset)
        };
    }
    
    const pathD = useMemo(() => pointsToPath(pathPoints, isNeuronLink ? 0 : 10), [pathPoints, isNeuronLink]);
    
    const midIndex = Math.floor(pathPoints.length / 2);
    const midPoint1 = pathPoints[midIndex-1];
    const midPoint2 = pathPoints[midIndex];
    if(!midPoint1 || !midPoint2) return null;

    const midX = (midPoint1.x + midPoint2.x) / 2;
    const midY = (midPoint1.y + midPoint2.y) / 2;
    const strokeColor = link.color || (isNeuronLink ? '#000000' : 'var(--color-link)');
    const strokeWidth = getStrokeWidth(isNeuronLink ? 'thin' : link.thickness, isSelected);

    return (
        <g onContextMenu={(e) => onContextMenu(e, link)} onClick={(e) => onSelect(e, link.id)}>
            <path d={pathD} stroke={strokeColor} strokeWidth={strokeWidth} fill="none"
                  strokeDasharray={getDashArray(link.style)}
                  markerStart={link.bidirectional ? "url(#arrowhead-reverse)" : undefined}
                  markerEnd={isNeuronLink ? undefined : "url(#arrowhead)"}
                  className="transition-all" />
            <path d={pathD} stroke="transparent" strokeWidth="15" fill="none" className="cursor-pointer" />
            {link.label && (
                <foreignObject x={midX - 75} y={midY - 15} width="150" height="30" style={{ pointerEvents: 'none' }}>
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-xs text-[var(--color-link)] bg-[var(--color-canvas-bg)] px-1 font-medium">
                          {link.label}
                      </div>
                    </div>
                </foreignObject>
            )}
        </g>
    );
};

export default DiagramCanvas;
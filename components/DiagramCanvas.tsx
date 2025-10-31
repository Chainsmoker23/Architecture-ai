

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import 'd3-transition';
import { DiagramData, Node, Link, Container } from '../types';
import ArchitectureIcon from './ArchitectureIcon';
import ContextMenu from './ContextMenu';

const GRID_SIZE = 10;
const MARGIN = 20;

export type InteractionMode = 'select' | 'addNode' | 'connect' | 'pan' | 'lasso';

interface DiagramCanvasProps {
  data: DiagramData;
  onDataChange: (newData: DiagramData, fromHistory?: boolean) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  forwardedRef: React.RefObject<SVGSVGElement>;
  fitScreenRef: React.RefObject<(() => void) | null>;
  centerViewRef: React.RefObject<(() => void) | null>;
  interactionMode?: InteractionMode;
  onInteractionCanvasClick?: (coords: { x: number, y: number }) => void;
  onInteractionNodeClick?: (nodeId: string) => void;
  linkPreview?: { sourceNode: Node; targetCoords: { x: number; y: number } } | null;
  lassoRect?: {x: number, y: number, width: number, height: number} | null;
  setLassoRect?: React.Dispatch<React.SetStateAction<{x: number, y: number, width: number, height: number} | null>>;
}

interface Point { x: number; y: number; }
interface Rect { x: number; y: number; width: number; height: number; }

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ 
    data, onDataChange, selectedIds, setSelectedIds, forwardedRef, fitScreenRef, centerViewRef,
    interactionMode = 'select', onInteractionCanvasClick, onInteractionNodeClick, linkPreview,
    lassoRect, setLassoRect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; link: Link; } | null>(null);
  const isLassoingRef = useRef(false);
  const lassoStartPointRef = useRef({x: 0, y: 0});
  
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

  const handleSelection = (e: React.MouseEvent, id: string) => {
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
      .filter((event) => {
        if (interactionMode === 'pan') return !event.button; // allow pan with left click
        return event.ctrlKey || event.metaKey || event.button === 1; // allow zoom with wheel/middle click
      })
      .on('zoom', (event) => {
        if (interactionMode === 'pan' || event.sourceEvent?.type === 'wheel') {
            setViewTransform(event.transform);
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
    
    const centerView = () => {
      const contentGroup = svg.select<SVGGElement>('#diagram-content').node();
      if (!contentGroup || !parent || data.nodes.length === 0) return;

      const bounds = contentGroup.getBBox();
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;
      const { width: diagramWidth, height: diagramHeight, x: diagramX, y: diagramY } = bounds;
      
      if (diagramWidth <= 0 || diagramHeight <= 0) return;

      const currentScale = viewTransform.k;
      const tx = parentWidth / 2 - (diagramX + diagramWidth / 2) * currentScale;
      const ty = parentHeight / 2 - (diagramY + diagramHeight / 2) * currentScale;

      svg.transition()
        .duration(750)
        .call(zoomBehavior.transform, zoomIdentity.translate(tx, ty).scale(currentScale));
    };

    if (fitScreenRef) {
      fitScreenRef.current = fitToScreen;
    }
    if (centerViewRef) {
        centerViewRef.current = centerView;
    }

    const getTransformedPoint = (event: MouseEvent) => {
        const svgNode = svg.node();
        if (!svgNode) return { x: 0, y: 0 };
        const svgPoint = svgNode.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;
        return svgPoint.matrixTransform((svgNode.getScreenCTM() as DOMMatrix).inverse());
    };

    const handleCanvasClick = (event: MouseEvent) => {
        const transformedPoint = getTransformedPoint(event);
        if (interactionMode === 'addNode' && onInteractionCanvasClick) {
            onInteractionCanvasClick(transformedPoint);
        } else {
            setSelectedIds([]);
            setContextMenu(null);
        }
    };
    
    const handleMouseDown = (event: MouseEvent) => {
        if (interactionMode === 'lasso' && setLassoRect) {
            event.preventDefault();
            isLassoingRef.current = true;
            const startPoint = getTransformedPoint(event);
            lassoStartPointRef.current = startPoint;
            setLassoRect({ x: startPoint.x, y: startPoint.y, width: 0, height: 0 });
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (interactionMode === 'lasso' && isLassoingRef.current && setLassoRect) {
            event.preventDefault();
            const currentPoint = getTransformedPoint(event);
            const startPoint = lassoStartPointRef.current;
            const x = Math.min(startPoint.x, currentPoint.x);
            const y = Math.min(startPoint.y, currentPoint.y);
            const width = Math.abs(startPoint.x - currentPoint.x);
            const height = Math.abs(startPoint.y - currentPoint.y);
            setLassoRect({ x, y, width, height });
        }
    };

    const handleMouseUp = (event: MouseEvent) => {
        if (interactionMode === 'lasso' && isLassoingRef.current && lassoRect && setLassoRect) {
            isLassoingRef.current = false;
            setLassoRect(null);

            const selected = data.nodes.filter(node => {
                const nodeX = node.x - node.width / 2;
                const nodeY = node.y - node.height / 2;
                return (
                    nodeX < lassoRect.x + lassoRect.width &&
                    nodeX + node.width > lassoRect.x &&
                    nodeY < lassoRect.y + lassoRect.height &&
                    nodeY + node.height > lassoRect.y
                );
            });
            setSelectedIds(selected.map(n => n.id));
        }
    };
    
    svg.on('click', handleCanvasClick);
    svg.on('mousedown', handleMouseDown);
    svg.on('mousemove', handleMouseMove);
    svg.on('mouseup', handleMouseUp);
    svg.on('mouseleave', handleMouseUp); // End lasso if mouse leaves svg

    return () => {
        svg.on('click', null).on('.zoom', null).on('mousedown', null).on('mousemove', null).on('mouseup', null).on('mouseleave', null);
        if (fitScreenRef) fitScreenRef.current = null;
        if (centerViewRef) centerViewRef.current = null;
    }
  }, [forwardedRef, setSelectedIds, data, fitScreenRef, centerViewRef, viewTransform, interactionMode, onInteractionCanvasClick, lassoRect, setLassoRect]);

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
          handleSelection(e, id);
      }
  };
  
  const getCursor = () => {
    switch(interactionMode) {
      case 'addNode': return 'crosshair';
      case 'connect': return 'pointer';
      case 'pan': return 'grab';
      case 'lasso': return 'crosshair';
      default: return 'default';
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
            <path d="M 0,-5 L 10 ,0 L 0,5" fill="var(--color-link)" style={{ stroke: 'none' }}></path>
          </marker>
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="var(--color-shadow)" floodOpacity="0.1" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" transform={viewTransform.toString()} />

        <g id="diagram-content" transform={viewTransform.toString()}>
          {data.containers?.map(container => {
              const fillColor = container.type === 'tier'
                  ? tierColors.get(container.id) || 'var(--color-tier-default)'
                  : 'var(--color-tier-default)';
              return (
                  <DiagramContainer 
                      key={container.id} 
                      container={container}
                      data={data}
                      onDataChange={onDataChange}
                      isSelected={isSelected(container.id)}
                      onSelect={handleSelection}
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
          {lassoRect && (
            <rect 
                {...lassoRect}
                fill="rgba(249, 215, 227, 0.2)"
                stroke="var(--color-accent)"
                strokeWidth="1"
                strokeDasharray="4 4"
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

const DiagramContainer = ({ container, isSelected, onSelect, fillColor, ...props }: {
    container: Container;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent, id: string) => void;
    fillColor: string;
} & DraggableProps) => {
    const ref = useRef<SVGGElement>(null);
    const { label, type, x, y, width, height } = container;

    useEffect(() => {
        if (!ref.current || props.interactionMode !== 'select') return;
        const dragHandler = drag<SVGGElement, unknown>()
            .on('start', (event) => event.sourceEvent.stopPropagation())
            .on('drag', (event) => {
                const dx = event.dx;
                const dy = event.dy;
                const { data, onDataChange, selectedIds } = props;
                const isDraggingSelected = selectedIds.includes(container.id);
                
                const newNodes = data.nodes.map(n => {
                    const shouldMove = (isDraggingSelected && selectedIds.includes(n.id)) || 
                                     (!isDraggingSelected && container.childNodeIds.includes(n.id));
                    if (shouldMove && !n.locked) {
                        return { ...n, x: n.x + dx, y: n.y + dy };
                    }
                    return n;
                });
                
                const newContainers = data.containers?.map(c => {
                    if (isDraggingSelected ? selectedIds.includes(c.id) : c.id === container.id) {
                         const newX = c.x + dx;
                         const newY = c.y + dy;
                         return { ...c, x: newX, y: newY };
                    }
                    return c;
                }) || [];

                onDataChange({ ...data, nodes: newNodes, containers: newContainers }, true);
            });
        select(ref.current).call(dragHandler);
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
        <g ref={ref} transform={`translate(${x}, ${y})`} className={props.interactionMode === 'select' ? 'cursor-move' : ''} onClick={(e) => onSelect(e, container.id)} style={{ filter: 'url(#drop-shadow)' }}>
            <rect width={width} height={height} {...style} />
            <text x="15" y="25" fill="var(--color-text-secondary)" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</text>
        </g>
    );
}

const DiagramNode = ({ node, isSelected, onSelect, ...props }: {
    node: Node;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent, id: string) => void;
} & DraggableProps) => {
    const ref = useRef<SVGGElement>(null);

    useEffect(() => {
        if (!ref.current || node.locked || props.interactionMode !== 'select') {
            select(ref.current).on('.drag', null);
            return;
        }
        const dragHandler = drag<SVGGElement, unknown>()
            .on('start', (event) => event.sourceEvent.stopPropagation())
            .on('drag', (event) => {
                const { data, onDataChange, selectedIds } = props;
                const isDraggingSelected = selectedIds.includes(node.id);

                const newNodes = data.nodes.map(n => {
                    const shouldMove = isDraggingSelected ? selectedIds.includes(n.id) : n.id === node.id;
                    if (shouldMove && !n.locked) {
                        const newX = n.x + event.dx;
                        const newY = n.y + event.dy;
                        return { ...n, x: newX, y: newY };
                    }
                    return n;
                });
                onDataChange({ ...data, nodes: newNodes }, true);
            });
        select(ref.current).call(dragHandler);
    }, [node, props]);

    const getCursor = () => {
        if (node.locked) return 'default';
        if (props.interactionMode === 'connect') return 'pointer';
        if (props.interactionMode === 'select') return 'move';
        return 'default';
    };

    return (
        <g ref={ref} transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
           style={{ cursor: getCursor(), filter: 'url(#drop-shadow)' }}
           onClick={(e) => onSelect(e, node.id)} >
            <rect width={node.width} height={node.height} rx={12} ry={12} fill="var(--color-node-bg)"
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
        
        if (p3) {
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

const DiagramLink = ({ link, source, target, obstacles, onContextMenu }: { link: Link, source: Node, target: Node, obstacles: Rect[], onContextMenu: (e: React.MouseEvent, link: Link) => void }) => {
    const pathPoints = useMemo(() => getOrthogonalPath(source, target, obstacles), [source, target, obstacles]);
    
    if (pathPoints.length < 2) return null;

    const endPoint = pathPoints[pathPoints.length - 1];
    const prevPoint = pathPoints[pathPoints.length - 2];
    
    const dx = endPoint.x - prevPoint.x;
    const dy = endPoint.y - prevPoint.y;
    const length = Math.sqrt(dx*dx + dy*dy);
    const unitDx = dx/length;
    const unitDy = dy/length;
    const targetRadius = Math.max(target.width, target.height) / 2;
    pathPoints[pathPoints.length - 1] = {
        x: endPoint.x - unitDx * (targetRadius * 0.5),
        y: endPoint.y - unitDy * (targetRadius * 0.5)
    };
    
    const pathD = useMemo(() => pointsToPath(pathPoints, 10), [pathPoints]);
    
    const midIndex = Math.floor(pathPoints.length / 2);
    const midPoint1 = pathPoints[midIndex-1];
    const midPoint2 = pathPoints[midIndex];
    if(!midPoint1 || !midPoint2) return null;

    const midX = (midPoint1.x + midPoint2.x) / 2;
    const midY = (midPoint1.y + midPoint2.y) / 2;

    return (
        <g onContextMenu={(e) => onContextMenu(e, link)}>
            <path d={pathD} stroke="none" strokeWidth="15" fill="none" className="cursor-pointer" />
            <path d={pathD} stroke="var(--color-link)" strokeOpacity="0.8" strokeWidth="2"
                  fill="none"
                  strokeDasharray={link.style === 'dotted' ? '5 5' : 'none'}
                  markerEnd="url(#arrowhead)" />
            {link.label && (
                <text x={midX} y={midY} dy="-6" fill="var(--color-text-secondary)" textAnchor="middle"
                      style={{ fontSize: '10px', paintOrder: 'stroke', stroke: 'var(--color-canvas-bg)', strokeWidth: '3px', strokeLinejoin: 'round' }} className="pointer-events-none">
                    {link.label}
                </text>
            )}
        </g>
    );
};

export default DiagramCanvas;
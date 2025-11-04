import React, { useEffect, useRef, useState, useMemo } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import { motion } from 'framer-motion';
import { DiagramData, Node, Link } from '../types';

interface DrawableNode extends Node {
  calculatedX: number;
  calculatedY: number;
}

interface DrawableLink extends Link {
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
}

interface Layout {
  nodes: DrawableNode[];
  links: DrawableLink[];
  width: number;
  height: number;
}

// Define a large, fixed virtual canvas for consistent layout calculations,
// independent of the screen's viewport size. This is crucial for reliable exports.
const VIRTUAL_CANVAS_WIDTH = 4000;
const VIRTUAL_CANVAS_HEIGHT = 3000;

const useNeuralNetworkLayout = (data: DiagramData): Layout => {
  return useMemo(() => {
    if (!data || !data.nodes) return { nodes: [], links: [], width: 0, height: 0 };
    
    const NEURON_RADIUS = 25;
    const VERTICAL_SPACING = 30;
    const HORIZONTAL_SPACING = 250;
    const LABEL_OFFSET_Y = 60;

    const neurons = data.nodes.filter(n => n.type === 'neuron');
    const labels = data.nodes.filter(n => n.type === 'layer-label');

    const layers = new Map<number, Node[]>();
    neurons.forEach(neuron => {
      const layer = neuron.layer ?? 0;
      if (!layers.has(layer)) {
        layers.set(layer, []);
      }
      layers.get(layer)!.push(neuron);
    });

    const sortedLayerKeys = Array.from(layers.keys()).sort((a, b) => a - b);
    const numLayers = sortedLayerKeys.length;
    
    // The total width of the diagram content.
    const layoutWidth = (numLayers + 1) * HORIZONTAL_SPACING;
    let maxLayerHeight = 0;

    const drawableNodes: DrawableNode[] = [];
    const nodePositionMap = new Map<string, { x: number, y: number }>();

    sortedLayerKeys.forEach((layerIndex, i) => {
      const layerNeurons = layers.get(layerIndex) || [];
      const numNeuronsInLayer = layerNeurons.length;
      const layerHeight = numNeuronsInLayer * (NEURON_RADIUS * 2 + VERTICAL_SPACING) - VERTICAL_SPACING;
      maxLayerHeight = Math.max(maxLayerHeight, layerHeight);

      const layerX = (VIRTUAL_CANVAS_WIDTH / 2) - (layoutWidth / 2) + (i + 1) * HORIZONTAL_SPACING;
      // Center the layer vertically on the large virtual canvas.
      const startY = (VIRTUAL_CANVAS_HEIGHT / 2) - (layerHeight / 2);
      
      layerNeurons.forEach((neuron, j) => {
        const calculatedX = layerX;
        const calculatedY = startY + j * (NEURON_RADIUS * 2 + VERTICAL_SPACING);
        drawableNodes.push({ ...neuron, calculatedX, calculatedY });
        nodePositionMap.set(neuron.id, { x: calculatedX, y: calculatedY });
      });
    });

    labels.forEach(label => {
        const layerIndex = label.layer ?? 0;
        const layerNeurons = layers.get(layerIndex);
        if (layerNeurons && layerNeurons.length > 0) {
            const layerHeight = layerNeurons.length * (NEURON_RADIUS * 2 + VERTICAL_SPACING) - VERTICAL_SPACING;
            const firstNeuronY = (VIRTUAL_CANVAS_HEIGHT / 2) - (layerHeight / 2);
            
            drawableNodes.push({
                ...label,
                calculatedX: (VIRTUAL_CANVAS_WIDTH / 2) - (layoutWidth / 2) + (sortedLayerKeys.indexOf(layerIndex) + 1) * HORIZONTAL_SPACING,
                calculatedY: firstNeuronY - LABEL_OFFSET_Y,
            });
        }
    });

    const drawableLinks: DrawableLink[] = (data.links || []).map(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      const sourcePos = nodePositionMap.get(sourceId)!;
      const targetPos = nodePositionMap.get(targetId)!;

      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      return {
        ...link,
        sourcePos: {
            x: sourcePos.x + (dx/dist) * NEURON_RADIUS,
            y: sourcePos.y + (dy/dist) * NEURON_RADIUS,
        },
        targetPos: {
            x: targetPos.x - (dx/dist) * NEURON_RADIUS,
            y: targetPos.y - (dy/dist) * NEURON_RADIUS,
        }
      };
    }).filter(l => l.sourcePos && l.targetPos);

    return { nodes: drawableNodes, links: drawableLinks, width: layoutWidth, height: maxLayerHeight + (LABEL_OFFSET_Y * 2) };
  }, [data]);
};


const NeuralNetworkCanvas: React.FC<{ data: DiagramData, forwardedRef: React.RefObject<SVGSVGElement> }> = ({ data, forwardedRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewTransform, setViewTransform] = useState<ZoomTransform>(() => zoomIdentity);
  
  const layout = useNeuralNetworkLayout(data);

  useEffect(() => {
    if (!forwardedRef.current || !containerRef.current || layout.width === 0) return;
    
    const svg = select(forwardedRef.current);
    
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => setViewTransform(event.transform));
      
    svg.call(zoomBehavior);
    
    const fitToScreen = () => {
        const contentGroup = svg.select<SVGGElement>('#diagram-content').node();
        if (!contentGroup || !containerRef.current) return;
        
        const bounds = contentGroup.getBBox();
        const parentWidth = containerRef.current.clientWidth;
        const parentHeight = containerRef.current.clientHeight;
        const { width: diagramWidth, height: diagramHeight, x: diagramX, y: diagramY } = bounds;

        if (diagramWidth <= 0 || diagramHeight <= 0) return;
        
        const scale = Math.min(1.5, 0.9 / Math.max(diagramWidth / parentWidth, diagramHeight / parentHeight));
        const tx = parentWidth / 2 - (diagramX + diagramWidth / 2) * scale;
        const ty = parentHeight / 2 - (diagramY + diagramHeight / 2) * scale;
        
        svg.transition().duration(750).call(zoomBehavior.transform, zoomIdentity.translate(tx, ty).scale(scale));
    };

    fitToScreen(); // Fit on initial render/layout change

    return () => { svg.on('.zoom', null); }
  }, [layout.width, layout.height, forwardedRef, data]); // Rerun fit on data change

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[var(--color-canvas-bg)] rounded-xl">
      <svg ref={forwardedRef} className="w-full h-full absolute inset-0">
         <defs>
          <pattern id="grid" width={10} height={10} patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--color-grid-dot)"></circle>
          </pattern>
          <radialGradient id="nn-neuron-gradient-dark">
            <stop offset="0%" stopColor="#888" />
            <stop offset="90%" stopColor="#2B2B2B" />
          </radialGradient>
          <radialGradient id="nn-neuron-gradient-light">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="90%" stopColor="#D1D5DB" />
          </radialGradient>
          <marker id="nn-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" orient="auto" markerWidth="6" markerHeight="6">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-link)" opacity="0.6"/>
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g id="diagram-content" transform={viewTransform.toString()}>
            {/* Links */}
            <g>
                {layout.links.map(link => (
                    <motion.path
                        key={link.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        d={`M ${link.sourcePos.x} ${link.sourcePos.y} L ${link.targetPos.x} ${link.targetPos.y}`}
                        stroke="var(--color-link)"
                        strokeWidth={1}
                        opacity={0.5}
                        markerEnd="url(#nn-arrowhead)"
                    />
                ))}
            </g>
            {/* Nodes */}
            <g>
                {layout.nodes.map(node => {
                    if (node.type === 'neuron') {
                        const neuronFill = node.color === '#2B2B2B' ? 'url(#nn-neuron-gradient-dark)' : 'url(#nn-neuron-gradient-light)';
                        return (
                            <motion.circle
                                key={node.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 + (node.layer ?? 0) * 0.1 }}
                                cx={node.calculatedX}
                                cy={node.calculatedY}
                                r={25}
                                fill={neuronFill}
                                stroke="rgba(0,0,0,0.1)"
                                strokeWidth={0.5}
                            />
                        );
                    }
                    if (node.type === 'layer-label') {
                        return (
                             <motion.text
                                key={node.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + (node.layer ?? 0) * 0.1, duration: 0.5 }}
                                x={node.calculatedX}
                                y={node.calculatedY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="var(--color-text-primary)"
                                fontSize="16px"
                                fontWeight="600"
                            >
                                {node.label}
                            </motion.text>
                        );
                    }
                    return null;
                })}
            </g>
        </g>
      </svg>
      <div className="absolute top-2 left-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-panel-bg-translucent)] px-2 py-1 rounded-md">
        {data.title}
      </div>
    </div>
  );
};

export default NeuralNetworkCanvas;
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { DiagramData, IconType, ArchNode, Link } from '../types';
import ArchitectureIcon from './ArchitectureIcon';

const ARCHITECTURE_EXAMPLES: DiagramData[] = [
  {
    title: 'Scalable AI Inference API',
    architectureType: 'Kubernetes',
    nodes: [
      { id: 'user', label: 'Client App', type: IconType.Mobile, x: 150, y: 375, width: 140, height: 70, animationOrder: 1 },
      { id: 'gateway', label: 'API Gateway', type: IconType.AwsApiGateway, x: 400, y: 375, width: 160, height: 80, animationOrder: 2 },
      { id: 'cache', label: 'Redis Cache', type: IconType.Cache, x: 725, y: 200, width: 160, height: 80, animationOrder: 3 },
      { id: 'infer1', label: 'Inference Service', type: IconType.Gpu, x: 1050, y: 125, width: 180, height: 85, animationOrder: 4 },
      { id: 'infer2', label: 'Inference Service', type: IconType.Gpu, x: 1050, y: 375, width: 180, height: 85, animationOrder: 4 },
      { id: 'infer3', label: 'Inference Service', type: IconType.Gpu, x: 1050, y: 625, width: 180, height: 85, animationOrder: 4 },
      { id: 'registry', label: 'Model Registry', type: IconType.ModelRegistry, x: 1400, y: 375, width: 180, height: 85, animationOrder: 5 },
      { id: 'logs', label: 'Logging', type: IconType.Logging, x: 1700, y: 250, width: 160, height: 80, animationOrder: 6 },
      { id: 'metrics', label: 'Monitoring', type: IconType.Monitoring, x: 1700, y: 500, width: 160, height: 80, animationOrder: 6 },
    ],
    links: [
      { id: 'l1', source: 'user', target: 'gateway' },
      { id: 'l2', source: 'gateway', target: 'cache', style: 'dashed', label: 'Cache Check' },
      { id: 'l3', source: 'gateway', target: 'infer2', label: 'API Request' },
      { id: 'l4', source: 'cache', target: 'infer1', style: 'dashed' },
      { id: 'l5', source: 'cache', target: 'infer2', style: 'dashed' },
      { id: 'l6', source: 'cache', target: 'infer3', style: 'dashed' },
      { id: 'l7', source: 'infer1', target: 'registry', style: 'dotted' },
      { id: 'l8', source: 'infer2', target: 'registry', style: 'dotted' },
      { id: 'l9', source: 'infer3', target: 'registry', style: 'dotted', label: 'Pull Model' },
      { id: 'l10', source: 'infer1', target: 'logs', style: 'dashed' },
      { id: 'l11', source: 'infer2', target: 'logs', style: 'dashed' },
      { id: 'l12', source: 'infer3', target: 'logs', style: 'dashed' },
      { id: 'l13', source: 'infer1', target: 'metrics', style: 'dashed' },
      { id: 'l14', source: 'infer2', target: 'metrics', style: 'dashed' },
      { id: 'l15', source: 'infer3', target: 'metrics', style: 'dashed' },
    ],
    containers: [
      { id: 'k8s', label: 'Kubernetes Cluster', type: 'region', x: 625, y: 50, width: 1250, height: 650, childNodeIds: ['cache', 'infer1', 'infer2', 'infer3', 'registry', 'logs', 'metrics'] }
    ],
  },
  {
    title: 'Real-time Gaming Analytics Pipeline',
    architectureType: 'GCP',
    nodes: [
      { id: 'client1', label: 'Game Client', type: IconType.Generic, x: 150, y: 250, width: 150, height: 75, animationOrder: 1 },
      { id: 'client2', label: 'Game Client', type: IconType.Generic, x: 150, y: 500, width: 150, height: 75, animationOrder: 1 },
      { id: 'lb', label: 'Load Balancer', type: IconType.AwsLoadBalancer, x: 425, y: 375, width: 160, height: 80, animationOrder: 2 },
      { id: 'kafka', label: 'Kafka', type: IconType.Kafka, x: 700, y: 375, width: 160, height: 80, animationOrder: 3 },
      { id: 'flink', label: 'Stream Processor', type: IconType.DataPreprocessing, x: 975, y: 375, width: 180, height: 85, animationOrder: 4 },
      { id: 'realtime_db', label: 'Real-time DB', type: IconType.Cache, x: 1300, y: 225, width: 180, height: 85, animationOrder: 5 },
      { id: 'dwh', label: 'Data Warehouse', type: IconType.GcpBigquery, x: 1300, y: 525, width: 180, height: 85, animationOrder: 5 },
      { id: 'dashboard', label: 'BI Dashboard', type: IconType.WebApp, x: 1650, y: 225, width: 160, height: 80, animationOrder: 6 },
      { id: 'alerting', label: 'Alerting', type: IconType.AwsSns, x: 1650, y: 525, width: 160, height: 80, animationOrder: 6 },
    ],
    links: [
      { id: 'gl1', source: 'client1', target: 'lb' },
      { id: 'gl2', source: 'client2', target: 'lb' },
      { id: 'gl3', source: 'lb', target: 'kafka', label: 'Game Events' },
      { id: 'gl4', source: 'kafka', target: 'flink' },
      { id: 'gl5', source: 'flink', target: 'realtime_db', label: 'Aggregates' },
      { id: 'gl6', source: 'flink', target: 'dwh', label: 'Raw Events' },
      { id: 'gl7', source: 'realtime_db', target: 'dashboard' },
      { id: 'gl8', source: 'dwh', target: 'alerting', style: 'dashed' },
    ],
    containers: [
      { id: 'ingest', label: 'Ingestion', type: 'tier', x: 325, y: 100, width: 500, height: 550, childNodeIds: ['lb', 'kafka'] },
      { id: 'process', label: 'Processing', type: 'tier', x: 875, y: 100, width: 250, height: 550, childNodeIds: ['flink'] },
      { id: 'serving', label: 'Serving & Storage', type: 'tier', x: 1175, y: 100, width: 650, height: 550, childNodeIds: ['realtime_db', 'dwh', 'dashboard', 'alerting'] },
    ],
  },
  {
    title: 'Automated CI/CD Pipeline',
    architectureType: 'DevOps',
    nodes: [
      { id: 'dev', label: 'Developer', type: IconType.User, x: 150, y: 375, width: 140, height: 70, animationOrder: 1 },
      { id: 'git', label: 'Git Repository', type: IconType.Generic, x: 400, y: 375, width: 160, height: 80, animationOrder: 2 },
      { id: 'ci-server', label: 'CI Server', type: IconType.Generic, x: 700, y: 375, width: 160, height: 80, animationOrder: 3 },
      { id: 'builder', label: 'Build & Test', type: IconType.Docker, x: 1000, y: 225, width: 160, height: 80, animationOrder: 4 },
      { id: 'artifacts', label: 'Artifact Repo', type: IconType.AwsS3, x: 1000, y: 525, width: 160, height: 80, animationOrder: 4 },
      { id: 'staging', label: 'Staging Env', type: IconType.Kubernetes, x: 1400, y: 225, width: 160, height: 80, animationOrder: 5 },
      { id: 'prod', label: 'Production Env', type: IconType.Kubernetes, x: 1400, y: 525, width: 160, height: 80, animationOrder: 6 },
      { id: 'monitoring', label: 'Monitoring', type: IconType.Monitoring, x: 1700, y: 375, width: 160, height: 80, animationOrder: 7 },
    ],
    links: [
      { id: 'cl1', source: 'dev', target: 'git', label: 'Code Push' },
      { id: 'cl2', source: 'git', target: 'ci-server', label: 'Webhook' },
      { id: 'cl3', source: 'ci-server', target: 'builder', style: 'dashed' },
      { id: 'cl4', source: 'builder', target: 'artifacts', style: 'dashed', label: 'Push Image' },
      { id: 'cl5', source: 'ci-server', target: 'staging', label: 'Deploy Staging' },
      { id: 'cl6', source: 'ci-server', target: 'prod', label: 'Deploy Prod' },
      { id: 'cl7', source: 'staging', target: 'ci-server', style: 'dotted', label: 'Test Results' },
      { id: 'cl8', source: 'prod', target: 'monitoring', style: 'dashed' },
    ],
    containers: [
       { id: 'deploy', label: 'Deployment Environments', type: 'tier', x: 1275, y: 100, width: 325, height: 550, childNodeIds: ['staging', 'prod'] },
    ],
  }
];

const diagramVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
};

const typewriterContainerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } }
};

const typewriterLetterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
  exit: {
      opacity: 0, y: -10,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
  }
};

const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut', delay: 0.3 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
};

const nodeVariants: Variants = {
    hidden: (node: ArchNode) => ({
        opacity: 0,
        scale: 0.5,
        x: node.x - node.width / 2,
        y: node.y - node.height / 2
    }),
    visible: (node: ArchNode) => ({
        opacity: 1,
        scale: 1,
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
        transition: {
            type: "spring",
            stiffness: 150,
            damping: 20,
            delay: 0.5 + (node.animationOrder || 0) * 0.15
        }
    }),
    exit: (node: ArchNode) => ({
        opacity: 0,
        scale: 0.5,
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
        transition: { duration: 0.3 }
    })
};

interface Rect { x: number; y: number; width: number; height: number; }
interface Point { x: number; y: number; }

const doesSegmentIntersectObstacles = (p1: Point, p2: Point, obstacles: Rect[]): boolean => {
    for (const rect of obstacles) {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        const tolerance = 1;
        if (rect.x < maxX - tolerance && rect.x + rect.width > minX + tolerance &&
            rect.y < maxY - tolerance && rect.y + rect.height > minY + tolerance) {
            return true;
        }
    }
    return false;
};

const buildPathFromPoints = (points: Point[]): string => {
    const cornerRadius = 20;
    if (points.length < 2) return '';
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    const [p1, p2, p3, p4] = points;
    if (!p2 || !p3 || !p4) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    if (p1.y === p4.y) return `M ${p1.x} ${p1.y} L ${p4.x} ${p4.y}`;

    return `
      M ${p1.x},${p1.y}
      L ${p2.x - cornerRadius * Math.sign(p2.x - p1.x)},${p2.y}
      A ${cornerRadius},${cornerRadius} 0 0 ${p2.y < p3.y ? (p2.x > p1.x ? 1 : 0) : (p2.x > p1.x ? 0 : 1)} ${p2.x},${p2.y + cornerRadius * Math.sign(p3.y - p2.y)}
      L ${p3.x},${p3.y - cornerRadius * Math.sign(p3.y - p2.y)}
      A ${cornerRadius},${cornerRadius} 0 0 ${p2.y < p3.y ? (p4.x > p3.x ? 0 : 1) : (p4.x > p3.x ? 1 : 0)} ${p3.x + cornerRadius * Math.sign(p4.x - p3.x)},${p3.y}
      L ${p4.x},${p4.y}
    `;
};

const generateOrthogonalPathD = (source: ArchNode, target: ArchNode, obstacles: Rect[]): string => {
    const sourceEdgeXRight = source.x + source.width / 2;
    const sourceEdgeXLeft = source.x - source.width / 2;
    const targetEdgeXLeft = target.x - target.width / 2;
    const targetEdgeXRight = target.x + target.width / 2;

    const p1 = { x: source.x < target.x ? sourceEdgeXRight : sourceEdgeXLeft, y: source.y };
    const p4 = { x: target.x > source.x ? targetEdgeXLeft : targetEdgeXRight, y: target.y };

    const midXCandidates = [
      (p1.x + p4.x) / 2,
      p1.x + 60 * Math.sign(p4.x - p1.x),
      p4.x - 60 * Math.sign(p4.x - p1.x),
    ];

    for (const midX of midXCandidates) {
      const p2 = { x: midX, y: p1.y };
      const p3 = { x: midX, y: p4.y };
      if (!doesSegmentIntersectObstacles(p2, p3, obstacles)) {
        return buildPathFromPoints([p1, p2, p3, p4]);
      }
    }

    const fallbackMidX = midXCandidates[0];
    const p2 = { x: fallbackMidX, y: p1.y };
    const p3 = { x: fallbackMidX, y: p4.y };
    return buildPathFromPoints([p1, p2, p3, p4]);
};

const ArchitectureAnimation: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [viewBox, setViewBox] = useState('0 0 1800 750');

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setViewBox('250 0 1300 900');
        } else {
            setViewBox('0 0 1800 750');
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % ARCHITECTURE_EXAMPLES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const currentDiagram = ARCHITECTURE_EXAMPLES[index];
  const allElements = useMemo(() => {
    const nodes = currentDiagram.nodes || [];
    const nodesById = new Map(nodes.map(node => [node.id, node]));
    const nodeObstacles = nodes.map(n => ({ x: n.x - n.width/2, y: n.y - n.height/2, width: n.width, height: n.height }));
    return {
        containers: currentDiagram.containers || [],
        nodes,
        links: currentDiagram.links || [],
        nodesById,
        nodeObstacles,
    };
  }, [currentDiagram]);

  return (
    <div className="w-full h-full absolute inset-0">
        <AnimatePresence mode="wait">
            <motion.svg
                key={index}
                width="100%"
                height="100%"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
                variants={diagramVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <defs>
                    <pattern id="anim-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="rgba(244, 114, 182, 0.2)"></circle>
                    </pattern>
                    <marker id="anim-arrowhead" viewBox="-0 -5 10 10" refX="8" refY="0" orient="auto" markerWidth="4" markerHeight="4">
                        <path d="M 0,-5 L 10 ,0 L 0,5" fill="#EC4899"></path>
                    </marker>
                    <filter id="nodeGlow">
                       <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F9A8D4" floodOpacity="0.6" />
                    </filter>
                    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#FFF7FA" />
                    </linearGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#anim-grid)" opacity="0.5">
                     <animateTransform attributeName="transform" type="translate" from="0 0" to="40 40" dur="5s" repeatCount="indefinite" />
                </rect>
                
                <motion.g
                    transform="translate(900, 40)"
                    variants={typewriterContainerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <text textAnchor="middle" fill="#333" style={{ fontSize: '32px', fontWeight: 800 }}>
                        {currentDiagram.title.split('').map((char, charIndex) => (
                            <motion.tspan
                                key={`${char}-${charIndex}`}
                                variants={typewriterLetterVariants}
                                style={{ display: 'inline-block' }} 
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.tspan>
                        ))}
                    </text>
                </motion.g>
                
                {allElements.containers.map(container => (
                    <motion.g key={container.id} variants={containerVariants}>
                        <rect
                            x={container.x} y={container.y}
                            width={container.width} height={container.height}
                            rx={24} ry={24}
                            fill="rgba(253, 232, 240, 0.4)"
                            stroke="rgba(244, 114, 182, 0.3)"
                            strokeWidth="2"
                            strokeDasharray="8 4"
                        />
                        <text x={container.x + 25} y={container.y + 40} fill="#D6336C" style={{ fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>{container.label}</text>
                    </motion.g>
                ))}

                 {allElements.links.map((link, i) => {
                    const sourceNode = allElements.nodesById.get(link.source as string);
                    const targetNode = allElements.nodesById.get(link.target as string);
                    if (!sourceNode || !targetNode) return null;

                    const obstacles = allElements.nodeObstacles.filter(
                        obs => obs.x !== (sourceNode.x - sourceNode.width/2) && obs.x !== (targetNode.x - targetNode.width/2)
                    );
                    const pathD = generateOrthogonalPathD(sourceNode, targetNode, obstacles);

                    return (
                        <g key={link.id}>
                            <motion.path
                                id={`path-${link.id}`}
                                d={pathD}
                                stroke={"#F9A8D4"}
                                strokeWidth={2.5}
                                strokeDasharray={link.style === 'dashed' ? '8 8' : 'none'}
                                fill="none"
                                markerEnd="url(#anim-arrowhead)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 1.6, duration: 0.5 } }}
                                exit={{ opacity: 0 }}
                            />
                            <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 2.5 } }}
                                exit={{ opacity: 0 }}
                            >
                                <g>
                                    <circle r="4.5" fill="#BE185D">
                                        <animateMotion dur="4s" begin={`${1.6 + (i % 4) * 0.4}s`} repeatCount="indefinite" rotate="auto">
                                            <mpath href={`#path-${link.id}`} />
                                        </animateMotion>
                                    </circle>
                                    <circle r="3.5" fill="#BE185D" opacity="0.7">
                                        <animateMotion dur="4s" begin={`${1.6 + (i % 4) * 0.4 + 0.1}s`} repeatCount="indefinite" rotate="auto">
                                            <mpath href={`#path-${link.id}`} />
                                        </animateMotion>
                                    </circle>
                                    <circle r="2.5" fill="#BE185D" opacity="0.5">
                                        <animateMotion dur="4s" begin={`${1.6 + (i % 4) * 0.4 + 0.2}s`} repeatCount="indefinite" rotate="auto">
                                            <mpath href={`#path-${link.id}`} />
                                        </animateMotion>
                                    </circle>
                                </g>
                            </motion.g>
                        </g>
                    );
                })}

                {allElements.nodes.map(node => (
                    <motion.g
                        key={node.id}
                        custom={node}
                        variants={nodeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.rect
                            width={node.width}
                            height={node.height}
                            rx={16}
                            ry={16}
                            fill="url(#nodeGradient)"
                            stroke="#FBCFE8"
                            strokeWidth="2"
                            style={{ filter: 'url(#nodeGlow)' }}
                            transition={{ duration: 0.3 }}
                        />
                        <foreignObject x="12" y="12" width="40" height={node.height - 24} className="flex items-center justify-center">
                            <ArchitectureIcon type={node.type} className="w-10 h-10 text-[#555]" />
                        </foreignObject>
                        <foreignObject x={60} y={12} width={node.width - 72} height={node.height - 24} >
                            <div className="text-base font-semibold text-[#333] leading-tight h-full flex items-center" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                {node.label}
                            </div>
                        </foreignObject>
                    </motion.g>
                ))}
            </motion.svg>
        </AnimatePresence>
    </div>
  );
};

export default ArchitectureAnimation;
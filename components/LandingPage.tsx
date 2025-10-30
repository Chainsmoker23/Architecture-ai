import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { FOOTER_LINKS } from '../constants';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

interface LandingPageProps {
  onLaunch: () => void;
}

const AnimatedArchitecture: React.FC<{
  nodes: any[]; links: any[]; containers?: any[]; key: number;
}> = ({ nodes, links, containers = [] }) => {

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5 + i * 0.1,
        type: 'spring',
        stiffness: 100
      },
    }),
  };

  const nodeVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.08,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  const linkVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 1.5 + i * 0.1, type: 'tween', duration: 0.8, ease: 'easeInOut' },
        opacity: { delay: 1.5 + i * 0.1, duration: 0.01 },
      },
    }),
  };

  return (
    <motion.svg
      width="100%" height="100%" viewBox="0 0 400 300"
      initial="hidden"
      animate="visible"
      className="w-full h-full"
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#F06292" />
        </marker>
        <filter id="drop-shadow-lp" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>

      {links.map((link, i) => {
        const pathD = `M ${link.source.x} ${link.source.y} L ${link.target.x} ${link.target.y}`;
        return (
          <motion.path
              key={`hero-l-${i}`}
              d={pathD}
              fill="none"
              stroke="#F06292"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
              custom={i}
              variants={linkVariants}
            />
        );
      })}

      {containers.map((c, i) => (
        <motion.rect
          key={`hero-c-${i}`}
          x={c.x} y={c.y} width={c.width} height={c.height}
          rx="10"
          fill={c.fill}
          stroke="#F9D7E3"
          strokeWidth="2"
          strokeDasharray="4 4"
          custom={i}
          variants={containerVariants}
        />
      ))}
      
       {nodes.map((node, i) => (
        <motion.g
          key={`hero-n-${i}`}
          custom={i}
          variants={nodeVariants}
          style={{ filter: 'url(#drop-shadow-lp)' }}
        >
          <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="8" fill="white" stroke={node.color || '#F9D7E3'} strokeWidth="2" />
          <foreignObject x={node.x + 8} y={node.y + 10} width="20" height="20">
            <ArchitectureIcon type={node.icon} />
          </foreignObject>
          <text x={node.x + 32} y={node.y + 24} fontSize="9" fontWeight="500" fill="#333">{node.label}</text>
        </motion.g>
      ))}
    </motion.svg>
  );
};


const demoArchitectures = [
  {
    title: 'AWS 5-Tier Cloud System',
    caption: 'A scalable and resilient cloud infrastructure for enterprise applications.',
    animData: {
      containers: [
        { x: 10, y: 10, width: 380, height: 60, fill: 'rgba(249, 215, 227, 0.3)' },
        { x: 10, y: 80, width: 380, height: 60, fill: 'rgba(219, 234, 254, 0.4)' },
        { x: 10, y: 150, width: 380, height: 60, fill: 'rgba(209, 250, 229, 0.4)' },
        { x: 10, y: 220, width: 380, height: 70, fill: 'rgba(254, 240, 169, 0.4)' },
      ],
      nodes: [
        { x: 150, y: 25, w: 100, h: 40, icon: IconType.AwsCloudfront, label: 'CloudFront', color: '#8C4FFF' },
        { x: 150, y: 95, w: 100, h: 40, icon: IconType.AwsLoadBalancer, label: 'ELB', color: '#0073B8' },
        { x: 150, y: 165, w: 100, h: 40, icon: IconType.AwsEc2, label: 'EC2 Instance', color: '#FF9900' },
        { x: 80, y: 235, w: 100, h: 40, icon: IconType.AwsRds, label: 'RDS', color: '#2E73B8' },
        { x: 220, y: 235, w: 100, h: 40, icon: IconType.AwsS3, label: 'S3', color: '#56B9D0' },
      ],
      links: [
        { source: { x: 200, y: 65 }, target: {x: 200, y: 95 } },
        { source: { x: 200, y: 135 }, target: {x: 200, y: 165 } },
        { source: { x: 200, y: 205 }, target: {x: 130, y: 235 } },
        { source: { x: 200, y: 205 }, target: {x: 270, y: 235 } },
      ],
    }
  },
  {
    title: 'Microservices Banking Platform',
    caption: 'A distributed system for modern financial services, ensuring independent scalability.',
    animData: {
      containers: [ { x: 10, y: 10, width: 380, height: 280, fill: 'rgba(219, 234, 254, 0.4)' }, ],
      nodes: [
        { x: 20, y: 125, w: 90, h: 40, icon: IconType.User, label: 'User', color: '#FF6B6B' },
        { x: 120, y: 125, w: 110, h: 40, icon: IconType.AwsApiGateway, label: 'API Gateway', color: '#4B4B4B' },
        { x: 250, y: 35, w: 120, h: 40, icon: IconType.Generic, label: 'Auth Service', color: '#BDBDBD' },
        { x: 250, y: 95, w: 120, h: 40, icon: IconType.Generic, label: 'Payment Svc', color: '#BDBDBD' },
        { x: 250, y: 155, w: 120, h: 40, icon: IconType.Generic, label: 'Account Svc', color: '#BDBDBD' },
        { x: 250, y: 215, w: 120, h: 40, icon: IconType.AwsSns, label: 'Notification Svc', color: '#D86613' },
      ],
      links: [
        { source: { x: 110, y: 145 }, target: { x: 120, y: 145 } }, { source: { x: 230, y: 145 }, target: { x: 250, y: 55 } },
        { source: { x: 230, y: 145 }, target: { x: 250, y: 115 } }, { source: { x: 230, y: 145 }, target: { x: 250, y: 175 } },
        { source: { x: 230, y: 145 }, target: { x: 250, y: 235 } },
      ],
    }
  },
  {
    title: 'Blockchain Network Topology',
    caption: 'A decentralized application showcasing interactions between users, contracts, and nodes.',
    animData: {
      nodes: [
        { x: 20, y: 125, w: 100, h: 40, icon: IconType.Wallet, label: 'User Wallet', color: '#4CAF50' },
        { x: 150, y: 35, w: 120, h: 40, icon: IconType.SmartContract, label: 'Smart Contract', color: '#9C27B0' },
        { x: 150, y: 215, w: 120, h: 40, icon: IconType.Oracle, label: 'Oracle', color: '#FFC107' },
        { x: 280, y: 35, w: 100, h: 40, icon: IconType.BlockchainNode, label: 'Validator A', color: '#2196F3' },
        { x: 280, y: 125, w: 100, h: 40, icon: IconType.BlockchainNode, label: 'Validator B', color: '#2196F3' },
        { x: 280, y: 215, w: 100, h: 40, icon: IconType.BlockchainNode, label: 'Validator C', color: '#2196F3' },
      ],
      links: [
        { source: { x: 120, y: 145 }, target: { x: 210, y: 55 } }, { source: { x: 210, y: 75 }, target: { x: 280, y: 145 } },
        { source: { x: 210, y: 215 }, target: { x: 210, y: 75 } }, { source: { x: 330, y: 75 }, target: { x: 330, y: 125 } },
        { source: { x: 330, y: 165 }, target: { x: 330, y: 215 } },
      ],
    }
  },
  {
    title: 'AI/ML Data Pipeline',
    caption: 'An automated pipeline for ingesting data, training models, and serving predictions.',
    animData: {
      containers: [ { x: 10, y: 10, width: 380, height: 280, fill: 'rgba(209, 250, 229, 0.4)' }, ],
      nodes: [
        { x: 30, y: 35, w: 100, h: 40, icon: IconType.AwsS3, label: 'Data Lake', color: '#56B9D0' },
        { x: 30, y: 125, w: 100, h: 40, icon: IconType.Kafka, label: 'Ingestion', color: '#2B2B2B' },
        { x: 150, y: 125, w: 100, h: 40, icon: IconType.Docker, label: 'Processing', color: '#2496ED' },
        { x: 270, y: 125, w: 110, h: 40, icon: IconType.Kubernetes, label: 'Model Training', color: '#326CE5' },
        { x: 150, y: 215, w: 100, h: 40, icon: IconType.Api, label: 'Prediction API', color: '#673AB7' },
        { x: 270, y: 35, w: 110, h: 40, icon: IconType.Monitoring, label: 'Monitoring', color: '#4DB6AC' },
      ],
      links: [
        { source: { x: 80, y: 75 }, target: { x: 80, y: 125 } }, { source: { x: 130, y: 145 }, target: { x: 150, y: 145 } },
        { source: { x: 250, y: 145 }, target: { x: 270, y: 145 } }, { source: { x: 325, y: 165 }, target: { x: 200, y: 215 } },
        { source: { x: 325, y: 165 }, target: { x: 325, y: 75 } },
      ],
    }
  }
];

const heroArchitectures = [
  {
    name: 'E-Commerce Platform (AWS)',
    animData: {
      containers: [
        { x: 10, y: 10, width: 380, height: 60, fill: 'rgba(249, 215, 227, 0.3)' },
        { x: 10, y: 80, width: 380, height: 130, fill: 'rgba(219, 234, 254, 0.4)' },
        { x: 10, y: 220, width: 380, height: 70, fill: 'rgba(209, 250, 229, 0.4)' },
      ],
      nodes: [
        { x: 20, y: 130, w: 100, h: 40, icon: IconType.User, label: 'User', color: '#FF6B6B' },
        { x: 150, y: 25, w: 100, h: 40, icon: IconType.AwsCloudfront, label: 'CloudFront', color: '#8C4FFF' },
        { x: 150, y: 95, w: 100, h: 40, icon: IconType.AwsLoadBalancer, label: 'ELB', color: '#0073B8' },
        { x: 150, y: 155, w: 100, h: 40, icon: IconType.AwsEcs, label: 'ECS Service', color: '#FF9900' },
        { x: 80, y: 235, w: 100, h: 40, icon: IconType.AwsRds, label: 'RDS DB', color: '#2E73B8' },
        { x: 220, y: 235, w: 100, h: 40, icon: IconType.AwsS3, label: 'S3 Bucket', color: '#56B9D0' },
      ],
      links: [
        { source: { x: 70, y: 150 }, target: { x: 200, y: 45 } },
        { source: { x: 200, y: 65 }, target: { x: 200, y: 95 } },
        { source: { x: 200, y: 135 }, target: { x: 200, y: 155 } },
        { source: { x: 200, y: 195 }, target: { x: 130, y: 235 } },
        { source: { x: 200, y: 195 }, target: { x: 270, y: 235 } },
      ],
    }
  },
  {
    name: 'Real-time Analytics Pipeline',
    animData: {
      nodes: [
        { x: 20, y: 50, w: 100, h: 40, icon: IconType.Mobile, label: 'Mobile App', color: '#FF6B6B' },
        { x: 20, y: 120, w: 100, h: 40, icon: IconType.WebApp, label: 'Web App', color: '#FF6B6B' },
        { x: 150, y: 85, w: 100, h: 40, icon: IconType.Kafka, label: 'Kafka', color: '#2B2B2B' },
        { x: 280, y: 85, w: 100, h: 40, icon: IconType.Kubernetes, label: 'Processing', color: '#326CE5' },
        { x: 150, y: 185, w: 100, h: 40, icon: IconType.Database, label: 'Data Warehouse', color: '#4FC3F7' },
        { x: 280, y: 185, w: 100, h: 40, icon: IconType.Monitoring, label: 'Dashboard', color: '#4DB6AC' },
      ],
      links: [
        { source: { x: 120, y: 70 }, target: { x: 150, y: 105 } },
        { source: { x: 120, y: 140 }, target: { x: 150, y: 105 } },
        { source: { x: 250, y: 105 }, target: { x: 280, y: 105 } },
        { source: { x: 330, y: 125 }, target: { x: 200, y: 185 } },
        { source: { x: 200, y: 225 }, target: { x: 330, y: 205 } },
      ],
    }
  },
  {
    name: 'Multi-Cloud Microservices',
    animData: {
      containers: [
        { x: 150, y: 60, width: 240, height: 80, fill: 'rgba(254, 240, 169, 0.4)' },
        { x: 150, y: 150, width: 240, height: 80, fill: 'rgba(219, 234, 254, 0.4)' },
      ],
      nodes: [
        { x: 20, y: 125, w: 100, h: 40, icon: IconType.User, label: 'Client', color: '#FF6B6B' },
        { x: 160, y: 15, w: 120, h: 40, icon: IconType.AwsApiGateway, label: 'API Gateway', color: '#4B4B4B' },
        { x: 160, y: 80, w: 110, h: 40, icon: IconType.GcpComputeEngine, label: 'Auth (GCP)', color: '#4285F4' },
        { x: 280, y: 80, w: 100, h: 40, icon: IconType.GcpCloudSql, label: 'Auth DB', color: '#4285F4' },
        { x: 160, y: 170, w: 110, h: 40, icon: IconType.AzureVm, label: 'Users (Azure)', color: '#0078D4' },
        { x: 280, y: 170, w: 100, h: 40, icon: IconType.AzureSqlDatabase, label: 'Users DB', color: '#0078D4' },
      ],
      links: [
        { source: { x: 120, y: 145 }, target: { x: 220, y: 35 } },
        { source: { x: 220, y: 55 }, target: { x: 215, y: 80 } },
        { source: { x: 220, y: 55 }, target: { x: 215, y: 170 } },
        { source: { x: 270, y: 100 }, target: { x: 280, y: 100 } },
        { source: { x: 270, y: 190 }, target: { x: 280, y: 190 } },
      ],
    }
  },
]


const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [activeDemoSlide, setActiveDemoSlide] = useState(0);
  const [isDemoHovered, setIsDemoHovered] = useState(false);

  useEffect(() => {
    const heroTimer = setTimeout(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroArchitectures.length);
    }, 7000); 
    return () => clearTimeout(heroTimer);
  }, [activeHeroSlide]);

  useEffect(() => {
    if (isDemoHovered) return;
    const demoTimer = setTimeout(() => {
      setActiveDemoSlide((prev) => (prev + 1) % demoArchitectures.length);
    }, 5000);
    return () => clearTimeout(demoTimer);
  }, [activeDemoSlide, isDemoHovered]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };
    
  const features = [
    { icon: '🧠', title: 'Prompt-Based Generation', desc: 'Describe your system, get instant architecture.' },
    { icon: '☁️', title: 'Multi-Cloud & Microservices', desc: 'From 3-tier to distributed systems.' },
    { icon: '⚙️', title: 'Editable & Exportable', desc: 'Drag, rename, resize, and export with ease.' },
    { icon: '🎨', title: 'Beautiful & Smart Layouts', desc: 'Clean, professional diagrams, every time.' },
  ];

  return (
    <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#FFF0F5] py-20">
          <div className="container mx-auto px-6 z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Design Enterprise-Grade Architectures.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Instantly.</span>
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-[#555555]">
                    AI-powered architecture designer that builds real-world cloud and microservice systems from a single prompt.
                </motion.p>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                    <button onClick={onLaunch}
                        className="shimmer-button text-[#A61E4D] font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                        Try the App
                    </button>
                    <a href="#demo" className="font-semibold py-3 px-8 text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle rounded-full">Watch Demo</a>
                </motion.div>
            </div>
            <div className="w-full h-full min-h-[300px] lg:min-h-[400px]">
              <AnimatePresence mode="wait">
                 <motion.div
                    key={activeHeroSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full"
                  >
                   <AnimatedArchitecture key={activeHeroSlide} {...heroArchitectures[activeHeroSlide].animData} />
                 </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <motion.section className="py-24 bg-white" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(233, 30, 99, 0.15)' }}
                className="p-8 bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl shadow-md transition-all duration-300 border border-[#EAEAEA] flex flex-col items-start text-left">
                <motion.div whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }} className="text-4xl mb-4 bg-white p-3 rounded-full shadow-inner">{feature.icon}</motion.div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#555555]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Demo Section */}
        <section id="demo" className="py-24 bg-white text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
                <p className="text-lg text-[#555555] max-w-2xl mx-auto mb-12">
                    Watch how ArchiGen AI transforms a simple text prompt into a complete, editable architecture diagram in seconds.
                </p>
                <motion.div 
                    className="bg-[#F8F1F3] rounded-2xl shadow-2xl p-4 md:p-8 border-4 border-white aspect-video max-w-4xl mx-auto relative"
                    initial={{ scale: 0.9, opacity: 0 }} 
                    whileInView={{ scale: 1, opacity: 1 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.5 }}
                    onMouseEnter={() => setIsDemoHovered(true)}
                    onMouseLeave={() => setIsDemoHovered(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDemoSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full"
                    >
                      <AnimatedArchitecture key={activeDemoSlide} {...demoArchitectures[activeDemoSlide].animData} />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {demoArchitectures.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveDemoSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          activeDemoSlide === index ? 'bg-[#D6336C]' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
                
                <div className="mt-6 min-h-[90px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDemoSlide}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold">{demoArchitectures[activeDemoSlide].title}</h3>
                      <p className="text-[#555555] max-w-xl mx-auto">{demoArchitectures[activeDemoSlide].caption}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

            </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-t from-white to-[#FFF0F5]">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold">Start Designing Your Architecture Now.</h2>
              <p className="mt-4 text-lg text-[#555555]">No signup required. Free to start.</p>
              <button onClick={onLaunch}
                className="mt-8 bg-[#F9D7E3] text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                Launch the App
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-white to-[#FFF0F5]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold">Archi<span className="text-[#D6336C]">Gen</span> AI</h3>
                <p className="text-[#555555]">Instant Architecture Design.</p>
            </div>
            <div className="flex items-center space-x-6 text-[#555555]">
                {FOOTER_LINKS.links.map((link) => (
                    <a key={link.name} href={link.href} className="hover:text-[#2B2B2B] transition-colors">{link.name}</a>
                ))}
            </div>
          </div>
          <div className="mt-8 border-t border-[#EAEAEA] pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-[#555555] text-sm">&copy; {new Date().getFullYear()} ArchiGen AI. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                {FOOTER_LINKS.socials.map((social) => (
                    <a key={social.name} href={social.href} className="text-[#555555] hover:text-[#2B2B2B] transition-colors">
                        <span className="sr-only">{social.name}</span>
                        <social.icon className="h-6 w-6" aria-hidden="true" />
                    </a>
                ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

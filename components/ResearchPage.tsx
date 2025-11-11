import React from 'react';
import { motion } from 'framer-motion';
import SharedFooter from './SharedFooter';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface ResearchPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const ResearchPillar: React.FC<{ icon: IconType; title: string; children: React.ReactNode; delay: number }> = ({ icon, title, children, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-pink-100 shadow-lg flex flex-col"
    >
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-white to-[#FFF0F5] border-2 border-[#F9D7E3] shadow-lg mb-4">
            <ArchitectureIcon type={icon} className="w-8 h-8 text-[#D6336C]" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-[#555555] text-sm flex-grow">{children}</p>
    </motion.div>
);

const RoadmapLine: React.FC = () => (
    <div className="absolute top-1/2 left-0 right-0 h-1 hidden md:block">
        <svg width="100%" height="100%" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FBCFE8" />
                    <stop offset="50%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#FBCFE8" />
                </linearGradient>
            </defs>
            <motion.line
                x1="0" y1="50%" x2="100%" y2="50%"
                stroke="url(#lineGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 2, delay: 0.2, ease: 'easeInOut' }}
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="24"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                />
            </motion.line>
        </svg>
    </div>
);


const ResearchPage: React.FC<ResearchPageProps> = ({ onBack, onNavigate }) => {

  return (
    <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
      <header className="absolute top-0 left-0 w-full p-6 z-20">
        <button onClick={onBack} className="flex items-center gap-2 font-semibold text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Back to Home
        </button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#FFF0F5] py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-6 z-10">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-center">
                Inventing the Future <br /> of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Architectural Intelligence</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555] text-center">
                At CubeGen AI, we're pioneering the next generation of AI-driven design. Explore our key research initiatives that are shaping the future of software architecture.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Research Pillars Section */}
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="relative">
                    <RoadmapLine />
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ResearchPillar icon={IconType.Brain} title="Next-Gen LLMs" delay={0.1}>
                            We are researching and fine-tuning language models specifically for the domain of software architecture. Our goal is to improve spatial reasoning, enhance layout algorithms, and develop models that understand nuanced architectural patterns to produce even more intelligent and aesthetic diagrams.
                        </ResearchPillar>
                        <ResearchPillar icon={IconType.BlockchainNode} title="Decentralized Architectures" delay={0.3}>
                            The future is decentralized. Our research in this area focuses on expanding our understanding of Web3, blockchain, and distributed ledger technologies. We're developing capabilities to accurately model complex P2P networks, smart contract interactions, and dApp infrastructures.
                        </ResearchPillar>
                        <ResearchPillar icon={IconType.Playground} title="Intelligent Tooling" delay={0.5}>
                            A diagram is just the beginning. We're exploring the frontier of "diagram-as-code," researching how to generate Infrastructure-as-Code (like Terraform) directly from your designs, enabling real-time collaboration, and creating a version control system for visual architecture.
                        </ResearchPillar>
                    </div>
                </div>
            </div>
        </section>


        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-t from-white to-[#FFF0F5]">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold">Shape the Future With Us</h2>
              <p className="mt-4 text-lg text-[#555555] max-w-2xl mx-auto">Have an idea, a research proposal, or want to collaborate? We believe in the power of community to drive innovation.</p>
              <button onClick={() => onNavigate('contact')}
                className="mt-8 bg-[#F9D7E3] text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                Get In Touch
              </button>
            </motion.div>
          </div>
        </section>

      </main>

      <SharedFooter onNavigate={onNavigate} activePage="research" />
    </div>
  );
};

export default ResearchPage;
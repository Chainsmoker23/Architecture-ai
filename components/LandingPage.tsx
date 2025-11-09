import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from './content/landingContent';
import { FOOTER_LINKS } from './content/iconConstants';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import AssistantWidget from './AssistantWidget';
import ArchitectureAnimation from './ArchitectureAnimation';
import ApiKeyAnimation from './ApiKeyAnimation';
import SharedFooter from './SharedFooter';
import Logo from './Logo';

interface LandingPageProps {
  onLaunch: () => void;
  onNavigate: (page: 'contact' | 'about' | 'sdk' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'careers' | 'research') => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Header: React.FC<LandingPageProps & { isScrolled: boolean }> = ({ onLaunch, onNavigate, isScrolled }) => {
  const navItemClass = "font-medium text-[#555] hover:text-[#2B2B2B] transition-colors";
  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${isScrolled ? 'header-blur bg-white/80 shadow-md' : 'bg-transparent'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-[#D6336C]" />
          <h3 className="text-2xl font-bold">Cube<span className="text-[#D6336C]">Gen</span> AI</h3>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => onNavigate('about')} className={navItemClass}>About</button>
          <button onClick={() => onNavigate('sdk')} className={navItemClass}>SDK</button>
          <button onClick={() => onNavigate('research')} className={navItemClass}>Research</button>
          <button onClick={() => onNavigate('docs')} className={navItemClass}>Docs</button>
          <button onClick={() => onNavigate('careers')} className={navItemClass}>Careers</button>
          <button onClick={() => onNavigate('contact')} className={navItemClass}>Contact</button>
        </nav>
        <button 
          onClick={onLaunch}
          className="hidden md:block bg-[#F9D7E3] text-[#A61E4D] font-bold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          Launch App
        </button>
      </div>
    </motion.header>
  );
}

const TestimonialCard: React.FC<{ testimonial: typeof TESTIMONIALS[0] }> = ({ testimonial }) => {
    const avatarColors = [
        'bg-pink-100 text-pink-700',
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-yellow-100 text-yellow-700',
        'bg-purple-100 text-purple-700',
        'bg-indigo-100 text-indigo-700',
    ];
    const colorClass = avatarColors[testimonial.name.charCodeAt(0) % avatarColors.length];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#F0F0F0] w-96 flex-shrink-0 flex flex-col h-[250px]">
            <div className="font-bold text-lg text-gray-400 tracking-widest">{testimonial.logoText}</div>
            <p className="text-[#555] my-4 flex-grow">"{testimonial.quote}"</p>
            <div className="mt-auto flex items-center">
                <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-sm mr-4`}>
                    {testimonial.avatar}
                </div>
                <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}, {testimonial.company}</p>
                </div>
            </div>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
    
  const features = [
    { icon: IconType.Gemini, title: 'AI-Powered Generation', desc: 'Describe your system in plain English and watch as a detailed architecture diagram is generated in seconds.' },
    { icon: IconType.Cloud, title: 'Multi-Cloud & Generic Icons', desc: 'Supports AWS, GCP, Azure, Kubernetes, and a wide array of generic components for any system.' },
    { icon: IconType.Playground, title: 'Interactive Playground', desc: 'Drag, drop, connect, and customize every element. Your diagram is a living document, not a static image.' },
    { icon: IconType.FileCode, title: 'Export & Share', desc: 'Export your designs to PNG, SVG, or JSON to integrate with your documentation and presentations.' },
  ];

  const howItWorksSteps = [
    {
      icon: IconType.Message,
      title: '1. Write a Prompt',
      description: 'Describe the components, technologies, and relationships of your desired architecture. Be as simple or as detailed as you like.'
    },
    {
      icon: IconType.Sparkles,
      title: '2. Generate with AI',
      description: "Our AI, powered by Google's Gemini, intelligently interprets your prompt, selecting the right icons and arranging them in a clean, logical layout."
    },
    {
      icon: IconType.Edit,
      title: '3. Visualize & Refine',
      description: 'Your diagram appears instantly. Jump into the playground to fine-tune details, add notes, and perfect your design for any audience.'
    }
  ];

  const trustedByIcons = [IconType.AwsLambda, IconType.AzureAppService, IconType.Javascript, IconType.ReactJs, IconType.MongoDb, IconType.GcpCloudStorage];

  return (
    <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
      <Header onLaunch={onLaunch} onNavigate={onNavigate} isScrolled={isScrolled} />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-gradient-bg py-20 pt-32 md:pt-20">
          <div className="container mx-auto px-6 z-10 text-center">
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                    From Prompt to Professional Diagram.
                    <br />
                    <span className="animated-gradient-text text-transparent bg-clip-text">In Seconds.</span>
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[#555555]">
                    CubeGen AI is the fastest way to visualize, design, and share software architecture. Leverage generative AI to build beautiful, intelligent diagrams for cloud, microservices, and more.
                </motion.p>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={onLaunch}
                        className="shimmer-button text-[#A61E4D] font-bold py-4 px-10 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                        Start Designing for Free
                    </button>
                </motion.div>
          </div>
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="w-full max-w-screen-2xl mx-auto mt-12 z-10 h-[450px] md:h-[600px] relative px-4"
          >
            <ArchitectureAnimation />
          </motion.div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">POWERING DIAGRAMS FOR TEAMS USING</p>
              <div className="mt-6 flex justify-center items-center gap-8 md:gap-12 flex-wrap">
                {trustedByIcons.map((iconType, index) => (
                  <ArchitectureIcon key={index} type={iconType} className="h-8 w-8 text-gray-400" />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants} className="text-center">
              <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4">A Smarter Way to Design</motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-[#555555] max-w-3xl mx-auto mb-16">
                Stop wrestling with traditional drag-and-drop tools. Our 3-step process streamlines your entire architectural workflow, from initial idea to polished presentation.
              </motion.p>

              <div className="relative">
                 <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200" />
                 <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                  {howItWorksSteps.map((step, index) => (
                    <motion.div key={step.title} variants={itemVariants} className="bg-white z-10">
                      <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-white to-[#FFF0F5] border-2 border-[#F9D7E3] shadow-lg">
                        <ArchitectureIcon type={step.icon as IconType} className="w-10 h-10 text-[#D6336C]" />
                      </div>
                      <h3 className="text-xl font-bold mt-6 mb-2">{step.title}</h3>
                      <p className="text-[#555555]">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <motion.section className="py-24 hero-gradient-bg" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(233, 30, 99, 0.15)' }}
                className="p-6 bg-white rounded-2xl shadow-md transition-all duration-300 border border-[#EAEAEA] flex flex-col text-left">
                <div className="mb-4 bg-white p-3 rounded-full shadow-inner inline-block">
                  <ArchitectureIcon type={feature.icon as IconType} className="h-8 w-8 text-[#E91E63]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[#555555] text-sm flex-grow">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* API Key CTA Section */}
        <section className="py-24 sdk-hero-bg">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Your Vision, <br/> Uninterrupted.</h2>
                <p className="text-lg text-[#555555] mb-6">
                  Bring your own API key to bypass shared limits and unlock the full, unrestricted power of CubeGen AI. Perfect for power users, teams, and automated workflows.
                </p>
                <div className="flex items-center gap-4">
                  <button onClick={() => onNavigate('apiKey')} className="bg-[#F9D7E3] text-[#A61E4D] font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                    Learn about API Keys
                  </button>
                </div>
              </motion.div>
              <motion.div 
                className="flex justify-center items-center"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <ApiKeyAnimation />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <motion.section 
          className="py-24 bg-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Architects and Developers</h2>
              <p className="text-lg text-[#555555] max-w-3xl mx-auto mb-16">
                See how teams and individuals are accelerating their design process with CubeGen AI.
              </p>
            </div>
          </div>
          <div className="marquee-container space-y-4">
              <div className="marquee-track flex gap-8 py-2">
                {[...TESTIMONIALS.slice(0, 5), ...TESTIMONIALS.slice(0, 5)].map((testimonial, index) => (
                  <TestimonialCard key={`a-${index}`} testimonial={testimonial} />
                ))}
              </div>
              <div className="marquee-track marquee-track-reverse flex gap-8 py-2">
                 {[...TESTIMONIALS.slice(5, 10), ...TESTIMONIALS.slice(5, 10)].map((testimonial, index) => (
                  <TestimonialCard key={`b-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section className="py-24 hero-gradient-bg">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold">Ready to Build Your Next Big Idea?</h2>
              <p className="mt-4 text-lg text-[#555555]">Go from concept to clickable diagram in seconds. No credit card required.</p>
              <button onClick={onLaunch}
                className="mt-8 shimmer-button text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                Launch the App
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <SharedFooter onNavigate={onNavigate} />
      <AssistantWidget />
    </div>
  );
};

export default LandingPage;
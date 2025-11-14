import React from 'react';
import { motion } from 'framer-motion';
import SharedFooter from './SharedFooter';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research' | 'sdk';

interface SdkPageProps {
  onBack: () => void;
  onLaunch: () => void;
  onNavigate: (page: Page) => void;
}

const SdkPage: React.FC<SdkPageProps> = ({ onBack, onLaunch, onNavigate }) => {
  const steps = [
    {
      icon: IconType.Google,
      title: '1. Get Your API Key',
      description: "Visit Google AI Studio to generate your own free Gemini API key. This key connects directly to Google's powerful models."
    },
    {
      icon: IconType.Gear,
      title: '2. Add to Settings',
      description: "Launch the CubeGen AI app, open the Settings sidebar, and paste your new key into the 'In-App Personal Key' section."
    },
    {
      icon: IconType.Sparkles,
      title: '3. Enjoy Unlimited Access',
      description: "That's it! The app will now use your personal key, bypassing all shared usage limits for truly uninterrupted design sessions."
    }
  ];

  return (
    <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
      <header className="absolute top-0 left-0 w-full p-6 z-20">
        <button onClick={onBack} className="flex items-center gap-2 font-semibold text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Back to Home
        </button>
      </header>

      <main>
        <section className="relative flex items-center justify-center overflow-hidden api-hero-bg py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-6 z-10 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Bring Your <span className="animated-gradient-text text-transparent bg-clip-text">Own Key</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                Unlock unlimited diagram generations within the CubeGen AI app by using your own Google Gemini API key. It's free, easy, and gives you complete control.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-[#555555] max-w-3xl mx-auto mb-16">
                In just three simple steps, you can connect your personal Gemini key and bypass all shared usage limits.
              </p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                {steps.map((step, index) => (
                  <motion.div 
                    key={step.title} 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white z-10 text-center"
                  >
                    <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-white to-[#FFF0F5] border-2 border-[#F9D7E3] shadow-lg">
                      <ArchitectureIcon type={step.icon} className="w-10 h-10 text-[#D6336C]" />
                    </div>
                    <h3 className="text-xl font-bold mt-6 mb-2">{step.title}</h3>
                    <p className="text-[#555555]">{step.description}</p>
                    {index === 0 && (
                      <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-[#F9D7E3] text-[#A61E4D] font-bold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Go to Google AI Studio
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-24 hero-gradient-bg">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold">Ready to Get Started?</h2>
              <p className="mt-4 text-lg text-[#555555]">Launch the app to add your key or start designing now.</p>
              <button onClick={onLaunch}
                className="mt-8 shimmer-button text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                Launch the App
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <SharedFooter onNavigate={onNavigate} />
    </div>
  );
};

export default SdkPage;

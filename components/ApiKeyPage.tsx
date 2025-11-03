import React from 'react';
import { motion } from 'framer-motion';
import ApiKeyAnimation from './ApiKeyAnimation';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import SharedFooter from './SharedFooter';

type Page = 'contact' | 'about' | 'sdk' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface ApiKeyPageProps {
  onBack: () => void;
  onLaunch: () => void;
  onNavigate: (page: Page) => void;
}

const ApiKeyPage: React.FC<ApiKeyPageProps> = ({ onBack, onLaunch, onNavigate }) => {
    const steps = [
        {
            title: 'Visit Google AI Studio',
            description: 'Navigate to the official Google AI Studio website to start the process.',
            link: 'https://ai.google.dev/',
            linkText: 'Go to AI Studio',
            icon: IconType.Google,
        },
        {
            title: 'Get API Key',
            description: 'Look for a button labeled "Get API key" and click it. You may need to sign in with your Google account.',
            icon: IconType.Sparkles,
        },
        {
            title: 'Create a New Project',
            description: 'Follow the on-screen instructions to create a new project. This will generate your unique API key.',
            icon: IconType.FileCode,
        },
        {
            title: 'Copy & Paste Your Key',
            description: 'In CubeGen AI, open the Settings sidebar and paste your key into the designated field.',
            icon: IconType.Gear,
        },
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
            {/* Hero Section */}
            <section className="relative flex items-center justify-center overflow-hidden sdk-hero-bg py-20 pt-32 md:pt-40">
                <div className="container mx-auto px-6 z-10 text-center">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            Unlock <span className="animated-gradient-text text-transparent bg-clip-text">Pro</span> Capabilities
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                            The "Bring Your Own Key" feature is available on our <b>Pro ($10/mo)</b> and <b>Business ($50/mo)</b> plans, allowing you to bypass shared usage limits and experience CubeGen AI without interruption.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Why Use Your Own Key Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="order-2 md:order-1"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Unleash Your Architectural Vision</h2>
                            <ul className="space-y-6 text-lg text-[#555555]">
                                <li className="flex items-start">
                                    <b className="text-[#D6336C] mr-3 mt-1 text-xl">&rarr;</b>
                                    <div>
                                        <b className="text-black">Infinite Canvas:</b> Say goodbye to shared quotas. Design, iterate, and generate without interruption, ensuring your creativity is never capped.
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <b className="text-[#D6336C] mr-3 mt-1 text-xl">&rarr;</b>
                                    <div>
                                        <b className="text-black">First-Class Access:</b> Leverage your own key to tap directly into the latest and most powerful models from Google, putting you at the forefront of AI-driven design.
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <b className="text-[#D6336C] mr-3 mt-1 text-xl">&rarr;</b>
                                    <div>
                                        <b className="text-black">Built for Builders:</b> The perfect companion for professionals. Integrate with our SDK to automate documentation, power internal tools, and scale your design process.
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div
                            className="flex justify-center items-center order-1 md:order-2"
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

            {/* How to get a key */}
            <section className="py-24 sdk-hero-bg">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">How to Get Your Key in 4 Steps</h2>
                    <div className="relative max-w-5xl mx-auto">
                        {/* The connecting line */}
                        <div className="hidden md:block absolute top-10 left-10 right-10 h-0.5 bg-pink-200" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="text-center relative bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 shadow-lg flex flex-col"
                                >
                                    <div className="flex-shrink-0 flex items-center justify-center h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-white to-[#FFF0F5] border-2 border-[#F9D7E3] shadow-lg mb-4">
                                        <ArchitectureIcon type={step.icon} className="w-10 h-10 text-[#D6336C]" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className="text-sm text-[#555555] mb-3 flex-grow">{step.description}</p>
                                    {step.link && (
                                        <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#D6336C] hover:underline mt-auto">
                                            {step.linkText} &rarr;
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h2 className="text-4xl md:text-5xl font-extrabold">Upgrade to Unlock Your Potential</h2>
                    <p className="mt-4 text-lg text-[#555555]">Choose a Pro or Business plan to use your own API key and access unlimited generations.</p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => onNavigate('sdk')}
                            className="bg-[#F9D7E3] text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                            View Pro Plans
                        </button>
                         <button onClick={onLaunch}
                            className="shimmer-button text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                            Launch App & Add Key
                        </button>
                    </div>
                    </motion.div>
                </div>
            </section>
        </main>

        <SharedFooter onNavigate={onNavigate} />
    </div>
  );
};

export default ApiKeyPage;

import React from 'react';
import { motion } from 'framer-motion';
import SharedFooter from './SharedFooter';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

type Page = 'contact' | 'about' | 'sdk' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface AboutPageProps {
  onBack: () => void;
  onLaunch: () => void;
  onNavigate: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack, onLaunch, onNavigate }) => {

  const teamMembers = [
    {
      name: 'Divesh Sarkar',
      role: 'Founder & Lead Architect',
      bio: 'The visionary behind CubeGen AI, Divesh leads the project with a passion for making complex system design accessible to everyone through the power of AI.',
      avatar: 'DS',
    },
    {
      name: 'Manish Sarkar',
      role: 'Software Engineer',
      bio: "Manish is the core engineer turning prompts into pixels. He's dedicated to optimizing the AI's performance and ensuring a seamless user experience.",
      avatar: 'MS',
    },
  ];

  const modelPillars = [
      { icon: IconType.WebServer, title: 'Service Maintenance', description: 'Keeping the servers running, the APIs responsive, and the service reliable for all users.' },
      { icon: IconType.User, title: 'Team Support', description: 'Fairly compensating our small, dedicated team for their ongoing work and innovation.' },
      { icon: IconType.Brain, title: 'Future Research', description: 'Investing in R&D to explore new features and work towards an open-source model.' },
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
        <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#FFF0F5] py-20 pt-32">
          <div className="container mx-auto px-6 z-10">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-center">
                Our Mission: <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Democratize Design</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555] text-center">
                CubeGen AI was born from a simple idea: great software architecture shouldn't be a bottleneck. We're a non-profit organization, founded in 2025, dedicated to making professional design tools accessible to all.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12">Meet the Team</h2>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {teamMembers.map((member, index) => {
                       const colorClasses = ['bg-pink-100 text-pink-700', 'bg-blue-100 text-blue-700'];
                       const colorClass = colorClasses[index % colorClasses.length];

                       return (
                        <motion.div 
                            key={member.name}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-md text-center border border-[#F9D7E3] hover:shadow-xl transition-shadow"
                        >
                            <div className={`w-20 h-20 mx-auto rounded-full ${colorClass} flex items-center justify-center font-bold text-2xl mb-4`}>
                                {member.avatar}
                            </div>
                            <h3 className="text-xl font-bold">{member.name}</h3>
                            <p className="text-[#D6336C] font-semibold mb-3">{member.role}</p>
                            <p className="text-[#555555] text-sm">{member.bio}</p>
                        </motion.div>
                       )
                    })}
                </div>
            </div>
        </section>

        {/* Sustainable Model Section */}
        <section className="py-24 bg-gradient-to-b from-white to-[#FFF0F5]">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4">Our Sustainable Model</h2>
            <p className="text-lg text-[#555555] max-w-3xl mx-auto text-center mb-12">
              As a non-profit, our focus is on impact, not profit. API charges from our SDK and power-users with personal keys directly fund our mission.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {modelPillars.map((pillar, index) => (
                    <motion.div 
                        key={pillar.title}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-8 rounded-2xl shadow-md text-center border border-[#F9D7E3]"
                    >
                        <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-white to-[#FFF0F5] border-2 border-[#F9D7E3] shadow-lg mb-4">
                            <ArchitectureIcon type={pillar.icon} className="w-8 h-8 text-[#D6336C]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
                        <p className="text-[#555555] text-sm">{pillar.description}</p>
                    </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold">Ready to Build Your Vision?</h2>
              <p className="mt-4 text-lg text-[#555555]">Turn your ideas into professional diagrams in seconds.</p>
              <button onClick={onLaunch}
                className="mt-8 shimmer-button text-[#A61E4D] font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg">
                Launch the App
              </button>
            </motion.div>
          </div>
        </section>

      </main>

      <SharedFooter onNavigate={onNavigate} activePage="about" />
    </div>
  );
};

export default AboutPage;

import React from 'react';
import { motion } from 'framer-motion';
import { FOOTER_LINKS } from '../constants';

interface AboutPageProps {
  onBack: () => void;
  onLaunch: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack, onLaunch }) => {

  const teamMembers = [
    {
      name: 'Architect AI',
      role: 'Lead Solutions Architect',
      bio: 'The mastermind behind diagram generation, ensuring every design is robust, scalable, and follows best practices. Fluent in all cloud languages.',
      avatar: '🧠',
    },
    {
      name: 'Designer AI',
      role: 'Principal UX Designer',
      bio: 'Obsessed with clean layouts and beautiful aesthetics. Designer AI ensures every diagram is not just functional, but also a work of art.',
      avatar: '🎨',
    },
    {
      name: 'Explainer AI',
      role: 'Senior Technical Writer',
      bio: 'Takes complex architectural concepts and translates them into clear, concise explanations for any audience. Loves markdown more than code.',
      avatar: '✍️',
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
        <section className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#FFF0F5] py-20 pt-32">
          <div className="container mx-auto px-6 z-10">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-center">
                Our Mission: <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Democratize Design</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555] text-center">
                ArchiGen AI was born from a simple idea: great software architecture shouldn't be a bottleneck. We're leveraging the power of generative AI to empower developers, architects, and students to visualize, design, and understand complex systems faster than ever before.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">Powered by Cutting-Edge AI</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                    <h3 className="text-2xl font-bold mb-4 text-[#D6336C]">Google's Gemini API</h3>
                    <p className="text-[#555555] mb-4">
                        At the heart of ArchiGen is Google's state-of-the-art Gemini model. We use its advanced reasoning and code-generation capabilities to interpret your prompts and translate them into structured, accurate diagram data.
                    </p>
                    <p className="text-[#555555]">
                        This allows us to not only create the visual components but also understand the relationships and logical groupings, resulting in diagrams that are both beautiful and intelligent.
                    </p>
                </div>
                <div className="flex justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="p-8 bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl shadow-lg border border-[#EAEAEA]">
                    <img src="https://storage.googleapis.com/gemini-api-use-case-images/google-gemini-logo.svg" alt="Google Gemini Logo" className="w-48 h-auto"/>
                  </motion.div>
                </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-gradient-to-b from-white to-[#FFF0F5]">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12">Meet the (AI) Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {teamMembers.map((member, index) => (
                        <motion.div 
                            key={member.name}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-md text-center border border-[#F9D7E3] hover:shadow-xl transition-shadow"
                        >
                            <div className="text-5xl mb-4 bg-[#F8F1F3] inline-block p-4 rounded-full">{member.avatar}</div>
                            <h3 className="text-xl font-bold">{member.name}</h3>
                            <p className="text-[#D6336C] font-semibold mb-3">{member.role}</p>
                            <p className="text-[#555555] text-sm">{member.bio}</p>
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

      <footer className="bg-gradient-to-t from-white to-[#FFF0F5]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold">Archi<span className="text-[#D6336C]">Gen</span> AI</h3>
                <p className="text-[#555555]">Instant Architecture Design.</p>
            </div>
            <div className="flex items-center space-x-6 text-[#555555]">
                {FOOTER_LINKS.links.map((link) => {
                    if (link.name === 'About') {
                        return <span key={link.name} className="font-semibold text-[#2B2B2B] cursor-default">{link.name}</span>;
                    }
                     if (link.name === 'Contact') {
                        return <button key={link.name} onClick={onBack} className="hover:text-[#2B2B2B] transition-colors">{link.name}</button>;
                    }
                    return <a key={link.name} href={link.href} className="hover:text-[#2B2B2B] transition-colors">{link.name}</a>
                })}
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

export default AboutPage;

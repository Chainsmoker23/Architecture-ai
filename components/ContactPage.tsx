
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FOOTER_LINKS } from '../constants';

interface ContactPageProps {
  onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
      <header className="absolute top-0 left-0 w-full p-6 z-20">
        <button onClick={onBack} className="flex items-center gap-2 font-semibold text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Back to Home
        </button>
      </header>

      <main>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#FFF0F5] py-20 pt-32">
          <div className="container mx-auto px-6 z-10">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-center">
                Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Touch</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[#555555] text-center">
                Have a question, feedback, or a partnership inquiry? We'd love to hear from you.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              {isSubmitted ? (
                <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-[#F9D7E3]">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <h2 className="text-3xl font-bold text-[#D6336C]">Thank You!</h2>
                    <p className="mt-4 text-[#555555]">Your message has been sent. We'll get back to you as soon as possible.</p>
                    <button onClick={onBack} className="mt-8 shimmer-button text-[#A61E4D] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      Go Home
                    </button>
                  </motion.div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-[#F9D7E3]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#555555] mb-1">Full Name</label>
                      <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292]" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#555555] mb-1">Email Address</label>
                      <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292]" />
                    </div>
                  </div>
                   <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-[#555555] mb-1">Subject</label>
                      <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292]" />
                    </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#555555] mb-1">Message</label>
                    <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleChange} className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] resize-none"></textarea>
                  </div>
                  <div>
                    <button type="submit" disabled={isSubmitting} className="w-full shimmer-button text-[#A61E4D] font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Sending...
                        </>
                      ) : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
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
                    if (link.name === 'Contact') {
                        return <span key={link.name} className="font-semibold text-[#2B2B2B] cursor-default">{link.name}</span>;
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

export default ContactPage;

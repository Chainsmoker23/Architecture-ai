import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SharedFooter from './SharedFooter';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';

type Page = 'contact' | 'about' | 'sdk' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface CareersPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const CareersPage: React.FC<CareersPageProps> = ({ onBack, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    setIsSubmitting(true);
    
    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setFileName('');
      } else {
        console.error('Form submission error:', result);
        alert('There was an error submitting your application. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
                Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Mission</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[#555555] text-center">
                We're building the future of software design. While we have no open positions right now, we're always interested in hearing from passionate individuals.
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
                    <h2 className="text-3xl font-bold text-[#D6336C]">Application Received!</h2>
                    <p className="mt-4 text-[#555555]">Thank you for your interest in CubeGen AI. We've received your information and will keep it on file for future opportunities.</p>
                    <button onClick={onBack} className="mt-8 shimmer-button text-[#A61E4D] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                      Return Home
                    </button>
                  </motion.div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-[#F9D7E3]">
                  <input type="hidden" name="access_key" value="1313aee6-47fd-4d0b-9e9a-07fff922b405" />
                  <input type="hidden" name="subject" value="New Career Inquiry from CubeGen AI" />
                  <input type="hidden" name="from_name" value="CubeGen Careers" />
                  
                  <div className="text-center">
                    <h2 className="font-bold text-2xl">Spontaneous Application</h2>
                    <p className="text-sm text-gray-500 mt-1">Think you'd be a great fit? Let us know why.</p>
                  </div>
                  
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
                    <label htmlFor="message" className="block text-sm font-medium text-[#555555] mb-1">Cover Letter / Message</label>
                    <textarea name="message" id="message" rows={5} required value={formData.message} onChange={handleChange} placeholder="Tell us about yourself and why you're interested in CubeGen AI..." className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] resize-none"></textarea>
                  </div>

                  <div>
                    <label htmlFor="attachment" className="block text-sm font-medium text-[#555555] mb-1">Attach Resume (Optional)</label>
                    <label htmlFor="attachment" className="relative cursor-pointer bg-[#F8F1F3] border border-dashed border-[#E8DCE0] rounded-xl flex items-center justify-center p-3 text-sm text-gray-500 hover:border-[#F06292]">
                        <ArchitectureIcon type={IconType.FileCode} className="w-5 h-5 mr-2" />
                        <span>{fileName || 'Upload PDF, DOC, or DOCX'}</span>
                        <input id="attachment" name="attachment" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </label>
                  </div>
                  
                  <div>
                    <button type="submit" disabled={isSubmitting} className="w-full shimmer-button text-[#A61E4D] font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Submitting...
                        </>
                      ) : 'Submit Application'}
                    </button>
                  </div>

                   <div className="pt-4 text-center border-t border-pink-100">
                     <p className="text-sm text-gray-500 mb-2">Stay in the loop for future openings:</p>
                     <a href="#" className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        Follow us on LinkedIn
                     </a>
                   </div>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <SharedFooter onNavigate={onNavigate} activePage="careers" />
    </div>
  );
};

export default CareersPage;
import React from 'react';
import { motion } from 'framer-motion';
import SharedFooter from './SharedFooter';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface TermsPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const TermsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#D6336C] mb-3">{title}</h2>
        <div className="text-[#555555] space-y-4 prose max-w-none">
            {children}
        </div>
    </div>
);

const TermsPage: React.FC<TermsPageProps> = ({ onBack, onNavigate }) => {
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
                Terms of Service
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                Please read these terms carefully before using our service.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <TermsSection title="1. Acceptance of Terms">
                    <p>By accessing or using CubeGen AI (the "Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all of these terms, do not use the Service.</p>
                </TermsSection>

                <TermsSection title="2. Description of Service">
                    <p>CubeGen AI is a web application that allows users to generate software architecture diagrams automatically from natural language prompts. The Service utilizes third-party AI models, such as Google's Gemini API, to interpret prompts and produce diagram data.</p>
                </TermsSection>

                <TermsSection title="3. User Conduct and Responsibilities">
                    <p>You agree to use the Service responsibly. You are solely responsible for the content of the prompts you submit. You must not use the Service to:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Generate illegal, harmful, or offensive content.</li>
                        <li>Infringe upon the intellectual property rights of others.</li>
                        <li>Attempt to gain unauthorized access to our systems or engage in any activity that disrupts or interferes with the Service.</li>
                        <li>Submit any personal data or confidential information that you do not have the right to share.</li>
                    </ul>
                </TermsSection>

                <TermsSection title="4. API Usage">
                    <p>The Service may be used with a shared API key provided by us, which is subject to usage limits. Alternatively, you may provide your own API key for a third-party service (e.g., Google Gemini).</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Shared Key:</strong> The shared key has strict rate limits. We reserve the right to change these limits or revoke access at any time. Abuse of the shared key may result in a ban.</li>
                        <li><strong>Personal Key:</strong> If you use your own API key, you are responsible for all costs and usage associated with that key, subject to the terms of the third-party provider (e.g., Google). We do not store your key on our servers; it is saved in your browser's local storage.</li>
                    </ul>
                </TermsSection>
                
                <TermsSection title="5. Intellectual Property">
                    <p>You retain ownership of the prompts you create. You grant us a worldwide, non-exclusive, royalty-free license to use, process, and transmit your prompts solely for the purpose of providing the Service to you.</p>
                    <p>The diagrams generated by the Service are the output of an AI model. Your ability to use, reproduce, or claim copyright over these diagrams may be subject to the terms of the underlying AI model provider (e.g., Google) and applicable law. We do not claim any ownership over the generated diagrams.</p>
                    <p>All aspects of the CubeGen AI Service itself, including its design, text, graphics, and code, are the property of CubeGen AI and are protected by copyright and other intellectual property laws.</p>
                </TermsSection>

                <TermsSection title="6. Disclaimer of Warranties">
                    <p>The Service is provided on an "as is" and "as available" basis. We make no warranties, express or implied, that the Service will be uninterrupted, error-free, or accurate. The diagrams generated are for informational and illustrative purposes only and should not be considered professional advice. You are responsible for verifying the accuracy and suitability of any generated diagram for your specific needs.</p>
                </TermsSection>
                
                <TermsSection title="7. Limitation of Liability">
                    <p>In no event shall CubeGen AI, its creators, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service.</p>
                </TermsSection>

                <TermsSection title="8. Changes to Terms">
                    <p>We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new terms.</p>
                </TermsSection>
            </div>
        </section>
      </main>

      <SharedFooter onNavigate={onNavigate} activePage="terms" />
    </div>
  );
};

export default TermsPage;
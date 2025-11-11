import React from 'react';
import { motion } from 'framer-motion';
import SharedFooter from './SharedFooter';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research';

interface PrivacyPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const PrivacySection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#D6336C] mb-3">{title}</h2>
        <div className="text-[#555555] space-y-4 prose max-w-none">
            {children}
        </div>
    </div>
);

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, onNavigate }) => {
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
                Privacy Policy
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                Your trust is important to us. Here's how we protect your privacy and handle your data.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <PrivacySection title="1. Introduction">
                    <p>Welcome to CubeGen AI ("we", "us", "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using CubeGen AI, you agree to the collection and use of information in accordance with this policy.</p>
                </PrivacySection>

                <PrivacySection title="2. Information We Collect">
                    <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Information You Provide to Us:</strong> The primary data we collect is the content of the prompts you enter to generate diagrams. If you use our contact form, we will also collect your name and email address.</li>
                        <li><strong>Personal API Keys:</strong> If you choose to provide your own Google Gemini API key, it is stored exclusively in your browser's local storage. This key is NOT transmitted to our servers and we do not have access to it.</li>
                        <li><strong>Usage Data:</strong> We may automatically collect anonymous information about your usage of the Service, such as the features you use, the time you spend on the app, and general user-flow patterns. This data is aggregated and does not personally identify you.</li>
                    </ul>
                </PrivacySection>

                <PrivacySection title="3. How We Use Your Information">
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
                     <ul className="list-disc list-inside space-y-2">
                        <li>Process your prompts to generate and display architecture diagrams.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
                        <li>Respond to your comments and questions when you contact us.</li>
                    </ul>
                </PrivacySection>

                <PrivacySection title="4. Third-Party Services">
                     <p>CubeGen AI relies on third-party services to function. Our primary third-party service is:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Google Gemini API:</strong> To generate diagrams, the text prompts you submit are sent to Google's servers for processing by the Gemini model. Your use of this feature is subject to Google's Privacy Policy. We do not send any other personal information to Google. You can review their policy <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#D6336C] hover:underline">here</a>.</li>
                    </ul>
                </PrivacySection>

                <PrivacySection title="5. Data Storage and Security">
                    <p>We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
                     <ul className="list-disc list-inside space-y-2">
                        <li>Your generated diagrams and prompts are not stored on our servers. Your session is contained entirely within your browser.</li>
                        <li>As mentioned, user-provided API keys are stored in your browser's local storage. You can clear this at any time by clearing your browser's cache and site data.</li>
                    </ul>
                </PrivacySection>
                
                 <PrivacySection title="6. Your Rights and Choices">
                    <p>You have certain rights regarding the information we handle.</p>
                     <ul className="list-disc list-inside space-y-2">
                        <li><strong>Access and Control:</strong> Since we do not store your data, most of your control lies within your browser. You can clear your API key, prompts, and any cached data by clearing your browser's data for our site.</li>
                        <li><strong>Opt-Out of Data Collection:</strong> You can stop all collection of information by the Service by discontinuing use of the Service.</li>
                    </ul>
                </PrivacySection>

                 <PrivacySection title="7. Changes to This Privacy Policy">
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
                </PrivacySection>

                 <PrivacySection title="8. Contact Us">
                    <p>If you have questions or comments about this Privacy Policy, please contact us through the contact form on our website or by emailing <a href="mailto:privacy@cubegen.ai" className="text-[#D6336C] hover:underline">privacy@cubegen.ai</a>.</p>
                </PrivacySection>
            </div>
        </section>
      </main>

      <SharedFooter onNavigate={onNavigate} activePage="privacy" />
    </div>
  );
};

export default PrivacyPage;
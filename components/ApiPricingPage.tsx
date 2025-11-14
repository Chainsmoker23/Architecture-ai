import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import SharedFooter from './SharedFooter';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { supabase } from '../supabaseClient';
import { FREE_GENERATION_LIMIT, HOBBYIST_GENERATION_LIMIT } from './constants';
import PricingTableOne from './billingsdk/PricingTableOne';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research' | 'auth' | 'sdk';

interface ApiPricingPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const highlightSyntax = (code: string) => {
  let highlightedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return { __html: highlightedCode
      .replace(/'([^']*)'/g, `<span class="token string">'$1'</span>`)
      .replace(/\b(const|let|async|function|try|catch|await|new|return|if|throw|Error)\b/g, `<span class="token keyword">${'$&'}</span>`)
      .replace(/(\.json\(\)|\.log|\.error|\.stringify|ok|message)/g, `<span class="token property-access">${'$&'}</span>`)
      .replace(/\b(fetch|console|JSON)\b/g, `<span class="token function">${'$&'}</span>`)
      .replace(/(\(|\{|\}|\[|\]|,|:)/g, `<span class="token punctuation">${'$&'}</span>`)
      .replace(/(\/\/.*)/g, `<span class="token comment">${'$&'}</span>`)
  };
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <pre className="p-4 text-sm text-gray-300 bg-[#1e1e1e] rounded-xl overflow-x-auto">
        <code dangerouslySetInnerHTML={highlightSyntax(code)} />
    </pre>
);

const ApiPricingPage: React.FC<ApiPricingPageProps> = ({ onBack, onNavigate }) => {
    const { currentUser } = useAuth();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const codeExample = `// Example: Using fetch to call the CubeGen AI API.
// Public API access is a Pro feature.

const apiKey = 'YOUR_API_KEY'; // Get this from your dashboard
const prompt = 'A serverless API on GCP using Cloud Functions and Firestore.';

fetch('https://cubegen.ai/api/v1/diagrams/generate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt }),
})
.then(res => {
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
})
.then(data => {
  console.log('Generated Diagram:', data.diagram);
})
.catch(error => {
  console.error('Error:', error);
});
`;
    
    useEffect(() => {
        // Handle cancelled payments
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const paymentStatus = hashParams.get('payment');

        if (paymentStatus === 'cancelled') {
            setToast({ message: 'Your purchase was cancelled.', type: 'error' });
            // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname + '#api');
        }
    }, []);


    const getPlans = () => {
        return [
          {
            id: 'free',
            title: 'Free',
            description: 'Perfect for getting started and occasional use.',
            currency: '$',
            monthlyPrice: '0',
            buttonText: 'Sign Up for Free',
            highlight: false,
            features: [
              { name: `${FREE_GENERATION_LIMIT} diagram generations per month`, icon: 'check', iconColor: 'text-green-500' },
              { name: 'Standard icon set', icon: 'check', iconColor: 'text-blue-500' },
              { name: 'Community support', icon: 'check', iconColor: 'text-orange-500' },
            ]
          },
          {
            id: 'one_time',
            title: 'Hobbyist',
            description: 'A one-time purchase for extra generations.',
            currency: '$',
            monthlyPrice: '3',
            buttonText: 'Buy for $3',
            highlight: false,
            features: [
              { name: `${HOBBYIST_GENERATION_LIMIT} total diagram generations`, icon: 'check', iconColor: 'text-green-500' },
              { name: 'Standard icon set', icon: 'check', iconColor: 'text-blue-500' },
              { name: 'Perfect for small projects', icon: 'check', iconColor: 'text-orange-500' },
            ]
          },
          {
            id: 'subscription',
            title: 'Pro',
            description: 'Full Pro access with ongoing updates and support.',
            currency: '$',
            monthlyPrice: '10',
            buttonText: 'Subscribe for $10/mo',
            highlight: true,
            features: [
              { name: 'Unlimited diagram generations', icon: 'check', iconColor: 'text-green-500' },
              { name: 'Generate a personal API key', icon: 'check', iconColor: 'text-blue-500' },
              { name: 'Use your own key in-app', icon: 'check', iconColor: 'text-orange-500' },
              { name: 'Priority support', icon: 'check', iconColor: 'text-purple-500' },
            ]
          }
        ];
    };

    const handlePlanSelect = async (planId: string) => {
        if (planId === 'free') {
            if (!currentUser) onNavigate('auth');
            return;
        }

        if (!currentUser) {
            onNavigate('auth');
            return;
        }

        setLoadingPlan(planId);
        setToast(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('You must be logged in to purchase a plan.');
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ plan: planId }),
            });

            // Defensively get the raw text of the response first for robust error handling
            const responseText = await response.text();
            console.log('[Checkout] Raw server response:', responseText);

            if (!response.ok) {
                // Try to parse a structured error from the response, with a fallback.
                let errorMessage = 'Failed to create checkout session.';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = responseText.length < 100 ? responseText : errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Now, parse the successful response
            const data = JSON.parse(responseText);
            console.log('[Checkout] Parsed server response:', data);
            
            if (data.success && data.checkout_url) {
                // Perform a direct browser redirect instead of using an SDK
                window.location.href = data.checkout_url;
            } else {
                // This handles the specific case of a 200 OK response that's missing the expected data
                throw new Error(data.error || 'Server responded successfully but did not provide a checkout URL.');
            }
        } catch (error: any) {
            console.error('Error in handlePlanSelect:', error);
            setToast({ message: error.message, type: 'error' });
            setLoadingPlan(null); // Ensure loading state is reset on any error
        }
    };


    return (
        <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
            <AnimatePresence>
                {toast && <Toast message={toast.message} onDismiss={() => setToast(null)} />}
            </AnimatePresence>
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
                                Plans & Pricing
                            </h1>
                            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                                Integrate the power of CubeGen AI into your workflow. Find a plan that's right for you.
                            </p>
                        </motion.div>
                    </div>
                </section>
                
                 <section id="pricing" className="py-24 bg-gradient-to-b from-white to-[#FFF0F5]">
                    <PricingTableOne
                        title="Plans for Every Scale"
                        description="From solo developers to enterprise teams, choose a plan that fits your needs."
                        onPlanSelect={handlePlanSelect}
                        plans={getPlans()}
                        loadingPlan={loadingPlan}
                    />
                </section>

                 <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                <h2 className="text-4xl font-bold mb-4">Simple, Powerful Integration</h2>
                                <p className="text-[#555555] mb-6">Our Pro plan allows you to generate a personal API key. Use this key within the app settings to bypass the shared usage limits and enjoy unlimited diagram generation, ensuring your workflow is never interrupted.</p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3"><ArchitectureIcon type={IconType.Sparkles} className="w-6 h-6 text-[#D6336C] flex-shrink-0 mt-1" /><p><strong>Unlimited Generations:</strong> Create as many diagrams as you need without hitting daily quotas.</p></div>
                                    <div className="flex items-start gap-3"><ArchitectureIcon type={IconType.Gear} className="w-6 h-6 text-[#D6336C] flex-shrink-0 mt-1" /><p><strong>Personal Key:</strong> Your own dedicated key for use within the CubeGen AI application.</p></div>
                                    <div className="flex items-start gap-3"><ArchitectureIcon type={IconType.Cloud} className="w-6 h-6 text-[#D6336C] flex-shrink-0 mt-1" /><p><strong>Public API (Coming Soon):</strong> Your plan will grant you access to our future public API and SDK for full automation.</p></div>
                                </div>
                            </motion.div>
                             <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                             >
                                <div className="bg-[#2a2a2a] p-6 rounded-2xl shadow-2xl border border-pink-900/50">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    </div>
                                    <CodeBlock code={codeExample} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

            </main>

            <SharedFooter onNavigate={onNavigate} activePage="api" />
        </div>
    );
};

export default ApiPricingPage;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import SharedFooter from './SharedFooter';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { supabase } from '../supabaseClient';
import { FREE_GENERATION_LIMIT, HOBBYIST_GENERATION_LIMIT } from './constants';
import Logo from './Logo';

type Page = 'contact' | 'about' | 'api' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research' | 'auth';

interface ApiPricingPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

// Fictional Dodo SDK types for TypeScript
declare function Dodo(publishableKey: string): {
    redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: { message: string } }>;
};

const highlightSyntax = (code: string) => {
  const highlighted = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/'([^']*)'/g, `<span class="token string">'${'$1'}'</span>`)
    .replace(/"([^"]*)"/g, `<span class="token string">"${'$1'}"</span>`)
    .replace(/\b(const|let|import|from|await|new|return)\b/g, `<span class="token keyword">${'$&'}</span>`)
    .replace(/(\bCubeGenAI|generateDiagram\b)/g, `<span class="token function">${'$&'}</span>`)
    .replace(/(\(|\{|\}|\[|\]|\.)/g, `<span class="token punctuation">${'$&'}</span>`)
    .replace(/(\/\/.*)/g, `<span class="token comment">${'$&'}</span>`);
  return { __html: highlighted };
};

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <pre className="p-4 text-sm text-gray-300 bg-[#1e1e1e] rounded-xl overflow-x-auto">
        <code dangerouslySetInnerHTML={highlightSyntax(code)} />
    </pre>
);

const CheckoutRedirector: React.FC<{ sessionId: string, onRedirectError: (message: string) => void }> = ({ sessionId, onRedirectError }) => {
    
    useEffect(() => {
        const redirectToDodo = async () => {
            // Checks are moved to handlePlanClick for earlier feedback.
            // We assume if we get here, the SDK is ready.
            const dodoPublishableKey = process.env.VITE_DODO_PUBLISHABLE_KEY!;
            const dodo = Dodo(dodoPublishableKey);
            const { error } = await dodo.redirectToCheckout({ sessionId });
            if (error) {
                onRedirectError(error.message || "An unknown error occurred during the redirect.");
            }
        };

        // Adding a small delay to allow the user to read the message.
        const timer = setTimeout(redirectToDodo, 1500);

        return () => clearTimeout(timer);
    }, [sessionId, onRedirectError]);

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center p-8"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Logo className="h-10 w-10 text-[#D6336C]" />
                    <h3 className="text-2xl font-bold">Cube<span className="text-[#D6336C]">Gen</span> AI</h3>
                </div>
                 <div className="flex items-center justify-center gap-2 text-gray-500 font-medium">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Redirecting you to our secure payment partner...</span>
                 </div>
            </motion.div>
        </div>
    );
};


const ApiPricingPage: React.FC<ApiPricingPageProps> = ({ onBack, onNavigate }) => {
    const { currentUser } = useAuth();
    const userPlan = currentUser?.user_metadata?.plan || 'free';
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);

    const codeExample = `// The CubeGenAI SDK is currently for internal demonstration.
// Public API access is on our roadmap!

// Pro users can generate a personal key in their dashboard
// and add it to the app settings to get unlimited generations.

console.log('Building the future of automated design!');
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


    const handlePlanClick = async (plan: any) => {
        // 1. Check if user is logged in.
        if (!currentUser) {
            onNavigate('auth');
            return;
        }

        // 2. Check if SDK and keys are ready before doing anything else.
        if (typeof Dodo === 'undefined') {
            setToast({ message: "Payment SDK is not loaded. Please wait a moment or check your connection.", type: 'error' });
            return;
        }
        if (!process.env.VITE_DODO_PUBLISHABLE_KEY) {
            setToast({ message: "Payment system is not configured. (Missing Publishable Key)", type: 'error' });
            return;
        }

        setLoadingPriceId(plan.productId);
        setToast(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('You must be logged in to purchase a plan.');
            }

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ 
                    productId: plan.productId,
                    planName: plan.name.toLowerCase(),
                    mode: plan.mode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session.');
            }
            
            if (!data.sessionId) {
              throw new Error("Could not retrieve a checkout session ID.");
            }
            
            setCheckoutSessionId(data.sessionId);

        } catch (error: any) {
            console.error('Error creating checkout session:', error.message);
            setToast({ message: `Error: ${error.message}`, type: 'error' });
        } finally {
            setLoadingPriceId(null);
        }
    };

    const plans = [
        {
            name: 'Free',
            price: '$0',
            freq: 'per month',
            productId: null,
            mode: null,
            features: [
                `${FREE_GENERATION_LIMIT} diagram generations per month`,
                'Standard icon set',
                'Community support',
                'Perfect for getting started',
            ],
            cta: 'Sign Up for Free',
            isFeatured: false,
        },
        {
            name: 'Hobbyist',
            price: '$3',
            freq: 'one-time',
            productId: 'pdt_hobby_123', // <-- REPLACE with your actual Dodo Product ID
            mode: 'payment',
            features: [
              `${HOBBYIST_GENERATION_LIMIT} diagram generations`,
              'Standard icon set',
              'Perfect for small projects',
              'Community support',
            ],
            cta: 'Get Started',
            isFeatured: false,
        },
        {
            name: 'Pro',
            price: '$10',
            freq: 'per month',
            productId: 'pdt_pro_456', // <-- REPLACE with your actual Dodo Product ID
            mode: 'subscription',
            features: [
              'Unlimited diagram generations',
              'Generate a personal API key',
              'Use your own key in-app',
              'Priority support',
            ],
            cta: 'Go Pro',
            isFeatured: true,
        },
    ];

    return (
        <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
            <AnimatePresence>
                {checkoutSessionId && (
                    <CheckoutRedirector 
                        sessionId={checkoutSessionId} 
                        onRedirectError={(message) => {
                            setToast({ message, type: 'error' });
                            setCheckoutSessionId(null);
                        }}
                    />
                )}
            </AnimatePresence>
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
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-4">Plans for Every Scale</h2>
                        <p className="text-lg text-[#555555] max-w-2xl mx-auto text-center mb-12">
                            From solo developers to enterprise teams, choose a plan that fits your needs.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start justify-center">
                           {plans.map((plan) => {
                               const planNameLower = plan.name.toLowerCase();
                               const isCurrentPlan = userPlan && userPlan === planNameLower;
                               const isDowngrade = (userPlan === 'pro' && (planNameLower === 'hobbyist' || planNameLower === 'free')) || (userPlan === 'hobbyist' && planNameLower === 'free');

                               let buttonText = plan.cta;
                               if (isCurrentPlan) buttonText = "Current Plan";
                               if (isDowngrade) buttonText = "Included";
                               if (!currentUser && planNameLower !== 'free') buttonText = "Sign In to Purchase";

                               return (
                                <motion.div
                                    key={plan.name}
                                    className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                                        isCurrentPlan
                                            ? 'bg-white border-2 border-[#D6336C] shadow-2xl scale-105'
                                            : plan.isFeatured
                                            ? 'bg-white shadow-2xl border-[#D6336C] md:-translate-y-4'
                                            : 'bg-white/70 shadow-lg border-pink-100'
                                    }`}
                                >
                                    {isCurrentPlan && (
                                        <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-[#E91E63] to-[#F06292] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                            Current Plan
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="mt-2"><span className="text-4xl font-extrabold">{plan.price}</span><span className="text-gray-500"> / {plan.freq}</span></p>
                                    <ul className="mt-6 space-y-3 text-sm text-[#555555]">
                                        {plan.features.map(f => <li key={f} className="flex items-center gap-2"><svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>{f}</li>)}
                                    </ul>
                                    <button
                                        onClick={() => {
                                            if (planNameLower === 'free') {
                                                if (!currentUser) onNavigate('auth');
                                            } else {
                                                handlePlanClick(plan);
                                            }
                                        }}
                                        disabled={loadingPriceId === plan.productId || isCurrentPlan || isDowngrade || (planNameLower === 'free' && !!currentUser)}
                                        className={`mt-8 w-full font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
                                            isCurrentPlan || (planNameLower === 'free' && !!currentUser)
                                            ? 'bg-gray-200 text-gray-500 cursor-default' 
                                            : (plan.isFeatured ? 'shimmer-button text-[#A61E4D]' : 'bg-[#F9D7E3] text-[#A61E4D] hover:shadow-lg')
                                        }`}
                                    >
                                        {loadingPriceId !== null && loadingPriceId === plan.productId
                                            ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Processing...
                                                </>
                                            ) 
                                            : buttonText
                                        }
                                    </button>
                                </motion.div>
                           )})}
                        </div>
                    </div>
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
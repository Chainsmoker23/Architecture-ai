import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import SharedFooter from './SharedFooter';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { supabase } from '../supabaseClient';

type Page = 'contact' | 'about' | 'sdk' | 'privacy' | 'terms' | 'docs' | 'apiKey' | 'careers' | 'research' | 'auth';

interface SdkPageProps {
  onBack: () => void;
  onNavigate: (page: Page) => void;
}

const useTypewriter = (text: string, enabled: boolean, speed = 10) => {
    const [displayedText, setDisplayedText] = useState('');

    React.useEffect(() => {
        if (enabled && text) {
            setDisplayedText(''); // Reset on text change
            let i = 0;
            const intervalId = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText(text.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(intervalId);
                }
            }, speed);
            return () => clearInterval(intervalId);
        }
        if (!enabled) {
          setDisplayedText(text);
        }
    }, [text, enabled, speed]);

    return displayedText;
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

const SdkPage: React.FC<SdkPageProps> = ({ onBack, onNavigate }) => {
    const { currentUser, pollForPlanUpdate } = useAuth();
    const userPlan = currentUser?.user_metadata?.plan;
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const codeExample = `import { CubeGenAI } from '@cubegen/sdk';

// Initialize with your CubeGen API Key from your dashboard
const cubeGen = new CubeGenAI('cg_sk_YOUR_API_KEY');

async function generate() {
  const prompt = 'A 3-tier web app on AWS with a load balancer and RDS database.';
  const diagramData = await cubeGen.generateDiagram({ prompt });

  // Returns a JSON object to render or save
  console.log(diagramData);
  return diagramData;
}`;
    const typedCode = useTypewriter(codeExample, true, 10);
    
    useEffect(() => {
        const handlePaymentSuccess = async () => {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const paymentStatus = hashParams.get('payment');
            const planName = hashParams.get('plan');

            if (paymentStatus === 'success' && planName) {
                setIsUpgrading(true);
                setToast(null);

                window.history.replaceState({}, document.title, window.location.pathname + '#sdk');
                
                await pollForPlanUpdate(planName);

                setIsUpgrading(false);
                const capitalizedPlan = planName.charAt(0).toUpperCase() + planName.slice(1);
                setToast({ message: `Upgrade successful! Your ${capitalizedPlan} plan is now active.`, type: 'success' });

            } else if (paymentStatus === 'cancelled') {
                setToast({ message: 'Payment was cancelled.', type: 'error' });
                window.history.replaceState({}, document.title, window.location.pathname + '#sdk');
            }
        };

        handlePaymentSuccess();
    }, [pollForPlanUpdate]);


    const handlePlanClick = async (priceId: string) => {
        if (!currentUser) {
            onNavigate('auth');
            return;
        }

        setLoadingPriceId(priceId);
        setToast(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('You must be logged in to purchase a plan.');
            }

            const response = await fetch('http://localhost:3001/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session.');
            }
            
            if (!data.redirectUrl) {
              throw new Error("Could not retrieve a checkout redirect URL.");
            }
            
            // Redirect the user to the checkout page provided by the backend.
            window.location.href = data.redirectUrl;

        } catch (error: any) {
            console.error('Error creating checkout session:', error.message);
            setToast({ message: `Error: ${error.message}`, type: 'error' });
            setLoadingPriceId(null);
        }
    };

    const plans = [
        {
            name: 'Hobbyist',
            price: '$3',
            freq: 'one-time',
            priceId: 'dodo_price_hobby',
            features: [
              '50 diagram generations',
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
            priceId: 'dodo_price_pro',
            features: [
              'Ultimate generations',
              'Access to SDK & API',
              'Emergency "Bring Your Own Key"',
              'Priority support',
            ],
            cta: 'Go Pro',
            isFeatured: true,
        },
        {
            name: 'Business',
            price: '$50',
            freq: 'per month',
            priceId: 'dodo_price_biz',
            features: [
              'Ultimate generations',
              'All Pro features, plus:',
              'Team collaboration tools',
              'Dedicated account manager',
            ],
            cta: 'Contact Sales',
            isFeatured: false,
        },
    ];

    return (
        <div className="bg-white text-[#2B2B2B] overflow-x-hidden">
            <AnimatePresence>
                {toast && <Toast message={toast.message} onDismiss={() => setToast(null)} />}
                {isUpgrading && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                        <div className="bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Finalizing your upgrade...
                        </div>
                    </div>
                )}
            </AnimatePresence>
            <header className="absolute top-0 left-0 w-full p-6 z-20">
                <button onClick={onBack} className="flex items-center gap-2 font-semibold text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to Home
                </button>
            </header>

            <main>
                <section className="relative flex items-center justify-center overflow-hidden sdk-hero-bg py-20 pt-32 md:pt-40">
                    <div className="container mx-auto px-6 z-10 text-center">
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                                Automate Your Architecture
                            </h1>
                            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                                Integrate the power of CubeGen AI into your workflow with our simple SDK and REST API. Generate, modify, and manage diagrams programmatically.
                            </p>
                        </motion.div>
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
                                <p className="text-[#555555] mb-6">Our NPM package provides a straightforward way to interact with the CubeGen AI engine. Generate diagrams in your CI/CD pipelines, build internal developer portals, or automate documentation with just a few lines of code.</p>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3"><ArchitectureIcon type={IconType.FileCode} className="w-6 h-6 text-[#D6336C] flex-shrink-0 mt-1" /><p><strong>Generate on the Fly:</strong> Create diagrams based on dynamic data or events in your system.</p></div>
                                    <div className="flex items-start gap-3"><ArchitectureIcon type={IconType.Gear} className="w-6 h-6 text-[#D6336C] flex-shrink-0 mt-1" /><p><strong>Automate Docs:</strong> Keep your architecture documentation in sync with your codebase automatically.</p></div>
                                    <div className="flex items-start gap-3"><ArchitectureIcon type={IconType.Cloud} className="w-6 h-6 text-[#D6336C] flex-shrink-0 mt-1" /><p><strong>Flexible Output:</strong> Receive diagram data as JSON for custom rendering or integration.</p></div>
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
                                    <CodeBlock code={typedCode} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
                
                 <section id="pricing" className="py-24 bg-gradient-to-b from-white to-[#FFF0F5]">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-4">Plans for Every Scale</h2>
                        <p className="text-lg text-[#555555] max-w-2xl mx-auto text-center mb-12">
                            From solo developers to enterprise teams, choose a plan that fits your needs.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                           {plans.map((plan) => {
                               const isCurrentPlan = userPlan && userPlan === plan.name.toLowerCase();
                               return (
                                <motion.div
                                    key={plan.name}
                                    className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                                        isCurrentPlan
                                            ? 'bg-white border-2 border-[#D6336C] shadow-2xl scale-105'
                                            : plan.isFeatured
                                            ? 'bg-white shadow-2xl border-[#D6336C] -translate-y-4'
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
                                        onClick={() => plan.name === 'Business' ? onNavigate('contact') : handlePlanClick(plan.priceId)}
                                        disabled={loadingPriceId === plan.priceId || isCurrentPlan}
                                        className={`mt-8 w-full font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
                                            isCurrentPlan 
                                            ? 'bg-gray-200 text-gray-500 cursor-default' 
                                            : (plan.isFeatured ? 'shimmer-button text-[#A61E4D]' : 'bg-[#F9D7E3] text-[#A61E4D] hover:shadow-lg')
                                        }`}
                                    >
                                        {isCurrentPlan 
                                            ? 'Current Plan'
                                            : loadingPriceId === plan.priceId 
                                            ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Redirecting...
                                                </>
                                            ) 
                                            : (currentUser ? plan.cta : "Sign In to Upgrade")
                                        }
                                    </button>
                                </motion.div>
                           )})}
                        </div>
                    </div>
                </section>
            </main>

            <SharedFooter onNavigate={onNavigate} activePage="sdk" />
        </div>
    );
};

export default SdkPage;
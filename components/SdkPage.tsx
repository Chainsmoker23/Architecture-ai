import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import SharedFooter from './SharedFooter';
import { useAuth } from '../contexts/AuthContext';
import { redirectToCheckout } from '../services/stripeService';

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
    .replace(/\b(fetch|method|headers|body|JSON|stringify|then|console|log|requests|post|get|json|print)\b/g, `<span class="token function">${'$&'}</span>`)
    .replace(/\b(const|let|var|new|import|from|async|await|def|return|True|False|None)\b/g, `<span class="token keyword">${'$&'}</span>`)
    .replace(/([{}\[\]():,;])/g, `<span class="token punctuation">${'$&'}</span>`);
  return { __html: highlighted };
};


const CodeShowcase: React.FC = () => {
    const [activeLang, setActiveLang] = useState('curl');
    const [isCopied, setIsCopied] = useState(false);
    
    const snippets = {
      curl: `curl 'https://api.cubegen.ai/v1/diagrams' \\
  -X POST \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "prompt": "A 3-tier web app on GCP..."
  }'`,
      node: `import { post } from 'axios';

async function generateDiagram() {
  const response = await post(
    'https://api.cubegen.ai/v1/diagrams',
    { prompt: 'A 3-tier web app on GCP...' },
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    }
  );
  console.log(response.data);
}`,
      python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
}

json_data = {
    'prompt': 'A 3-tier web app on GCP...',
}

response = requests.post(
    'https://api.cubegen.ai/v1/diagrams',
    headers=headers,
    json=json_data
)

print(response.json())`
    };

    const typedCode = useTypewriter(snippets[activeLang as keyof typeof snippets], true);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(snippets[activeLang as keyof typeof snippets]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#222] rounded-2xl shadow-2xl border border-pink-500/10 flex flex-col"
        >
            <div className="bg-[#2a2a2a] px-4 py-3 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-2">
                    {Object.keys(snippets).map(lang => (
                        <button key={lang} onClick={() => setActiveLang(lang)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeLang === lang ? 'bg-pink-500/20 text-pink-300' : 'text-gray-400 hover:bg-white/5'}`}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                    ))}
                </div>
                 <button onClick={handleCopy} className="text-sm font-medium text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                    {isCopied ? (
                        <>
                         <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                         Copied
                        </>
                    ) : (
                         <>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                         Copy
                         </>
                    )}
                </button>
            </div>
            <pre className="p-4 sm:p-6 text-sm text-gray-300 overflow-x-auto bg-gradient-to-b from-[#222] to-[#1e1e1e] min-h-[300px] rounded-b-2xl">
                <code dangerouslySetInnerHTML={highlightSyntax(typedCode)} />
            </pre>
        </motion.div>
    );
};


const SdkPage: React.FC<SdkPageProps> = ({ onBack, onNavigate }) => {
    const whyReasons = [
        { icon: IconType.Gear, title: "Automate Everything", description: "Integrate diagram generation directly into your CI/CD pipelines to keep documentation in sync with development." },
        { icon: IconType.FileCode, title: "Developer-First API", description: "A clean, predictable REST API with JSON responses. Get up and running in minutes, not days." },
        { icon: IconType.Sparkles, title: "Endless Possibilities", description: "Build internal developer portals, automate presentations, or create custom tools tailored to your workflow." }
    ];

    const { currentUser } = useAuth();
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState<string | null>(null); // Store priceId of redirecting plan
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This is a placeholder for a real subscription check.
        // For demonstration, we'll set a plan if the user is logged in.
        if (currentUser) {
            setCurrentPlan('Pro');
        } else {
            setCurrentPlan(null);
        }
    }, [currentUser]);

    const pricingPlans = [
        { 
            name: 'Free', 
            priceId: null,
            mode: null,
            price: '$0', 
            frequency: 'Forever', 
            description: 'For individuals getting started and exploring the platform.', 
            features: [
                '30 Diagram Generations', 
                'Access to all core features', 
                'Community Support'
            ], 
            isPopular: false, 
            ctaText: 'Start for Free'
        },
        { 
            name: 'Hobbyist', 
            priceId: 'price_1PLaF8RsL5ht22L1bA5g4e3f', // Replace with your actual Price ID
            mode: 'payment' as const,
            price: '$3', 
            frequency: 'One-time', 
            description: 'A top-up for when you need a few more diagrams.', 
            features: [
                '60 Diagram Generations', 
                'One-time payment',
                'No expiration on generations'
            ], 
            isPopular: false, 
            ctaText: 'Purchase'
        },
        { 
            name: 'Pro', 
            priceId: 'price_1PLaGBRsL5ht22L1cDEf6a7b', // Replace with your actual Price ID
            mode: 'subscription' as const,
            price: '$10', 
            frequency: '/ month', 
            description: 'For professionals who design and iterate frequently.', 
            features: [
                'Unlimited Generations', 
                'Bring Your Own API Key',
                'Priority Email Support', 
                'Access to all diagram types'
            ], 
            isPopular: true, 
            ctaText: 'Choose Pro'
        },
        { 
            name: 'Business', 
            priceId: 'price_1PLaGZRsL5ht22L1dEfg9h0i', // Replace with your actual Price ID
            mode: 'subscription' as const,
            price: '$50', 
            frequency: '/ month', 
            description: 'For teams that need automation and unlimited scale.', 
            features: [
                'Unlimited Generations', 
                'Full API Access (Key Provided)',
                'Option to Bring Your Own Key',
                'Priority Support',
                'Team Collaboration (soon)'
            ], 
            isPopular: false, 
            ctaText: 'Choose Business'
        },
        { 
            name: 'Enterprise', 
            priceId: null,
            mode: null,
            price: 'Custom', 
            frequency: '', 
            description: 'For large organizations with specific security and support needs.', 
            features: [
                'Everything in Business',
                'On-premise deployment option',
                'Dedicated Account Manager',
                'Custom Integrations'
            ], 
            isPopular: false, 
            ctaText: 'Contact Sales'
        },
    ];

  const handleCtaClick = async (plan: typeof pricingPlans[0]) => {
    setError(null);
    if (!currentUser) {
        onNavigate('auth');
        return;
    }
    if (plan.name === 'Enterprise') {
        onNavigate('contact');
        return;
    }
    if (plan.priceId && plan.mode) {
        setIsRedirecting(plan.priceId);
        try {
            await redirectToCheckout(plan.priceId, currentUser.email || '', plan.mode);
            // The user will be redirected to Stripe, so no need to reset loading state here.
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Could not redirect to checkout.');
            setIsRedirecting(null);
        }
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
        {/* Hero Section */}
        <section className="relative flex items-center justify-center overflow-hidden sdk-hero-bg py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-6 z-10 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Integrate with the <span className="animated-gradient-text text-transparent bg-clip-text">CubeGen API</span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                Programmatically generate, update, and manage architecture diagrams with our powerful and simple REST API. Automate your documentation and build custom tools.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why API Section */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {whyReasons.map((reason, index) => (
                        <motion.div key={reason.title} 
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-white to-[#FFF0F5] border-2 border-[#F9D7E3] shadow-lg mb-4">
                                <ArchitectureIcon type={reason.icon} className="w-8 h-8 text-[#D6336C]" />
                            </div>
                            <h3 className="text-xl font-bold mt-4 mb-2">{reason.title}</h3>
                            <p className="text-[#555555]">{reason.description}</p>
                        </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Code Showcase Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
             <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold mb-4">Simple to Integrate</h2>
                    <p className="text-lg text-[#555555] max-w-2xl mx-auto">
                       Get up and running in minutes with predictable, JSON-based responses that plug directly into your workflows.
                    </p>
                </motion.div>
                <CodeShowcase />
            </div>
          </div>
        </section>
        
        {/* Pricing & CTA Section */}
        <section className="py-24 sdk-hero-bg">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4">Flexible Plans for Every Team</h2>
                <p className="text-lg text-[#555555] max-w-2xl mx-auto mb-12">
                    Start for free and scale as you grow. Choose the plan that's right for you.
                </p>

                <div className="flex flex-wrap items-stretch justify-center gap-8">
                    {pricingPlans.map((plan, index) => {
                         const isCurrent = plan.name === currentPlan;
                         const isProcessing = isRedirecting === plan.priceId;
                         const cardClasses = `relative bg-white p-8 rounded-2xl shadow-lg border flex flex-col w-full max-w-sm transition-transform duration-300 ${
                            isCurrent 
                            ? 'border-blue-500 border-2 ring-4 ring-blue-500/20 md:scale-105' 
                            : plan.isPopular 
                            ? 'border-[#E91E63] border-2 md:scale-105' 
                            : 'border-[#F9D7E3]'
                        }`;

                        return (
                         <motion.div 
                            key={plan.name}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={cardClasses}
                        >
                            {isCurrent && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                                    Current Plan
                                </div>
                            )}
                            {!isCurrent && plan.isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E91E63] to-[#F06292] text-white text-xs font-bold px-4 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <p className="text-sm text-[#555555] mt-2 min-h-[40px]">{plan.description}</p>
                            <p className="text-5xl font-extrabold my-4">{plan.price} <span className="text-lg font-medium text-[#555555]">{plan.frequency}</span></p>
                            <ul className="text-[#555555] space-y-3 mb-8 text-left flex-grow">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                         <svg className="w-5 h-5 text-[#D6336C] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handleCtaClick(plan)}
                                disabled={isCurrent || !!isRedirecting}
                                className={`w-full font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 mt-auto flex items-center justify-center ${
                                    isCurrent
                                    ? 'bg-gray-200 text-gray-500 cursor-default'
                                    : isProcessing
                                    ? 'bg-gray-200 text-gray-500 cursor-wait'
                                    : plan.isPopular
                                    ? 'shimmer-button text-[#A61E4D] hover:shadow-xl hover:scale-105'
                                    : 'bg-[#F8F1F3] text-[#A61E4D] hover:shadow-xl hover:scale-105'
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Redirecting...
                                    </>
                                ) : isCurrent ? 'Your Current Plan' : plan.ctaText}
                            </button>
                        </motion.div>
                    )})}
                </div>
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                 <p className="text-xs text-gray-400 mt-8">For custom enterprise needs, please <button onClick={() => onNavigate('contact')} className="underline hover:text-[#D6336C]">contact sales</button>.</p>
            </div>
        </section>
      </main>

      <SharedFooter onNavigate={onNavigate} activePage="sdk" />
    </div>
  );
};

export default SdkPage;

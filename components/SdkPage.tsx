import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FOOTER_LINKS } from '../constants';

interface SdkPageProps {
  onBack: () => void;
}

const CodeBlock: React.FC = () => {
    const codeString = `fetch('https://api.archigen.ai/v1/diagrams', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A 3-tier web app on GCP...'
  })
})
.then(res => res.json())
.then(diagramData => {
  console.log(diagramData);
});`;
  
    return (
      <div className="bg-[#2B2B2B] rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#3a3a3a] px-4 py-2 flex items-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="ml-4 text-sm text-gray-300">bash</span>
        </div>
        <pre className="p-4 text-sm text-white overflow-x-auto"><code>{codeString}</code></pre>
      </div>
    );
};

const SdkPage: React.FC<SdkPageProps> = ({ onBack }) => {
    const [apiKey, setApiKey] = useState('');
    const [isKeyLoading, setIsKeyLoading] = useState(false);

    const handleGetKey = () => {
        setIsKeyLoading(true);
        setTimeout(() => {
            setApiKey(`ag-key-${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`);
            setIsKeyLoading(false);
        }, 1000);
    };

    const pricingPlans = [
        {
            name: 'Starter',
            price: '$0',
            frequency: '/ month',
            description: 'For individuals and small teams getting started.',
            features: [
                '10 Team Members',
                '1,000 API Calls / mo',
                'Community Support',
            ],
            isPopular: false,
            ctaText: 'Get Your API Key',
            isInteractive: true,
        },
        {
            name: 'Pro',
            price: '$3',
            frequency: '/ month',
            description: 'For growing teams that need more power.',
            features: [
                '50 Team Members',
                '10,000 API Calls / mo',
                'Email Support',
                'Advanced Diagram Types'
            ],
            isPopular: false,
            ctaText: 'Choose Pro',
        },
        {
            name: 'Business',
            price: '$20',
            frequency: '/ month',
            description: 'For businesses that require scale and priority support.',
            features: [
                'Unlimited Members',
                '100,000 API Calls / mo',
                'Priority Support',
                'Advanced Customization',
            ],
            isPopular: true,
            ctaText: 'Choose Business',
        },
        {
            name: 'Enterprise',
            price: '$2000',
            frequency: 'Lifetime',
            description: 'One-time payment for ultimate access and support.',
            features: [
                'Everything in Business',
                'Lifetime Access & Updates',
                'Dedicated Account Manager',
                'On-premise Option'
            ],
            isPopular: false,
            ctaText: 'Get Lifetime Access',
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
          <div className="container mx-auto px-6 z-10 text-center">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Integrate with the Archi<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#F06292]">Gen</span> API
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-[#555555]">
                Programmatically generate, update, and manage architecture diagrams with our powerful and simple REST API. Automate your documentation and build custom tools.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
             <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                    <h3 className="text-3xl font-bold mb-6">Simple to Integrate</h3>
                    <p className="text-[#555555] mb-4">
                       Our REST API is designed for developers. Get up and running in minutes with predictable, JSON-based responses that plug directly into your workflows.
                    </p>
                    <ul className="text-[#555555] space-y-2">
                        <li className="flex items-start"><span className="text-[#D6336C] mr-2">✓</span> Automate diagram creation in your CI/CD pipeline.</li>
                        <li className="flex items-start"><span className="text-[#D6336C] mr-2">✓</span> Build custom internal developer portals.</li>
                        <li className="flex items-start"><span className="text-[#D6336C] mr-2">✓</span> Keep your documentation always up-to-date.</li>
                    </ul>
                </div>
                <div>
                   <CodeBlock />
                </div>
            </div>
          </div>
        </section>
        
        {/* Pricing & CTA Section */}
        <section className="py-24 bg-gradient-to-b from-white to-[#FFF0F5]">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4">Flexible Plans for Every Team</h2>
                <p className="text-lg text-[#555555] max-w-2xl mx-auto mb-12">
                    Start for free and scale as you grow. Choose the plan that's right for you.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
                    {pricingPlans.map((plan, index) => (
                         <motion.div 
                            key={plan.name}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white p-8 rounded-2xl shadow-lg border ${plan.isPopular ? 'border-[#E91E63] border-2 transform scale-105' : 'border-[#F9D7E3]'} flex flex-col h-full`}
                        >
                            {plan.isPopular && (
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
                                         <svg className="w-5 h-5 text-[#D6336C] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {plan.isInteractive ? (
                                <AnimatePresence mode="wait">
                                {apiKey ? (
                                    <motion.div key="api-key-display" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-left p-3 bg-[#F8F1F3] rounded-lg border border-[#E8DCE0]">
                                        <p className="text-xs font-semibold text-[#555555] mb-1">Your sample API Key:</p>
                                        <p className="text-xs font-mono break-all text-[#A61E4D]">{apiKey}</p>
                                    </motion.div>
                                ) : (
                                    <motion.button 
                                        key="get-api-key-button"
                                        onClick={handleGetKey}
                                        disabled={isKeyLoading}
                                        className={`w-full font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center ${plan.isPopular ? 'shimmer-button text-[#A61E4D]' : 'bg-[#F8F1F3] text-[#A61E4D]'}`}
                                    >
                                        {isKeyLoading ? (
                                            <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Generating...
                                            </>
                                        ) : plan.ctaText}
                                    </motion.button>
                                )}
                                </AnimatePresence>
                            ) : (
                                <button className={`w-full font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${plan.isPopular ? 'shimmer-button text-[#A61E4D]' : 'bg-[#F8F1F3] text-[#A61E4D]'}`}>
                                    {plan.ctaText}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
                 <p className="text-xs text-gray-400 mt-8">For custom enterprise needs, please <a href="#" className="underline">contact sales</a>.</p>
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
                    if (link.name.toLowerCase() === 'sdk') {
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

export default SdkPage;
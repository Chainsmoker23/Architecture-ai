import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// --- TYPES ---
interface PlanFeature {
  name: string;
  icon: string; // "check"
  iconColor: string;
}

interface Plan {
  id: string;
  title: string;
  description: string;
  currency: string;
  monthlyPrice: string;
  buttonText: string;
  highlight: boolean;
  features: PlanFeature[];
}

interface PricingTableOneProps {
  title: string;
  description: string;
  onPlanSelect: (planId: string) => void;
  plans: Plan[];
  loadingPlan: string | null;
}

// --- SUB-COMPONENTS ---
const CheckIcon: React.FC<{className: string}> = ({className}) => (
    <svg className={`w-5 h-5 flex-shrink-0 ${className}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
    </svg>
);

// --- MAIN COMPONENT ---
const PricingTableOne: React.FC<PricingTableOneProps> = ({ title, description, onPlanSelect, plans, loadingPlan }) => {
    const { currentUser } = useAuth();
    const userPlan = currentUser?.user_metadata?.plan;

    return (
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4">{title}</h2>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto text-center mb-12">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start justify-center">
                {plans.map((plan) => {
                    const planId = plan.id === 'one_time' ? 'hobbyist' : (plan.id === 'subscription' ? 'pro' : 'free');
                    const isCurrentPlan = userPlan === planId;
                    
                    let buttonText = plan.buttonText;
                    if (isCurrentPlan) buttonText = "Current Plan";
                    if (!currentUser && plan.id !== 'free') buttonText = "Sign In to Purchase";

                    return (
                        <motion.div
                            key={plan.id}
                            className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full ${
                                isCurrentPlan
                                    ? 'bg-white border-2 border-[#D6336C] shadow-2xl scale-105'
                                    : plan.highlight
                                    ? 'bg-white shadow-2xl border-[#D6336C] md:-translate-y-4'
                                    : 'bg-white/70 shadow-lg border-pink-100'
                            }`}
                        >
                            {isCurrentPlan && (
                                <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-[#E91E63] to-[#F06292] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    Current Plan
                                </div>
                            )}
                            <h3 className="text-xl font-bold">{plan.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                            <p className="mt-4"><span className="text-4xl font-extrabold">{plan.currency}{plan.monthlyPrice}</span><span className="text-gray-500"> / {plan.id === 'one_time' ? 'one-time' : 'month'}</span></p>
                            
                            <div className="flex-grow mt-6">
                                <ul className="space-y-3 text-sm text-[#555555]">
                                    {plan.features.map(f => <li key={f.name} className="flex items-start gap-2"><CheckIcon className={f.iconColor}/><span>{f.name}</span></li>)}
                                </ul>
                            </div>
                            
                            <button
                                onClick={() => onPlanSelect(plan.id)}
                                disabled={loadingPlan === plan.id || isCurrentPlan || (plan.id === 'free' && !!currentUser)}
                                className={`mt-8 w-full font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed ${
                                    isCurrentPlan || (plan.id === 'free' && !!currentUser)
                                    ? 'bg-gray-200 text-gray-500 cursor-default' 
                                    : (plan.highlight ? 'shimmer-button text-[#A61E4D]' : 'bg-[#F9D7E3] text-[#A61E4D] hover:shadow-lg')
                                }`}
                            >
                                {loadingPlan === plan.id
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
                    )
                })}
            </div>
        </div>
    );
};

export default PricingTableOne;
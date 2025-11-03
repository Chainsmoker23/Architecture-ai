import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import FOOTER_LINKS to resolve undefined variable error.
import { ICONS, FOOTER_LINKS } from './constants';
import { IconType } from '../types';

interface AuthPageProps {
  onBack: () => void;
}

const ProviderButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string, disabled?: boolean }> = ({ onClick, icon, label, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 bg-[#F8F1F3] text-[#555] font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-[#F0DAE2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {icon}
        {label}
    </button>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.3,12.24c0,2.13-1.2,3.8-3.11,3.8c-1.89,0-2.83-1.48-4.14-1.48c-1.32,0-2.31,1.48-4.14,1.48 c-1.86,0-3.27-1.67-3.27-3.8c0-2.14,1.38-4.04,3.53-4.04c1.81,0,2.67,1.38,4.1,1.38c1.32,0,2.17-1.38,4-1.38 C17.93,8.2,19.3,10.06,19.3,12.24z M12,3.39c-1-0.03-2.3,0.59-3.09,1.5c-0.91,1.07-1.7,2.78-1.7,4.45c0,0.5,0.11,1,0.3,1.45 c1.58-0.86,3.32-1.34,5.19-1.34c0.16,0,0.32,0,0.48,0.02c0.03-0.45-0.08-0.9-0.29-1.32C12.3,7.22,12.01,6.3,12.01,5.32 C12.01,4.49,12.31,3.69,12,3.39z" />
  </svg>
);


const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
    const { signInWithGoogle, signInWithGitHub, signInWithApple } = useAuth();

    return (
        <div className="bg-white text-[#2B2B2B] min-h-screen">
            <header className="absolute top-0 left-0 w-full p-6 z-20">
                <button onClick={onBack} className="flex items-center gap-2 font-semibold text-[#555555] hover:text-[#2B2B2B] transition-colors pulse-subtle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to Home
                </button>
            </header>

            <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FFF0F5] py-12 px-4">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-sm"
                >
                    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#F9D7E3]">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#333]">
                                Join CubeGen AI
                            </h1>
                            <p className="text-[#555555] mt-2">
                                Continue with your favorite provider.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <ProviderButton
                                onClick={signInWithGoogle}
                                label="Continue with Google"
                                icon={ICONS[IconType.Google]}
                            />
                             <ProviderButton
                                onClick={signInWithGitHub}
                                label="Continue with GitHub"
                                icon={FOOTER_LINKS.socials.find(s => s.name === 'GitHub')?.icon({className: 'w-6 h-6'})}
                            />
                            <ProviderButton
                                onClick={signInWithApple}
                                label="Continue with Apple"
                                icon={<AppleIcon className="w-6 h-6" />}
                            />
                             <div title="LinkedIn sign-in requires a custom backend and is coming soon!">
                                <ProviderButton
                                    onClick={() => {}}
                                    label="Continue with LinkedIn"
                                    icon={FOOTER_LINKS.socials.find(s => s.name === 'LinkedIn')?.icon({className: 'w-6 h-6'})}
                                    disabled
                                />
                             </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400">
                                By continuing, you agree to our <a href="#" className="underline hover:text-[#D6336C]">Terms of Service</a> and <a href="#" className="underline hover:text-[#D6336C]">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AuthPage;
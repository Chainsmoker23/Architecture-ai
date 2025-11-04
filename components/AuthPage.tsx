import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.417 44 30.836 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);

interface AuthPageProps {
  onBack: () => void;
}

const ProviderButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string, disabled?: boolean }> = ({ onClick, icon, label, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-3 bg-white text-[#555] font-bold py-3 px-4 rounded-xl border border-pink-100 shadow-sm hover:bg-[#FFF0F5] hover:border-pink-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {icon}
        {label}
    </button>
);

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
    const { signInWithGoogle, signInWithGitHub, signUpWithEmail, signInWithEmail } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isSignUp) {
                if (!name.trim()) {
                    setError("Please enter your name.");
                    return;
                }
                await signUpWithEmail(email, password, name);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

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
                    <div className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-[#F9D7E3]">
                        <div className="text-center mb-6">
                            <Logo className="w-12 h-12 mx-auto text-[#D6336C]" />
                            <h1 className="text-3xl font-bold text-[#333] mt-4">
                                {isSignUp ? 'Create an Account' : 'Welcome Back'}
                            </h1>
                            <p className="text-[#555555] mt-2 text-sm">
                                {isSignUp ? 'Join to start designing your architecture.' : 'Sign in to continue to CubeGen AI.'}
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isSignUp ? 'signup' : 'signin'}
                                    variants={formVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4"
                                >
                                    {isSignUp && (
                                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition" />
                                    )}
                                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition" />
                                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition" />
                                </motion.div>
                            </AnimatePresence>
                            
                            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileTap={{ scale: 0.98 }}
                                className="mt-6 w-full shimmer-button text-[#A61E4D] font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                               {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                            </motion.button>
                        </form>

                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-grow h-px bg-pink-200"></div>
                            <span className="text-xs text-gray-400 font-medium">OR</span>
                            <div className="flex-grow h-px bg-pink-200"></div>
                        </div>

                        <div className="space-y-3">
                            <ProviderButton onClick={signInWithGoogle} label="Continue with Google" icon={<GoogleIcon className="w-5 h-5" />} />
                            <ProviderButton onClick={signInWithGitHub} label="Continue with GitHub" icon={<GitHubIcon className="w-5 h-5" />} />
                        </div>
                        
                        <div className="mt-6 text-center">
                            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-sm text-[#555] hover:text-[#D6336C] font-medium transition-colors">
                                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AuthPage;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FOOTER_LINKS } from '../constants';

interface AuthPageProps {
  onBack: () => void;
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = () => {
    setIsLoading(true);
    // Simulate API call for login/register
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };
  
  const SocialButton: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
    <button 
      onClick={handleAuthAction}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#E8DCE0] rounded-xl bg-white hover:bg-[#F8F1F3] transition-colors duration-200"
    >
      {icon}
      <span className="font-semibold text-[#333]">{label}</span>
    </button>
  );

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
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-[#F9D7E3]">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#333]">
                    {isLoginView ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <p className="text-[#555555] mt-2">
                    {isLoginView ? 'Sign in to continue to ArchiGen AI.' : 'Get started in seconds.'}
                </p>
            </div>

            <div className="space-y-4">
                <SocialButton icon={FOOTER_LINKS.socials[2].icon({ className: 'h-6 w-6' })} label="Continue with Google" />
                <SocialButton icon={FOOTER_LINKS.socials[0].icon({ className: 'h-6 w-6' })} label="Continue with GitHub" />
                <SocialButton icon={FOOTER_LINKS.socials[1].icon({ className: 'h-6 w-6' })} label="Continue with LinkedIn" />
            </div>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-[#E8DCE0]"></div>
                <span className="mx-4 text-xs font-medium text-gray-400">OR</span>
                <div className="flex-grow border-t border-[#E8DCE0]"></div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#555555] mb-1">Email Address</label>
                    <input type="email" name="email" id="email" required className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292]" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#555555] mb-1">Password</label>
                    <input type="password" name="password" id="password" required className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292]" />
                </div>
                {!isLoginView && (
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-[#555555] mb-1">Confirm Password</label>
                        <input type="password" name="confirm-password" id="confirm-password" required className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292]" />
                    </div>
                )}
                 <button type="submit" disabled={isLoading} className="w-full shimmer-button text-[#A61E4D] font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Processing...
                        </>
                      ) : 'Continue with Email'}
                </button>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-[#555555]">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLoginView(!isLoginView)} className="font-semibold text-[#D6336C] hover:underline">
                        {isLoginView ? "Sign Up" : "Sign In"}
                    </button>
                </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthPage;
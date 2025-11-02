import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SignIn } from '@stackframe/react';

interface AuthPageProps {
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // This will get the correct origin URL, whether it's localhost or an AI Studio URL.
    setOrigin(window.location.origin);
  }, []);

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
                    Sign in or create an account
                </h1>
                <p className="text-[#555555] mt-2">
                    to continue to ArchiGen AI
                </p>
            </div>
            {/* FIX: Removed invalid 'appearance' prop from SignIn component. Styling is now handled globally in index.tsx. */}
            <SignIn />
            
            {origin && (
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <p className="font-bold mb-2">Configuration Help</p>
                <p>For authentication to work correctly, add this exact URL to your Stack Auth project's "Allowed Origins" list:</p>
                <code className="block bg-amber-100 p-2 rounded-md mt-2 font-mono text-xs break-all">{origin}</code>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthPage;

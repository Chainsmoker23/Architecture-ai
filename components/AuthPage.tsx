import React from 'react';
import { motion } from 'framer-motion';

interface AuthPageProps {
  onBack: () => void;
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLogin }) => {

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
                    Welcome to CubeGen AI
                </h1>
                <p className="text-[#555555] mt-2">
                    Sign in or create an account to continue
                </p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            required
                            className="w-full p-3 mt-1 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] focus:border-[#F06292]"
                            defaultValue="architect@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            autoComplete="current-password"
                            required
                             className="w-full p-3 mt-1 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] focus:border-[#F06292]"
                            defaultValue="password"
                        />
                    </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onLogin}
                        className="w-full bg-[#F8F1F3] text-[#A61E4D] font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-[#F0DAE2] transition-colors"
                    >
                        Sign Up
                    </button>
                    <button
                        type="submit"
                        className="w-full shimmer-button text-[#A61E4D] font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AuthPage;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import Logo from './Logo';

interface AdminLoginPageProps {
  onBack: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBack }) => {
    const { login } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
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
                                Admin Sign In
                            </h1>
                            <p className="text-[#555555] mt-2 text-sm">
                                Enter your administrator credentials.
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition" 
                            />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                className="w-full p-3 bg-[#F8F1F3] border border-[#E8DCE0] rounded-xl focus:ring-2 focus:ring-[#F06292] outline-none transition" 
                            />
                            
                            {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileTap={{ scale: 0.98 }}
                                className="!mt-6 w-full shimmer-button text-[#A61E4D] font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                               {isLoading ? 'Authenticating...' : 'Sign In'}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AdminLoginPage;
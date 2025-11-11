import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminConfig, updateAdminConfig } from '../services/geminiService';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import Logo from './Logo';
import Loader from './Loader';

type Page = 'app';
interface AdminPageProps {
    onNavigate: (page: Page) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
    const { adminToken, logout } = useAdminAuth();
    const [config, setConfig] = useState({
        gemini_api_key: '',
        dodo_secret_key: '',
        dodo_webhook_secret: '',
        site_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            if (!adminToken) {
                setError("Authentication token is missing.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const fetchedConfig = await getAdminConfig(adminToken);
                setConfig(prev => ({ ...prev, ...fetchedConfig }));
            } catch (err: any) {
                setError(err.message || 'Failed to fetch the application configuration.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, [adminToken]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!adminToken) {
            setError("Authentication token is missing. Cannot save.");
            return;
        }
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await updateAdminConfig(config, adminToken);
            setSuccess('Configuration updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to update the configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-[#D6336C]" />
                        <h1 className="text-xl font-bold">CubeGen AI - Admin Panel</h1>
                    </div>
                     <div className="flex items-center gap-4">
                        <button onClick={() => onNavigate('app')} className="font-semibold text-sm text-pink-600 hover:text-pink-800">
                            &larr; Back to App
                        </button>
                        <button onClick={logout} className="font-semibold text-sm text-gray-500 hover:text-gray-800">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-4xl mx-auto"
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-2">Application Configuration</h2>
                            <p className="text-gray-500 mb-6">Manage live configuration variables for the application. Changes made here take effect immediately.</p>
                            
                            {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                            {success && <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>}

                            <div className="space-y-6">
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                                    <h4 className="font-bold">Important Note</h4>
                                    <p className="text-sm">Core credentials like Supabase keys cannot be changed here for security reasons. They must be configured in the <code className="bg-yellow-100 px-1 py-0.5 rounded">.env</code> file and require a server restart to apply.</p>
                                </div>
                                
                                <InputField name="gemini_api_key" label="Shared Gemini API Key" value={config.gemini_api_key || ''} onChange={handleInputChange} />
                                <InputField name="dodo_secret_key" label="Dodo Payments Secret Key" value={config.dodo_secret_key || ''} onChange={handleInputChange} />
                                <InputField name="dodo_webhook_secret" label="Dodo Payments Webhook Secret" value={config.dodo_webhook_secret || ''} onChange={handleInputChange} />
                                <InputField name="site_url" label="Site URL" value={config.site_url || ''} onChange={handleInputChange} isText={true} />
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-pink-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
                                >
                                    {isSaving && <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    {isSaving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

const InputField: React.FC<{name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, isText?: boolean}> = ({ name, label, value, onChange, isText = false }) => {
    const [isVisible, setIsVisible] = useState(isText);
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-600">{label}</label>
            <div className="mt-1 relative">
                <input
                    id={name}
                    name={name}
                    type={isVisible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    className="w-full p-3 pr-10 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition font-mono"
                />
                {!isText && (
                     <button
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={isVisible ? "Hide key" : "Show key"}
                    >
                        {isVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 6.957 15.425 5 12 5c-.913 0-1.794.19-2.62.533L7.743 3.812A9.957 9.957 0 0112 3c4.257 0 7.927 3.013 9.428 7.025a1 1 0 010 .95C20.302 15.488 16.892 18 12 18c-1.353 0-2.656-.32-3.84-.897L6.23 18.81A1 1 0 014.816 17.396l-1.109-1.11z M12 15c2.206 0 4-1.794 4-4a4.008 4.008 0 00-1.19-2.828l-5.63 5.63A3.987 3.987 0 0012 15z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.73 6.957 4.575 5 8 5s6.27 1.957 7.542 5c-1.272 3.043-4.117 5-7.542 5S1.73 13.043.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default AdminPage;
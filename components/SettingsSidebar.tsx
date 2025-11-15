import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTheme } from '../contexts/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import UserPlansPanel from './UserPlansPanel';
import BillingPanel from './BillingPanel'; // Import the new component
import { FREE_GENERATION_LIMIT } from './constants';


type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'api' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research' | 'sdk';


interface SettingsSidebarProps {
  userApiKey: string | null;
  setUserApiKey: (key: string | null) => void;
  onNavigate: (page: Page | 'admin') => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ userApiKey, setUserApiKey, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentUser, signOut, refreshUser } = useAuth();
 
  const [isEditing, setIsEditing] = useState(!userApiKey);
  const [editingKey, setEditingKey] = useState(userApiKey || '');
  const [showSaved, setShowSaved] = useState(false);
  const [activeModeler, setActiveModeler] = useState('app');

  useEffect(() => {
    const updateActiveModeler = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'neuralNetwork' || hash === 'apiKey') {
        setActiveModeler(hash.split('/')[0]);
      } else {
        setActiveModeler('app');
      }
    };
    updateActiveModeler();
    window.addEventListener('hashchange', updateActiveModeler);
    return () => window.removeEventListener('hashchange', updateActiveModeler);
  }, []);

  const plan = currentUser?.user_metadata?.plan || 'free';
  const isPremiumUser = ['pro'].includes(plan);
  
  // NEW: Generation balance logic
  const generationBalance = currentUser?.user_metadata?.generation_balance;
  let usageDisplay;
  if (plan === 'pro') {
      usageDisplay = <p className="text-sm font-semibold text-green-600">Unlimited Generations</p>;
  } else if (plan === 'hobbyist') {
      usageDisplay = <p className="text-sm font-semibold">{generationBalance ?? 0} <span className="text-[var(--color-text-secondary)] font-normal">credits remaining</span></p>;
  } else { // free
      const balance = generationBalance ?? FREE_GENERATION_LIMIT;
      const usagePercentage = Math.max(0, (balance / FREE_GENERATION_LIMIT) * 100);
      usageDisplay = (
          <>
              <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-[var(--color-text-secondary)]">Generations Remaining</p>
                  <p className="text-sm font-semibold">{balance} / {FREE_GENERATION_LIMIT}</p>
              </div>
              <div className="w-full bg-[var(--color-bg)] rounded-full h-2.5 border border-[var(--color-border)] overflow-hidden">
                  <div className="bg-gradient-to-r from-[var(--color-accent)] to-pink-400 h-2 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
              </div>
          </>
      );
  }
 
  useEffect(() => {
    setIsEditing(!userApiKey);
    setEditingKey(userApiKey || '');
  }, [userApiKey]);

  const sidebarVariants: Variants = {
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
    open: { x: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } },
  };
 
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'slate', label: 'Slate' },
    { value: 'midnight', label: 'Midnight' },
  ] as const;

  const handleKeySave = () => {
    const trimmedKey = editingKey.trim();
    setUserApiKey(trimmedKey ? trimmedKey : null);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    if (trimmedKey) {
        setIsEditing(false);
    }
  };

  const handleClearKey = () => {
      setUserApiKey(null);
  };
 
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingKey(userApiKey || '');
  };

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const modelerButtonClasses = (modeler: string) => {
    const base = "w-full flex items-center justify-start gap-3 p-3 rounded-xl transition-colors text-left";
    if (activeModeler === modeler) {
      return `${base} bg-[var(--color-accent-soft)] border border-[var(--color-accent)] cursor-default`;
    }
    return `${base} bg-[var(--color-bg-input)] border border-[var(--color-border)] hover:bg-[var(--color-button-bg)]`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-40 p-2 rounded-full bg-[var(--color-panel-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-sm hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Open settings"
        title="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 left-0 bottom-0 w-80 border-r border-[var(--color-border)] shadow-xl z-50 overflow-hidden"
            >
              <div className="aurora-layer"></div>
              
              <div className="glass-layer-content relative z-10 flex flex-col h-full p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-[var(--color-button-bg-hover)] transition-colors"
                    aria-label="Close settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {currentUser && (
                  <div className="mb-4">
                      <div className={`relative p-3 rounded-xl flex items-center gap-3 border transition-all ${isPremiumUser ? 'premium-glow' : 'bg-[var(--color-bg-input)] border-[var(--color-border)]'}`}>
                          {isPremiumUser && (
                              <div className="absolute top-1.5 right-1.5 text-yellow-400" title="Pro Member">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                              </div>
                          )}
                           {plan && plan === 'hobbyist' && (
                              <div className="absolute top-0 right-3 -translate-y-1/2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                  Hobbyist
                              </div>
                          )}
                          <div className="flex-shrink-0">
                              <img src={currentUser.user_metadata?.custom_avatar_url || currentUser.user_metadata?.avatar_url || undefined} alt="User avatar" className="w-12 h-12 rounded-full object-cover" />
                            
                          </div>
                          <div>
                              <p className="font-semibold text-sm">{currentUser.user_metadata?.full_name || currentUser.email}</p>
                              <p className="text-xs text-[var(--color-text-secondary)]">{currentUser.email}</p>
                          </div>
                      </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col space-y-6">
                  <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Theme</h3>
                      <div className="flex items-center space-x-2 bg-[var(--color-bg-input)] p-1 rounded-xl border border-[var(--color-border)]">
                          {themeOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => setTheme(option.value)}
                              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                theme === option.value ? 'bg-[var(--color-panel-bg)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-button-bg)]'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                      </div>
                  </div>

                  <div className="w-full h-px bg-[var(--color-border)] opacity-50" />
                  
                  {currentUser && (
                    <>
                      <UserPlansPanel 
                          plan={plan}
                          refreshUser={refreshUser}
                          isOpen={isOpen}
                      />
                      <BillingPanel
                          isPremiumUser={isPremiumUser}
                          refreshUser={refreshUser}
                          isOpen={isOpen}
                      />
                    </>
                  )}
                  
                  <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Usage</h3>
                      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)]">
                          {usageDisplay}
                          {plan !== 'pro' && (
                             <button 
                                  onClick={() => { onNavigate('api'); setIsOpen(false); }}
                                  className="w-full mt-4 bg-[var(--color-accent)] text-[var(--color-accent-text-strong)] text-sm font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity"
                             >
                                  {plan === 'free' ? 'Upgrade Plan' : 'Add More Credits'}
                             </button>
                          )}
                      </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Modelers</h3>
                     <div className="space-y-2">
                        <button
                          onClick={() => { onNavigate('app'); setIsOpen(false); }}
                          className={modelerButtonClasses('app')}
                        >
                          <ArchitectureIcon type={IconType.Cloud} className={`w-6 h-6 flex-shrink-0 ${activeModeler === 'app' ? 'text-[var(--color-accent-text)]' : 'text-[var(--color-text-secondary)]'}`} />
                          <span className={`font-semibold text-sm ${activeModeler === 'app' ? 'text-[var(--color-text-primary)]' : ''}`}>General Architecture</span>
                        </button>
                        <button
                          onClick={() => { onNavigate('neuralNetwork'); setIsOpen(false); }}
                           className={modelerButtonClasses('neuralNetwork')}
                        >
                          <ArchitectureIcon type={IconType.Brain} className={`w-6 h-6 flex-shrink-0 ${activeModeler === 'neuralNetwork' ? 'text-[var(--color-accent-text)]' : 'text-[var(--color-text-secondary)]'}`} />
                           <span className={`font-semibold text-sm ${activeModeler === 'neuralNetwork' ? 'text-[var(--color-text-primary)]' : ''}`}>Neural Network Modeler</span>
                        </button>
                    </div>
                  </div>

                  {isPremiumUser && (
                    <>
                    <div className="w-full h-px bg-[var(--color-border)] opacity-50" />
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">In-App Personal Key</h3>
                        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)]">
                          <AnimatePresence mode="wait">
                            {userApiKey && !isEditing ? (
                              <motion.div
                                key="view"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                              >
                                <p className="text-sm text-[var(--color-text-secondary)]">Your personal key is active.</p>
                                <div className="bg-[var(--color-bg)] p-3 rounded-lg my-2 border border-[var(--color-border)]">
                                    <p className="font-mono text-sm text-[var(--color-text-primary)]" aria-label={`API key ending in ${userApiKey.slice(-4)}`}>
                                        ••••••••••••••••••••{userApiKey.slice(-4)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <button onClick={() => setIsEditing(true)} className="flex-1 bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] text-sm font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors">Change</button>
                                    <button onClick={handleClearKey} className="text-[var(--color-text-secondary)] text-sm font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors">Remove</button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="edit"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                              >
                                <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                  {userApiKey ? 'Update your key or clear to use the shared key.' : 'Add your own Google Gemini key to bypass usage limits within this app.'}
                                </p>
                                <div>
                                  <input
                                        id="api-key-input"
                                        type="password"
                                        value={editingKey}
                                        onChange={(e) => setEditingKey(e.target.value)}
                                        placeholder="Paste your API key here"
                                        className="w-full mt-1 p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                                  />
                                  <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-accent-text)] hover:underline mt-1 inline-block">
                                        Get a key from Google AI Studio
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <button onClick={handleKeySave} className="flex-1 bg-[var(--color-accent)] text-[var(--color-accent-text-strong)] text-sm font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-opacity relative">
                                        {showSaved ? 'Saved!' : (userApiKey ? 'Update Key' : 'Save Key')}
                                    </button>
                                    {userApiKey && isEditing && (
                                        <button onClick={handleCancelEdit} className="bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] text-sm font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    </div>
                    </>
                  )}
                </div>
                
                <div className="mt-auto pt-6">
                  <div className="border-t border-[var(--color-border)] pt-4">
                    {currentUser && (
                      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-500 py-2.5 px-3 rounded-lg hover:bg-red-500/10 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                          Sign Out
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsSidebar;
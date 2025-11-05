import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTheme } from '../contexts/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import ArchitectureIcon from './ArchitectureIcon';
import { IconType } from '../types';
import { AVATARS, svgToDataURL } from './constants';
import { supabase } from '../supabaseClient';

interface SettingsSidebarProps {
  userApiKey: string | null;
  setUserApiKey: (key: string | null) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ userApiKey, setUserApiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentUser, signOut } = useAuth();
  
  // State for managing the API key form
  const [isEditing, setIsEditing] = useState(!userApiKey);
  const [editingKey, setEditingKey] = useState(userApiKey || '');
  const [showSaved, setShowSaved] = useState(false);
  
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);

  // MOCK: Assume logged-in user is on a Pro plan for demonstration
  const userPlan = currentUser ? 'Pro' : null; 
  const isPremiumUser = userPlan && ['Hobbyist', 'Pro', 'Business'].includes(userPlan);


  useEffect(() => {
    // Sync local state if the userApiKey prop changes from outside
    setIsEditing(!userApiKey);
    setEditingKey(userApiKey || '');
  }, [userApiKey]);

  const sidebarVariants: Variants = {
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
    open: { x: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } },
  };
  
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'dark', label: 'Dark' },
  ] as const;

  const handleKeySave = () => {
    const trimmedKey = editingKey.trim();
    setUserApiKey(trimmedKey ? trimmedKey : null);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    if (trimmedKey) {
        setIsEditing(false); // Switch to view mode on successful save
    }
  };

  const handleClearKey = () => {
      setUserApiKey(null);
      // The useEffect will handle setting isEditing and editingKey
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingKey(userApiKey || ''); // Reset any changes
  };

  const handleAvatarUpdate = async (avatarSvg: string) => {
    setIsAvatarUpdating(true);
    const avatarUrl = svgToDataURL(avatarSvg);
    const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
    });
    if (error) {
        console.error("Failed to update avatar:", error);
    }
    setIsAvatarSelectorOpen(false);
    setIsAvatarUpdating(false);
  };
  
  const formVariants: Variants = {
    hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors"
        aria-label="Open settings"
        title="Settings"
      >
        <ArchitectureIcon type={IconType.Gear} className="w-5 h-5" />
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
              className="fixed top-0 left-0 bottom-0 w-80 glass-panel shadow-xl z-50 p-6 flex flex-col"
            >
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
                    <div className={`relative p-3 bg-[var(--color-bg-input)] rounded-xl flex items-center gap-3 border transition-all ${isPremiumUser ? 'border-[var(--color-accent)] shadow-md shadow-[var(--color-accent-soft)]' : 'border-[var(--color-border)]'}`}>
                        {isPremiumUser && (
                            <div className="absolute top-0 right-3 -translate-y-1/2 bg-gradient-to-r from-[#E91E63] to-[#F06292] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                {userPlan} Member
                            </div>
                        )}
                        <div className="relative group flex-shrink-0">
                            <img src={currentUser.user_metadata?.avatar_url || undefined} alt="User avatar" className="w-12 h-12 rounded-full object-cover" />
                            <button 
                              onClick={() => setIsAvatarSelectorOpen(prev => !prev)}
                              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ArchitectureIcon type={IconType.Edit} className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div>
                            <p className="font-semibold text-sm">{currentUser.user_metadata?.full_name || currentUser.email}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{currentUser.email}</p>
                        </div>
                    </div>
                    
                    <AnimatePresence>
                    {isAvatarSelectorOpen && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 bg-[var(--color-bg-input)] p-3 rounded-xl border border-[var(--color-border)] overflow-hidden"
                        >
                            <p className="text-xs font-semibold text-center text-[var(--color-text-secondary)] mb-2">Choose your Avatar</p>
                            <div className="grid grid-cols-4 gap-2">
                                {AVATARS.map(avatar => (
                                    <button 
                                      key={avatar.name} 
                                      onClick={() => handleAvatarUpdate(avatar.svg)}
                                      disabled={isAvatarUpdating}
                                      className="aspect-square rounded-full bg-[var(--color-bg)] hover:bg-[var(--color-button-bg)] border border-transparent hover:border-[var(--color-accent)] p-1 transition-all"
                                      title={avatar.name}
                                    >
                                        <img src={svgToDataURL(avatar.svg)} alt={avatar.name} className="w-full h-full object-cover rounded-full" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
              )}


              <div className="flex-1 flex flex-col space-y-8">
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

                 <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">API Key</h3>
                    <div className="bg-[var(--color-bg-input)] p-4 rounded-xl border border-[var(--color-border)]">
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
                               {userApiKey ? 'Update your key or clear to use the shared key.' : 'Add your own key to bypass usage limits.'}
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
              </div>
              <div className="mt-auto">
                {currentUser ? (
                    <button onClick={signOut} className="w-full flex items-center justify-center gap-2 bg-[var(--color-button-bg)] text-sm font-semibold text-[var(--color-text-secondary)] py-2.5 px-3 rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        Sign Out
                    </button>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsSidebar;
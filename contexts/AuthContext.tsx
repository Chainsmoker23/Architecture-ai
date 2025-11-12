import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { AVATARS } from '../components/content/avatarContent';
import { svgToDataURL } from '../utils/dataUrls';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    pollForPlanUpdate: (expectedPlan: string) => Promise<boolean>;
    refreshUser: () => Promise<void>;
    updateCurrentUserMetadata: (newMetadata: object) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRandomAvatarUrl = () => {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    return svgToDataURL(randomAvatar.svg);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // This robust, sequential flow fixes the avatar race condition.
    const syncUserSession = async (session: Session | null) => {
        const user = session?.user;

        if (user && !user.user_metadata?.custom_avatar_url) {
            // This is a new user or a user without our custom avatar.
            // We must assign an avatar and wait for the update to complete
            // before setting the user in the state to prevent showing the social media picture.
            const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
                data: {
                    // Save to a separate field to avoid being overwritten by social provider.
                    custom_avatar_url: getRandomAvatarUrl(),
                }
            });

            if (updateError) {
                console.error("Error setting custom avatar:", updateError);
                setCurrentUser(user); // Fallback to original user on error
            } else {
                // Use the fully updated user object returned from the API.
                // This is the guaranteed source of truth.
                setCurrentUser(updatedUser);
            }
        } else {
            // User is either null or already has a custom avatar.
            setCurrentUser(user ?? null);
        }
        setLoading(false);
    };

    useEffect(() => {
        // On initial load, get the session and synchronize the user.
        supabase.auth.getSession().then(({ data: { session } }) => {
            syncUserSession(session);
        });
        
        // Then, listen for any subsequent auth events.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'USER_UPDATED') {
                setCurrentUser(session?.user ?? null);
            } 
            else if (event === 'SIGNED_IN') {
                await syncUserSession(session);
            } 
            else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const pollForPlanUpdate = async (expectedPlan: string): Promise<boolean> => {
        const MAX_RETRIES = 6;
        const RETRY_DELAY = 1000; // 1 second
        console.log(`[Auth] Starting poll for plan update to '${expectedPlan}'...`);
    
        for (let i = 0; i < MAX_RETRIES; i++) {
            console.log(`[Auth] Polling attempt ${i + 1}/${MAX_RETRIES}...`);
            
            const { data, error } = await supabase.auth.refreshSession();
    
            if (error) {
                console.error("[Auth] Error refreshing session during poll:", error);
                break;
            }
    
            const user = data.user;
            const currentPlan = user?.user_metadata?.plan || 'free';
    
            if (user && currentPlan === expectedPlan) {
                console.log(`[Auth] Success! Plan updated to '${expectedPlan}'.`);
                setCurrentUser(user);
                return true; // Return success
            } else {
                 console.log(`[Auth] Plan is still '${currentPlan}'. Waiting ${RETRY_DELAY}ms...`);
            }
    
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    
        console.warn(`[Auth] User plan did not update to '${expectedPlan}' after ${MAX_RETRIES} retries.`);
        await supabase.auth.refreshSession();
        return false; // Return failure
    };

    const refreshUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error refreshing user data:", error.message);
        } else {
            setCurrentUser(user);
        }
    };
    
    const updateCurrentUserMetadata = (newMetadata: object) => {
        setCurrentUser(prevUser => {
            if (!prevUser) {
                return null;
            }
            return {
                ...prevUser,
                user_metadata: {
                    ...prevUser.user_metadata,
                    ...newMetadata
                }
            };
        });
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
    };

    const signInWithGitHub = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
        if (error) throw error;
    };
    
    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                },
            },
        });
        if (error) throw error;
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signOut = () => {
        supabase.auth.signOut().catch(error => {
            console.error("Error signing out from Supabase:", error.message);
        });
    };

    const value = {
        currentUser,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        pollForPlanUpdate,
        refreshUser,
        updateCurrentUserMetadata,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
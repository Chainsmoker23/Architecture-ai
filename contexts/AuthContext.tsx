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
    pollForPlanUpdate: (expectedPlan: string) => Promise<void>;
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

    const pollForPlanUpdate = async (expectedPlan: string) => {
        const MAX_RETRIES = 6;
        const RETRY_DELAY = 1000; // 1 second
    
        for (let i = 0; i < MAX_RETRIES; i++) {
            const { data: { user }, error } = await supabase.auth.getUser();
    
            if (error) {
                console.error("Error fetching user during poll:", error);
                break; 
            }
    
            if (user && user.user_metadata?.plan === expectedPlan) {
                console.log(`Plan updated to ${expectedPlan}!`);
                setCurrentUser(user);
                return;
            }
    
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    
        console.warn(`User plan did not update to ${expectedPlan} after ${MAX_RETRIES} retries. Falling back to refreshSession.`);
        supabase.auth.refreshSession();
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
        if (currentUser) {
            const updatedUser = {
                ...currentUser,
                user_metadata: {
                    ...currentUser.user_metadata,
                    ...newMetadata
                }
            };
            setCurrentUser(updatedUser);
        }
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
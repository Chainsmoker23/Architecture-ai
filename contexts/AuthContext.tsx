import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { AVATARS, svgToDataURL } from '../components/constants';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => void;
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

        if (user && !user.user_metadata?.has_custom_avatar) {
            // This is a new user. We must assign an avatar and wait for the update to complete
            // before setting the user in the state to prevent showing the social media picture.
            const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
                data: {
                    avatar_url: getRandomAvatarUrl(),
                    has_custom_avatar: true,
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
            // A user's plan is updated via a webhook, and the frontend calls refreshSession(),
            // which triggers this event. We sync the session to get the new plan details.
            if (event === 'USER_UPDATED') {
                setCurrentUser(session?.user ?? null);
            } 
            // This handles logins. We run the full sync process.
            else if (event === 'SIGNED_IN') {
                await syncUserSession(session);
            } 
            // This handles logouts.
            else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);
    
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
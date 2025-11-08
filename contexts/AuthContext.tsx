import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
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

    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Get the initial session from Supabase. This might fail if the
                // service is down or if the credentials in .env are incorrect.
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    throw error;
                }
                setCurrentUser(session?.user ?? null);
            } catch (error) {
                // If getting the session fails, log the error and ensure the user is logged out.
                console.error("AuthContext: Error fetching initial session:", error);
                setCurrentUser(null);
            } finally {
                // CRITICAL: Always set loading to false, so the app doesn't get stuck
                // on the loader even if the auth service is unreachable.
                setLoading(false);
            }
        };

        initializeSession();

        // Set up a listener for any future authentication changes.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user ?? null);

            // On first sign-in, assign a random avatar if one isn't set.
            if (_event === 'SIGNED_IN' && session?.user && !session.user.user_metadata.has_custom_avatar) {
                supabase.auth.updateUser({
                    data: {
                        avatar_url: getRandomAvatarUrl(),
                        has_custom_avatar: true,
                    }
                }).catch(e => {
                    console.error("Error setting default avatar:", e);
                });
            }
        });

        // Cleanup the subscription when the component unmounts.
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
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                    avatar_url: getRandomAvatarUrl(),
                    has_custom_avatar: true, 
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

    // Render children immediately. The App component itself will handle the loading state.
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
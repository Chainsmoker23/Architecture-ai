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
    signOut: () => void; // Changed to be synchronous for immediate UI update
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
        setLoading(true);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const user = session?.user ?? null;
            setCurrentUser(user);
            setLoading(false);

            // On first sign-in, assign a random avatar if one isn't set.
            if (_event === 'SIGNED_IN' && user && !user.user_metadata.has_custom_avatar) {
                try {
                    // This update will trigger onAuthStateChange again, which is expected.
                    await supabase.auth.updateUser({
                        data: {
                            avatar_url: getRandomAvatarUrl(),
                            has_custom_avatar: true,
                        }
                    });
                } catch (e) {
                    console.error("Error setting default avatar:", e);
                }
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
        // Optimistically update the UI to be instant.
        setCurrentUser(null);
        // The onAuthStateChange listener will eventually receive the SIGNED_OUT event,
        // but we don't wait for it.
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
            {!loading && children}
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
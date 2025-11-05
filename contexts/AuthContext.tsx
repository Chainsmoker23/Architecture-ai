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
    signOut: () => Promise<void>;
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
        
        const authTimeout = setTimeout(() => {
            console.warn("Supabase auth timed out. Assuming no user is logged in. Please check your Supabase configuration.");
            setLoading(false);
        }, 5000);

        const setUserFromSession = (user: User | null) => {
            clearTimeout(authTimeout);
            setCurrentUser(user);
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserFromSession(session?.user ?? null);
        }).catch(err => {
            console.error("Error getting initial Supabase session:", err);
            setUserFromSession(null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                let user = session?.user ?? null;
                if (_event === 'SIGNED_IN' && user && !user.user_metadata.has_custom_avatar) {
                     const { data: updatedUserData } = await supabase.auth.updateUser({
                        data: {
                            avatar_url: getRandomAvatarUrl(),
                            has_custom_avatar: true,
                        }
                    });
                    user = updatedUserData?.user ?? user;
                }
                setUserFromSession(user);
            } catch (e) {
                console.error("Error in onAuthStateChange:", e);
                setUserFromSession(session?.user ?? null);
            }
        });

        return () => {
            clearTimeout(authTimeout);
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

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            // Log the error but don't throw, as we still want to clear the local state.
            console.error("Error signing out:", error.message);
        }
        // Manually clear the user from the state. This provides immediate feedback
        // to the user and ensures logout happens even if onAuthStateChange is delayed.
        setCurrentUser(null);
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

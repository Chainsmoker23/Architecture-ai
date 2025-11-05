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
            console.warn("Supabase auth timed out. Assuming no user is logged in. Please check your Supabase configuration in your .env file.");
            setLoading(false);
        }, 5000); // 5-second timeout

        const fetchUserWithProfile = async (user: User | null) => {
            clearTimeout(authTimeout);
            if (!user) {
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            try {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Gracefully handle if a profile doesn't exist yet (e.g., new OAuth user, or RLS issue)
                // 'PGRST116' is the code for "exact one row not found" from .single()
                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching user profile:", error.message);
                    setCurrentUser(user); // Fallback to user without profile
                    return;
                }

                // Merge profile data into user_metadata for easy access in components
                const enhancedUser = {
                    ...user,
                    user_metadata: {
                        ...user.user_metadata,
                        ...(profile || {}), // Merge profile, or empty object if profile is null
                    },
                };
                setCurrentUser(enhancedUser);
            } catch (e) {
                console.error("An exception occurred while fetching the user profile:", e);
                setCurrentUser(user); // Fallback on any exception
            } finally {
                // This is crucial to ensure the app always renders, even if profile fetch fails.
                setLoading(false);
            }
        };
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            fetchUserWithProfile(session?.user ?? null);
        }).catch(err => {
            console.error("Error getting initial Supabase session:", err);
            fetchUserWithProfile(null); // Proceed in logged-out state on error
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                const user = session?.user ?? null;
                
                if (_event === 'SIGNED_IN' && user && !user.user_metadata.has_custom_avatar) {
                     await supabase.auth.updateUser({
                        data: {
                            avatar_url: getRandomAvatarUrl(),
                            has_custom_avatar: true,
                        }
                    });
                }
                
                // Refetch session to get the updated user object after any changes
                const { data: { session: updatedSession } } = await supabase.auth.getSession();
                await fetchUserWithProfile(updatedSession?.user ?? null);
            } catch (e) {
                console.error("Error within onAuthStateChange handler:", e);
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
        
        // Also create a profile entry
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: displayName,
                avatar_url: data.user.user_metadata.avatar_url,
            });
            if (profileError) {
                console.error("Error creating profile on signup:", profileError.message);
            }
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
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

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    signInWithPopup, 
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signInWithGitHub = async () => {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
    };
    
    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
            // Manually update the current user state to reflect the new user immediately
            // This ensures the app navigates correctly after sign-up
            setCurrentUser(userCredential.user);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
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
        {/* FIX: Corrected typo in component closing tag. */}
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

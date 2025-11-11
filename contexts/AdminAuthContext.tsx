import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { adminLogin, adminLogout } from '../services/geminiService';

const ADMIN_TOKEN_KEY = 'admin-auth-token';

interface AdminAuthContextType {
    isAdminAuthenticated: boolean;
    adminToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [adminToken, setAdminToken] = useState<string | null>(() => {
        try {
            return sessionStorage.getItem(ADMIN_TOKEN_KEY);
        } catch {
            return null; // Handle environments where sessionStorage is not available
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const token = await adminLogin(email, password);
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
        setAdminToken(token);
    }, []);

    const logout = useCallback(async () => {
        if (adminToken) {
            await adminLogout(adminToken); // Inform the server (optional, stateless)
        }
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
    }, [adminToken]);

    const value = {
        isAdminAuthenticated: !!adminToken,
        adminToken,
        loading,
        login,
        logout,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = (): AdminAuthContextType => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
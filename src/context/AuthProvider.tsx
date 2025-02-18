'use client';

import { api } from '@/lib/api';
import { User } from '@/models/user';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

interface AuthContextType {
    user: User | null;
    loginUser: (userData: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    register: (userData: {
        email: string;
        username: string;
        password: string;
    }) => void;
}

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser();
    }, []);

    const loginUser = async (userData: { email: string; password: string }) => {
        try {
            const response = await api.login(userData);
            if (response.status === 200) {
                await getUser();
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
            setUser(null);
            console.log('Logout successful');
        } catch (error: any) {
            console.error(
                'Logout failed:',
                error.response?.data?.message || error.message
            );
        }
    };

    const register = async (userData: {
        email: string;
        username: string;
        password: string;
    }) => {
        try {
            const response = await api.register(userData);
            console.log('Registration successful:', response.data);
        } catch (error: any) {
            console.error(
                'Registration failed:',
                error.response?.data?.message || error.message
            );
        }
    };

    const getUser = async () => {
        try {
            const response = await api.getUser();
            if (response.status === 200) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            setUser(null); // <-- Explicitly set null if request fails
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

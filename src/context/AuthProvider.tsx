'use client';

import {User} from '@/models/user';
import {createContext, ReactNode, useContext, useEffect, useState,} from 'react';
import {api} from "@/lib";

interface AuthContextType {
    user: User | null
    loadUser: () => void
    loginUser: (userData: { email: string; password: string }) => Promise<void>
    logout: () => void
    register: (userData: {
        email: string
        username: string
        password: string
    }) => void
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
)

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        loadUser()
    }, [])

    const loginUser = async (userData: { email: string; password: string }) => {
        try {
            const response = await api.auth.login(userData);
            if (response.status === 200) {
                console.log('Successfully logged in')
            }
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    const logout = async () => {
        try {
            await api.auth.logout();
            setUser(null);
            await loadUser();
            console.log('Logout successful');
        } catch (error: any) {
            console.error(
                'Logout failed:',
                error.response?.data?.message || error.message
            )
        }
    }

    const register = async (userData: {
        email: string
        username: string
        password: string
    }) => {
        try {
            const response = await api.auth.register(userData);
            console.log('Registration successful:', response.data);
        } catch (error: any) {
            console.error(
                'Registration failed:',
                error.response?.data?.message || error.message
            )
        }
    }

    const loadUser = async () => {
        try {
            const response = await api.auth.getUser();
            if (response.status === 200) {
                setUser(response.data)
            } else {
                setUser(null)
            }
        } catch (err) {
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{user, loginUser, logout, register, loadUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}

"use client";

import {User} from "@/models/user";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {api} from "@/lib";
import {UserRegister} from "@/models/userRegister";

interface AuthContextType {
    user: User | null;
    loadUser: () => void;
    loginUser: (userData: { email: string; password: string }) => void;
    logout: () => void;
    register: (userRegData: UserRegister) => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        loadUser()
    }, []);

    const loginUser = (userData: { email: string; password: string }) => {
        try {
            api.auth.login(userData)
                .then(response => {
                    if (response.status === 200) {
                        console.log("Successfully logged in");
                        loadUser()
                    }
                })
        } catch (error: any) {
            const problemDetail: ProblemDetail = error
            throw new Error(problemDetail.detail || "An unknown error occurred during login.");
        }
    };

    const logout = async () => {
        try {
            api.auth.logout()
                .finally(() => {
                    setUser(null)
                    console.log("Logout successful")
                })
        } catch (error: any) {
            const problemDetail: ProblemDetail = error
            throw new Error(problemDetail.detail || "Logout failed")
        }
    }

    const register = (userRegData: UserRegister) => {
        try {
            api.auth.register(userRegData)
                .then(response => console.log("Registration successful:", response.data))
        } catch (error: any) {
            const problemDetail: ProblemDetail = error
            throw new Error(problemDetail.detail || "Registration failed.");
        }
    };

    const loadUser = () => {
        api.auth.getUser()
            .then(response => {
                if (response.status === 200) {
                    setUser(response.data);
                } else {
                    setUser(null);
                }
            });
    };

    return <AuthContext.Provider
        value={{user, loginUser, logout, register, loadUser}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

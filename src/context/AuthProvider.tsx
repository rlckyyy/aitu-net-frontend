"use client";

import {User} from "@/models/User";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {api} from "@/lib";
import {NewUserRequest} from "@/models/NewUserRequest";

interface AuthContextType {
    user: User | null;
    loadUser: () => void;
    loginUser: (userData: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    register: (userRegData: NewUserRequest) => Promise<void>;
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

    const loginUser = async (userData: { email: string; password: string }) => {
        return api.auth.login(userData)
            .then(response => {
                if (response.status === 200) {
                    console.log("Successfully logged in")
                    loadUser()
                }
            })
            .catch(error => {
                console.log("Failed logging in", error.response.data)
                return Promise.reject(error.response.data)
            })
    }

    const logout = async () => {
        api.auth.logout()
            .catch(error => {
                const problemDetail: ProblemDetail = error
                throw new Error(problemDetail.detail || "Logout failed")
            })
            .finally(() => {
                setUser(null)
                console.log("Logout successful")
            })
    }

    const register = async (userRegData: NewUserRequest) => {
        return api.auth.register(userRegData)
            .then(response => console.log("Registration successful:", response.data))
            .catch(error => {
                return Promise.reject(error.response.data);
            })
    };

    const loadUser = () => {
        api.auth.getUser()
            .then(response => {
                if (response.status === 200) {
                    setUser(response.data)
                } else {
                    setUser(null);
                }
            })
            .catch(error => console.log("error while load user", error))
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

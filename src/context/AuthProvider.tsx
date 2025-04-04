"use client";

import { User } from "@/models/user";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "@/lib";
import { UserRegisterData } from "@/models/userRegisterData";

interface AuthContextType {
	user: User | null;
	loadUser: () => void;
	loginUser: (userData: { email: string; password: string }) => void;
	logout: () => void;
	register: (userRegData: UserRegisterData) => void;
}

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [authenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const response = await api.auth.checkAuth();
			const data = response.data as AuthCheckResponse;
			setIsAuthenticated(data.authenticated);
			if (data.authenticated) {
				await loadUser();
			}
		} catch (err) {
			setIsAuthenticated(false);
		}
	};

	const loginUser = async (userData: { email: string; password: string }) => {
		try {
			const response = await api.auth.login(userData);
			if (response.status === 200) {
				console.log("Successfully logged in");
				localStorage.setItem("token", response.data.token);
				await checkAuth();
			}
		} catch (err) {
			console.error("Login failed:", err);
		}
	};

	const logout = async () => {
		try {
			await api.auth.logout();
			setUser(null);
			setIsAuthenticated(false);
			console.log("Logout successful");
		} catch (error: any) {
			console.error("Logout failed:", error.response?.data?.message || error.message);
		}
	};

	const register = async (userRegData: UserRegisterData) => {
		try {
			const response = await api.auth.register(userRegData);
			console.log("Registration successful:", response.data);
		} catch (error: any) {
			console.error("Registration failed:", error.response?.data?.message || error.message);
		}
	};

	const loadUser = async () => {
		try {
			const response = await api.auth.getUser();
			if (response.status === 200) {
				setUser(response.data);
			} else {
				setUser(null);
			}
		} catch (err) {
			setUser(null);
		}
	};

	return <AuthContext.Provider value={{ user, loginUser, logout, register, loadUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}

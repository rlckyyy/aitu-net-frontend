"use client";

import {User} from "@/models/User";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {api} from "@/lib";
import {NewUserRequest} from "@/models/NewUserRequest";
import {del, get, set} from 'idb-keyval'

interface AuthContextType {
    user: User | null;
    loadUser: () => void;
    loginUser: (userData: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    register: (userRegData: NewUserRequest) => Promise<void>;
    recoverPrivateKey: (password: string) => Promise<boolean>;
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

    const deriveKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        const baseKey = await window.crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            baseKey,
            {
                name: "AES-GCM",
                length: 256
            },
            false,
            ["encrypt", "decrypt"]
        );
    };

    // Шифрование приватного ключа паролем
    const encryptPrivateKey = async (privateKey: CryptoKey, password: string): Promise<{
        encryptedKey: string;
        salt: string;
        iv: string;
    }> => {
        // Генерируем соль и IV
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Экспортируем приватный ключ
        const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", privateKey);

        // Создаем ключ шифрования из пароля
        const encryptionKey = await deriveKeyFromPassword(password, salt);

        // Шифруем приватный ключ
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            encryptionKey,
            privateKeyBuffer
        );

        return {
            encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
            salt: btoa(String.fromCharCode(...salt)),
            iv: btoa(String.fromCharCode(...iv))
        };
    };

    const decryptPrivateKey = async (
        encryptedData: { encryptedKey: string; salt: string; iv: string },
        password: string
    ): Promise<CryptoKey> => {
        const encryptedBuffer = new Uint8Array(
            atob(encryptedData.encryptedKey).split('').map(c => c.charCodeAt(0))
        );
        const salt = new Uint8Array(
            atob(encryptedData.salt).split('').map(c => c.charCodeAt(0))
        );
        const iv = new Uint8Array(
            atob(encryptedData.iv).split('').map(c => c.charCodeAt(0))
        );

        const decryptionKey = await deriveKeyFromPassword(password, salt);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            decryptionKey,
            encryptedBuffer
        );

        // Импортируем дешифрованный приватный ключ
        return window.crypto.subtle.importKey(
            "pkcs8",
            decryptedBuffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["decrypt"]
        );
    };

    const loginUser = async (userData: { email: string; password: string }) => {
        return api.auth.login(userData)
            .then(response => {
                if (response.status === 200) {
                    console.log("Successfully logged in")
                    loadUser()
                    recoverPrivateKey(userData.password)
                        .then(success => {
                            if (success) {
                                console.log("Private key recovered successfully");
                            } else {
                                console.log("Failed to recover private key");
                            }
                        })
                        .catch(error => console.log("Error recovering private key:", error));
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
                // Удаляем приватный ключ из локального хранилища
                del('rsa-private-key')
                console.log("Logout successful")
            })
    }

    const register = async (userRegData: NewUserRequest & { password: string }) => {
        const keyPair = await generateKeyPair();
        userRegData.publicKey = keyPair.publicKey;

        userRegData.encryptedPrivateKeyDto = await encryptPrivateKey(keyPair.privateKey, userRegData.password);

        console.log("Registering user:", userRegData);
        return api.auth.register(userRegData)
            .then(response => {
                console.log("Registration successful:", response.data);
                set('rsa-private-key', keyPair.privateKey);
            })
            .catch(error => {
                return Promise.reject(error.response.data);
            })
    };

    const generateKeyPair = async (): Promise<{ privateKey: CryptoKey; publicKey: string }> => {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        const exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));

        return {
            privateKey: keyPair.privateKey,
            publicKey: publicKeyBase64
        };
    }

    const recoverPrivateKey = async (password: string): Promise<boolean> => {
        try {
            // Проверяем, есть ли уже ключ в локальном хранилище
            const existingKey = await get('rsa-private-key');
            if (existingKey) {
                console.log("Private key already exists locally");
                return true;
            }

            const response = await api.auth.getEncryptedPrivateKey();
            if (response.status !== 200) {
                throw new Error("Failed to fetch encrypted private key from server");
            }

            const encryptedKeyData = response.data;

            const privateKey = await decryptPrivateKey(encryptedKeyData, password);

            await set('rsa-private-key', privateKey);

            console.log("Private key recovered and stored locally");
            return true;

        } catch (error) {
            console.error("Failed to recover private key:", error);
            return false;
        }
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
        value={{user, loginUser, logout, register, loadUser, recoverPrivateKey}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

// Дополнительные утилиты для работы с ключами
export const cryptoUtils = {
    // Функция для шифрования данных с помощью приватного ключа пользователя
    encryptData: async (data: string): Promise<string> => {
        const privateKey = await get('rsa-private-key');
        if (!privateKey) {
            throw new Error("Private key not found. Please log in first.");
        }

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // Для RSA-OAEP мы используем публичный ключ для шифрования
        // Здесь предполагается, что у вас есть доступ к публичному ключу
        // В реальном приложении вы бы получили его из профиля пользователя

        // Это пример - вам нужно адаптировать под вашу архитектуру
        throw new Error("Implementation needed based on your key management strategy");
    },

    // Функция для дешифрования данных
    decryptData: async (encryptedData: string): Promise<string> => {
        const privateKey = await get('rsa-private-key') as CryptoKey;
        if (!privateKey) {
            throw new Error("Private key not found. Please log in first.");
        }

        const encryptedBuffer = new Uint8Array(
            atob(encryptedData).split('').map(c => c.charCodeAt(0))
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    }
};
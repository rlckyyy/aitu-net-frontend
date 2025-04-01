'use client';

import {useRouter} from 'next/navigation';
import React, {useState} from 'react';
import {useAuth} from "@/context/AuthProvider";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const {loginUser} = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            loginUser({email, password});
            router.push('/users/profile');
        } catch (err) {
            console.error(err);
            setError('Неверные учетные данные');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl mb-4 text-red-500">Sign in</h2>
            <form onSubmit={handleLogin} className="flex flex-col space-y-3">
                {error && <p className="text-red-500">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Sign in
                </button>
            </form>
        </div>
    );
}

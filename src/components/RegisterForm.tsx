'use client';

import {AxiosError} from 'axios';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {useAuth} from "@/context/AuthProvider";

export default function AuthForm({type}: { type: 'register' | 'login' }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const {register} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (type === 'register') {
                await register({username: username, email: email, password: password, publicKey: 'fewf'});
            }
            router.push('/auth/login');
        } catch (err) {
            const errorMessage =
                (err as AxiosError<ProblemDetail>)?.response?.data?.detail ||
                'An unexpected error occurred';
            setError(errorMessage);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl mb-4 text-red-500">📝 Sign up</h2>
            <div className="max-w-md w-full p-4 border rounded-lg bg-white">
                <h2 className="text-xl font-bold text-center mb-2 text-red-500">
                    {type === 'register' ? 'Sign Up' : 'Sign in'}
                </h2>
                {error && <p className="text-red-500 text-center mb-2">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {type === 'register' && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border p-2 rounded text-black w-full"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 rounded text-black w-full"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded text-black w-full"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
                    >
                        {type === 'register' ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

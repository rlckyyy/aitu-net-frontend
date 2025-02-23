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
                await register({username: username, email: email, password: password});
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
        <div className="max-w-md mx-auto p-4 border rounded-lg">
            <h2 className="text-xl font-bold">
                {type === 'register' ? 'Регистрация' : 'Вход'}
            </h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {type === 'register' && (
                    <input
                        type="text"
                        placeholder="Имя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 rounded text-black"
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-black p-2 rounded"
                >
                    {type === 'register' ? 'Зарегистрироваться' : 'Войти'}
                </button>
            </form>
        </div>
    );
}

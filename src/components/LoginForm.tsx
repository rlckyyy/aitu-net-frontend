"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/api";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await api.login(email, password);
            router.push("/users/profile");
        } catch (err) {
            console.error(err);
            setError("Неверные учетные данные");
        }
    };

    return (
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
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded text-black"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Войти
            </button>
        </form>
    );
}

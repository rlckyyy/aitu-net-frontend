"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/api";
import {User} from "@/models/user";

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.getUser();
                setUser(data);
            } catch (error) {
                console.error("Ошибка загрузки профиля:", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    if (loading) return <p>Загрузка...</p>;
    if (!user) return null;

    return (
        <div className="max-w-md mx-auto p-6 bg-black rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold">Профиль</h1>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>FriendList:</strong> {user.friendList}</p>
            <p><strong>Roles:</strong> {user.roles}</p>
        </div>
    );
}

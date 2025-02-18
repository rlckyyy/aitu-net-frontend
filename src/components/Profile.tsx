'use client';

import { useAuth } from '@/context/AuthProvider';
import { useEffect, useState } from 'react';

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    if (loading) return <p>Загрузка...</p>;
    if (!user) return null;

    return (
        <div className="max-w-md mx-auto p-6 bg-black rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold">Профиль</h1>
            <p>
                <strong>ID:</strong> {user?.id}
            </p>
            <p>
                <strong>Username:</strong> {user?.username}
            </p>
            <p>
                <strong>Email:</strong> {user?.email}
            </p>
            <p>
                <strong>FriendList:</strong> {user?.friendList}
            </p>
            <p>
                <strong>Roles:</strong> {user?.roles}
            </p>
        </div>
    );
}

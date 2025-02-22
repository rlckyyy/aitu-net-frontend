'use client';

import {useAuth} from '@/context/AuthProvider';
import {useEffect, useState} from 'react';

export default function Profile() {
    const {user, loadUser} = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Profile component opened')
        console.log('User: ', user)
        loadUser()
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    if (loading) return <p>Загрузка...</p>;
    if (!user) return null;

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold mb-4 text-blue-400">Профиль</h1>

            <div className="space-y-2">
                <p>
                    <span className="font-semibold text-gray-400">ID:</span> {user?.id}
                </p>
                <p>
                    <span className="font-semibold text-gray-400">Username:</span> {user?.username}
                </p>
                <p>
                    <span className="font-semibold text-gray-400">Email:</span> {user?.email}
                </p>
                <p>
                    <span
                        className="font-semibold text-gray-400">Friend List:</span> {user?.friendList?.join(", ") || "No friends"}
                </p>
                <p>
                    <span className="font-semibold text-gray-400">Roles:</span> {user?.roles?.join(", ")}
                </p>
            </div>
        </div>
    )
}

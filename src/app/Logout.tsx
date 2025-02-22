'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        await api.logout();

        router.refresh();
        router.replace('/auth/login');
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            Выйти
        </button>
    );
};

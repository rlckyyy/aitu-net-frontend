'use client';

import { useRouter } from "next/navigation";

export const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");

        router.push("/auth/login");
    };

    return (
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Выйти
        </button>
    );
};

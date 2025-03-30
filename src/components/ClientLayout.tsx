'use client';

import {LogoutButton} from '@/app/logout';
import {useAuth} from '@/context/AuthProvider';
import Link from 'next/link';
import React, {useState} from "react";
import SearchBar from "@/components/SearchBar";
import FriendLayout from "@/components/friends/FriendLayout";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center fixed w-full top-0 z-10 h-16">
                {/* Контейнер для логотипа и поиска */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-gray-800">AITU Network</Link>
                    <SearchBar />
                </div>

                {/* Контейнер для аватара и меню */}
                <div className="relative">
                    {user && (
                        <div>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
                                <img
                                    src={user?.avatar?.location || '/def_pfp.svg'}
                                    alt="User Avatar"
                                    width={40}
                                    height={40}
                                    className="rounded-full cursor-pointer border border-gray-300"
                                />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                                    <Link href="/users/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">⚙️ Settings</Link>
                                    <LogoutButton />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Sidebar */}
            <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-gray-800 text-white p-4 shadow-lg flex flex-col">
                <Link href="/" className="hover:text-blue-400 transition">🏠 Main</Link>
                {!user && <Link href="/auth/login" className="hover:text-blue-400 transition">🔐 Login</Link>}
                {!user && <Link href="/auth/register" className="hover:text-blue-400 transition">📝 Registration</Link>}
                {user && <Link href="/users/profile" className="hover:text-blue-400 transition">📌 Profile</Link>}
                {user && <Link href="/chat" className="hover:text-blue-400 transition">💬 Chat</Link>}
                {user && <FriendLayout />}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-gray-100 flex flex-col justify-start items-center ml-64 mt-16 min-h-screen">
                <div className="w-full max-w-5xl">{children}</div>
            </main>
        </div>
    );
}

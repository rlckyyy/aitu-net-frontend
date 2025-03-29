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
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center fixed w-full top-0 z-10">
                <Link href="/" className="text-xl font-bold text-gray-800">AITU Network</Link>
                <div className="relative">
                    {user && (
                        <div>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
                                <img
                                    src={user?.avatar?.location || "/def_pfp.svg"}
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

            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <aside className="w-64 h-screen bg-gray-800 text-white p-4 shadow-lg fixed flex flex-col space-y-4">
                    <Link href="/" className="hover:text-blue-400 transition">🏠 Main</Link>
                    {!user && <Link href="/auth/login" className="hover:text-blue-400 transition">🔐 Login</Link>}
                    {!user && <Link href="/auth/register" className="hover:text-blue-400 transition">📝 Registration</Link>}
                    {user && <Link href="/users/profile" className="hover:text-blue-400 transition">📌 Profile</Link>}
                    {user && <Link href="/chat" className="hover:text-blue-400 transition">💬 Chat</Link>}
                    {user && <FriendLayout />}
                    <SearchBar />
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 ml-64 bg-gray-100 max-w-3xl mx-auto">{children}</main>
            </div>
        </div>
    );
}

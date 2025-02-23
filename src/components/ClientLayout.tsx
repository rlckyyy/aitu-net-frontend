'use client';

import {LogoutButton} from '@/app/logout';
import {useAuth} from '@/context/AuthProvider';
import Link from 'next/link';
import React from "react";
import SearchBar from "@/components/SearchBar";
import FriendLayout from "@/components/friends/FriendLayout";

export default function ClientLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const {user} = useAuth();

    return (
        <div className="flex">
            {/* Sidebar */}
            <aside className="w-64 h-screen bg-gray-800 text-white p-4 shadow-lg fixed flex flex-col space-y-4">
                <Link href="/" className="hover:text-blue-400 transition">🏠 Main</Link>
                {!user && <Link href="/auth/login" className="hover:text-blue-400 transition">🔐 Login</Link>}
                {!user && <Link href="/auth/register" className="hover:text-blue-400 transition">📝 Registration</Link>}
                {user && <Link href="/users/profile" className="hover:text-blue-400 transition">📌 Profile</Link>}
                {user && <Link href="/chat" className="hover:text-blue-400 transition">💬 Chat</Link>}
                {user && <FriendLayout/>}
                <SearchBar/>
                <LogoutButton/>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 ml-64">{children}</main>
        </div>
    );
}

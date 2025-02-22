'use client';

import { LogoutButton } from '@/app/Logout';
import { useAuth } from '@/context/AuthProvider';
import Link from 'next/link';
import React from "react";
import SearchBar from "@/components/SearchBar";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <>
            <nav className="p-4 bg-gray-800 text-white flex items-center space-x-4 shadow-lg">
                <Link href="/" className="hover:text-blue-400 transition">🏠 Main</Link>
                {!user && <Link href="/auth/login" className="hover:text-blue-400 transition">🔐 Login</Link>}
                {!user && <Link href="/auth/register" className="hover:text-blue-400 transition">📝 Registration</Link>}
                <Link href="/users/profile" className="hover:text-blue-400 transition">📌 Profile</Link>
                {user && <Link href="/chat" className="hover:text-blue-400 transition">💬 Chat</Link>}
                <SearchBar />
                <LogoutButton />
            </nav>
            <main className="p-6">{children}</main>
        </>
    )
}

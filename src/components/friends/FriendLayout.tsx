'use client'

import Link from "next/link";
import {useState} from "react";

export default function FriendLayout() {
    const [showFriendsMenu, setShowFriendsMenu] = useState(false);

    return (
        <div className="mt-2">
            {/* Кнопка Friends */}
            <button
                onClick={() => setShowFriendsMenu((prev) => !prev)}
                className="hover:text-blue-400 transition flex items-center"
            >
                🤼‍ Friends
            </button>

            {/* Меню друзей */}
            {showFriendsMenu && (
                <div className="mt-4 p-2 bg-gray-700 text-white rounded-md shadow">
                    <nav className="flex flex-col space-y-2">
                        <Link href="/friends/list" className="hover:text-blue-400 transition">👥 Friend List</Link>
                        <Link href="/friends/send-requests" className="hover:text-blue-400 transition">📨 Send
                            Requests</Link>
                        <Link href="/friends/respond-requests" className="hover:text-blue-400 transition">✅ Respond
                            Requests</Link>
                    </nav>
                </div>
            )}
        </div>
    )
}
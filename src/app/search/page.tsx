'use client'

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {User} from "@/models/user";
import {api} from "@/lib";

export default function SearchPage() {
    const searchParams = useSearchParams()
    const [users, setUsers] = useState<User[]>([])
    const router = useRouter()
    const query = searchParams.get('query') || '';
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!query) {
            return
        }
        api.chat.searchUsers(query)
            .then(setUsers)
            .then(() => setLoading(false))
    }, [query])
    const handleFriendRequest = async (userId: string) => {
        api.friends.sendFriendRequest(userId);
    }

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            <h1 className="text-2xl font-bold mb-4 text-blue-400">
                Search Results for: "{query}"
            </h1>

            {loading && <p className="text-gray-400">Loading...</p>}

            <ul className="space-y-4">
                {users.length > 0 ? (
                    users.map((user) => (
                        <li
                            key={user.id}
                            className="p-4 border border-gray-700 rounded-lg flex justify-between items-center bg-gray-800 shadow-md"
                        >
                            <div>
                                <p className="text-lg font-semibold">{user.username}</p>
                                <p className="text-gray-400">Email: {user.email}</p>
                            </div>
                            <button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white rounded transition"
                                onClick={() => handleFriendRequest(user.id)}
                            >
                                Send Friend Request
                            </button>
                            <button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white rounded transition"
                                onClick={() => router.push(`chat?companionEmail=${user.email}`)}
                            >
                                Send Message
                            </button>
                        </li>
                    ))
                ) : (
                    !loading && <p className="text-gray-400">No users found.</p>
                )}
            </ul>
        </div>
    )
}
'use client'

import {useAuth} from "@/context/AuthProvider";
import {useEffect, useState} from "react";
import {User} from "@/models/user";
import {friendsApi} from "@/lib/friendsApi";
import Link from "next/link";

export default function ListFriends() {
    const {user} = useAuth()
    const [friends, setFriends] = useState<User[]>([])
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user?.id) return;

        friendsApi.getUserFriendList(user.id)
            .then(response => setFriends(response.data))
            .catch(error => console.error("Error while getting friends:", error))
            .finally(() => setLoading(false));
    }, [user]);
    if (loading) return <p>Loading ...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Friend List</h2>
            <ul className="space-y-4">
                {friends.length > 0 ? (
                    friends.map(friend => (
                        <li
                            key={friend.id}
                            className="flex items-center p-4 bg-gray-900 rounded-lg shadow hover:bg-gray-700 transition duration-300"
                        >
                            <img
                                src={friend.avatar?.location || "/def_pfp.svg"}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full mr-4"
                            />
                            <Link
                                href={{
                                    pathname: "/users/profile/another",
                                    query: { userId: friend.id },
                                }}
                                className="text-blue-400 font-semibold hover:underline"
                            >
                                {friend.email}
                            </Link>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-400">No friends yet</p>
                )}
            </ul>
        </div>

    );
}
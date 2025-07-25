"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import type {User} from "@/models/User";
import {api} from "@/lib";
import {Mail, MessageCircle, Search, UserPlus} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";
import Link from "next/link";

export default function SearchComponent() {
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();
    const query = searchParams.get("query") || "";
    const [loading, setLoading] = useState(true);
    const [requestSent, setRequestSent] = useState<Record<string, boolean>>({});
    const {user} = useAuth();

    useEffect(() => {
        console.log("Query: ", query);
        if (!query || query === "") {
            setLoading(false);
            return;
        }
        console.log("Query 2: ", query);
        api.user
            .searchUsers(query)
            .then(response => setUsers(response.data))
            .finally(() => setLoading(false));
    }, [query]);

    const handleFriendRequest = async (userId: string) => {
        try {
            await api.friends.sendFriendRequest(userId);
            setRequestSent(prev => ({...prev, [userId]: true}));
            setTimeout(() => {
                setRequestSent(prev => ({...prev, [userId]: false}));
            }, 3000);
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <Search className="w-5 h-5 text-gray-400 mr-2"/>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Search Results for: <span className="text-indigo-600 dark:text-indigo-400">"{query}"</span>
                    </h1>
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div
                            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : users.length > 0 ? (
                    <div className="space-y-4">
                        {users.map(searchedUser => (
                            <div
                                key={searchedUser.id}
                                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                                        {searchedUser.avatar?.location ? (
                                            <img
                                                src={searchedUser.avatar.location || "/placeholder.svg"}
                                                alt={searchedUser.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="text-xl font-bold">{searchedUser.username.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{searchedUser.username}</h3>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Mail size={14} className="mr-1"/>
                                            {searchedUser.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                                    {/* Кнопка "View Profile" всегда отображается */}
                                    <Link
                                        href={`/users/profile/another?userId=${searchedUser.id}`}
                                        className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <span className="mr-1">👤</span>
                                        View Profile
                                    </Link>

                                    {user && !user.friendList.includes(searchedUser.email) && (
                                        <>
                                            <button
                                                type="button"
                                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                    requestSent[searchedUser.id]
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/40"
                                                }`}
                                                onClick={() => handleFriendRequest(searchedUser.id)}
                                                disabled={requestSent[searchedUser.id]}
                                            >
                                                {requestSent[searchedUser.id] ? (
                                                    <>
                                                        <span className="mr-1">✓</span>
                                                        Request Sent
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus size={16} className="mr-1"/>
                                                        Add Friend
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
                                                onClick={() => router.push(`/chat?companionId=${searchedUser.id}`)}
                                            >
                                                <MessageCircle size={16} className="mr-1"/>
                                                Message
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
                            <Search size={24}/>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No users found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try searching with a different term</p>
                    </div>
                )}
            </div>
        </div>
    );
}

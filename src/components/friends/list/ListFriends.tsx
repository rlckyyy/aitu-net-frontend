"use client";

import {useEffect, useState} from "react";
import type {User} from "@/models/User";
import Link from "next/link";
import {MessageCircle, UserIcon} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {defaultPfp} from "../../../../public/modules/defaultPfp";
import {api} from "@/lib";


export default function ListFriends() {
    const [friends, setFriends] = useState<User[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    useEffect(() => {
        if (userId){
            api.friends.getUserFriendList(userId).then(response => setFriends(response.data));
        }
    }, [userId]);

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Friends</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your connections on AITU Network
                </p>
            </div>

            <div className="p-6">
                {friends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.map(friend => (
                            <div
                                key={friend.id}
                                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center">
                                    <div className="relative">
                                        <img
                                            src={friend.avatar?.location || defaultPfp}
                                            alt="Avatar"
                                            className="w-12 h-12 rounded-full object-cover bg-white"
                                        />
                                        <div
                                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"/>
                                    </div>
                                    <div className="ml-4">
                                        <Link
                                            href={{
                                                pathname: "/users/profile/another",
                                                query: {userId: friend.id},
                                            }}
                                            className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            {friend.username || friend.email}
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/chat?companionId=${friend.id}`)}
                                    className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/40 rounded-md text-sm font-medium transition-colors"
                                >
                                    <MessageCircle size={16} className="mr-1"/>
                                    Message
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
                            <UserIcon size={24}/>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No friends yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Start connecting with other users to build your network
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client'

import {User as UserIcon, Users} from "lucide-react";
import Link from "next/link";
import React, {use, useEffect, useState} from "react";
import {User} from "@/models/User";
import {api} from "@/lib";

export default function FriendsSideBar({userId}: { userId: string }) {
    const [friends, setUserFriends] = useState<User[]>([])

    useEffect(() => {
        api.friends.getUserFriendList(userId).then(r => setUserFriends(r.data))
    }, [])
    return (
        <div className="flex-1">
            <div
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Users className="w-5 h-5 mr-2"/>
                        Friends
                    </h2>
                    <Link
                        href={`/friends/list?userId=${userId}`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        View all
                    </Link>
                </div>

                {friends.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {friends.slice(0, 4).map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                            >
                                <div
                                    className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                    <UserIcon size={16}/>
                                </div>
                                <Link href={`/users/profile/another?userId=${user.id}`} passHref>
                                    <span
                                        className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.username}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No friends yet</p>
                )}
            </div>
        </div>
    )
}
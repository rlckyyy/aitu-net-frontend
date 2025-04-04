"use client";

import {useEffect, useState} from "react";
import type {User} from "@/models/user";
import {api} from "@/lib";
import {useRouter, useSearchParams} from "next/navigation";
import {FileText, Mail, MessageCircle, Shield, UserIcon, UserPlus, Users} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get("userId");
    const {user: currUser} = useAuth();

    useEffect(() => {
        if (typeof userId === "string") {
            setLoading(true);
            console.log("Fetching user data for ID:", userId);

            api.user
                .getUserById(userId)
                .then(data => {
                    console.log("User data received:", data);
                    setUser(data.data);
                })
                .catch(e => console.error("Error loading user:", e))
                .finally(() => setLoading(false));
        }
    }, [userId]);

    const handleSendMessage = () => {
        if (user?.email) {
            router.push(`/chat?companionEmail=${user.email}`);
        }
    };

    const handleSendFriendRequest = () => {
        if (userId) {
            api.friends
                .sendFriendRequest(userId)
                .then(() => {
                    alert("Friend request sent successfully!");
                })
                .catch(error => {
                    console.error("Error sending friend request:", error);
                    if (error.response && error.response.status === 409) {
                        alert("Failed to send friend request: Already pending request");
                    } else {
                        alert("Failed to send friend request");
                    }
                });
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );

    if (!user)
        return (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">User not found</p>
            </div>
        );

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                <div className="absolute -bottom-16 left-8">
                    <img
                        src={user?.avatar?.location || "/def_pfp.svg"}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                    />
                </div>

                {currUser && (
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                        onClick={handleSendMessage}
                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        <MessageCircle size={16} className="mr-2"/>
                        Message
                    </button>

                    <button
                        onClick={handleSendFriendRequest}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
                    >
                        <UserPlus size={16} className="mr-2"/>
                        Add Friend
                    </button>
                </div>
                )}
            </div>

            <div className="pt-20 px-8 pb-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left column - User info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
                        {user?.description &&
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{user.description}</p>}

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center">
                                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"/>
                                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                            </div>

                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"/>
                                <span
                                    className="text-gray-700 dark:text-gray-300">{user?.roles?.join(", ") || "Member"}</span>
                            </div>

                            {user?.description && (
                                <div className="flex items-start">
                                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1"/>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{user.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column - Friends */}
                    <div className="flex-1">
                        <div
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                    <Users className="w-5 h-5 mr-2"/>
                                    Friends
                                </h2>
                            </div>

                            {user?.friendList && user.friendList.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {user.friendList.slice(0, 4).map((friend, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                                <UserIcon size={16}/>
                                            </div>
                                            <span
                                                className="text-sm text-gray-700 dark:text-gray-300 truncate">{friend}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No friends yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

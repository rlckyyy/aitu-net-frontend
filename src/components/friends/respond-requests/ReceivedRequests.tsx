"use client";

import {useAuth} from "@/context/AuthProvider";
import {useEffect, useState} from "react";
import type {FriendRequest} from "@/models/friend/FriendRequest";
import {FriendRequestStatus} from "@/models/friend/FriendRequestStatus";
import {api} from "@/lib";
import Link from "next/link";
import {Check, X, User} from "lucide-react";
import {Loading} from "@/components/Loading";
import useSWR from "swr";
import {fetcher} from "@/lib/fetcher";

export default function ReceivedRequests() {
    const {user} = useAuth();
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [actionStatus, setActionStatus] = useState<Record<string, { status: "accepted" | "declined" | null }>>({});
    const {data: receivedRequests, isLoading, error} = useSWR(
        ['friend/received', {status: FriendRequestStatus.PENDING}],
        ([url, params]) => fetcher(url, params)
    )

    useEffect(() => {
        receivedRequests && setFriendRequests(receivedRequests)
    }, [user]);

    if (error) {
        console.error("Error while getting received friend requests:", error)
    }

    if (isLoading) {
        return <Loading/>
    }

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await api.friends.respondRequest(requestId, FriendRequestStatus.ACCEPTED);
            setActionStatus(prev => ({...prev, [requestId]: {status: "accepted"}}));

            // Remove from list after animation
            setTimeout(() => {
                setFriendRequests(prev => prev.filter(request => request.id !== requestId));
            }, 1000);
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const handleDeclineRequest = async (requestId: string) => {
        try {
            await api.friends.respondRequest(requestId, FriendRequestStatus.DECLINED);
            setActionStatus(prev => ({...prev, [requestId]: {status: "declined"}}));

            // Remove from list after animation
            setTimeout(() => {
                setFriendRequests(prev => prev.filter(request => request.id !== requestId));
            }, 1000);
        } catch (error) {
            console.error("Error declining request:", error);
        }
    };

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Friend Requests</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your received friend requests</p>
            </div>

            <div className="p-6">
                {friendRequests.length > 0 ? (
                    <div className="space-y-4">
                        {friendRequests.map(friendReq => (
                            <div
                                key={friendReq.id}
                                className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all border border-gray-200 dark:border-gray-700 ${
                                    actionStatus[friendReq.id]?.status === "accepted"
                                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                        : actionStatus[friendReq.id]?.status === "declined"
                                            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                            : ""
                                }`}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
                                        <User size={24}/>
                                    </div>
                                    <div>
                                        <Link
                                            href={{
                                                pathname: "/users/profile/another",
                                                query: {userId: friendReq.senderId},
                                            }}
                                            className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            {friendReq.sender}
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Wants to be your
                                            friend</p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    {actionStatus[friendReq.id]?.status === "accepted" ? (
                                        <div
                                            className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center">
                                            <Check size={16} className="mr-2"/>
                                            Accepted
                                        </div>
                                    ) : actionStatus[friendReq.id]?.status === "declined" ? (
                                        <div
                                            className="px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md flex items-center">
                                            <X size={16} className="mr-2"/>
                                            Declined
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleDeclineRequest(friendReq.id)}
                                                className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md flex items-center transition-colors"
                                            >
                                                <X size={16} className="mr-2"/>
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleAcceptRequest(friendReq.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md flex items-center transition-colors"
                                            >
                                                <Check size={16} className="mr-2"/>
                                                Accept
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
                            <User size={24}/>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No friend requests</h3>
                        <p className="text-gray-500 dark:text-gray-400">You don't have any pending friend requests at
                            the moment</p>
                    </div>
                )}
            </div>
        </div>
    );
}

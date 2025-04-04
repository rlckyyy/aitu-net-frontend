"use client";

import { useEffect, useState } from "react";
import type { FriendRequest } from "@/models/friend/FriendRequest";
import { friendsApi } from "@/lib/friendsApi";
import { FriendRequestStatus } from "@/models/friend/FriendRequestStatus";
import { useAuth } from "@/context/AuthProvider";
import { Clock, User } from "lucide-react";
import Link from "next/link";

export default function SendRequests() {
	const { user } = useAuth();
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		friendsApi
			.getSentFriendRequests(FriendRequestStatus.PENDING)
			.then(response => setFriendRequests(response.data))
			.catch(error => console.error("Error while getting friends:", error))
			.finally(() => setLoading(false));
	}, [user]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-96">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
			</div>
		);

	return (
		<div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
			<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sent Friend Requests</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Friend requests you've sent that are waiting for a response</p>
			</div>

			<div className="p-6">
				{friendRequests.length > 0 ? (
					<div className="space-y-4">
						{friendRequests.map(friendReq => (
							<div
								key={friendReq.id}
								className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700"
							>
								<div className="flex items-center">
									<div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
										<User size={24} />
									</div>
									<div>
										<Link
											href={{
												pathname: "/users/profile/another",
												query: { userId: friendReq.receiverId },
											}}
											className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
										>
											{friendReq.receiverId}
										</Link>
										<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
											<Clock size={14} className="mr-1" />
											Pending response
										</div>
									</div>
								</div>

								<div className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md text-sm">
									Awaiting response
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
							<User size={24} />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No sent requests</h3>
						<p className="text-gray-500 dark:text-gray-400">You haven't sent any friend requests yet</p>
					</div>
				)}
			</div>
		</div>
	);
}

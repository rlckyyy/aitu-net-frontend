"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, UserPlus, Users, CheckCircle } from "lucide-react";

export default function FriendLayout() {
	const [showFriendsMenu, setShowFriendsMenu] = useState(false);

	return (
		<div className="mt-2">
			<button
				onClick={() => setShowFriendsMenu(prev => !prev)}
				className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
			>
				<Users size={18} className="mr-3 text-indigo-500" />
				<span>Friends</span>
				{showFriendsMenu ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />}
			</button>

			{showFriendsMenu && (
				<div className="ml-6 mt-1 space-y-1">
					<Link href="/friends/list" className="flex items-center p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
						<Users size={16} className="mr-2 text-indigo-400" />
						<span>Friend List</span>
					</Link>
					<Link
						href="/friends/send-requests"
						className="flex items-center p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<UserPlus size={16} className="mr-2 text-indigo-400" />
						<span>Sent Requests</span>
					</Link>
					<Link
						href="/friends/respond-requests"
						className="flex items-center p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						<CheckCircle size={16} className="mr-2 text-indigo-400" />
						<span>Received Requests</span>
					</Link>
				</div>
			)}
		</div>
	);
}

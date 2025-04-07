"use client";

import { LogoutButton } from "@/app/logout";
import { useAuth } from "@/context/AuthProvider";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import FriendLayout from "@/components/friends/FriendLayout";
import {Bell, Group, Home, MessageCircle, Settings, User, Users} from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="flex flex-col min-h-screen w-full bg-white dark:bg-gray-900">
			{/* Header */}
			<header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm px-6 py-3 flex justify-between items-center fixed w-full top-0 z-10 h-16">
				<div className="flex items-center gap-4">
					<Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
						AITU Network
					</Link>
					<SearchBar />
				</div>

				<div className="flex items-center gap-4">
					{user && (
						<>
							<button className="relative p-2 text-gray-500 hover:text-indigo-500 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
								<Bell size={20} />
								<span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
									3
								</span>
							</button>

							<div className="relative">
								<button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center focus:outline-none">
									<img
										src={user?.avatar?.location || "/def_pfp.svg"}
										alt="User Avatar"
										width={40}
										height={40}
										className="rounded-full cursor-pointer border border-gray-200 dark:border-gray-600 hover:ring-2 hover:ring-indigo-400 transition-all"
									/>
								</button>
								{menuOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-20">
										<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
											<p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
										</div>
										<Link
											href="/users/profile"
											className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											<User size={16} className="mr-2" />
											Profile
										</Link>
										<Link
											href="/users/edit"
											className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											<Settings size={16} className="mr-2" />
											Settings
										</Link>
										<div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
											<LogoutButton />
										</div>
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</header>

			{/* Sidebar */}
			<aside className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-md flex flex-col">
				<nav className="p-4 space-y-2">
					<Link href="/" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
						<Home size={18} className="mr-3 text-indigo-500" />
						<span>Home</span>
					</Link>

					{!user && (
						<>
							<Link href="/auth/login" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<User size={18} className="mr-3 text-indigo-500" />
								<span>Login</span>
							</Link>
							<Link href="/auth/register" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<Users size={18} className="mr-3 text-indigo-500" />
								<span>Register</span>
							</Link>
						</>
					)}

					{user && (
						<>
							<Link href="/users/profile" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<User size={18} className="mr-3 text-indigo-500" />
								<span>Profile</span>
							</Link>
							<Link href="/chat" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<MessageCircle size={18} className="mr-3 text-indigo-500" />
								<span>Chat</span>
							</Link>
							<Link href="/group" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
								<Group size={18} className="mr-3 text-indigo-500" />
								<span>Community</span>
							</Link>
							<div className="pt-2">
								<FriendLayout />
							</div>
						</>
					)}
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 flex flex-col justify-start items-center ml-64 mt-16 min-h-screen">
				<div className="w-full max-w-5xl">{children}</div>
			</main>
		</div>
	);
}

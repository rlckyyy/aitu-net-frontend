"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const router = useRouter();

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	const handleSearchSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (query.trim()) {
			router.push(`/search?query=${query}`);
		}
	};

	return (
		<form onSubmit={handleSearchSubmit} className="relative">
			<div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
				<input
					type="text"
					placeholder="Search users"
					value={query}
					onChange={handleSearchChange}
					className="px-4 py-2 w-64 bg-transparent text-gray-800 dark:text-white focus:outline-none"
				/>
				<button type="submit" className="p-2 text-gray-500 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400">
					<Search size={18} />
				</button>
			</div>
		</form>
	);
}

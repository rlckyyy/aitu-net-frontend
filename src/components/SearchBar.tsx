'use client'

import React, {useState} from "react";
import {useRouter} from "next/navigation";

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (query.trim()) {
            router.push(`/search?query=${query}`)
        }
    }

    return (
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
            <input
                type="text"
                placeholder="🔍 Search users"
                value={query}
                onChange={handleSearchChange}
                className="px-4 py-2 w-64 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </form>
    )
}
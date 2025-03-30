'use client'

import {useAuth} from "@/context/AuthProvider";
import React, {FormEvent, useState} from "react";
import {ProfileUpdate} from "@/models/ProfileUpdate";
import {useRouter} from "next/navigation";
import {api} from "@/lib";

export default function () {
    const {user} = useAuth()
    const [username, setUsername] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const router = useRouter()
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const req: ProfileUpdate = {
            username: username??user?.username,
            description: description??user?.description,
        }
        api.user.updateUser(req)
        router.push(`/users/profile`)
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold mb-4 text-blue-400">Update profile</h1>

            <form id="updateForm"
                  onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Username:</span>
                        <input type="text" id="username" defaultValue={user?.username}
                               onChange={(e) => setUsername(e.target.value)}
                               className="w-full mt-1 p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Description:</span>
                        <input type="text" id="description" defaultValue={user?.description}
                               onChange={(e) => setDescription(e.target.value)}
                               className="w-full mt-1 p-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                    </label>

                    <button type="submit"
                            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Save the changes
                    </button>
                </div>
            </form>
        </div>
    );
}
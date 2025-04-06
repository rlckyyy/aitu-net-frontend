"use client";

import {useAuth} from "@/context/AuthProvider";
import {type FormEvent, useState} from "react";
import type {ProfileUpdate} from "@/models/ProfileUpdate";
import {useRouter} from "next/navigation";
import {api} from "@/lib";
import {ArrowLeft, FileText, Save, User} from "lucide-react";
import Link from "next/link";

export default function () {
    const {user, loadUser} = useAuth();
    const [username, setUsername] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const req: ProfileUpdate = {
            username: username ?? user?.username,
            description: description ?? user?.description,
        };
        api.user.updateUser(req).then(_ => loadUser());
        router.push(`/users/profile`);
    };

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Profile</h1>
                <Link href="/users/profile"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <ArrowLeft size={20}/>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={16} className="text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            id="username"
                            defaultValue={user?.username}
                            onChange={e => setUsername(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bio
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                            <FileText size={16} className="text-gray-400"/>
                        </div>
                        <textarea
                            id="description"
                            defaultValue={user?.description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 sm:text-sm"
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Write a few sentences about
                        yourself.</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Save size={16} className="mr-2"/>
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
}

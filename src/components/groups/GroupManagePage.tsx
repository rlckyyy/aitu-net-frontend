'use client'

import {Group, GroupCreateDto} from "@/models/group/group";
import React, {useEffect, useState} from "react";
import {api} from "@/lib";
import {FileText, Plus} from "lucide-react";
import {AccessType} from "@/models/group/accessType";
import {Post, PostType} from "@/models/post/post";
import Link from "next/link";
import {PostFeed} from "@/components/posts/PostFeed";

export default function GroupManagePage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [groupName, setGroupName] = useState<string>("");
    const [groupDescription, setGroupDescription] = useState<string>("");
    const [accessType, setAccessType] = useState<AccessType>(AccessType.PUBLIC);
    const [posts, setPosts] = useState<Post[]>([]);
    const [avatar, setAvatar] = useState<File>();

    useEffect(() => {
        api.post
            .searchPosts(undefined, undefined, PostType.GROUP, undefined)
            .then((r) => setPosts(r.data));
        api.group.searchGroups()
            .then(r => setGroups(r.data as Group[]));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const group: GroupCreateDto = {
            name: groupName,
            description: groupDescription,
            accessType: accessType
        };

        try {
            await api.group.createGroup(group, avatar);
            setGroupDescription("");
            setGroupName("");
            setAccessType(AccessType.PUBLIC);
            setIsCreateGroupModalOpen(false);
            const response = await api.group.searchGroups();
            setGroups(response.data);
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
            {/* Основная часть */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2"/>
                        Groups
                    </h2>
                    <button
                        onClick={() => setIsCreateGroupModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2"/>
                        Create Group
                    </button>
                </div>

                {/* Модалка создания группы */}
                {isCreateGroupModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
                            <button
                                onClick={() => setIsCreateGroupModalOpen(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
                            >
                                ×
                            </button>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Group Name"
                                    required
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    placeholder="Group Description"
                                    className="w-full h-28 p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <select
                                    value={accessType}
                                    onChange={(e) => setAccessType(e.target.value as AccessType)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-gray-200 focus:outline-none"
                                >
                                    <option value={AccessType.PUBLIC}>Public</option>
                                    <option value={AccessType.PRIVATE}>Private</option>
                                </select>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="mb-4 w-full text-sm text-gray-600 dark:text-gray-300"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors duration-200"
                                    >
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Список постов */}
                <div className="mt-6 space-y-4">
                    <PostFeed posts={posts}/>
                </div>
            </div>

            {/* Боковая панель */}
            <div
                className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    My Groups
                </h2>
                <div className="space-y-3">
                    {groups.slice(0, 5).map(group => (
                        <div
                            key={group.id}
                            className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <Link
                                href={`/group/profile?groupId=${group.id}`}
                                className="flex items-start px-3 py-1.5 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
                            >
                                {/* Аватарка */}
                                <div className="mr-3">
                                    {group.avatar.location ? (
                                        <img
                                            src={group.avatar.location}
                                            alt={group.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="w-8 h-8 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-xs">
                            👤
                        </span>
                                    )}
                                </div>

                                {/* Название и описание */}
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{group.description}</p>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {groups.length > 5 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            + {groups.length - 5} more
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client'

import {useSearchParams} from "next/navigation";
import {Group} from "@/models/group/group";
import React, {useEffect, useState} from "react";
import {api} from "@/lib";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {PlusCircle, X} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";
import {PostFeed} from "@/components/posts/PostFeed";

export default function GroupProfile() {
    const searchParams = useSearchParams();
    const groupId = searchParams.get("groupId");
    const [group, setGroup] = useState<Group>();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postDescription, setPostDescription] = useState("");
    const [postFiles, setPostFiles] = useState<File[]>([]);
    const {user} = useAuth();

    useEffect(() => {
        if (!groupId) return;
        api.group.getById(groupId).then(r => setGroup(r.data));
        api.post.searchPosts(groupId).then(r => setPosts(r.data));
    }, [groupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const post: PostDTO = {
            groupId: groupId as string,
            ownerId: user?.id,
            postType: PostType.GROUP,
            description: postDescription,
        };

        try {
            await api.post.createPost(post, postFiles);
            setPostDescription("");
            setPostFiles([]);
            setIsModalOpen(false);

            const refreshed = await api.post.searchPosts(groupId as string, undefined, PostType.GROUP);
            setPosts(refreshed.data);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-2xl">
            {/* Информация о группе */}
            {group ? (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{group.name}</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{group.description}</p>
                    <span
                        className="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full">
                        {group.accessType}
                    </span>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Loading group...</p>
            )}

            {/* Кнопка открытия модалки */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition-colors"
                >
                    <PlusCircle className="w-5 h-5 mr-2"/>
                    Create Post
                </button>
            </div>

            {/* Лента постов */}
            <div className="space-y-4">
                <PostFeed posts={posts}/>
            </div>

            {/* Модалка */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl">
                        {/* Кнопка закрытия */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        >
                            <X size={24}/>
                        </button>

                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create a new post</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Описание */}
                            <div>
                                <label htmlFor="description"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={postDescription}
                                    onChange={(e) => setPostDescription(e.target.value)}
                                    rows={4}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="What's on your mind?"
                                />
                            </div>

                            {/* Файлы */}
                            <div>
                                <label htmlFor="files"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Attach media
                                </label>
                                <input
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={(e) => setPostFiles(Array.from(e.target.files || []))}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400"
                                />
                            </div>

                            {/* Кнопка отправки */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <PlusCircle className="w-5 h-5 mr-2"/>
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

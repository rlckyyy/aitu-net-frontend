'use client'

import React, {useEffect, useState} from "react";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {api} from "@/lib";
import {useAuth} from "@/context/AuthProvider";
import clsx from "clsx";
import {MediaFiles} from "@/components/MediaFiles";

export default function HomeFeed() {
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostFiles, setNewPostFiles] = useState<File[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const {user} = useAuth();


    useEffect(() => {
        api.post
            .searchPosts(undefined, undefined, undefined, undefined)
            .then((r) => setPosts(r.data));
    });


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewPostFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newPost: PostDTO = {
            ownerId: user?.id,
            postType: PostType.USER,
            description: newPostDescription,
        };

        try {
            await api.post.createPost(newPost, newPostFiles);
            setNewPostDescription("");
            setNewPostFiles([]);
            setIsCreatePostModalOpen(false);

            const response = await api.post.searchPosts(undefined, user?.id, PostType.USER, undefined);
            setPosts(response.data);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            {/* Кнопка "Создать пост" */}
            {user && (<div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                >
                    + New Post
                </button>
            </div>)}

            {/* Модальное окно */}
            {isCreatePostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transition-transform duration-300 scale-100 animate-fade-in">
                        {/* Кнопка закрытия */}
                        <button
                            onClick={() => setIsCreatePostModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
                        >
                            ×
                        </button>

                        {/* Форма создания поста */}
                        <form onSubmit={handleSubmit} className="mt-4">
              <textarea
                  value={newPostDescription}
                  onChange={(e) => setNewPostDescription(e.target.value)}
                  placeholder="Write something amazing..."
                  className="w-full h-32 p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-900 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="mb-4 w-full text-sm text-gray-600 dark:text-gray-300"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors duration-200"
                                >
                                    Add Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Лента постов */}
            <div className="space-y-4 mt-6">
                {posts === null ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No posts yet</p>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <p
                                className={clsx(
                                    "text-sm mb-2",
                                    post.description
                                        ? "text-gray-800 dark:text-gray-200"
                                        : "italic text-gray-500 dark:text-gray-400"
                                )}
                            >
                                {post.description}
                            </p>

                            {post.mediaFileIds && post.mediaFileIds.length > 0 && (
                                <MediaFiles mediaFileIds={post.mediaFileIds}/>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

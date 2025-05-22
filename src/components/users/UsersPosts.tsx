'use client'

import React, {useEffect, useState} from "react";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {api} from "@/lib";
import {FileText, Plus} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";
import {PostFeed} from "@/components/posts/PostFeed";


export default function UserPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostFiles, setNewPostFiles] = useState<File[]>([]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const {user} = useAuth();

    useEffect(() => {
        api.post.searchPosts(undefined, user?.id, PostType.USER, undefined)
            .then(r => setPosts(r.data));
    }, [user?.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewPostFiles(Array.from(e.target.files));
        }
    };
    const handleDeletePost = (postId: string) => {
        setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
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
            api.post
                .searchPosts(undefined, user?.id, PostType.USER, undefined)
                .then((r) => setPosts(r.data));
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2"/>
                    Posts
                </h2>
            </div>

            {/* Форма для добавления нового поста */}
            <div>
                <button
                    onClick={() => setIsCreatePostModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2"/>
                    Add Post
                </button>

                {/* Модальное окно */}
                {isCreatePostModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transition-transform duration-300 scale-100 animate-fade-in">
                            <button
                                onClick={() => setIsCreatePostModalOpen(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
                            >
                                ×
                            </button>
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
            </div>

            {/* Список постов */}
            <div className="space-y-4">
                <PostFeed posts={posts} onDelete={handleDeletePost}/>
            </div>
        </div>
    );
}

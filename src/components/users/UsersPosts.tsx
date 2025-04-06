'use client'

import React, {useEffect, useState} from "react";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {api} from "@/lib";
import {FileText, ImageIcon, Plus} from "lucide-react";
import clsx from "clsx";

interface UserPostsProps {
    userId: string;
}

export const MediaFiles = ({mediaFileIds}: { mediaFileIds: string[] }) => {
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    const getFileType = async (url: string) => {
        console.log("getFileType", url);
        const fileExtension = url.split('.').pop()?.toLowerCase();
        if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png" || fileExtension === "gif") {
            return "image";
        }

        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentType = response.headers.get('Content-Type') || '';
            console.log(contentType);
            if (contentType.includes('image')) {
                return 'image';
            }
            if (contentType.includes('video')) {
                return 'video';
            }
            if (contentType.includes('audio')) {
                return 'audio';
            }
            return 'unknown';
        } catch (error) {
            console.error("Error fetching file type:", error);
            return 'unknown';
        }
    };

    useEffect(() => {
        const fetchFileTypes = async () => {
            const types = await Promise.all(mediaFileIds.map(url => getFileType(url)));
            setFileTypes(types);
        };

        fetchFileTypes();
    }, [mediaFileIds]);

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {mediaFileIds.map((fileId, idx) => (
                <div
                    key={idx}
                    className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center border border-gray-300 dark:border-gray-600"
                >
                    {fileTypes[idx] === 'image' ? (
                        <img
                            src={fileId}
                            alt={`media-${idx}`}
                            className="w-full h-full object-cover"
                        />
                    ) : fileTypes[idx] === 'video' ? (
                        <video controls className="w-full h-full object-cover">
                            <source src={fileId} type="video/mp4"/>
                            Ваш браузер не поддерживает видео.
                        </video>
                    ) : fileTypes[idx] === 'audio' ? (
                        <audio controls className="w-full h-full object-cover">
                            <source src={fileId} type="audio/mp3"/>
                            Ваш браузер не поддерживает аудио.
                        </audio>
                    ) : (
                        <div className="text-gray-400">Unsupported file type</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default function UserPosts({userId}: UserPostsProps) {
    const [posts, setPosts] = useState<Post[] | null>(null);
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostFiles, setNewPostFiles] = useState<File[]>([]);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [files, setFiles] = useState<File[] | null>(null);

    useEffect(() => {
        api.post.searchPosts(undefined, userId, PostType.USER, undefined)
            .then(r => setPosts(r.data));

    }, [userId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewPostFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPost: PostDTO = {
            ownerId: userId,
            postType: PostType.USER,
            description: newPostDescription,
        };

        try {
            await api.post.createPost(newPost, newPostFiles);
            setNewPostDescription("");
            setNewPostFiles([]);
            api.post
                .searchPosts(undefined, userId, PostType.USER, undefined)
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
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                        <div
                            className="bg-white rounded-lg shadow-lg w-96 p-6 transform transition-transform duration-300 scale-100">
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={newPostDescription}
                                    onChange={(e) => setNewPostDescription(e.target.value)}
                                    placeholder="Write a new post..."
                                    className="w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="mb-4"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
                                    >
                                        Add Post
                                    </button>
                                </div>
                            </form>
                            <button
                                onClick={() => setIsCreatePostModalOpen(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                X
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Список постов */}
            <div className="space-y-4 mt-4"> {/* Добавлен отступ сверху */}
                {posts === null ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No posts yet</p>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <p
                                className={clsx(
                                    "text-sm mb-2",
                                    post.description
                                        ? "text-gray-800 dark:text-gray-300"
                                        : "italic text-gray-500 dark:text-gray-400"
                                )}
                            >
                                {post.description || "No description"}
                            </p>

                            {/* Отображение медиафайлов */}
                            {post.mediaFileIds && post.mediaFileIds.length > 0 && (
                                <MediaFiles mediaFileIds={post.mediaFileIds} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

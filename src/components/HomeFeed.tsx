'use client'

import React, {useEffect, useState} from "react";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {api} from "@/lib";
import {useAuth} from "@/context/AuthProvider";
import {PostFeed} from "@/components/posts/PostFeed";
import {
    X,
    Image,
    Video,
    FileText,
    Send,
    Smile,
    MapPin,
    Calendar,
    Users,
    Globe,
    Lock,
    Plus
} from "lucide-react";
import {defaultPfp} from "../../public/modules/defaultPfp";


export default function HomeFeed() {
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostFiles, setNewPostFiles] = useState<File[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const {user} = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [previewFiles, setPreviewFiles] = useState<string[]>([]);

    useEffect(() => {
        api.post
            .searchPosts(undefined, undefined, undefined, undefined)
            .then((r) => {
                const sortedPosts = [...r.data].sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                });
                setPosts(sortedPosts);
            });
    }, []);

    const handleDeletePost = (postId: string) => {
        setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewPostFiles(files);

            // Создаем превью для изображений
            const previews: string[] = [];
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            previews.push(e.target.result as string);
                            if (previews.length === files.filter(f => f.type.startsWith('image/')).length) {
                                setPreviewFiles(previews);
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            setNewPostFiles(files);

            // Создаем превью
            const previews: string[] = [];
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            previews.push(e.target.result as string);
                            if (previews.length === files.filter(f => f.type.startsWith('image/')).length) {
                                setPreviewFiles(previews);
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    const removeFile = (index: number) => {
        const updatedFiles = newPostFiles.filter((_, i) => i !== index);
        const updatedPreviews = previewFiles.filter((_, i) => i !== index);
        setNewPostFiles(updatedFiles);
        setPreviewFiles(updatedPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || (!newPostDescription.trim() && newPostFiles.length === 0)) return;

        setIsSubmitting(true);
        const newPost: PostDTO = {
            ownerId: user?.id,
            postType: PostType.USER,
            description: newPostDescription,
        };

        try {
            await api.post.createPost(newPost, newPostFiles);
            setNewPostDescription("");
            setNewPostFiles([]);
            setPreviewFiles([]);
            setIsCreatePostModalOpen(false);

            const response = await api.post.searchPosts(undefined, user?.id, PostType.USER, undefined);
            setPosts(response.data);
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsCreatePostModalOpen(false);
        setNewPostDescription("");
        setNewPostFiles([]);
        setPreviewFiles([]);
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            {/* Quick Post Creator */}
            {user && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <img
                            src={user?.avatar?.location || defaultPfp}
                            alt="Your avatar"
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                        />
                        <button
                            onClick={() => setIsCreatePostModalOpen(true)}
                            className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full px-6 py-3 text-left transition-all duration-200 hover:shadow-md"
                        >
                            What's on your mind, {user?.username || user?.email}?
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsCreatePostModalOpen(true)}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                            >
                                <Image className="w-5 h-5 text-green-500" />
                                <span className="font-medium">Photo</span>
                            </button>
                            <button
                                onClick={() => setIsCreatePostModalOpen(true)}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                            >
                                <Video className="w-5 h-5 text-blue-500" />
                                <span className="font-medium">Video</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Modal */}
            {isCreatePostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Post</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                            <form onSubmit={handleSubmit} className="p-6">
                                {/* User Info */}
                                <div className="flex items-center space-x-3 mb-6">
                                    <img
                                        src={user?.avatar?.location || defaultPfp}
                                        alt="Your avatar"
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {user?.username || user?.email}
                                        </h3>
                                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Globe className="w-4 h-4" />
                                            <span>Public</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Text Area */}
                                <div className="mb-6">
                                    <textarea
                                        value={newPostDescription}
                                        onChange={(e) => setNewPostDescription(e.target.value)}
                                        placeholder="What's happening?"
                                        className="w-full min-h-[120px] p-4 text-lg placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-gray-900 dark:text-white resize-none border-none outline-none"
                                        rows={4}
                                    />
                                </div>

                                {/* File Upload Area */}
                                <div
                                    className={`relative border-2 border-dashed rounded-2xl p-8 mb-6 transition-all duration-300 ${
                                        dragActive
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*,video/*"
                                    />

                                    {newPostFiles.length === 0 ? (
                                        <div className="text-center">
                                            <div className="flex justify-center mb-4">
                                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                                                    <Plus className="w-8 h-8 text-gray-400" />
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                Drag and drop files here, or click to select
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                Support for images and videos
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Selected Files ({newPostFiles.length})
                                            </h4>

                                            {/* File Previews */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {newPostFiles.map((file, index) => (
                                                    <div key={index} className="relative group">
                                                        {file.type.startsWith('image/') && previewFiles[index] ? (
                                                            <img
                                                                src={previewFiles[index]}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-xl"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                                                {file.type.startsWith('video/') ? (
                                                                    <Video className="w-8 h-8 text-gray-400" />
                                                                ) : (
                                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                                )}
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>

                                                        <div className="absolute bottom-2 left-2 right-2">
                                                            <p className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate">
                                                                {file.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                                        >
                                            <Image className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                                        >
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                                        >
                                            <MapPin className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || (!newPostDescription.trim() && newPostFiles.length === 0)}
                                            className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                                                isSubmitting || (!newPostDescription.trim() && newPostFiles.length === 0)
                                                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Publishing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>Publish</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
                <PostFeed posts={posts} onDelete={handleDeletePost}/>
            </div>
        </div>
    );
}
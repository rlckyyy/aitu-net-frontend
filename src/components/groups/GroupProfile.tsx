'use client'

import {useSearchParams} from "next/navigation";
import {Group} from "@/models/group/group";
import React, {useCallback, useEffect, useState} from "react";
import {api} from "@/lib";
import {Post, PostDTO, PostType} from "@/models/post/post";
import {
    AlertCircle,
    Calendar,
    Camera,
    FileText,
    Image as ImageIcon,
    Paperclip,
    PlusCircle,
    Send,
    Users,
    Video,
    X
} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";
import {PostFeed} from "@/components/posts/PostFeed";
import {defaultPfp} from "../../../public/modules/defaultPfp";

export default function GroupProfile() {
    const searchParams = useSearchParams();
    const groupId = searchParams.get("groupId");
    const [group, setGroup] = useState<Group>();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [postDescription, setPostDescription] = useState("");
    const [postFiles, setPostFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const {user} = useAuth();

    // Fetch group data and posts
    useEffect(() => {
        if (!groupId) return;

        const fetchGroupData = async () => {
            setLoading(true);
            try {
                const [groupResponse, postsResponse] = await Promise.all([
                    api.group.getById(groupId),
                    api.post.searchPosts(groupId)
                ]);

                setGroup(groupResponse.data);
                setPosts(postsResponse.data);
            } catch (error) {
                console.error("Error fetching group data:", error);
                setError("Failed to load group information");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupData();
    }, [groupId]);

    // Handle post submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!postDescription.trim()) {
            setError("Please enter a description for your post");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const post: PostDTO = {
            groupId: groupId as string,
            ownerId: user?.id,
            postType: PostType.GROUP,
            description: postDescription.trim(),
        };

        try {
            await api.post.createPost(post, postFiles);

            // Reset form
            setPostDescription("");
            setPostFiles([]);
            setIsModalOpen(false);

            // Refresh posts
            setLoadingPosts(true);
            const refreshed = await api.post.searchPosts(groupId as string, undefined, PostType.GROUP);
            setPosts(refreshed.data);
        } catch (error) {
            console.error("Error creating post:", error);
            setError("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
            setLoadingPosts(false);
        }
    }, [postDescription, postFiles, groupId, user?.id]);

    // Handle post deletion
    const handleDeletePost = useCallback((postId: string) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }, []);

    // Handle file selection
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate files
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        setPostFiles(validFiles);
        if (validFiles.length !== files.length) {
            setTimeout(() => setError(""), 5000);
        }
    }, []);

    // Close modal handler
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setPostDescription("");
        setPostFiles([]);
        setError("");
    }, []);

    // Get file type icon
    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <ImageIcon size={16}/>;
        if (file.type.startsWith('video/')) return <Video size={16}/>;
        return <Paperclip size={16}/>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading group...</p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Group Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The group you're looking for doesn't exist or has been removed.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Group Header Card */}
                <div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
                    {/* Cover Photo */}
                    <div className="h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
                        <div className="absolute inset-0 bg-black/20"></div>

                        {/* Group Avatar */}
                        <div className="absolute -bottom-20 left-8">
                            <div className="relative">
                                <img
                                    src={group.avatar?.location || defaultPfp}
                                    alt={`${group.name} avatar`}
                                    className="w-40 h-40 rounded-full border-6 border-white dark:border-gray-800 object-cover bg-white shadow-2xl"
                                />
                                <div
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <Camera size={16} className="text-white"/>
                                </div>
                            </div>
                        </div>

                        {/* Create Post Button */}
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 font-medium"
                            >
                                <PlusCircle size={18} className="mr-2"/>
                                Create Post
                            </button>
                        </div>
                    </div>

                    {/* Group Information */}
                    <div className="pt-24 px-8 pb-8">
                        <div className="max-w-4xl">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {group.name}
                            </h1>

                            {group.description && (
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    {group.description}
                                </p>
                            )}

                            {/* Group Stats */}
                            <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Users size={20} className="mr-2"/>
                                    <span className="font-medium">Members</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar size={20} className="mr-2"/>
                                    <span>Created {new Date().getFullYear()}</span>
                                </div>
                                <div className="flex items-center">
                                    <FileText size={20} className="mr-2"/>
                                    <span>{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <FileText className="w-4 h-4 text-white"/>
                                </div>
                                Group Posts
                            </h2>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div
                                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <div className="flex items-center">
                                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 mr-2"/>
                                    <p className="text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Posts Feed */}
                        {loadingPosts ? (
                            <div className="flex justify-center py-12">
                                <div
                                    className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : posts.length > 0 ? (
                            <PostFeed posts={posts} onDelete={handleDeletePost}/>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No posts yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Be the first to share something with the group!
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                >
                                    <PlusCircle size={18} className="mr-2"/>
                                    Create First Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Post Modal */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div
                                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Create New Post
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24}/>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                                {error && (
                                    <div
                                        className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                        <div className="flex items-center">
                                            <AlertCircle size={20} className="text-red-600 dark:text-red-400 mr-2"/>
                                            <p className="text-red-700 dark:text-red-400">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Post Description */}
                                    <div>
                                        <label htmlFor="description"
                                               className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            What's on your mind?
                                        </label>
                                        <textarea
                                            id="description"
                                            value={postDescription}
                                            onChange={(e) => setPostDescription(e.target.value)}
                                            rows={6}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50 transition-colors"
                                            placeholder="Share your thoughts with the group..."
                                        />
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {postDescription.length}/500 characters
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label htmlFor="files"
                                               className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Attach Media
                                        </label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                                            <input
                                                id="files"
                                                type="file"
                                                multiple
                                                accept="image/*,video/*,.pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                disabled={isSubmitting}
                                                className="hidden"
                                            />
                                            <label htmlFor="files" className="cursor-pointer">
                                                <div className="flex flex-col items-center">
                                                    <Paperclip className="w-8 h-8 text-gray-400 mb-2"/>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Click to select files or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        Maximum file size: 10MB
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Selected Files */}
                                        {postFiles.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Selected Files:
                                                </p>
                                                {postFiles.map((file, index) => (
                                                    <div key={index}
                                                         className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                        <div className="flex items-center">
                                                            {getFileIcon(file)}
                                                            <span
                                                                className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                                {file.name}
                              </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPostFiles(files => files.filter((_, i) => i !== index))}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <X size={16}/>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !postDescription.trim()}
                                            className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div
                                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={18} className="mr-2"/>
                                                    Publish Post
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
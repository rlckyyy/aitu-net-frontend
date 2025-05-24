'use client'

import {Group, GroupCreateDto} from "@/models/group/group";
import React, {useEffect, useState} from "react";
import {api} from "@/lib";
import {FileText, Plus, Users, Lock, Globe, Upload, X, Camera} from "lucide-react";
import {AccessType} from "@/models/group/accessType";
import {Post, PostType} from "@/models/post/post";
import Link from "next/link";
import {PostFeed} from "@/components/posts/PostFeed";
import {defaultPfp} from "../../../public/modules/defaultPfp";

export default function GroupManagePage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [groupName, setGroupName] = useState<string>("");
    const [groupDescription, setGroupDescription] = useState<string>("");
    const [accessType, setAccessType] = useState<AccessType>(AccessType.PUBLIC);
    const [posts, setPosts] = useState<Post[]>([]);
    const [avatar, setAvatar] = useState<File>();
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [postsResponse, groupsResponse] = await Promise.all([
                    api.post.searchPosts(undefined, undefined, PostType.GROUP, undefined),
                    api.group.searchGroups()
                ]);
                setPosts(postsResponse.data);
                setGroups(groupsResponse.data as Group[]);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        loadData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatar(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePost = (postId: string) => {
        setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
    };

    const resetForm = () => {
        setGroupName("");
        setGroupDescription("");
        setAccessType(AccessType.PUBLIC);
        setAvatar(undefined);
        setAvatarPreview("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const group: GroupCreateDto = {
            name: groupName,
            description: groupDescription,
            accessType: accessType
        };

        try {
            await api.group.createGroup(group, avatar);
            resetForm();
            setIsCreateGroupModalOpen(false);
            const response = await api.group.searchGroups();
            setGroups(response.data);
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsCreateGroupModalOpen(false);
        resetForm();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                        <FileText className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Group Feed
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Discover and manage your communities
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCreateGroupModalOpen(true)}
                                    className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Plus className="w-5 h-5"/>
                                        <span>Create Group</span>
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                                </button>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-indigo-600"/>
                                    Recent Group Posts
                                </h2>
                                <PostFeed posts={posts} onDelete={handleDeletePost}/>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                                    <Users className="w-5 h-5 text-white"/>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Groups
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {groups.slice(0, 5).map(group => (
                                    <Link
                                        key={group.id}
                                        href={`/group/profile?groupId=${group.id}`}
                                        className="group block"
                                    >
                                        <div className="p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl hover:bg-white dark:hover:bg-gray-600/50 border border-gray-200/50 dark:border-gray-600/30 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <img
                                                        src={group.avatar?.location || defaultPfp}
                                                        alt={group.name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white dark:border-gray-700"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                        {group.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {group.description}
                                                    </p>
                                                    <div className="flex items-center mt-1">
                                                        {group.accessType === AccessType.PRIVATE ? (
                                                            <Lock className="w-3 h-3 text-gray-400 mr-1"/>
                                                        ) : (
                                                            <Globe className="w-3 h-3 text-gray-400 mr-1"/>
                                                        )}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                            {group.accessType.toLowerCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {groups.length > 5 && (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-lg py-2 px-4">
                                            + {groups.length - 5} more groups
                                        </p>
                                    </div>
                                )}

                                {groups.length === 0 && (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"/>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            No groups yet. Create your first group to get started!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Group Modal */}
            {isCreateGroupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 dark:border-gray-700/30 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Plus className="w-5 h-5"/>
                                    </div>
                                    <h3 className="text-xl font-bold">Create New Group</h3>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Avatar Upload */}
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera className="w-8 h-8 text-gray-400"/>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                                        <Upload className="w-4 h-4"/>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Click to upload group avatar
                                </p>
                            </div>

                            {/* Group Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Group Name *
                                </label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Enter group name"
                                    required
                                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Group Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    placeholder="Describe your group..."
                                    rows={3}
                                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Access Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Privacy Setting
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAccessType(AccessType.PUBLIC)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                            accessType === AccessType.PUBLIC
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                                        <Globe className={`w-6 h-6 mx-auto mb-2 ${
                                            accessType === AccessType.PUBLIC ? 'text-indigo-600' : 'text-gray-400'
                                        }`}/>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">Public</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Anyone can join</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccessType(AccessType.PRIVATE)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                            accessType === AccessType.PRIVATE
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }`}
                                    >
                                        <Lock className={`w-6 h-6 mx-auto mb-2 ${
                                            accessType === AccessType.PRIVATE ? 'text-indigo-600' : 'text-gray-400'
                                        }`}/>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">Private</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Invite only</div>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !groupName.trim()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    'Create Group'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
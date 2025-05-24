"use client";

import {useCallback, useEffect, useState} from "react";
import type {User} from "@/models/User";
import {api} from "@/lib";
import {useRouter, useSearchParams} from "next/navigation";
import {AlertCircle, Calendar, FileText, Heart, Lock, Mail, MessageCircle, Shield, UserPlus, Users} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";
import {Post, PostType} from "@/models/post/post";
import {PostFeed} from "@/components/posts/PostFeed";
import {Loading} from "@/components/Loading";
import FriendsSideBar from "@/components/users/user/FriendsSideBar";
import {defaultPfp} from "../../../../public/modules/defaultPfp";
import {AccessType} from "@/models/group/accessType";

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [error, setError] = useState<string>("");

    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") || undefined;
    const router = useRouter();
    const {user: currUser, loadUser} = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        loadUser()
    }, []);

    useEffect(() => {
        if (currUser?.id === userId) {
            console.log("Redirecting to profile page");
            router.push("/users/profile");
        }
    }, [userId, currUser?.id, router]);

    useEffect(() => {
        if (!user || !currUser) return;

        const isPublic = user.accessType === AccessType.PUBLIC;
        const isFriend = currUser.friendList?.includes(user.id) ?? false;
        const isOwner = currUser.id === user.id;

        setIsOpen(isPublic || isFriend || isOwner);
    }, [user, currUser]);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.user.getUserById(userId);
                setUser(response.data);
            } catch (error) {
                console.error("Error loading user:", error);
                setError("Failed to load user profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    // Fetch user posts
    useEffect(() => {
        if (!userId || !isOpen) return;

        const fetchPosts = async () => {
            setIsLoadingPosts(true);

            try {
                const response = await api.post.searchPosts(undefined, userId, PostType.USER, undefined);
                setPosts(response.data);
            } catch (error) {
                console.error("Error while fetching posts", error);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [userId, isOpen]);

    // Handle post deletion
    const handleDeletePost = useCallback((postId: string) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }, []);

    // Handle message sending
    const handleSendMessage = useCallback(() => {
        if (user?.id) {
            router.push(`/chat?companionId=${user.id}`);
        }
    }, [user?.id, router]);

    // Handle friend request
    const handleSendFriendRequest = useCallback(async () => {
        if (!userId || sendingRequest) return;

        setSendingRequest(true);

        try {
            await api.friends.sendFriendRequest(userId);
            setFriendRequestSent(true);
        } catch (error: any) {
            console.error("Error sending friend request:", error);

            if (error.response?.status === 409) {
                setError("Friend request already pending");
            } else {
                setError("Failed to send friend request");
            }
        } finally {
            setSendingRequest(false);
        }
    }, [userId, sendingRequest]);

    // Loading state
    if (loading) {
        return <Loading/>;
    }

    // Error state
    if (error && !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The user profile you're looking for doesn't exist or has been removed.
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isFriend = currUser?.friendList?.includes(user.id) ?? false;
    const canSendFriendRequest = currUser && !isFriend && !friendRequestSent;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header Card */}
                <div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
                    {/* Cover Photo */}
                    <div className="relative h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                        <div className="absolute inset-0 bg-black/20"></div>

                        {/* Profile Picture */}
                        <div className="absolute -bottom-20 left-8">
                            <div className="relative">
                                <img
                                    src={user.avatar?.location || defaultPfp}
                                    alt={`${user.username}'s profile`}
                                    className="w-40 h-40 rounded-full border-6 border-white dark:border-gray-800 object-cover bg-white shadow-2xl"
                                />

                                {/* Online Status Indicator (if available) */}
                                <div
                                    className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-3 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {currUser && currUser.id !== user.id && (
                            <div className="absolute bottom-6 right-6 flex flex-wrap gap-3">
                                {isOpen && (
                                    <button
                                        onClick={handleSendMessage}
                                        className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 font-medium"
                                    >
                                        <MessageCircle size={18} className="mr-2"/>
                                        Message
                                    </button>
                                )}

                                {canSendFriendRequest && (
                                    <button
                                        onClick={handleSendFriendRequest}
                                        disabled={sendingRequest}
                                        className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                    >
                                        {sendingRequest ? (
                                            <div
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        ) : (
                                            <UserPlus size={18} className="mr-2"/>
                                        )}
                                        {sendingRequest ? "Sending..." : "Add Friend"}
                                    </button>
                                )}

                                {friendRequestSent && (
                                    <div
                                        className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-xl shadow-lg border border-green-200 font-medium">
                                        <Heart size={18} className="mr-2"/>
                                        Request Sent
                                    </div>
                                )}

                                {isFriend && (
                                    <div
                                        className="inline-flex items-center px-6 py-3 bg-emerald-100 text-emerald-800 rounded-xl shadow-lg border border-emerald-200 font-medium">
                                        <Users size={18} className="mr-2"/>
                                        Friends
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Content */}
                    <div className="pt-24 px-8 pb-8">
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Profile Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Name and Status */}
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                        {user.username}
                                    </h1>
                                    <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1"/>
                      Joined {new Date().getFullYear()}
                    </span>
                                    </div>
                                </div>

                                {/* Privacy Notice */}
                                {!isOpen && (
                                    <div
                                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                                        <div className="flex items-start">
                                            <Lock
                                                className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 mt-1 flex-shrink-0"/>
                                            <div>
                                                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                                    Private Profile
                                                </h3>
                                                <p className="text-amber-700 dark:text-amber-300">
                                                    This profile is private. Only friends can view detailed information
                                                    and posts.
                                                    {canSendFriendRequest && " Send a friend request to connect!"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Detailed Information - Only if accessible */}
                                {isOpen && (
                                    <>
                                        {/* Bio Section */}
                                        {user.description && (
                                            <div
                                                className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
                                                <div className="flex items-start">
                                                    <div
                                                        className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-white"/>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                            About {user.username}
                                                        </h3>
                                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {user.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Contact Information
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
                                                        <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                        <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <div
                                                        className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                                                        <Shield
                                                            className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                                                        <p className="text-gray-900 dark:text-white font-medium">
                                                            {user?.roles?.join(", ") || "Member"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sidebar - Only if accessible */}
                            {isOpen && (
                                <div className="lg:col-span-1">
                                    <FriendsSideBar userId={user.id}/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Section - Only if accessible */}
                {isOpen && (
                    <div
                        className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <div
                                        className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                        <FileText className="w-4 h-4 text-white"/>
                                    </div>
                                    {user.username}'s Posts
                                </h2>

                                {posts.length > 0 && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                    {posts.length} post{posts.length !== 1 ? 's' : ''}
                  </span>
                                )}
                            </div>

                            {isLoadingPosts ? (
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
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {user.username} hasn't shared any posts yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
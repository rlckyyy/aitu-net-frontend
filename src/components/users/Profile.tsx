"use client";

import {useAuth} from "@/context/AuthProvider";
import React, {useCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {api} from "@/lib";
import {Camera, Edit, FileText, Mail, Shield, Trash2, Upload, User} from "lucide-react";
import UserPosts from "@/components/users/UsersPosts";
import {Loading} from "@/components/Loading";
import FriendsSideBar from "@/components/users/user/FriendsSideBar";
import {defaultPfp} from "../../../public/modules/defaultPfp";

export default function Profile() {
    const {user, loadUser} = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const menuRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleUpload = useCallback(async () => {
        if (!selectedFile || !user) return;

        setIsUploading(true);
        setUploadError("");

        try {
            await api.user.uploadProfilePhoto(selectedFile);
            await loadUser();
            setSelectedFile(null);
        } catch (error) {
            console.error("Error with upload", error);
            setUploadError("Failed to upload photo. Please try again.");
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, user, loadUser]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setUploadError("File size must be less than 10MB");
                return;
            }

            if (!file.type.startsWith('image/')) {
                setUploadError("Please select an image file");
                return;
            }

            setUploadError("");
            setSelectedFile(file);
        }

        if (event.target) {
            event.target.value = '';
        }
    }, []);

    const handleDelete = useCallback(async () => {
        if (!user?.avatar) return;

        try {
            await api.user.deleteProfilePhoto();
            await loadUser();
            console.log("Photo deleted successfully");
        } catch (error) {
            console.error("Error deleting photo", error);
            setUploadError("Failed to delete photo. Please try again.");
        } finally {
            setMenuOpen(false);
        }
    }, [user?.avatar, loadUser]);

    const toggleMenu = useCallback(() => {
        setMenuOpen(prev => !prev);
        setUploadError("");
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
                setUploadError("");
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (selectedFile) {
            handleUpload();
        }
    }, [selectedFile, handleUpload]);

    if (!user) {
        return <Loading/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header Card */}
                <div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
                    {/* Cover Photo with Gradient */}
                    <div className="relative h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                        <div className="absolute inset-0 bg-black/20"></div>

                        {/* Profile Picture Section */}
                        <div className="absolute -bottom-20 left-8">
                            <div className="relative group">
                                <div className="relative">
                                    <img
                                        src={user?.avatar?.location || defaultPfp}
                                        alt={`${user.username}'s profile`}
                                        className="w-40 h-40 rounded-full border-6 border-white dark:border-gray-800 object-cover bg-white shadow-2xl transition-transform group-hover:scale-105"
                                    />

                                    {/* Upload Status Overlay */}
                                    {isUploading && (
                                        <div
                                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                            <div
                                                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Camera Button */}
                                <button
                                    onClick={toggleMenu}
                                    disabled={isUploading}
                                    className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                                    aria-label="Change profile picture"
                                >
                                    <Camera size={18}/>
                                </button>

                                {/* Photo Menu */}
                                {menuOpen && (
                                    <div
                                        ref={menuRef}
                                        className="absolute top-full left-0 mt-4 w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
                                    >
                                        {uploadError && (
                                            <div
                                                className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                                                <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                                            </div>
                                        )}

                                        <label
                                            htmlFor="fileInput"
                                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors"
                                        >
                                            <Upload size={18} className="mr-3 text-indigo-600 dark:text-indigo-400"/>
                                            <span className="font-medium">Upload new photo</span>
                                        </label>

                                        <input
                                            ref={fileInputRef}
                                            id="fileInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={isUploading}
                                        />

                                        {user?.avatar && (
                                            <button
                                                onClick={handleDelete}
                                                disabled={isUploading}
                                                className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={18} className="mr-3"/>
                                                <span className="font-medium">Delete photo</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <div className="absolute bottom-6 right-6">
                            <Link
                                href="/users/edit"
                                className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 font-medium"
                            >
                                <Edit size={18} className="mr-2"/>
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-24 px-8 pb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Profile Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Name and Basic Info */}
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                        {user.username}
                                    </h1>
                                    <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <User size={16} className="mr-1"/>
                      Member since {new Date().getFullYear()}
                    </span>
                                    </div>
                                </div>

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
                                                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
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

                                {/* Bio Section */}
                                {user?.description && (
                                    <div
                                        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
                                        <div className="flex items-start">
                                            <div
                                                className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                <FileText className="w-5 h-5 text-white"/>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                    About
                                                </h3>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {user.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <FriendsSideBar userId={user.id}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="w-4 h-4 text-white"/>
                            </div>
                            Posts & Activity
                        </h2>
                        <UserPosts/>
                    </div>
                </div>
            </div>
        </div>
    );
}
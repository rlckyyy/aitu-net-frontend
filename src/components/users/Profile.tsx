"use client";

import {useAuth} from "@/context/AuthProvider";
import type React from "react";
import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {api} from "@/lib";
import {Camera, Edit, FileText, Mail, Shield, Trash2, User, Users} from "lucide-react";
import UserPosts from "@/components/users/UsersPosts";
import {Loading} from "@/components/Loading";


export default function Profile() {
    const {user, loadUser} = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        handleUpload();
        setMenuOpen(false);
    }, [selectedFile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;
        try {
            await api.user.uploadProfilePhoto(selectedFile);
            alert("Successfully uploaded photo");
            loadUser();
        } catch (error) {
            console.error("Error with upload", error);
            alert("Error with upload");
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleDelete = () => {
        api.user.deleteProfilePhoto();
        console.log("Photo deleted");
        setMenuOpen(false);
        window.location.reload();
    };

    if (loading)
        return (
            <Loading/>
        );

    if (!user) return null;

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                <div className="absolute -bottom-16 left-8">
                    <div className="relative">
                        <img
                            src={user?.avatar?.location || "/def_pfp.svg"}
                            alt="Profile"
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                            onClick={toggleMenu}
                        />
                        <button
                            onClick={toggleMenu}
                            className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                        >
                            <Camera size={16}/>
                        </button>

                        {menuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute top-[calc(100%+8px)] left-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-10"
                            >
                                <label
                                    htmlFor="fileInput"
                                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <Camera size={16} className="mr-2"/>
                                    Update photo
                                </label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        handleFileChange(e);
                                        setMenuOpen(false);
                                    }}
                                />

                                <button
                                    onClick={() => {
                                        handleDelete();
                                        setMenuOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Trash2 size={16} className="mr-2"/>
                                    Delete Photo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-4 right-4">
                    <Link
                        href="/users/edit"
                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        <Edit size={16} className="mr-2"/>
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="pt-20 px-8 pb-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left column - User info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h1>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center">
                                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"/>
                                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                            </div>

                            <div className="flex items-center">
                                <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2"/>
                                <span
                                    className="text-gray-700 dark:text-gray-300">{user?.roles?.join(", ") || "Member"}</span>
                            </div>

                            {user?.description && (
                                <div className="flex items-start">
                                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 mt-1"/>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{user.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column - Friends */}
                    <div className="flex-1">
                        <div
                            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                                    <Users className="w-5 h-5 mr-2"/>
                                    Friends
                                </h2>
                                <Link href="/friends/list"
                                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                    View all
                                </Link>
                            </div>

                            {user?.friendList && user.friendList.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {user.friendList.slice(0, 4).map((friend, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                                <User size={16}/>
                                            </div>
                                            <span
                                                className="text-sm text-gray-700 dark:text-gray-300 truncate">{friend}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No friends yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-8 pb-8">
                <UserPosts/>
            </div>
        </div>
    );
}

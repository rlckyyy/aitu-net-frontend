'use client';

import {useAuth} from '@/context/AuthProvider';
import React, {useEffect, useRef, useState} from 'react';
import Link from "next/link";
import {api} from "@/lib";

export default function Profile() {
    const {user, loadUser} = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        loadUser()
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

    if (loading) return <p>Загрузка...</p>;
    if (!user) return null;

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }
    const handleDelete = () => {
        api.user.deleteProfilePhoto();
        console.log("Photo deleted");
        setMenuOpen(false);
        window.location.reload();
    };

    return (
        <div className="flex pl-10 justify-betweenш items-center">
            <div className="flex flex-col items-center mr-20 relative">
                <img
                    src={user?.avatar?.location || "/def_pfp.svg"}
                    alt="Profile"
                    className="w-32 h-38 rounded-full cursor-pointer"
                    onClick={toggleMenu}
                />

                {menuOpen && (
                    <div
                        ref={menuRef}
                        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-40 bg-white shadow-md rounded-lg border border-gray-200"
                    >
                        <label
                            htmlFor="fileInput"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                            Update photo
                        </label>
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                handleFileChange(e)
                                setMenuOpen(false)
                            }}
                        />

                        <button
                            onClick={() => {
                                console.log("Фото удалено");
                                handleDelete();
                                setMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                            Delete Photo
                        </button>
                    </div>
                )}
            </div>


            <div className="max-w-md p-6 bg-gray-900 text-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold mb-4 text-blue-400">Profile</h1>

                <div className="space-y-2">
                    <p>
                        <span className="font-semibold text-gray-400">Username:</span> {user?.username}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-400">Email:</span> {user?.email}
                    </p>
                    <p>
                        <span
                            className="font-semibold text-gray-400">Friend List:</span> {user?.friendList?.join(", ") || "No friends"}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-400">Roles:</span> {user?.roles?.join(", ")}
                    </p>
                    {user?.description && (
                        <p>
                            <span className="font-semibold text-gray-400">Bio:</span> {user.description}
                        </p>
                    )}
                    <Link
                        href="/users/edit"
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 block"
                    >
                        Edit Profile
                    </Link>

                </div>
            </div>
        </div>
    )

}

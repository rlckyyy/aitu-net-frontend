'use client';

import {useAuth} from '@/context/AuthProvider';
import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {api} from "@/lib/api";

export default function Profile() {
    const {user, loadUser} = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        loadUser()
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !user) return;
        try {
            await api.uploadProfilePhoto(selectedFile);
            alert("Фото успешно обновлено!");
            loadUser();
        } catch (error) {
            console.error("Ошибка загрузки фото", error);
            alert("Ошибка загрузки фото");
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (!user) return null;
    const avatarUrl = "http://" + user?.avatar?.location;
    console.log(avatarUrl);
    return (
        <div className="flex justify-center items-center">
            {/* Image Block */}
            <div className="flex flex-col items-center" style={{
                width: preview ? "12%" : "12%",
            }}>
                <img src={avatarUrl} alt={"GANDON NETU FOTKI"}/>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 text-sm text-gray-400"
                />

                <button
                    onClick={handleUpload}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                    disabled={!selectedFile}
                >
                    Обновить фото
                </button>
            </div>

            <div className="max-w-md p-6 bg-gray-900 text-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold mb-4 text-blue-400">Профиль</h1>

                <div className="space-y-2">
                    <p>
                        <span className="font-semibold text-gray-400">ID:</span> {user?.id}
                    </p>
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
                    <p>
                        <span
                            className="font-semibold text-gray-400">Bio:</span> {user?.description ? user?.description : "Empty"}
                    </p>
                    <Link href="/users/edit" className="hover:text-blue-400 transition">Edit</Link>
                </div>
            </div>
        </div>
    )

}

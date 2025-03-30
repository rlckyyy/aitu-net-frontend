"use client";

import React, {useEffect, useState} from "react";
import {User} from "@/models/user";
import {api} from "@/lib";
import {useSearchParams} from "next/navigation";

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    useEffect(() => {
        if (typeof userId === "string") {
            setLoading(true);
            console.log("Fetching user data for ID:", userId);

            api.user.getUserById(userId)
                .then((data) => {
                    console.log("User data received:", data);
                    setUser(data.data);
                })
                .catch((e) => console.error("Ошибка загрузки пользователя:", e))
                .finally(() => setLoading(false));
        }
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not found</p>;

    return (
        <div className=" pl-10 justify-between items-center">
            <div className="flex flex-col mb-10 mr-20 relative">
                <img
                    src={user?.avatar?.location || "/def_pfp.svg"}
                    alt="Profile"
                    className="w-32 h-38 rounded-full cursor-pointer"
                />
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
                </div>
            </div>
        </div>
    );
}

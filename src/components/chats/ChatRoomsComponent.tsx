"use client";

import React, { useState, useMemo } from "react";
import { MessageCircle, Search, Users, Settings, Plus } from "lucide-react";
import Dropdown from "@/components/chats/DropDown";
import { ChatRoom } from "@/models/chat/ChatRoom";
import { useAuth } from "@/context/AuthProvider";
import { defaultPfp } from "../../../public/modules/defaultPfp";
import { Loading } from "@/components/Loading";

interface ChatRoomsPageProps {
    selectChat(chatId: string): void;
    chatRooms: Map<string, ChatRoom>;
    newMessagesCount: Map<string, number>;
    selectedChatId?: string;
}

export const ChatRoomsComponent: React.FC<ChatRoomsPageProps> = ({
                                                                     selectChat,
                                                                     chatRooms,
                                                                     newMessagesCount,
                                                                     selectedChatId
                                                                 }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter chat rooms based on search query
    const filteredChatRooms = useMemo(() => {
        if (!chatRooms || !searchQuery.trim()) {
            return chatRooms ? [...chatRooms.values()] : [];
        }
        return [...chatRooms.values()].filter(chatRoom =>
            chatRoom.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [chatRooms, searchQuery]);

    // Remove the formatLastSeen function since lastActivity doesn't exist

    if (!user) {
        return <Loading />;
    }

    return (
        <aside className="w-full md:w-1/4 min-w-[280px] border-r border-gray-200 dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <MessageCircle size={18} className="text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Messages
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <Plus size={18} className="text-gray-600 dark:text-gray-400" />
                        </button>
                        <Dropdown />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search
                            size={16}
                            className="text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto flex-1 p-3">
                {filteredChatRooms.length > 0 ? (
                    <div className="space-y-2">
                        {filteredChatRooms.map((chatRoom: ChatRoom) => {
                            const isSelected = selectedChatId === chatRoom.chatId;
                            const unreadCount = newMessagesCount.get(chatRoom.chatId) || 0;

                            return (
                                <button
                                    key={chatRoom.id}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-left focus:outline-none group relative overflow-hidden ${
                                        isSelected
                                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-md scale-[1.02]"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm hover:scale-[1.01]"
                                    }`}
                                    onClick={() => selectChat(chatRoom.chatId)}
                                >
                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                                    )}

                                    {/* Avatar */}
                                    <div className="relative mr-3 flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm">
                                            <img
                                                src={user.avatar?.location || defaultPfp}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                            <Users
                                                size={20}
                                                className="text-indigo-600 dark:text-indigo-400"
                                                style={{ display: user.avatar?.location ? 'none' : 'block' }}
                                            />
                                        </div>
                                        {/* Online Status */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-pulse" />
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-sm font-semibold truncate ${
                                                isSelected
                                                    ? "text-indigo-900 dark:text-indigo-100"
                                                    : "text-gray-900 dark:text-white"
                                            }`}>
                                                {chatRoom.title}
                                            </p>
                                            {unreadCount > 0 && (
                                                <div className="ml-2 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-sm animate-bounce">
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate ${
                                            isSelected
                                                ? "text-indigo-700 dark:text-indigo-300"
                                                : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                            Click to view conversation
                                        </p>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState searchQuery={searchQuery} />
                )}
            </div>
        </aside>
    );
};

// Empty State Component
const EmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4 shadow-sm">
            {searchQuery ? (
                <Search size={28} className="text-indigo-500 dark:text-indigo-400" />
            ) : (
                <MessageCircle size={28} className="text-indigo-500 dark:text-indigo-400" />
            )}
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? "No matches found" : "No conversations yet"}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {searchQuery
                ? `No conversations match "${searchQuery}"`
                : "Start a new conversation to get chatting"
            }
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
            {searchQuery ? "Try a different search term" : "Search for users to start chatting"}
        </p>
    </div>
);
"use client";

import React from "react";
import {MessageCircle, Search} from "lucide-react";
import Dropdown from "@/components/chats/DropDown";
import {ChatRoom} from "@/models/chat/chatRoom";
import {useAuth} from "@/context/AuthProvider";
import {defaultPfp} from "../../../public/modules/defaultPfp";

interface ChatRoomsPageProps {
    selectChat(chatId: string): void;

    chatRooms: Map<string, ChatRoom>;
}

export const ChatRoomsComponent: React.FC<ChatRoomsPageProps> = ({selectChat, chatRooms}) => {
    const {user} = useAuth();

    return (
        <aside
            className="w-full md:w-1/4 min-w-[250px] border-r border-gray-200 dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Messages</h3>
                    <Dropdown/>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400"/>
                    </div>
                    <input
                        type="text"
                        placeholder="Search conversations"
                        className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
                {chatRooms ? (
                    <div className="space-y-1">
                        {[...chatRooms.values()].map((chatRoom: ChatRoom) => (
                            <button
                                key={chatRoom.id}
                                className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                onClick={() => selectChat(chatRoom.chatId)}
                            >
                                <div className="relative mr-3">
                                    <div
                                        className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <img
                                            src={user?.avatar?.location || defaultPfp}
                                            alt="Profile"
                                            className="w-15 h-12 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                                        />
                                    </div>
                                    <div
                                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{chatRoom.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Click to view
                                        conversation</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div
                            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-3">
                            <MessageCircle size={24}/>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Search for users to start
                            chatting</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

"use client";

import {ChatMessage, MessageType} from "@/models/chat/chatMessage";
import React, {JSX, RefObject, useEffect, useRef, useState} from "react";
import {InputMessageBarComponent} from "@/components/chats/InputMessageBarComponent";
import {ChatRoom} from "@/models/chat/chatRoom";
import {useAuth} from "@/context/AuthProvider";
import {Mic} from "lucide-react";
import {useIsMobile} from "@/hooks/useIsMobile";
import {Loading} from "@/components/Loading";
import {Client} from "@stomp/stompjs";
import AudioCall from "@/components/chats/AudioCallComponent";
import {ChatRoomDetails} from "@/components/chats/ChatRoomDetails";
import {defaultPfp} from "../../../public/modules/defaultPfp";

interface ChatWindowComponentProps {
    chatMessages: ChatMessage[];
    chatRoom: ChatRoom;
    stompClientRef: RefObject<Client | null>;

    selectChat(chatId: string): void

    handleSendMessage(chatMessage: ChatMessage): void;
}

export const ChatWindowComponent = ({
                                        chatRoom,
                                        chatMessages,
                                        stompClientRef,
                                        handleSendMessage,
                                        selectChat
                                    }: ChatWindowComponentProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {user} = useAuth();
    const audioRef = useRef<HTMLAudioElement>(null);
    const isMobile = useIsMobile();
    const [chatDetailsOpen, setChatDetailsOpen] = useState<boolean>(false);

    if (!user) {
        return <Loading/>
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    function displayChatMessage(chatMessage: ChatMessage) {
        const strategy = messageRenderStrategies[chatMessage.type];
        return strategy(chatMessage)
    }

    const messageRenderStrategies: Record<MessageType, (chatMessage: ChatMessage) => JSX.Element> = {
        [MessageType.MESSAGE_TEXT]: chatMessage =>
            (
                <div className="break-words">{chatMessage.content}</div>
            ),
        [MessageType.MESSAGE_AUDIO]: chatMessage =>
            (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 dark:bg-gray-700">
                    <Mic className="w-5 h-5 text-indigo-500 dark:text-indigo-300"/>
                    <audio ref={audioRef} preload={"auto"} controls src={chatMessage.content}
                           className="w-full focus:outline-none"/>
                </div>
            ),
        [MessageType.JOIN]: chatMessage =>
            (
                <div>{chatMessage.senderId} joined</div>
            ),
        [MessageType.LEAVE]: chatMessage =>
            (
                <div>{chatMessage.senderId} left</div>
            )
    }

    return (
        <main className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 w-full">
            {/* Mobile Back Button */}
            {isMobile && <div className="p-2">
                <button
                    onClick={() => selectChat("")}
                    className="text-sm text-indigo-500 hover:underline"
                >
                    ← Back
                </button>
            </div>}

            {chatDetailsOpen && <ChatRoomDetails chatRoom={chatRoom} setIsChatDetailsOpen={setChatDetailsOpen}/>}

            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <a
                    onClick={() => setChatDetailsOpen(true)}
                    className="flex w-max h-max">
                    <div className="relative mr-3">
                        <div
                            className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <img
                                src={user.avatar?.location || defaultPfp}
                                alt="Profile"
                                className="w-15 h-12 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                            />
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{chatRoom.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                    </div>
                </a>
                {stompClientRef && stompClientRef.current && <AudioCall stompClient={stompClientRef.current}
                                                                        localUserId={user.id}
                                                                        remoteUserId={chatRoom.participants.find(u => u.id !== user.id)!.id}
                />}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages ? (
                    chatMessages.map(chatMessage => (
                        <div key={chatMessage.id}
                             className={`flex ${chatMessage.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[85%] w-fit sm:w-[75%] rounded-lg px-4 py-2 ${
                                    chatMessage.senderId === user?.id
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                                }`}
                            >
                                <div className="max-w-full">
                                    {displayChatMessage(chatMessage)}
                                </div>
                                {chatMessage.createdAt && <div className="text-xs opacity-70 text-right mt-1">
                                    {new Date(chatMessage.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Start a
                                conversation</h3>
                            <p className="text-gray-500 dark:text-gray-400">Send your first message
                                to {chatRoom.title}</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>

            <InputMessageBarComponent title={chatRoom.title} handleSendMessage={handleSendMessage}
                                      chatId={chatRoom.chatId}/>
        </main>
    );
};

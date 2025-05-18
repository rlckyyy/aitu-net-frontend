"use client";

import {ChatMessage, ChatMessageStatus} from "@/models/chat/ChatMessage";
import React, {RefObject, useEffect, useRef, useState} from "react";
import {InputMessageBarComponent} from "@/components/chats/InputMessageBarComponent";
import {ChatRoom, ChatRoomType} from "@/models/chat/ChatRoom";
import {useAuth} from "@/context/AuthProvider";
import {useIsMobile} from "@/hooks/useIsMobile";
import {Loading} from "@/components/Loading";
import {Client, Message} from "@stomp/stompjs";
import AudioCall from "@/components/chats/messages/AudioCallComponent";
import {ChatRoomDetails} from "@/components/chats/ChatRoomDetails";
import {defaultPfp} from "../../../public/modules/defaultPfp";
import {MessageRenderer, MessageRendererProps} from "@/components/chats/messages/MessageRenderer";

interface ChatWindowComponentProps {
    chatMessages: ChatMessage[];
    chatRoom: ChatRoom;
    stompClientRef: RefObject<Client | null>;
    currentChatId: string;

    selectChat(chatId: string): void

    handleSendMessage(chatMessage: ChatMessage): void;

    markMessageAsRead(chatMessage: ChatMessage): void;
}

type ConnectionStatus = "OFFLINE" | "ONLINE"

interface StatusMessage {
    status: ConnectionStatus;
}

export const ChatWindowComponent = ({
                                        chatRoom,
                                        chatMessages,
                                        stompClientRef,
                                        currentChatId,
                                        handleSendMessage,
                                        selectChat,
                                        markMessageAsRead
                                    }: ChatWindowComponentProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const {user} = useAuth()
    const isMobile = useIsMobile()
    const [chatDetailsOpen, setChatDetailsOpen] = useState<boolean>(false)
    const [connStatus, setConnStatus] = useState<ConnectionStatus | undefined>(undefined)
    const messageRenderStrategies = MessageRenderer({markMessageAsRead} as MessageRendererProps)

    if (!user) {
        return <Loading/>
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth", inline: "nearest", block: "end"})
    }

    useEffect(() => {
        if (!currentChatId) return

        let destination: string
        if (chatRoom.chatRoomType === ChatRoomType.ONE_TO_ONE) {
            const companion = chatRoom.participants.filter(participant => participant.id !== user.id).pop()
            if (!companion) {
                throw new Error("Companion not present in one to one chat room")
            }

            companion.connected && setConnStatus(companion.connected ? "ONLINE" : "OFFLINE")

            destination = `/user/${companion.id}/queue/status`
            subscribeForStatus(destination)
        }

        return () => {
            destination && stompClientRef.current?.unsubscribe(destination)
        }
    }, [currentChatId])

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    function subscribeForStatus(destination: string) {
        stompClientRef.current?.subscribe(destination, onStatusReceived)
    }

    function onStatusReceived(message: Message) {
        const statusMessage: StatusMessage = JSON.parse(message.body)
        setConnStatus(statusMessage.status)
    }

    function displayChatMessage(chatMessage: ChatMessage) {
        return messageRenderStrategies[chatMessage.type](chatMessage)
    }

    function isFirstUnreadMessage(chatMessage: ChatMessage, index: number) {
        if (index === chatMessages.length - 1) {
            return messagesEndRef
        }
        return chatMessage.status === ChatMessageStatus.RECEIVED && messagesEndRef.current === null
            ? messagesEndRef
            : null
    }

    return (
        <main className="flex-1 flex flex-col h-screen bg-white dark:bg-gray-900 w-full">
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

            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">{connStatus}</p>
                    </div>
                </a>
                {stompClientRef && stompClientRef.current && <AudioCall stompClient={stompClientRef.current}
                                                                        localUserId={user.id}
                                                                        remoteUserId={chatRoom.participants.find(u => u.id !== user.id)!.id}
                />}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages ? (
                    chatMessages.map((chatMessage, index) => {
                        return (
                            <div key={chatMessage.id} ref={isFirstUnreadMessage(chatMessage, index)}>
                                {displayChatMessage(chatMessage)}
                            </div>
                        )
                    })
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
            </div>

            <InputMessageBarComponent title={chatRoom.title}
                                      handleSendMessage={handleSendMessage}
                                      chatId={chatRoom.chatId}
            />
        </main>
    )
}

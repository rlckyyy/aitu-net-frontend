"use client";

import {useChat} from "@/hooks/useChat";
import {ChatRoomsComponent} from "@/components/chats/ChatRoomsComponent";
import {ChatWindowComponent} from "@/components/chats/ChatWindowComponent";
import {useAuth} from "@/context/AuthProvider";
import {ChatMessage} from "@/models/chat/chatMessage";

export default function MessagingComponent() {
    const {user} = useAuth();
    const {chatRooms, chatRoomMessages, currentChatId, selectChat, sendMessage} = useChat();

    if (!user)
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );

    const handleSendMessage = (chatMessage: ChatMessage) => {
        if (!chatMessage.content.trim()) return;
        console.log(`Sending: ${chatMessage}`);
        chatMessage.chatId = ''

        sendMessage(chatMessage);
    };

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[calc(100vh-180px)]">
            <div className="flex h-full">
                <ChatRoomsComponent chatRooms={chatRooms} selectChat={selectChat}/>

                {currentChatId && chatRooms.has(currentChatId) ? (
                    <ChatWindowComponent
                        chatMessages={chatRoomMessages.get(currentChatId) || []}
                        chatRoom={chatRooms.get(currentChatId)!}
                        handleSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-8">
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
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Select a
                                conversation</h3>
                            <p className="text-gray-500 dark:text-gray-400">Choose a chat from the sidebar or start a
                                new conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

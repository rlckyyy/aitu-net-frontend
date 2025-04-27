"use client";

import {useChat} from "@/hooks/useChat";
import {ChatRoomsComponent} from "@/components/chats/ChatRoomsComponent";
import {ChatWindowComponent} from "@/components/chats/ChatWindowComponent";
import {useAuth} from "@/context/AuthProvider";
import {ChatMessage} from "@/models/chat/chatMessage";
import {useIsMobile} from "@/hooks/useIsMobile";
import {Loading} from "@/components/Loading";

export default function MessagingComponent() {
    const {user} = useAuth();
    const {chatRooms, chatRoomMessages, currentChatId,  stompClientRef,selectChat, sendMessage} = useChat();
    const isMobile = useIsMobile();

    if (!user || !stompClientRef.current)
        return (
            <Loading/>
        );

    const handleSendMessage = (chatMessage: ChatMessage) => {
        if (!chatMessage.content.trim()) return;
        console.log(`Sending: ${chatMessage}`);

        sendMessage(chatMessage);
    };

    return (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[calc(100vh-180px)]">
            <div className="flex h-full flex-col md:flex-row">
                {/* Chat Rooms Sidebar (mobile: only visible if no chat is selected) */}
                {isMobile ? ((!currentChatId || !chatRooms.has(currentChatId)) && (
                    <div className="flex flex-1">
                        <ChatRoomsComponent chatRooms={chatRooms} selectChat={selectChat} />
                    </div>
                )) : (
                    // Desktop Sidebar
                    <div className="md:flex">
                        <ChatRoomsComponent chatRooms={chatRooms} selectChat={selectChat} />
                    </div>
                )}

                {/* Chat Window */}
                {currentChatId && chatRooms.has(currentChatId) && (
                    <div className="flex flex-1">
                        <ChatWindowComponent
                            chatMessages={chatRoomMessages.get(currentChatId) || []}
                            chatRoom={chatRooms.get(currentChatId)!}
                            stompClientRef={stompClientRef}
                            handleSendMessage={handleSendMessage}
                            selectChat={selectChat}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

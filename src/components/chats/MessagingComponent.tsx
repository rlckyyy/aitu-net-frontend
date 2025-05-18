"use client";

import {useChat} from "@/hooks/useChat";
import {ChatRoomsComponent} from "@/components/chats/ChatRoomsComponent";
import {ChatWindowComponent} from "@/components/chats/ChatWindowComponent";
import {ChatMessage} from "@/models/chat/ChatMessage";
import {useIsMobile} from "@/hooks/useIsMobile";
import {Loading} from "@/components/Loading";

export default function MessagingComponent() {
    const {chatRooms, chatRoomMessages, currentChatId, stompClientRef, newMessagesCount, selectChat, sendMessage, markMessageAsRead} = useChat()
    const isMobile = useIsMobile()

    if (!stompClientRef.current)
        return (
            <Loading/>
        )

    const handleSendMessage = (chatMessage: ChatMessage) => {
        if (!chatMessage.content.trim()) return
        console.log(`Sending: ${chatMessage}`)

        sendMessage(chatMessage)
    }

    return (
        <div
            className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex h-screen flex-col md:flex-row">
                {/* Chat Rooms Sidebar (mobile: only visible if no chat is selected) */}
                {isMobile ? ((!currentChatId || !chatRooms.has(currentChatId)) && (
                    <div className="flex flex-1">
                        <ChatRoomsComponent chatRooms={chatRooms} selectChat={selectChat} newMessagesCount={newMessagesCount}/>
                    </div>
                )) : (
                    // Desktop Sidebar
                    <div className="md:flex">
                        <ChatRoomsComponent chatRooms={chatRooms} selectChat={selectChat} newMessagesCount={newMessagesCount}/>
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
                            currentChatId={currentChatId}
                            markMessageAsRead={markMessageAsRead}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

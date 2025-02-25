import {useChat} from "@/hooks/useChat";
import {ChatRoomsComponent} from "@/components/chats/ChatRoomsComponent";
import {ChatWindowComponent} from "@/components/chats/ChatWindowComponent";
import {useAuth} from "@/context/AuthProvider";
import React, {useState} from "react";
import {ChatMessage, ChatMessageStatus} from "@/models/chatMessage";

export default function MessagingComponent() {
    const {user} = useAuth();
    const {chatRooms, chatRoomMessages, currentChatId, currentCompanion, selectChat, sendMessage } = useChat();
    const [inputMessage, setInputMessage] = useState("");

    if (!user) return <div>Loading...</div>;

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        console.log(`Sending: ${inputMessage}`);
        const chatMessage: ChatMessage = {
            chatId: currentChatId,
            type: 'MESSAGE',
            content: inputMessage,
            recipient: currentCompanion,
            sender: user.email,
            status: ChatMessageStatus.DELIVERED,
            timestamp: new Date()
        }

        sendMessage(chatMessage)

        // Send message to backend and update chatRoomMessages...
        setInputMessage("");
    };

    return (
        <div className="h-screen bg-black text-gray-300 flex overflow-hidden">
            <ChatRoomsComponent selectChat={selectChat} chatRooms={chatRooms}/>
            {currentCompanion ? (
                <ChatWindowComponent
                    messages={chatRoomMessages.get(currentChatId) || []}
                    currentCompanion={currentCompanion}
                    handleSendMessage={handleSendMessage}
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    userEmail={user.email}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to start
                    messaging</div>
            )}
        </div>
    );
}

import React from "react";

interface ChatRoomsPageProps {
    selectChat: (chatId: string, companionEmail: string) => void,
    chatRooms: Map<string, ChatRoom>
}

export const ChatRoomsComponent: React.FC<ChatRoomsPageProps> = ({selectChat, chatRooms}) => {

    return (
        <aside className="w-1/4 bg-gray-900 p-4 h-screen shadow-lg flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Chats</h3>
            <ul className="space-y-2 overflow-y-auto flex-1">
                {[...chatRooms.values()].map((chatRoom: ChatRoom) => (
                    <li key={chatRoom.id}>
                        <button
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition text-left"
                            onClick={() => selectChat(chatRoom.chatId, chatRoom.recipient)}
                        >
                            {chatRoom.recipient}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    )
}
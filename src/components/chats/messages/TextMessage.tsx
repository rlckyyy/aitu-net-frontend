import React from "react";
import {MessageRenderProps} from "@/components/chats/messages/messageRenderProps";

export const TextMessage: React.FC<MessageRenderProps> = ({chatMessage, currentUser}) => {

    const isOwn = chatMessage.senderId === currentUser.id

    return (
        <div
             className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[85%] w-fit sm:w-[75%] rounded-lg px-4 py-2 ${
                    isOwn
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                }`}
            >
                <div className="max-w-full">
                    <div className="break-words">{chatMessage.content}</div>
                </div>
                {chatMessage.createdAt && <div className="text-xs opacity-70 text-right mt-1">
                    {new Date(chatMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
                }
            </div>
        </div>
    )
}
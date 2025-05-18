import React from "react";
import {MessageRenderProps} from "@/components/chats/messages/messageRenderProps";

export const AudioMessage: React.FC<MessageRenderProps> = ({chatMessage, currentUser, markMessageAsRead}) => {

    const isOwn = chatMessage.senderId === currentUser.id

    return (
        <>
            <div
                 className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <audio preload={"metadata"} controls src={chatMessage.content}
                       onPlay={() => markMessageAsRead(chatMessage)}
                >
                    <source type="audio/mp3"/>
                </audio>
            </div>
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
                {chatMessage.length} secs
            </div>
        </>
    )
}
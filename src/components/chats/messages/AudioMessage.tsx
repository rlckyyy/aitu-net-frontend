import React, {useRef} from "react";
import {MessageRenderProps} from "@/components/chats/messages/messageRenderProps";

export const AudioMessage: React.FC<MessageRenderProps> = ({chatMessage, currentUser}) => {

    const audioRef = useRef<HTMLAudioElement>(null)

    const isOwn = chatMessage.senderId === currentUser.id

    return (
        <>
            <div
                 className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <audio ref={audioRef} preload={"metadata"} controls src={chatMessage.content}
                >
                    <source type="audio/mp3"/>
                </audio>
            </div>
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>{`audio duration ${chatMessage.length} seconds`}</div>
        </>
    )
}
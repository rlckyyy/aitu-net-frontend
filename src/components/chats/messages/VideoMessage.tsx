import React, {useRef} from "react";
import {MessageRenderProps} from "@/components/chats/messages/messageRenderProps";

export const VideoMessage: React.FC<MessageRenderProps> = ({chatMessage, currentUser, markMessageAsRead}) => {

    const videoRef = useRef<HTMLVideoElement>(null)
    const isOwn = chatMessage.senderId === currentUser.id

    return (
        <>
            <div
                 className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <video ref={videoRef}
                       onClick={(e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
                           e.currentTarget.paused
                               ? e.currentTarget.play()
                               : e.currentTarget.pause()
                       }}
                       onPlay={() => markMessageAsRead(chatMessage)}
                       preload={"metadata"} playsInline={true} src={`${chatMessage.content}#t=0.5`}
                       className={"rounded-full object-cover w-[250px] h-[250px]"}
                >
                    <source type="video/mp4"/>
                </video>
            </div>
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
                {chatMessage.length} secs
            </div>
        </>
    )
}
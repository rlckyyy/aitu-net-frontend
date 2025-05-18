import {ChatMessage, MessageType} from "@/models/chat/ChatMessage";
import React, {JSX} from "react";
import {TextMessage} from "@/components/chats/messages/TextMessage";
import {AudioMessage} from "@/components/chats/messages/AudioMessage";
import {VideoMessage} from "@/components/chats/messages/VideoMessage";
import {useAuth} from "@/context/AuthProvider";

export interface MessageRendererProps {
    markMessageAsRead(chatMessage: ChatMessage): Promise<void>;
}

export const MessageRenderer = ({markMessageAsRead}: MessageRendererProps): Record<MessageType, (chatMessage: ChatMessage) => JSX.Element> => {
    const {user} = useAuth()

    if (!user) {
        throw new Error("No user")
    }

    return {
        [MessageType.MESSAGE_TEXT]: chatMessage =>
            (
                <TextMessage chatMessage={chatMessage} currentUser={user} markMessageAsRead={markMessageAsRead}/>
            ),
        [MessageType.MESSAGE_AUDIO]: chatMessage =>
            (
                <AudioMessage chatMessage={chatMessage} currentUser={user} markMessageAsRead={markMessageAsRead}/>
            ),
        [MessageType.MESSAGE_VIDEO]: chatMessage =>
            (
                <VideoMessage chatMessage={chatMessage} currentUser={user} markMessageAsRead={markMessageAsRead}/>
            ),
        [MessageType.JOIN]: chatMessage =>
            (
                <div>{chatMessage.senderId} joined</div>
            ),
        [MessageType.LEAVE]: chatMessage =>
            (
                <div>{chatMessage.senderId} left</div>
            )
    }
}
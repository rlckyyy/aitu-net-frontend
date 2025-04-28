"use client";

import React, {useState} from "react";
import {Send, Paperclip, Smile} from "lucide-react";
import {ChatMessage, ChatMessageStatus, MessageType} from "@/models/chat/chatMessage";
import {useAuth} from "@/context/AuthProvider";
import {VoiceRecorderComponent} from "@/components/chats/VoiceRecorderComponent";

interface InputMessageBarProps {
    handleSendMessage(chatMessage: ChatMessage): void;

    title: string;
    chatId: string;
}

export const InputMessageBarComponent: React.FC<InputMessageBarProps> = ({
                                                                             handleSendMessage,
                                                                             title,
                                                                             chatId,
                                                                         }) => {

    const {user} = useAuth();
    const [inputMessage, setInputMessage] = useState<string>('');

    function handleSubmitMessage() {
        if (!user) return
        if (!inputMessage.trim()) return;
        const chatMessage: ChatMessage = {
            chatId: chatId,
            type: MessageType.MESSAGE_TEXT,
            content: inputMessage,
            senderId: user.id,
            status: ChatMessageStatus.DELIVERED,
            createdAt: new Date(),
        };
        handleSendMessage(chatMessage)
        resetInput()
    }

    function resetInput() {
        setInputMessage('')
    }

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <button
                    className="shrink-0 p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                    <Paperclip size={20}/>
                </button>

                <input
                    type="text"
                    className="flex-1 min-w-0 py-2 px-3 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
                    placeholder={`Message ${title}...`}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSubmitMessage())}
                />

                <button
                    className="shrink-0 p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                    <Smile size={20}/>
                </button>

                <button
                    className={`shrink-0 p-2 ml-1 ${
                        inputMessage.trim()
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleSubmitMessage}
                    disabled={!inputMessage.trim()}
                >
                    <Send size={20}/>
                </button>
                {inputMessage.trim() ? null : (
                    <div className={"shrink-0"}>
                        <VoiceRecorderComponent chatId={chatId} handleSendMessage={handleSendMessage}/>
                    </div>
                )}
            </div>
        </div>
    );
};

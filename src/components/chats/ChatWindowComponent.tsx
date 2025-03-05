import {ChatMessage} from "@/models/chat/chatMessage";
import React from "react";
import {InputMessageBarComponent} from "@/components/chats/InputMessageBarComponent";

interface ChatWindowComponentProps {
    messages: ChatMessage[];
    currentCompanion: string;
    handleSendMessage: () => void,
    inputMessage: string;
    setInputMessage: (inputMessage: string) => void,
    userEmail: string;
}

export const ChatWindowComponent = ({
                                        messages,
                                        currentCompanion,
                                        handleSendMessage,
                                        inputMessage,
                                        setInputMessage,
                                        userEmail
                                    }: ChatWindowComponentProps) => {
    return (
        <main className="flex-1 p-6 flex flex-col h-screen overflow-hidden">
            <h1 className="text-2xl font-bold text-white">{currentCompanion}</h1>

            <div className="w-full bg-gray-900 p-4 rounded-lg shadow-lg mt-4 flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {messages.length > 0 ? (
                        messages.map((chatMessage) => (
                            <div
                                key={chatMessage.id}
                                className={`p-3 rounded max-w-[75%] ${
                                    chatMessage.sender === userEmail ? "bg-blue-600 text-white ml-auto" : "bg-gray-800 text-gray-300"
                                }`}
                            >
                                {chatMessage.content}
                                <div className={'text-xs text-gray-400 flex justify-end self-end mt-1'}>
                                    {new Date(chatMessage.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 flex items-center justify-center h-full">
                            You are messaging for the first time
                        </div>
                    )}
                </div>

                <InputMessageBarComponent currentCompanion={currentCompanion} handleSendMessage={handleSendMessage}
                                          inputMessage={inputMessage}
                                          setInputMessage={setInputMessage}/>
            </div>
        </main>
    );
}
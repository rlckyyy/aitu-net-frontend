"use client";

import {ChatMessage, ChatMessageStatus} from "@/models/chat/ChatMessage";
import React, {RefObject, useEffect, useRef, useState} from "react";
import {InputMessageBarComponent} from "@/components/chats/InputMessageBarComponent";
import {ChatRoom, ChatRoomType} from "@/models/chat/ChatRoom";
import {useAuth} from "@/context/AuthProvider";
import {useIsMobile} from "@/hooks/useIsMobile";
import {Loading} from "@/components/Loading";
import {Client, Message} from "@stomp/stompjs";
import AudioCall from "@/components/chats/messages/AudioCallComponent";
import {ChatRoomDetails} from "@/components/chats/ChatRoomDetails";
import {defaultPfp} from "../../../public/modules/defaultPfp";
import {MessageRenderer, MessageRendererProps} from "@/components/chats/messages/MessageRenderer";
import {ArrowLeft, MessageCircle, MoreVertical, Sparkles, Users, Video, Wifi, WifiOff} from "lucide-react";

interface ChatWindowComponentProps {
    chatMessages: ChatMessage[];
    chatRoom: ChatRoom;
    stompClientRef: RefObject<Client | null>;
    currentChatId: string;

    selectChat(chatId: string): void;

    handleSendMessage(chatMessage: ChatMessage): void;

    markMessageAsRead(chatMessage: ChatMessage): void;
}

type ConnectionStatus = "OFFLINE" | "ONLINE";

interface StatusMessage {
    status: ConnectionStatus;
}

export const ChatWindowComponent = ({
                                        chatRoom,
                                        chatMessages,
                                        stompClientRef,
                                        currentChatId,
                                        handleSendMessage,
                                        selectChat,
                                        markMessageAsRead
                                    }: ChatWindowComponentProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {user} = useAuth();
    const isMobile = useIsMobile();
    const [chatDetailsOpen, setChatDetailsOpen] = useState<boolean>(false);
    const [connStatus, setConnStatus] = useState<ConnectionStatus | undefined>(undefined);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messageRenderStrategies = MessageRenderer({markMessageAsRead} as MessageRendererProps);

    if (!user) {
        return <Loading/>;
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            inline: "nearest",
            block: "end"
        });
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = messagesContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setIsScrolledUp(!isNearBottom);
        }
    };

    useEffect(() => {
        if (!currentChatId) return;

        let destination: string;
        if (chatRoom.chatRoomType === ChatRoomType.ONE_TO_ONE) {
            const companion = chatRoom.participants.filter(participant => participant.id !== user.id).pop();
            if (!companion) {
                throw new Error("Companion not present in one to one chat room");
            }

            companion.connected && setConnStatus(companion.connected ? "ONLINE" : "OFFLINE");
            destination = `/user/${companion.id}/queue/status`;
            subscribeForStatus(destination);
        }

        return () => {
            destination && stompClientRef.current?.unsubscribe(destination);
        };
    }, [currentChatId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    function subscribeForStatus(destination: string) {
        stompClientRef.current?.subscribe(destination, onStatusReceived);
    }

    function onStatusReceived(message: Message) {
        const statusMessage: StatusMessage = JSON.parse(message.body);
        setConnStatus(statusMessage.status);
    }

    function displayChatMessage(chatMessage: ChatMessage) {
        return messageRenderStrategies[chatMessage.type](chatMessage);
    }

    function isFirstUnreadMessage(chatMessage: ChatMessage, index: number) {
        if (index === chatMessages.length - 1) {
            return messagesEndRef;
        }
        return chatMessage.status === ChatMessageStatus.RECEIVED && messagesEndRef.current === null
            ? messagesEndRef
            : null;
    }

    const getStatusColor = () => {
        switch (connStatus) {
            case "ONLINE":
                return "bg-green-500 shadow-green-500/50";
            case "OFFLINE":
                return "bg-gray-400 shadow-gray-400/50";
            default:
                return "bg-yellow-400 shadow-yellow-400/50 animate-pulse";
        }
    };

    const getStatusText = () => {
        switch (connStatus) {
            case "ONLINE":
                return "Online";
            case "OFFLINE":
                return "Offline";
            default:
                return "Connecting...";
        }
    };

    const companion = chatRoom.participants.find(p => p.id !== user.id);

    return (
        <main
            className="flex-1 flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 w-full relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-purple-100/20 to-pink-100/20 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10"/>
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                    backgroundSize: '60px 60px'
                }}/>
            </div>

            {/* Mobile Back Button */}
            {isMobile && (
                <div
                    className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
                    <button
                        onClick={() => selectChat("")}
                        className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200"/>
                        <span className="font-medium">Back to chats</span>
                    </button>
                </div>
            )}

            {/* Chat Room Details Modal */}
            {chatDetailsOpen && (
                <ChatRoomDetails
                    chatRoom={chatRoom}
                    setIsChatDetailsOpen={setChatDetailsOpen}
                />
            )}

            {/* Enhanced Header */}
            <header
                className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"/>
                <div className="relative p-4 flex items-center justify-between">
                    <button
                        onClick={() => setChatDetailsOpen(true)}
                        className="flex items-center space-x-3 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl p-2 -m-2 transition-all duration-200 group"
                    >
                        {/* Enhanced Avatar */}
                        <div className="relative">
                            <div
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-lg">
                                <img
                                    src={companion?.avatar?.location || user.avatar?.location || defaultPfp}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <Users
                                    size={20}
                                    className="text-indigo-600 dark:text-indigo-400"
                                    style={{display: (companion?.avatar?.location || user.avatar?.location) ? 'none' : 'block'}}
                                />
                            </div>
                            {/* Enhanced Status Indicator */}
                            <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 shadow-lg ${getStatusColor()}`}>
                                {connStatus === "ONLINE" && (
                                    <div
                                        className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"/>
                                )}
                            </div>
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 truncate">
                                {chatRoom.title}
                            </h2>
                            <div className="flex items-center space-x-2">
                                {connStatus && (
                                    <>
                                        {connStatus === "ONLINE" ? (
                                            <Wifi size={12} className="text-green-500"/>
                                        ) : (
                                            <WifiOff size={12} className="text-gray-400"/>
                                        )}
                                        <p className={`text-sm font-medium ${
                                            connStatus === "ONLINE"
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                            {getStatusText()}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {stompClientRef && stompClientRef.current && (
                            <AudioCall
                                stompClient={stompClientRef.current}
                                localUserId={user.id}
                                remoteUserId={chatRoom.participants.find(u => u.id !== user.id)!.id}
                            />
                        )}

                        <button
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group">
                            <Video size={20}
                                   className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"/>
                        </button>

                        <button
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group">
                            <MoreVertical size={20}
                                          className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"/>
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scroll-smooth"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent'
                }}
            >
                {chatMessages && chatMessages.length > 0 ? (
                    <>
                        {chatMessages.map((chatMessage, index) => (
                            <div
                                key={chatMessage.id}
                                ref={isFirstUnreadMessage(chatMessage, index)}
                                className="animate-fade-in"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'both'
                                }}
                            >
                                {displayChatMessage(chatMessage)}
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </>
                ) : (
                    <EmptyState chatRoomTitle={chatRoom.title}/>
                )}
            </div>

            {/* Scroll to Bottom Button */}
            {isScrolledUp && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-24 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-20 animate-bounce"
                >
                    <ArrowLeft size={20} className="rotate-90"/>
                </button>
            )}

            {/* Enhanced Input Bar */}
            <div
                className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"/>
                <div className="relative">
                    <InputMessageBarComponent
                        title={chatRoom.title}
                        handleSendMessage={handleSendMessage}
                        chatId={chatRoom.chatId}
                    />
                </div>
            </div>
        </main>
    );
};

// Enhanced Empty State Component
const EmptyState: React.FC<{ chatRoomTitle: string }> = ({chatRoomTitle}) => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto px-6">
            {/* Animated Icon */}
            <div className="relative mb-6">
                <div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto shadow-lg">
                    <MessageCircle size={32} className="text-indigo-600 dark:text-indigo-400"/>
                </div>
                <div className="absolute -top-2 -right-2">
                    <Sparkles size={16} className="text-yellow-500 animate-pulse"/>
                </div>
                <div className="absolute -bottom-2 -left-2">
                    <Sparkles size={12} className="text-pink-500 animate-pulse" style={{animationDelay: '1s'}}/>
                </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Start your conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Send your first message to <span
                className="font-semibold text-indigo-600 dark:text-indigo-400">{chatRoomTitle}</span> and begin your
                chat journey together.
            </p>

            {/* Suggested Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
                <span
                    className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                    👋 Say hello
                </span>
                <span
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    🎉 Share something fun
                </span>
            </div>
        </div>
    </div>
);

const styles = `
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.3);
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 102, 241, 0.5);
}
`;
"use client";

import type { ChatMessage } from "@/models/chat/chatMessage";
import { useRef, useEffect } from "react";
import { InputMessageBarComponent } from "@/components/chats/InputMessageBarComponent";

interface ChatWindowComponentProps {
	messages: ChatMessage[];
	currentCompanion: string;
	handleSendMessage: () => void;
	inputMessage: string;
	setInputMessage: (inputMessage: string) => void;
	userEmail: string;
}

export const ChatWindowComponent = ({ messages, currentCompanion, handleSendMessage, inputMessage, setInputMessage, userEmail }: ChatWindowComponentProps) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<main className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
			<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
				<div className="relative mr-3">
					<div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
						<span className="text-sm font-semibold">{currentCompanion.charAt(0).toUpperCase()}</span>
					</div>
					<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
				</div>
				<div>
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{currentCompanion}</h2>
					<p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				{messages.length > 0 ? (
					messages.map(chatMessage => (
						<div key={chatMessage.id} className={`flex ${chatMessage.sender === userEmail ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-[75%] rounded-lg px-4 py-2 ${
									chatMessage.sender === userEmail
										? "bg-indigo-600 text-white rounded-br-none"
										: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
								}`}
							>
								<div className="break-words">{chatMessage.content}</div>
								<div className="text-xs opacity-70 text-right mt-1">
									{new Date(chatMessage.createdAt!).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</div>
						</div>
					))
				) : (
					<div className="flex items-center justify-center h-full">
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Start a conversation</h3>
							<p className="text-gray-500 dark:text-gray-400">Send your first message to {currentCompanion}</p>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<InputMessageBarComponent
				currentCompanion={currentCompanion}
				handleSendMessage={handleSendMessage}
				inputMessage={inputMessage}
				setInputMessage={setInputMessage}
			/>
		</main>
	);
};

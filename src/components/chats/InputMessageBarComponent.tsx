"use client";

import type React from "react";
import { Send, Paperclip, Smile } from "lucide-react";

interface InputMessageBarProps {
	handleSendMessage(): void;
	title: string;
	setInputMessage(inputMessage: string): void;
	inputMessage: string;
}

export const InputMessageBarComponent: React.FC<InputMessageBarProps> = ({ handleSendMessage, setInputMessage, inputMessage, title }) => {
	return (
		<div className="p-4 border-t border-gray-200 dark:border-gray-700">
			<div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
				<button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
					<Paperclip size={20} />
				</button>

				<input
					type="text"
					className="flex-1 py-2 px-3 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500"
					placeholder={`Message ${title}...`}
					value={inputMessage}
					onChange={e => setInputMessage(e.target.value)}
					onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSendMessage())}
				/>

				<button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
					<Smile size={20} />
				</button>

				<button
					className={`p-2 ml-1 rounded-r-lg ${
						inputMessage.trim()
							? "bg-indigo-600 text-white hover:bg-indigo-700"
							: "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
					}`}
					onClick={handleSendMessage}
					disabled={!inputMessage.trim()}
				>
					<Send size={20} />
				</button>
			</div>
		</div>
	);
};

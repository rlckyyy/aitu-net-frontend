import React from "react";

interface InputMessageBarProps {
    handleSendMessage: () => void,
    currentCompanion: string,
    setInputMessage: (inputMessage: string) => void,
    inputMessage: string
}

export const InputMessageBarComponent: React.FC<InputMessageBarProps> = ({
                                                                    handleSendMessage,
                                                                    setInputMessage,
                                                                    inputMessage,
                                                                    currentCompanion
                                                                }) => {
    return (
        <div className="mt-4 flex p-2 bg-gray-800 rounded-b-lg">
            <input
                type="text"
                className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder={`Enter message for ${currentCompanion}`}
                onChange={(e) => setInputMessage(e.target.value)}
                value={inputMessage}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSendMessage())}
            />
            <button
                className="ml-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white rounded transition"
                onClick={handleSendMessage}
            >
                Send
            </button>
        </div>
    )
}
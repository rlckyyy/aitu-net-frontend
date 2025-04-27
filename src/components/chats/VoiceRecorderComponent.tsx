import React, {useRef, useState} from "react";
import {api} from "@/lib";
import {ChatMessage, ChatMessageStatus, MessageType} from "@/models/chat/chatMessage";
import {useAuth} from "@/context/AuthProvider";

interface VoiceRecorderProps {
    handleSendMessage(chatMessage: ChatMessage): void;

    chatId: string;
}

export const VoiceRecorderComponent: React.FC<VoiceRecorderProps> = ({handleSendMessage, chatId}) => {
    const {user} = useAuth();
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunks: Blob[] = [];

    function stopRecording() {
        mediaRecorderRef.current?.stop()
        setRecording(false)
    }

    function resetChunks() {
        chunks.length = 0
    }

    async function startRecording() {
        if (!user) return
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, {type: "audio/ogg"})
            const formData = new FormData()
            const fileName = 'audio-file-message.ogg';
            formData.append("file", audioBlob, fileName)

            const message: ChatMessage = {
                chatId: chatId,
                senderId: user.id,
                content: fileName,
                type: MessageType.MESSAGE_AUDIO,
                status: ChatMessageStatus.DELIVERED
            };
            formData.set("chatMessage", new Blob([JSON.stringify(message)], {type: "application/json"}))

            api.chat.uploadFileMessage(formData)
                .then(handleSendMessage)
                .then(resetChunks)
        }

        mediaRecorder.start()
        setRecording(true)
    }

    return (
        <div className="flex justify-center">
            <button
                onClick={recording ? stopRecording : startRecording}
                className={`relative px-5 py-2 text-white font-semibold rounded-full transition-all duration-300
            ${recording ? "bg-red-600 animate-pulse shadow-lg" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
            >
                {recording ? (
                    <span className="flex items-center gap-2">
				<svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
					<path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
				</svg>
			</span>
                ) : (
                    <span className="flex items-center gap-2">
				<svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
					<path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2z" />
					<path
                        fillRule="evenodd"
                        d="M4 10a6 6 0 0012 0h-2a4 4 0 11-8 0H4zm6 7a7 7 0 007-7h-2a5 5 0 01-10 0H3a7 7 0 007 7z"
                        clipRule="evenodd"
                    />
				</svg>
			</span>
                )}
            </button>
        </div>

    )
}
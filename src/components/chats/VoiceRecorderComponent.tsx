import React, {useRef, useState} from "react";
import {api} from "@/lib";
import {ChatMessage, ChatMessageStatus, MessageType} from "@/models/chat/chatMessage";
import {useAuth} from "@/context/AuthProvider";
import {Mic, MicOff} from "lucide-react";

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
        const constraints: MediaStreamConstraints = {
            audio: {
                channelCount: {ideal: 2},
                sampleRate: {ideal: 48000},
                sampleSize: {ideal: 24},
                autoGainControl: false,
                echoCancellation: false,
                noiseSuppression: false
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        const mro: MediaRecorderOptions = {
            mimeType: 'audio/webm;codec=opus',
            audioBitsPerSecond: 128000
        }

        const mediaRecorder = new MediaRecorder(stream, mro)
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
                className={`relative px-5 py-2 text-white font-semibold transition-all duration-300
            ${recording ? "bg-red-600 animate-pulse shadow-lg" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
            >
                {recording ? (
                    <span className="flex items-center gap-2">
                        <MicOff size={20} strokeWidth={2.5}/>
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Mic size={20} strokeWidth={2.5}/>
                    </span>
                )}
            </button>
        </div>
    )
}
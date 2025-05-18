import React, {ReactElement, useRef, useState} from "react";
import {Mic, MicOff, Video, VideoOff} from "lucide-react";
import {ChatMessage, ChatMessageStatus, MessageType} from "@/models/chat/ChatMessage";
import {api} from "@/lib";
import {useAuth} from "@/context/AuthProvider";
import {VideoMessagePreviewModal} from "@/components/chats/messages/VideoMessagePreviewModal";
import {useTime} from "@/hooks/useTime";

interface VideoRecorderProps {
    chatId: string;
    type: FileMessageType;

    handleChatMessage(chatMessage: ChatMessage): void;
}

type MediaTypeConfig = {
    mediaRecorderOptions: MediaRecorderOptions;
    mediaStreamConstraints: MediaStreamConstraints;
    enabledUI: ReactElement;
    disabledUI: ReactElement;
    blobProperty: BlobPropertyBag;
    messageType: MessageType;
}

export enum FileMessageType {
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO'
}

const mediaRecorderConfigRecord: Record<FileMessageType, MediaTypeConfig> = {
    [FileMessageType.AUDIO]: {
        mediaRecorderOptions: {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 128000
        },
        mediaStreamConstraints: {
            audio: {
                channelCount: {ideal: 2},
                sampleRate: {ideal: 48000},
                sampleSize: {ideal: 24},
                autoGainControl: false,
                echoCancellation: false,
                noiseSuppression: false
            }
        },
        enabledUI: (<span className="flex items-center gap-2">
                        <Mic size={20} strokeWidth={2.5}/>
                    </span>),
        disabledUI: (<span className="flex items-center gap-2">
                        <MicOff size={20} strokeWidth={2.5}/>
                    </span>),
        blobProperty: {
            type: 'audio/mp3;codec=opus'
        },
        messageType: MessageType.MESSAGE_AUDIO
    },

    [FileMessageType.VIDEO]: {
        mediaRecorderOptions: {
            videoBitsPerSecond: 8000000
        },
        mediaStreamConstraints: {
            video: true,
            audio: true
        },
        enabledUI: (
            <span className="flex items-center gap-2">
                <VideoOff size={20} strokeWidth={2.5}/>
            </span>
        ),
        disabledUI: (
            <span className="flex items-center gap-2">
                <Video size={20} strokeWidth={2.5}/>
            </span>
        ),
        blobProperty: {
            type: 'video/mp4'
        },
        messageType: MessageType.MESSAGE_VIDEO
    }
}

export const MediaRecorderComponent: React.FC<VideoRecorderProps> = ({chatId, handleChatMessage, type}) => {
    const {user} = useAuth()
    const [recording, setRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder>(null)
    const chunks: Blob[] = []
    const mediaRecorderConfig = mediaRecorderConfigRecord[type]
    const videoPreviewRef = useRef<HTMLVideoElement>(null)
    const {start, stop} = useTime()

    function stopRecording() {
        setRecording(false)
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current?.stream.getTracks()
            .forEach(track => track.stop())
    }

    async function startRecording() {
        if (!user) return

        setRecording(true)
        const stream = await navigator.mediaDevices.getUserMedia(mediaRecorderConfig.mediaStreamConstraints)

        const mediaRecorder = new MediaRecorder(stream, mediaRecorderConfig.mediaRecorderOptions)

        mediaRecorderRef.current = mediaRecorder

        if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream
        }

        mediaRecorder.ondataavailable = (blobEvent: BlobEvent) => {
            chunks.push(blobEvent.data)
        }

        mediaRecorder.onstop = () => {
            const mediaBlob = new Blob(chunks, mediaRecorderConfig.blobProperty)
            const formData = new FormData()

            const mimeType = mediaRecorderConfig.blobProperty.type
            if (!mimeType) {
                throw new Error(`Unsupported file message type: ${type}`)
            }

            const extension = extractExtension(mimeType);
            const fileName = `${chatId}_${user.id}.${extension}`
            formData.set("fileMessage", mediaBlob, fileName)

            const message: ChatMessage = {
                chatId: chatId,
                senderId: user.id,
                content: fileName,
                length: stop(),
                type: mediaRecorderConfig.messageType,
                status: ChatMessageStatus.DELIVERED
            }

            formData.set("chatMessage", new Blob([JSON.stringify(message)], {type: "application/json"}))

            api.chat.uploadFileMessage(formData)
                .then(response => handleChatMessage(response.data))
                .finally(resetChunks)
        }

        mediaRecorder.start()
        start()
    }

    function resetChunks() {
        chunks.length = 0
    }

    function extractExtension(mimeType: string) {
        const extensionBeg = mimeType.indexOf("/") + 1

        const codecStart = mimeType.indexOf(";")
        const extensionEnd = codecStart > 0
            ? codecStart
            : undefined

        return mimeType.substring(extensionBeg, extensionEnd)
    }

    return (
        <div className={"flex justify-center"}>
            <button
                onClick={recording ? stopRecording : startRecording}
                className={`relative px-5 py-2 text-white font-semibold transition-all duration-300
            ${recording ? "bg-red-600 shadow-lg" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
            >
                {recording
                    ? (type === FileMessageType.VIDEO
                        ? ((mediaRecorderConfig.enabledUI &&
                            <VideoMessagePreviewModal videoPreviewRef={videoPreviewRef}/>))
                        : mediaRecorderConfig.enabledUI)
                    : mediaRecorderConfig.disabledUI
                }
            </button>
        </div>
    )
}
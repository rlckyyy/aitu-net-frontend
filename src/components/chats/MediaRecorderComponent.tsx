import React, {ReactElement, useRef, useState} from "react";
import {Mic, MicOff, Video, VideoOff} from "lucide-react";
import {ChatMessage, ChatMessageStatus, MessageType} from "@/models/chat/chatMessage";
import {api} from "@/lib";
import {useAuth} from "@/context/AuthProvider";

interface VideoRecorderProps {
    chatId: string;
    type: FileMessageType;

    handleChatMessage(chatMessage: ChatMessage): void;
}

type MediaTypeConfig = {
    mediaRecorderOptions: MediaRecorderOptions;
    mediaStreamConstraints: MediaStreamConstraints;
    enableUI: ReactElement;
    disableUI: ReactElement;
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
            mimeType: 'audio/webm;codec=opus',
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
        enableUI: (<span className="flex items-center gap-2">
                        <Mic size={20} strokeWidth={2.5}/>
                    </span>),
        disableUI: (<span className="flex items-center gap-2">
                        <MicOff size={20} strokeWidth={2.5}/>
                    </span>),
        blobProperty: {
            type: 'audio/webm;codec=opus'
        },
        messageType: MessageType.MESSAGE_AUDIO
    },

    [FileMessageType.VIDEO]: {
        mediaRecorderOptions: {
            videoBitsPerSecond: 8000000
        },
        mediaStreamConstraints: {
            video: true,
            audio: {
                channelCount: 2
            }
        },
        enableUI: (<span className="flex items-center gap-2">
                        <>
                            <Video size={20} strokeWidth={2.5}/>
                        </>
                    </span>),
        disableUI: (<span className="flex items-center gap-2">
                        <VideoOff size={20} strokeWidth={2.5}/>
                    </span>),
        blobProperty: {
            type: 'video/mp4'
        },
        messageType: MessageType.MESSAGE_VIDEO
    }
}

export const MediaRecorderComponent: React.FC<VideoRecorderProps> = ({chatId, handleChatMessage, type}) => {
    const {user} = useAuth();
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunks: Blob[] = [];
    const mediaRecorderConfig = mediaRecorderConfigRecord[type];
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    async function startRecording() {
        if (!user) return

        setRecording(true)
        const stream = await navigator.mediaDevices.getUserMedia(mediaRecorderConfig.mediaStreamConstraints)

        const mediaRecorder = new MediaRecorder(stream, {videoBitsPerSecond: 8000000})

        mediaRecorderRef.current = mediaRecorder

        if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream
        }

        mediaRecorder.ondataavailable = (blobEvent: BlobEvent) => {
            chunks.push(blobEvent.data)
        }

        mediaRecorder.onstop = (_: Event) => {
            const mediaBlob = new Blob(chunks, mediaRecorderConfig.blobProperty)
            const formData = new FormData()
            const fileName = 'file-message.webm'
            formData.append("file", mediaBlob, fileName)

            const message: ChatMessage = {
                chatId: chatId,
                senderId: user.id,
                content: fileName,
                type: mediaRecorderConfig.messageType,
                status: ChatMessageStatus.DELIVERED
            }

            formData.set("chatMessage", new Blob([JSON.stringify(message)], {type: "application/json"}))

            api.chat.uploadFileMessage(formData)
                .then(response => handleChatMessage(response.data))
                .finally(resetChunks)
        }

        mediaRecorder.start()
    }

    async function startRecordingWithLength(milliSeconds: number) {
        if (!user) return
        setRecording(true)
        const blobs: Blob[] = []

        const stream = await navigator.mediaDevices.getUserMedia({video: true})

        const recorder = new MediaRecorder(stream, mediaRecorderConfigRecord[type].mediaRecorderOptions)
        recorder.ondataavailable = (e) => blobs.push(e.data)
        recorder.start()

        const stopped = new Promise((resolve, reject) => {
            recorder.onstop = resolve
            recorder.onerror = (errorEvent) => reject(errorEvent.message)
        })

        const recorded = new Promise((resolve, reject) => {
            setTimeout(resolve, milliSeconds)
        }).then(() => {
            if (recorder.state === 'recording') {
                recorder.stop()
            }
        })

        return Promise.all([recorded, stopped]).then(() => blobs)
    }

    function resetChunks() {
        chunks.length = 0
    }

    function stopRecording() {
        setRecording(false)
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current?.stream.getTracks()
            .forEach(track => track.stop())
    }

    return (
        <div className={"flex justify-center"}>
            {/*<VideoMessagePreviewModal/>*/}
            <button
                onClick={recording ? stopRecording : startRecording}
                className={`relative px-5 py-2 text-white font-semibold transition-all duration-300
            ${recording ? "bg-red-600 animate-pulse shadow-lg" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
            >
                {recording
                    ? mediaRecorderConfig.disableUI && (<div
                    className="fixed inset-0 z-40 min-h-full overflow-y-auto overflow-x-hidden transition flex items-center">
                    {/* overlay */}
                    <div aria-hidden="true" className="fixed inset-0 w-full h-full bg-black/50 cursor-pointer"/>

                    {/* Modal */}
                    <div className="relative w-full cursor-pointer pointer-events-none transition my-auto p-4">
                        <div
                            className="w-full py-2 bg-white cursor-default pointer-events-auto dark:bg-gray-800 relative rounded-xl mx-auto max-w-sm">
                            <div
                                className={`max-w-[85%] w-fit sm:w-[75%] rounded-lg px-4 py-2 bg-indigo-600 text-white rounded-br-none`}
                            >
                                <div className="max-w-full">
                                    <div
                                        className="flex items-center gap-2 p-2 rounded-full bg-white/10 dark:bg-gray-700 border">
                                        <Video
                                            className="w-5 h-5 text-indigo-500 dark:text-indigo-300"/> {/*MouseEvent<HTMLVideoElement, MouseEvent>*/}
                                        <video className="w-full focus:outline-none rounded-full object-cover"
                                               ref={videoPreviewRef}
                                               autoPlay={true}
                                               width={150}
                                               height={150}
                                        >
                                            <source type="video/mp4"/>
                                            <source type="video/ogg"/>
                                            <source type="video/webm"/>
                                            <source type="video/mp3"/>
                                            <source type="video/mpeg3"/>
                                        </video>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)
                    : mediaRecorderConfig.enableUI
                }
            </button>
        </div>
    )
}
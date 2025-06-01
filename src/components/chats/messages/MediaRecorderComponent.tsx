import React, { ReactElement, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Lock, Upload, AlertCircle } from "lucide-react";
import { MessageType } from "@/models/chat/ChatMessage";
import { api } from "@/lib";
import { useAuth } from "@/context/AuthProvider";
import { VideoMessagePreviewModal } from "@/components/chats/messages/VideoMessagePreviewModal";
import { useTime } from "@/hooks/useTime";

// Обновленный интерфейс MediaRecorderComponent
interface E2EMediaRecorderProps {
    chatId: string;
    type: FileMessageType;
    handleSendMessage: (messageData: string, messageType: MessageType) => Promise<void>;
    isEncrypting?: boolean;
    disabled?: boolean;
}

type MediaTypeConfig = {
    mediaRecorderOptions: MediaRecorderOptions;
    mediaStreamConstraints: MediaStreamConstraints;
    enabledUI: ReactElement;
    disabledUI: ReactElement;
    blobProperty: BlobPropertyBag;
    messageType: MessageType;
    displayName: string;
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
                channelCount: { ideal: 2 },
                sampleRate: { ideal: 48000 },
                sampleSize: { ideal: 24 },
                autoGainControl: false,
                echoCancellation: false,
                noiseSuppression: false
            }
        },
        enabledUI: (
            <span className="flex items-center gap-2">
                <MicOff size={16} strokeWidth={2.5} />
                <span className="text-xs">Stop</span>
            </span>
        ),
        disabledUI: (
            <span className="flex items-center gap-2">
                <Mic size={16} strokeWidth={2.5} />
                <span className="text-xs">Voice</span>
            </span>
        ),
        blobProperty: {
            type: 'audio/mp3;codec=opus'
        },
        messageType: MessageType.MESSAGE_AUDIO,
        displayName: 'Voice Message'
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
                <VideoOff size={16} strokeWidth={2.5} />
                <span className="text-xs">Stop</span>
            </span>
        ),
        disabledUI: (
            <span className="flex items-center gap-2">
                <Video size={16} strokeWidth={2.5} />
                <span className="text-xs">Video</span>
            </span>
        ),
        blobProperty: {
            type: 'video/mp4'
        },
        messageType: MessageType.MESSAGE_VIDEO,
        displayName: 'Video Message'
    }
}

export const MediaRecorderComponent: React.FC<E2EMediaRecorderProps> = ({
                                                                            chatId,
                                                                            handleSendMessage,
                                                                            type,
                                                                            isEncrypting = false,
                                                                            disabled = false
                                                                        }) => {
    const { user } = useAuth();
    const [recording, setRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const chunks: Blob[] = [];
    const mediaRecorderConfig = mediaRecorderConfigRecord[type];
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const { start, stop } = useTime();

    const isDisabled = disabled || isEncrypting || uploading || recording;

    React.useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);

    function stopRecording() {
        setRecording(false);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current?.stream.getTracks()
            .forEach(track => track.stop());
    }

    async function startRecording() {
        if (!user) return;

        try {
            setError(null);
            setRecording(true);

            const stream = await navigator.mediaDevices.getUserMedia(mediaRecorderConfig.mediaStreamConstraints);
            const mediaRecorder = new MediaRecorder(stream, mediaRecorderConfig.mediaRecorderOptions);

            mediaRecorderRef.current = mediaRecorder;

            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }

            mediaRecorder.ondataavailable = (blobEvent: BlobEvent) => {
                chunks.push(blobEvent.data);
            };

            mediaRecorder.onstop = async () => {
                try {
                    await handleMediaUpload();
                } catch (error) {
                    console.error('Failed to upload media:', error);
                    setError('Failed to send media message');
                }
            };

            mediaRecorder.start();
            start();

            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            setError('Failed to access camera/microphone');
            setRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
        }
    }

    async function handleMediaUpload() {
        if (!user) return;

        setUploading(true);

        try {
            const mediaBlob = new Blob(chunks, mediaRecorderConfig.blobProperty);
            const formData = new FormData();

            const mimeType = mediaRecorderConfig.blobProperty.type;
            if (!mimeType) {
                throw new Error(`Unsupported file message type: ${type}`);
            }

            const extension = extractExtension(mimeType);
            const fileName = `${chatId}_${user.id}_${Date.now()}.${extension}`;
            const duration = stop();

            formData.set("fileMessage", mediaBlob, fileName);

            const messageMetadata = {
                chatId: chatId,
                senderId: user.id,
                length: duration,
                type: mediaRecorderConfig.messageType,
            };

            formData.set("chatMessage", new Blob([JSON.stringify(messageMetadata)], { type: "application/json" }));

            // Upload file to server
            const response = await api.chat.uploadFileMessage(formData);

            // Send through E2E system
            const fileUrl = fileName; // Use filename as fallback
            const mediaInfo = `${mediaRecorderConfig.displayName}: ${fileUrl} (${formatDuration(duration)})`;

            await handleSendMessage(mediaInfo, mediaRecorderConfig.messageType);

        } catch (error) {
            console.error('Failed to upload media:', error);
            throw error;
        } finally {
            setUploading(false);
            resetChunks();
        }
    }

    function resetChunks() {
        chunks.length = 0;
    }

    function extractExtension(mimeType: string) {
        const extensionBeg = mimeType.indexOf("/") + 1;
        const codecStart = mimeType.indexOf(";");
        const extensionEnd = codecStart > 0 ? codecStart : undefined;
        return mimeType.substring(extensionBeg, extensionEnd);
    }

    function formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    const getButtonState = () => {
        if (error) return 'error';
        if (uploading) return 'uploading';
        if (recording) return 'recording';
        if (isDisabled) return 'disabled';
        return 'idle';
    };

    const buttonState = getButtonState();

    const buttonStyles = {
        idle: "bg-gray-600 hover:bg-gray-700 text-white",
        recording: "bg-red-600 hover:bg-red-700 text-white animate-pulse",
        uploading: "bg-blue-600 text-white cursor-wait",
        disabled: "bg-gray-400 text-gray-600 cursor-not-allowed",
        error: "bg-red-500 text-white"
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            {/* Error Message */}
            {error && (
                <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                    <AlertCircle size={12} />
                    <span>{error}</span>
                </div>
            )}

            {/* Recording Duration */}
            {recording && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>{formatDuration(recordingTime)}</span>
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={recording ? stopRecording : startRecording}
                disabled={isDisabled && !recording}
                className={`
                    relative px-3 py-2 rounded-lg font-semibold transition-all duration-300 
                    text-xs min-w-[80px] flex items-center justify-center space-x-1
                    ${buttonStyles[buttonState]}
                    ${buttonState === 'idle' ? 'hover:scale-105 shadow-md hover:shadow-lg' : ''}
                `}
                title={
                    error ? error :
                        uploading ? 'Uploading...' :
                            recording ? `Stop ${mediaRecorderConfig.displayName.toLowerCase()}` :
                                isEncrypting ? 'Encrypting message...' :
                                    disabled ? 'Disabled' :
                                        `Record ${mediaRecorderConfig.displayName.toLowerCase()}`
                }
            >
                {uploading ? (
                    <>
                        <Upload size={16} className="animate-pulse" />
                        <span>Uploading...</span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle size={16} />
                        <span>Error</span>
                    </>
                ) : recording ? (
                    mediaRecorderConfig.enabledUI
                ) : (
                    <>
                        {mediaRecorderConfig.disabledUI}
                        <Lock size={8} className="opacity-60" />
                    </>
                )}

                {recording && type === FileMessageType.VIDEO && (
                    <VideoMessagePreviewModal videoPreviewRef={videoPreviewRef} />
                )}
            </button>

            {/* E2E Warning for Media */}
            {!recording && !uploading && (
                <div className="text-xs text-amber-600 dark:text-amber-400 text-center max-w-[100px]">
                    <div className="flex items-center space-x-1">
                        <AlertCircle size={10} />
                        <span>File E2E coming soon</span>
                    </div>
                </div>
            )}
        </div>
    );
};
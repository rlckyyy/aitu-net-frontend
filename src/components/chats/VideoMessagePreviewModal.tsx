import React from "react";
import {Video} from "lucide-react";

interface VideoMessagePreviewModalProps {
    recordingBlobs: Blob[];
}

export const VideoMessagePreviewModal: React.FC<VideoMessagePreviewModalProps> = ({recordingBlobs}) => {
    return (
        <div
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
                                       width={150}
                                       height={150}
                                       src={URL.createObjectURL(new Blob(recordingBlobs))}
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
        </div>
    )
}
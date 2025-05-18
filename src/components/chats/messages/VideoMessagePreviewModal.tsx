import React, {Ref} from "react";

interface VideoMessagePreviewModalProps {
    videoPreviewRef: Ref<HTMLVideoElement>;
}

export const VideoMessagePreviewModal: React.FC<VideoMessagePreviewModalProps> = ({videoPreviewRef}) => {

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
                                <video className="rounded-full object-cover w-[250px] h-[250px] focus:outline-none"
                                       ref={videoPreviewRef}
                                       autoPlay={true}
                                       muted={true}
                                       width={25}
                                       height={25}
                                       playsInline={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
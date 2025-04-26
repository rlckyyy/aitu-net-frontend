import { useEffect, useState } from "react";

export const MediaFiles = ({ mediaFileIds }: { mediaFileIds: string[] }) => {
    const [fileTypes, setFileTypes] = useState<string[]>([]);

    const getFileType = async (url: string): Promise<string> => {
        const fileExtension = url.split('.').pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || '')) {
            return "image";
        }

        try {
            const response = await fetch(url, { method: "HEAD" });
            const contentType = response.headers.get("Content-Type") || "";
            if (contentType.includes("image")) return "image";
            if (contentType.includes("video")) return "video";
            if (contentType.includes("audio")) return "audio";
            return "unknown";
        } catch (error) {
            console.error("Error fetching file type:", error);
            return "unknown";
        }
    };

    useEffect(() => {
        Promise.all(mediaFileIds.map((url) => getFileType(url))).then((types) => setFileTypes(types));
    }, [mediaFileIds]);

    return (
        <div className="flex flex-wrap gap-4 mt-4">
            {mediaFileIds.map((fileId, idx) => (
                <div
                    key={idx}
                    className="w-full sm:w-40 md:w-80 lg:w-250 h-auto bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center border border-gray-300 dark:border-gray-600"
                >
                    {fileTypes[idx] === "image" ? (
                        <img
                            src={fileId}
                            alt={`media-${idx}`}
                            className="w-full h-auto object-cover"
                        />
                    ) : fileTypes[idx] === "video" ? (
                        <video controls className="w-full h-auto object-cover">
                            <source src={fileId} type="video/mp4" />
                            Ваш браузер не поддерживает видео.
                        </video>
                    ) : fileTypes[idx] === "audio" ? (
                        <audio controls className="w-full h-full object-cover">
                            <source src={fileId} type="audio/mp3" />
                            Ваш браузер не поддерживает аудио.
                        </audio>
                    ) : (
                        <div className="text-gray-400 text-sm text-center px-1">
                            Unsupported file type
                            <a
                                href={fileId}
                                download
                                className="block mt-2 text-xs text-blue-500 hover:underline"
                            >
                                Download file
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

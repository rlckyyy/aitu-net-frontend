import { useEffect, useState, useCallback } from "react";
import { File, Download, Image, Video, Volume2, Loader2, X, ZoomIn } from "lucide-react";

interface MediaFile {
    id: string;
    type: 'image' | 'video' | 'audio' | 'unknown' | 'loading';
    error?: boolean;
    extension?: string;
}

export const MediaFiles = ({ mediaFileIds }: { mediaFileIds: string[] }) => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<{ index: number; file: MediaFile } | null>(null);

    const getFileExtension = (url: string): string => {
        return url.split('.').pop()?.toLowerCase() || 'file';
    };

    const getFileType = useCallback(async (url: string): Promise<'image' | 'video' | 'audio' | 'unknown'> => {
        const fileExtension = getFileExtension(url);

        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];

        if (imageExtensions.includes(fileExtension)) return 'image';
        if (videoExtensions.includes(fileExtension)) return 'video';
        if (audioExtensions.includes(fileExtension)) return 'audio';

        try {
            const response = await fetch(url, {
                method: "HEAD",
                signal: AbortSignal.timeout(5000)
            });

            const contentType = response.headers.get("Content-Type") || "";
            if (contentType.startsWith("image/")) return "image";
            if (contentType.startsWith("video/")) return "video";
            if (contentType.startsWith("audio/")) return "audio";

            return "unknown";
        } catch (error) {
            return "unknown";
        }
    }, []);

    useEffect(() => {
        setMediaFiles(mediaFileIds.map(id => ({
            id,
            type: 'loading',
            extension: getFileExtension(id)
        })));

        const determineFileTypes = async () => {
            const results = await Promise.allSettled(
                mediaFileIds.map(async (id) => {
                    try {
                        const type = await getFileType(id);
                        return {
                            id,
                            type,
                            error: false,
                            extension: getFileExtension(id)
                        };
                    } catch (error) {
                        return {
                            id,
                            type: 'unknown' as const,
                            error: true,
                            extension: getFileExtension(id)
                        };
                    }
                })
            );

            setMediaFiles(results.map((result, index) =>
                result.status === 'fulfilled'
                    ? result.value
                    : {
                        id: mediaFileIds[index],
                        type: 'unknown' as const,
                        error: true,
                        extension: getFileExtension(mediaFileIds[index])
                    }
            ));
        };

        if (mediaFileIds.length > 0) {
            determineFileTypes();
        }
    }, [mediaFileIds, getFileType]);

    const handleImageError = (index: number) => {
        setMediaFiles(prev => prev.map((file, i) =>
            i === index ? { ...file, error: true } : file
        ));
    };

    const openModal = (index: number, file: MediaFile) => {
        if (file.type === 'image' || file.type === 'video') {
            setSelectedMedia({ index, file });
        }
    };

    const closeModal = () => {
        setSelectedMedia(null);
    };

    const getGridLayout = () => {
        const count = mediaFiles.length;
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-2";
        if (count === 3) return "grid-cols-3";
        if (count === 4) return "grid-cols-2";
        return "grid-cols-3";
    };

    const getItemHeight = () => {
        const count = mediaFiles.length;
        if (count === 1) return "aspect-video"; // Полный размер для одного элемента
        if (count === 2) return "aspect-square";
        return "aspect-square";
    };

    if (mediaFileIds.length === 0) {
        return null;
    }

    return (
        <>
            <div className="mt-6">
                <div className={`grid ${getGridLayout()} gap-2 max-w-full`}>
                    {mediaFiles.map((file, index) => (
                        <div
                            key={file.id}
                            className={`group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${
                                mediaFiles.length === 1 ? 'col-span-1' :
                                    mediaFiles.length === 4 && index >= 2 ? 'col-span-1' :
                                        mediaFiles.length > 4 && index === 2 ? 'col-span-1' : ''
                            }`}
                            onClick={() => openModal(index, file)}
                        >
                            <div className={`relative ${getItemHeight()} ${
                                file.type === 'image' || file.type === 'video' ? 'cursor-pointer' : ''
                            }`}>
                                {file.type === 'loading' ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span className="text-sm">Загрузка...</span>
                                        </div>
                                    </div>
                                ) : file.type === 'image' && !file.error ? (
                                    <>
                                        <img
                                            src={file.id}
                                            alt={`Изображение ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                            onError={() => handleImageError(index)}
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </div>
                                    </>
                                ) : file.type === 'video' ? (
                                    <div className="relative w-full h-full group cursor-pointer">
                                        <video
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                            onError={() => handleImageError(index)}
                                            muted
                                        >
                                            <source src={file.id} type="video/mp4" />
                                            <source src={file.id} type="video/webm" />
                                        </video>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                                            <div className="bg-black/70 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Video className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ) : file.type === 'audio' ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4">
                                        <div className="flex flex-col items-center gap-3 mb-4">
                                            <Volume2 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        Аудио файл
                      </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-mono">
                        .{file.extension}
                      </span>
                                        </div>
                                        <audio
                                            controls
                                            className="w-full max-w-xs"
                                            preload="metadata"
                                            onError={() => handleImageError(index)}
                                        >
                                            <source src={file.id} type={`audio/${file.extension}`} />
                                            Ваш браузер не поддерживает воспроизведение аудио.
                                        </audio>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 p-4">
                                        <div className="flex flex-col items-center gap-3">
                                            <File className="w-12 h-12" />
                                            <div className="text-center">
                                                <p className="text-lg font-mono uppercase tracking-wider mb-2">
                                                    .{file.extension}
                                                </p>
                                                <p className="text-xs text-gray-400 mb-3">
                                                    {file.error ? 'Ошибка загрузки файла' : 'Файл для скачивания'}
                                                </p>
                                                <a
                                                    href={file.id}
                                                    download
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Скачать
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Кнопка загрузки для медиа файлов */}
                                {(file.type === 'image' || file.type === 'video') && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <a
                                            href={file.id}
                                            download
                                            className="flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black/80 text-white rounded-full transition-colors duration-200"
                                            title="Скачать файл"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}

                                {/* Счетчик для множества файлов */}
                                {mediaFiles.length > 4 && index === 3 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                                        +{mediaFiles.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Модальное окно для просмотра */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                            {selectedMedia.file.type === 'image' ? (
                                <img
                                    src={selectedMedia.file.id}
                                    alt={`Изображение ${selectedMedia.index + 1}`}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            ) : selectedMedia.file.type === 'video' ? (
                                <video
                                    src={selectedMedia.file.id}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                >
                                    Ваш браузер не поддерживает воспроизведение видео.
                                </video>
                            ) : null}
                        </div>

                        {/* Кнопка скачивания в модальном окне */}
                        <a
                            href={selectedMedia.file.id}
                            download
                            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200"
                        >
                            <Download className="w-4 h-4" />
                            Скачать
                        </a>
                    </div>
                </div>
            )}
        </>
    );
};
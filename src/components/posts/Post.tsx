import { Post, PostType } from "@/models/post/post";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Reaction, ReactionType } from "@/models/reaction/reaction";
import { api } from "@/lib";
import { Comment, CommentCriteria } from "@/models/comment/comment";
import { defaultPfp } from "../../../public/modules/defaultPfp";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { MediaFiles } from "@/components/MediaFiles";
import { useAuth } from "@/context/AuthProvider";
import { User } from "@/models/User";
import {
    MoreVertical,
    ThumbsDown,
    ThumbsUp,
    Edit3,
    Trash2,
    X,
    Check,
    Heart,
    MessageCircle,
    Share2
} from "lucide-react";
import { Group } from "@/models/group/group";
import { Menu, Transition } from "@headlessui/react";
import { CommentList } from "@/components/comments/Comment";
import { Fragment } from "react";
import Link from "next/link";

interface PostUnitProps {
    post: Post;
    onDelete?: (postId: string) => void;
    onEdit?: (postId: string, description: string) => void;
}

export default function PostUnit({ post, onDelete, onEdit }: PostUnitProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [resourceOwner, setResourceOwner] = useState<User | Group | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(post.description || "");
    const [isLoading, setIsLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const { user } = useAuth();

    const userReaction = useMemo(() =>
            reactions.find(r => r.userId === user?.id),
        [reactions, user?.id]
    );

    const likesCount = useMemo(() =>
            reactions.filter(r => r.reactionType === ReactionType.LIKE).length,
        [reactions]
    );

    const dislikesCount = useMemo(() =>
            reactions.filter(r => r.reactionType === ReactionType.DISLIKE).length,
        [reactions]
    );

    const isOwner = useMemo(() =>
            user?.id === post.ownerId,
        [user?.id, post.ownerId]
    );

    // Определяем ссылку на профиль в зависимости от типа поста
    const profileLink = useMemo(() => {
        if (post.postType === PostType.GROUP && post.groupId) {
            return {
                pathname: "/group/profile",
                query: { groupId: post.groupId }
            };
        } else if (post.postType === PostType.USER && post.ownerId) {
            return {
                pathname: "/users/profile/another",
                query: { userId: post.ownerId }
            };
        }
        return null;
    }, [post.postType, post.groupId, post.ownerId]);

    // Загрузка данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [commentsRes, reactionsRes] = await Promise.all([
                    api.comment.getComments({ postId: post.id } as CommentCriteria),
                    api.post.getReactions(post.id)
                ]);

                setComments(commentsRes.data);
                setReactions(reactionsRes.data);
            } catch (error) {
                console.error('Failed to load post data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [post.id]);

    // Загрузка владельца поста
    useEffect(() => {
        const loadOwner = async () => {
            try {
                if (post.postType === PostType.GROUP && post.groupId) {
                    const res = await api.group.getById(post.groupId);
                    setResourceOwner(res.data);
                } else if (post.postType === PostType.USER && post.ownerId) {
                    const res = await api.user.getUserById(post.ownerId);
                    setResourceOwner(res.data);
                }
            } catch (error) {
                console.error('Failed to load post owner:', error);
            }
        };

        loadOwner();
    }, [post.postType, post.ownerId, post.groupId]);

    // Обработка реакций
    const handleReaction = useCallback(async (reactionType: ReactionType) => {
        if (!user) return;

        const existingReaction = reactions.find(r => r.userId === user.id);

        try {
            if (existingReaction) {
                if (existingReaction.reactionType === reactionType) {
                    // Удаляем реакцию
                    await api.post.deletePostReaction(post.id, user.id);
                    setReactions(prev => prev.filter(r => r.userId !== user.id));
                } else {
                    // Изменяем реакцию
                    const updatedReaction = { ...existingReaction, reactionType };
                    await api.post.updatePostReaction(updatedReaction);
                    setReactions(prev => prev.map(r =>
                        r.userId === user.id ? updatedReaction : r
                    ));
                }
            } else {
                // Добавляем новую реакцию
                const newReaction: Reaction = {
                    userId: user.id,
                    postId: post.id,
                    reactionType
                };
                await api.post.updatePostReaction(newReaction);
                setReactions(prev => [...prev, newReaction]);
            }
        } catch (error) {
            console.error('Failed to update reaction:', error);
        }
    }, [user, reactions, post.id]);

    // Обработка удаления поста
    const handleDeletePost = useCallback(async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.post.deletePost(post.id);
            onDelete?.(post.id);
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    }, [post.id, onDelete]);

    // Обработка редактирования поста
    const handleEditPost = useCallback(async () => {
        if (editedDescription.trim() === post.description?.trim()) {
            setIsEditing(false);
            return;
        }

        try {
            await api.post.updatePost(post.id, { description: editedDescription });
            setIsEditing(false);
            post.description = editedDescription;
            onEdit?.(post.id, editedDescription);
        } catch (error) {
            console.error('Failed to update post:', error);
        }
    }, [editedDescription, post, onEdit]);

    const cancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditedDescription(post.description || "");
    }, [post.description]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                </div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            </div>
        );
    }

    // Компонент для отображения профиля/аватара
    const ProfileSection = () => {
        const profileContent = (
            <>
                <div className="relative">
                    <img
                        src={resourceOwner?.avatar?.location || defaultPfp}
                        alt={`${post.resource || "Unknown"} avatar`}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900"></div>
                </div>
                <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        {post.postType === PostType.GROUP
                            ? (resourceOwner as Group)?.name || post.resource || "Unknown Group"
                            : (resourceOwner as User)?.username || (resourceOwner as User)?.email || post.resource || "Unknown User"
                        }
                    </h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                        {post.createdAt
                            ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                            : "Just now"}
                    </time>
                </div>
            </>
        );

        // Если есть ссылка на профиль, оборачиваем в Link
        if (profileLink) {
            return (
                <Link href={profileLink} className="flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl p-2 -m-2 transition-colors duration-200">
                    {profileContent}
                </Link>
            );
        }

        // Если нет ссылки, просто отображаем без Link
        return (
            <div className="flex items-center space-x-4">
                {profileContent}
            </div>
        );
    };

    return (
        <article className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-gray-900/50">
            {/* Заголовок поста */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                    <ProfileSection />

                    {/* Меню действий */}
                    {isOwner && (
                        <Menu as="div" className="relative">
                            <Menu.Button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                                <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-2xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700">
                                    <div className="p-2">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className={clsx(
                                                        "flex items-center space-x-3 w-full text-left px-4 py-3 text-sm rounded-xl transition-colors duration-200",
                                                        active
                                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleDeletePost}
                                                    className={clsx(
                                                        "flex items-center space-x-3 w-full text-left px-4 py-3 text-sm rounded-xl transition-colors duration-200",
                                                        active
                                                            ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                                            : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    )}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    )}
                </div>
            </div>

            {/* Контент поста */}
            <div className="px-6">
                {isEditing ? (
                    <div className="mb-6">
                        <div className="relative">
              <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[120px] p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={4}
              />
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={cancelEdit}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleEditPost}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
                            >
                                <Check className="w-4 h-4" />
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <p className={clsx(
                            "text-gray-800 dark:text-gray-200 leading-relaxed",
                            !post.description && "italic text-gray-500 dark:text-gray-400"
                        )}>
                            {post.description || "No description"}
                        </p>
                    </div>
                )}

                {/* Медиафайлы */}
                {post.mediaFileIds && post.mediaFileIds.length > 0 && (
                    <div className="mb-6">
                        <MediaFiles mediaFileIds={post.mediaFileIds} />
                    </div>
                )}
            </div>

            {/* Статистика и действия */}
            <div className="px-6 pb-4">
                {/* Статистика реакций */}
                {(likesCount > 0 || dislikesCount > 0) && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-6">
                            {likesCount > 0 && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <ThumbsUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span>{likesCount}</span>
                                    </div>
                                </div>
                            )}
                            {dislikesCount > 0 && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                            <ThumbsDown className="w-3 h-3 text-red-600 dark:text-red-400" />
                                        </div>
                                        <span>{dislikesCount}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            {comments.length} comments
                        </button>
                    </div>
                )}

                {/* Кнопки действий */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        {/* Лайк */}
                        <button
                            onClick={() => handleReaction(ReactionType.LIKE)}
                            disabled={!user}
                            className={clsx(
                                "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group",
                                userReaction?.reactionType === ReactionType.LIKE
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400",
                                !user && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ThumbsUp
                                className={clsx(
                                    "w-5 h-5 transition-all duration-300",
                                    userReaction?.reactionType === ReactionType.LIKE && "scale-110"
                                )}
                            />
                            <span className="font-medium">Like</span>
                        </button>

                        {/* Дизлайк */}
                        <button
                            onClick={() => handleReaction(ReactionType.DISLIKE)}
                            disabled={!user}
                            className={clsx(
                                "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group",
                                userReaction?.reactionType === ReactionType.DISLIKE
                                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400",
                                !user && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ThumbsDown
                                className={clsx(
                                    "w-5 h-5 transition-all duration-300",
                                    userReaction?.reactionType === ReactionType.DISLIKE && "scale-110"
                                )}
                            />
                            <span className="font-medium">Dislike</span>
                        </button>
                    </div>

                    {/* Comments Button */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-all duration-200"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">Comment</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 mx-6 mb-6">
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                        <CommentList
                            postId={post.id}
                            initialComments={comments}
                            currentUserId={user?.id}
                        />
                    </div>
                </div>
            )}
        </article>
    );
}
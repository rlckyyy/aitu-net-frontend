import {User} from "@/models/User";
import {formatDistanceToNow} from "date-fns";
import {useEffect, useState} from "react";
import {api} from "@/lib";
import {Comment} from "@/models/comment/comment";
import {Menu, MenuButton, MenuItem, MenuItems, Transition} from "@headlessui/react";
import {defaultPfp} from "../../../public/modules/defaultPfp";
import {Check, MoreVertical, Pencil, Trash2} from "lucide-react";
import {useAuth} from "@/context/AuthProvider";

interface CommentListProps {
    postId: string;
    initialComments: Comment[];
    userMapInitial?: Record<string, User>;
    currentUserId?: string;
    onAddComment?: (comment: Comment) => void;
}

export function CommentList({
                                postId,
                                initialComments,
                                userMapInitial = {},
                                currentUserId,
                                onAddComment,
                            }: CommentListProps) {
    const {user} = useAuth();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [userMap, setUserMap] = useState<Record<string, User>>(userMapInitial);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState<string>('');

    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);

    useEffect(() => {
        const uniqueUserIds = Array.from(
            new Set(comments.map((c) => c.userId).filter(Boolean))
        ) as string[];

        Promise.all(
            uniqueUserIds.map((userId) =>
                api.user.getUserById(userId).then((res) => ({userId, user: res.data}))
            )
        ).then((results) => {
            const map: Record<string, User> = {};
            results.forEach(({userId, user}) => {
                map[userId] = user;
            });
            setUserMap(map);
        });
    }, [comments]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUserId) return;

        const commentToSave: Comment = {
            postId,
            userId: currentUserId,
            content: newComment,
        };

        const response = await api.comment.saveComment(commentToSave, []);
        const savedComment = response.data as Comment;

        setComments((prev) => [...prev, savedComment]);
        setNewComment("");

        if (onAddComment) {
            onAddComment(savedComment);
        }
    };

    return (
        <div className="mt-4 space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comments</h4>

            {comments.map(comment => {
                const commentUser = userMap?.[comment.userId || ''];
                const avatarUrl = commentUser?.avatar?.location || defaultPfp;
                const isOwnComment = user?.id === comment.userId;

                return (
                    <div
                        key={comment.id}
                        className="flex justify-between items-start bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm"
                    >
                        <div className="flex space-x-3">
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {commentUser?.username || "Anonymous"}
              </span>
                                    {comment.createdAt && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {formatDistanceToNow(new Date(comment.createdAt), {addSuffix: true})}
                </span>
                                    )}
                                </div>

                                {editingCommentId === comment.id ? (
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (!editedContent.trim() || !comment.id) return;
                                            await api.comment.updateComment(comment.id, {
                                                ...comment,
                                                content: editedContent
                                            });
                                            setComments(prev =>
                                                prev.map(c => (c.id === comment.id ? {
                                                    ...c,
                                                    content: editedContent
                                                } : c))
                                            );
                                            setEditingCommentId(null);
                                            setEditedContent('');
                                        }}
                                        className="mt-1 flex items-center space-x-2"
                                    >
                                        <input
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                            className="w-full px-2 py-1 rounded-md border text-sm dark:bg-gray-700 dark:text-white"
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            className="text-green-500 hover:text-green-700"
                                            title="Сохранить"
                                        >
                                            <Check className="w-4 h-4"/>
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-gray-700 dark:text-gray-300 mt-1">
                                        {comment.content}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isOwnComment && (
                            <Menu as="div" className="relative inline-block text-left">
                                <MenuButton className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <MoreVertical className="w-4 h-4"/>
                                </MenuButton>
                                <Transition
                                    enter="transition duration-100 ease-out"
                                    enterFrom="transform scale-95 opacity-0"
                                    enterTo="transform scale-100 opacity-100"
                                    leave="transition duration-75 ease-in"
                                    leaveFrom="transform scale-100 opacity-100"
                                    leaveTo="transform scale-95 opacity-0"
                                >
                                    <MenuItems
                                        className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                    >
                                        <MenuItem>
                                            {({active}) => (
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id || null);
                                                        setEditedContent(comment.content || '');
                                                    }}
                                                    className={`${
                                                        active ? 'bg-gray-100 dark:bg-gray-800' : ''
                                                    } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                                                >
                                                    <Pencil className="w-4 h-4 mr-2"/> Edit
                                                </button>
                                            )}
                                        </MenuItem>
                                        <MenuItem>
                                            {({active}) => (
                                                <button
                                                    onClick={async () => {
                                                        if (!comment.id) return;
                                                        await api.comment.deleteComment(comment.id);
                                                        setComments(prev => prev.filter(c => c.id !== comment.id));
                                                    }}
                                                    className={`${
                                                        active ? 'bg-gray-100 dark:bg-gray-800' : ''
                                                    } group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2"/> Delete
                                                </button>
                                            )}
                                        </MenuItem>
                                    </MenuItems>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                );
            })}

            {user && (
                <form onSubmit={handleCommentSubmit} className="mt-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white"
                        placeholder="Write a comment..."
                    />
                </form>
            )}
        </div>

    );
}

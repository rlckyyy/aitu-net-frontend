import {Post} from "@/models/post/post";
import {useEffect, useState} from "react";
import {Reaction, ReactionType} from "@/models/reaction/reaction";
import {api} from "@/lib";
import {Comment, CommentCriteria} from "@/models/comment/comment";
import {defaultPfp} from "../../../public/modules/defaultPfp";
import {formatDistanceToNow} from "date-fns";
import clsx from "clsx";
import {MediaFiles} from "@/components/MediaFiles";
import {useAuth} from "@/context/AuthProvider";

interface PostUnitProps {
    post: Post;
}

export default function PostUnit({post}: PostUnitProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [newComment, setNewComment] = useState('');
    const {user} = useAuth();

    useEffect(() => {
        const params: CommentCriteria = {
            postId: post.id,
        };
        api.comment.getComments(params).then(r => setComments(r.data));
        api.post.getReactions(post.id).then(r => setReactions(r.data));
    }, [post.id]);

    const handleReaction = async (reactionType: ReactionType) => {
        if (!user) return;
        const existingReaction = reactions.find((r) => r.userId === user?.id);

        if (existingReaction) {
            if (existingReaction.reactionType === reactionType) {
                await api.post.deletePostReaction(post.id, user?.id);
                setReactions(reactions.filter((r) => r.userId !== user?.id));
            } else {
                existingReaction.reactionType = reactionType;
                await api.post.updatePostReaction(existingReaction);
                setReactions([...reactions.filter((r) => r.userId !== user?.id), existingReaction]);
            }
        } else {
            const newReaction: Reaction = {
                userId: user.id,
                postId: post.id,
                reactionType: reactionType
            };
            await api.post.updatePostReaction(newReaction);
            setReactions([...reactions, newReaction]);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim()) return;
        if (!user?.id) return;

        const comment: Comment = {
            postId: post.id,
            userId: user.id,
            content: newComment,
        }

        const response = await api.comment.saveComment(comment, []);

        setComments((prevComments) => [...prevComments, response.data as Comment]);

        setNewComment('');
    };

    return (
        <div className="space-y-6 mt-6">
            <div
                key={post.id}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
            >
                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <img
                        src={user?.avatar?.location || defaultPfp}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {post.resource || "Unknown"}
          </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
            {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                : "Just now"}
          </span>
                    </div>
                </div>

                {/* Description */}
                <p
                    className={clsx(
                        "text-sm mb-4",
                        post.description
                            ? "text-gray-800 dark:text-gray-200"
                            : "italic text-gray-500 dark:text-gray-400"
                    )}
                >
                    {post.description || "No description"}
                </p>

                {/* Media */}
                {post.mediaFileIds && post.mediaFileIds.length > 0 && (
                    <div className="mb-4">
                        <MediaFiles mediaFileIds={post.mediaFileIds} />
                    </div>
                )}

                {/* Reactions */}
                <div className="flex items-center space-x-4 border-t pt-3">
                    <button
                        onClick={() => handleReaction(ReactionType.LIKE)}
                        className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 text-sm"
                        disabled={!user}
                    >
                        <span>👍</span>
                        <span>
            {reactions.filter(r => r.reactionType === ReactionType.LIKE).length} Like
                            {reactions.filter(r => r.reactionType === ReactionType.LIKE).length !== 1 && 's'}
          </span>
                    </button>

                    <button
                        onClick={() => handleReaction(ReactionType.DISLIKE)}
                        className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
                        disabled={!user}
                    >
                        <span>👎</span>
                        <span>Dislike</span>
                    </button>
                </div>

                {/* Comments */}
                <div className="mt-4 space-y-3 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comments</h4>
                    {comments.map(comment => (
                        <div
                            key={comment.id}
                            className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm"
                        >
                            <div className="font-medium text-gray-900 dark:text-white">{comment.userId || "Anonymous"}</div>
                            <div className="text-gray-700 dark:text-gray-300">{comment.content}</div>
                        </div>
                    ))}

                    {/* Add Comment Form */}
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
            </div>
        </div>
    );

}
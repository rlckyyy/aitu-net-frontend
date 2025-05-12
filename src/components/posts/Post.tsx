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

    const handleLike = async () => {
        if (!user?.id) return;
        let reaction = reactions.find(r => r.userId === user?.id) as Reaction;

        if (reaction) {
            if (reaction.reactionType === "LIKE") {
                await api.post.deletePostReaction(post.id, user.id);
                setReactions(reactions.filter(r => r.userId !== user?.id));
            } else if (reaction.reactionType === "DISLIKE") {
                reaction.reactionType = ReactionType.LIKE;
                await api.post.updatePostReaction(reaction);
                const updatedReactions = await api.post.getReactions(post.id);
                setReactions(updatedReactions.data);
            }
        } else {
            const reaction: Reaction = {
                postId: post.id,
                userId: user.id,
                reactionType: ReactionType.LIKE
            }
            await api.post.updatePostReaction(reaction);
            const updatedReactions = await api.post.getReactions(post.id);
            setReactions(updatedReactions.data);
        }
        console.log("HandleLike Func")
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
                <div className="flex items-center space-x-4 mb-3">
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
                  ? formatDistanceToNow(new Date(post.createdAt), {addSuffix: true})
                  : "Just now"}
            </span>
                    </div>
                </div>

                {/* Description */}
                <p
                    className={clsx(
                        "text-sm mb-3",
                        post.description
                            ? "text-gray-800 dark:text-gray-200"
                            : "italic text-gray-500 dark:text-gray-400"
                    )}
                >
                    {post.description || "No description"}
                </p>

                {/* Media */}
                {post.mediaFileIds && post.mediaFileIds.length > 0 && (
                    <MediaFiles mediaFileIds={post.mediaFileIds}/>
                )}

                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className="text-blue-600 dark:text-blue-400 text-sm mt-3"
                >
                    ❤️ {reactions.length} Like{reactions.length !== 1 && 's'}
                </button>

                {/* Comments */}
                <div className="mt-4 space-y-2">
                    {comments.map(comment => (
                        <div
                            key={comment.id}
                            className="text-sm text-gray-700 dark:text-gray-300 border-t pt-2"
                        >
                            <div className="font-medium">{comment.userId || "Anonymous"}</div>
                            <div>{comment.content}</div>
                        </div>
                    ))}

                    {/* Add Comment Form */}
                    {user && (<form onSubmit={handleCommentSubmit} className="mt-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:text-white"
                            placeholder="Write a comment..."
                        />
                    </form>)}
                </div>
            </div>
        </div>
    );
}
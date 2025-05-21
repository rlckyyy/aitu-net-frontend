import {Post, PostType} from "@/models/post/post";
import {useEffect, useState} from "react";
import {Reaction, ReactionType} from "@/models/reaction/reaction";
import {api} from "@/lib";
import {Comment, CommentCriteria} from "@/models/comment/comment";
import {defaultPfp} from "../../../public/modules/defaultPfp";
import {formatDistanceToNow} from "date-fns";
import clsx from "clsx";
import {MediaFiles} from "@/components/MediaFiles";
import {useAuth} from "@/context/AuthProvider";
import {User} from "@/models/User";
import {ThumbsDown, ThumbsUp} from "lucide-react";
import {Group} from "@/models/group/group";

interface PostUnitProps {
    post: Post;
}

export default function PostUnit({post}: PostUnitProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [newComment, setNewComment] = useState('');
    const {user} = useAuth();
    const [userMap, setUserMap] = useState<Record<string, User>>();
    const [resourceOwner, setResourceOwner] = useState<User | Group | null>(null);
    const userReaction = reactions.find(r => r.userId === user?.id);


    useEffect(() => {
        const params: CommentCriteria = {
            postId: post.id,
        };
        api.comment.getComments(params).then(r => setComments(r.data));
        api.post.getReactions(post.id).then(r => setReactions(r.data));
    }, []);
    useEffect(() => {
        console.log(post);
        if (post.postType === PostType.GROUP && post.groupId) {
            api.group.getById(post.groupId).then(r => setResourceOwner(r.data));
        } else if (post.postType === PostType.USER && post.ownerId) {
            api.user.getUserById(post.ownerId).then(r => setResourceOwner(r.data));
        }
    }, [post.postType, post.ownerId, post.groupId]);

    useEffect(() => {
        const uniqueUserIds = Array.from(new Set(comments.map(c => c.userId).filter(Boolean))) as string[];

        Promise.all(
            uniqueUserIds.map(userId =>
                api.user.getUserById(userId).then(user => ({userId, user: user.data}))
            )
        ).then(results => {
            const map: Record<string, User> = {};
            results.forEach(({userId, user}) => {
                map[userId] = user;
            });
            setUserMap(map);
        });
    }, [comments]);

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
                        src={resourceOwner?.avatar?.location || defaultPfp}
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
                        <MediaFiles mediaFileIds={post.mediaFileIds}/>
                    </div>
                )}

                {/* Reactions */}
                <div className="flex flex-col items-start space-y-2 pt-3">
                    <div className="flex items-end space-x-6">
                        {/* Like */}
                        <button
                            onClick={() => handleReaction(ReactionType.LIKE)}
                            className="group transition-all duration-200 transform hover:scale-110 active:scale-95"
                            disabled={!user}
                        >
                            <ThumbsUp
                                size={28}
                                className={`transition-colors duration-300 ${
                                    userReaction?.reactionType === ReactionType.LIKE
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500'
                                }`}
                                fill={
                                    userReaction?.reactionType === ReactionType.LIKE ? '#2563eb' : 'none'
                                }
                            />
                        </button>

                        {/* Dislike */}
                        <button
                            onClick={() => handleReaction(ReactionType.DISLIKE)}
                            className="group transition-all duration-200 transform hover:scale-110 active:scale-95"
                            disabled={!user}
                        >
                            <ThumbsDown
                                size={28}
                                className={`transition-colors duration-300 ${
                                    userReaction?.reactionType === ReactionType.DISLIKE
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-400 dark:text-gray-500 group-hover:text-red-500'
                                }`}
                                fill={
                                    userReaction?.reactionType === ReactionType.DISLIKE ? '#dc2626' : 'none'
                                }
                            />
                        </button>
                    </div>

                    {/* Like count (under both buttons) */}
                    <div
                        className="ml-1 mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 shadow-sm w-fit">
                        {reactions.filter(r => r.reactionType === ReactionType.LIKE).length} Likes
                    </div>
                </div>


                {/* Comments */}
                <div className="mt-4 space-y-3 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comments</h4>
                    {comments.map(comment => {
                        const user = userMap?.[comment.userId || ''];
                        const avatarUrl = user?.avatar?.location || '/default-avatar.png';

                        return (
                            <div
                                key={comment.id}
                                className="flex items-start space-x-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-md text-sm"
                            >
                                <img
                                    src={avatarUrl}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {user?.username || "Anonymous"}
                                    </div>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        {comment.content}
                                    </div>
                                </div>
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
            </div>
        </div>
    );

}
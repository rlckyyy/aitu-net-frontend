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
import {MoreVertical, ThumbsDown, ThumbsUp} from "lucide-react";
import {Group} from "@/models/group/group";
import {Menu} from "@headlessui/react";
import {CommentList} from "@/components/comments/Comment";

interface PostUnitProps {
    post: Post;
    onDelete?: (postId: string) => void;
}

export default function PostUnit({post, onDelete}: PostUnitProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const {user} = useAuth();
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
        if (post.postType === PostType.GROUP && post.groupId) {
            api.group.getById(post.groupId).then(r => setResourceOwner(r.data));
        } else if (post.postType === PostType.USER && post.ownerId) {
            api.user.getUserById(post.ownerId).then(r => setResourceOwner(r.data));
        }
    }, [post.postType, post.ownerId, post.groupId]);

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


    const handleDeletePost = async () => {
        await api.post.deletePost(post.id);
        if (onDelete) onDelete(post.id);
    };

    return (
        <div className="space-y-6 mt-6">
            <div
                key={post.id}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
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

                    {/* Dropdown Menu */}
                    <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                        </Menu.Button>

                        <Menu.Items
                            className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={handleDeletePost}
                                            className={`${
                                                active
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-white"
                                                    : "text-red-600 dark:text-red-400"
                                            } block w-full text-left px-4 py-2 text-sm`}
                                        >
                                            Delete Post
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu>
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
                    <div
                        className="ml-1 mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 shadow-sm w-fit">
                        {reactions.filter(r => r.reactionType === ReactionType.LIKE).length} Likes
                    </div>
                </div>

                <CommentList
                    postId={post.id}
                    initialComments={comments}
                    currentUserId={user?.id}
                />

            </div>
        </div>
    );
}

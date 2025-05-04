import {Post} from "@/models/post/post";
import clsx from "clsx";
import {MediaFiles} from "@/components/MediaFiles";
import {formatDistanceToNow} from "date-fns";
import {defaultPfp} from "../../../public/modules/defaultPfp";

export interface PostFeedProps {
    posts: Post[];
}

export const PostFeed: React.FC<PostFeedProps> = ({posts}) => {
    if (!posts) {
        return <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading posts...</p>;
    }

    if (posts.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No posts yet</p>;
    }

    return (
        <div className="space-y-6 mt-6">
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                >
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-3">
                        <img
                            src={post.avatarUrl || defaultPfp}
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
                </div>
            ))}
        </div>
    );
};
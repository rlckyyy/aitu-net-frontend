'use client'

import {Post} from "@/models/post/post";
import clsx from "clsx";
import {MediaFiles} from "@/components/MediaFiles";

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
        <div className="space-y-4 mt-6">
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <p
                        className={clsx(
                            "text-sm mb-2",
                            post.description
                                ? "text-gray-800 dark:text-gray-200"
                                : "italic text-gray-500 dark:text-gray-400"
                        )}
                    >
                        {post.description}
                    </p>

                    {post.mediaFileIds && post.mediaFileIds.length > 0 && (
                        <MediaFiles mediaFileIds={post.mediaFileIds}/>
                    )}
                </div>
            ))}
        </div>
    );
}
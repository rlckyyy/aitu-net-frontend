import {Post} from "@/models/post/post";
import {Loading} from "@/components/Loading";
import PostUnit from "@/components/posts/Post";

export interface PostFeedProps {
    posts: Post[];
    onDelete: (postId: string) => void;
}

export const PostFeed: React.FC<PostFeedProps> = ({posts, onDelete}) => {

    if (!posts) {
        return <Loading/>
    }

    if (posts.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No posts yet</p>;
    }

    return (
        <div className="space-y-6 mt-6">
            {posts.map(post => (
                <PostUnit post={post} key={post.id} onDelete={onDelete}/>
            ))}
        </div>
    );
};
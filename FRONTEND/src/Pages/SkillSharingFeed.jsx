import {useState, useEffect} from "react";
import {Heart, MessageSquare, Edit, Trash, Filter, TrendingUp, Clock, Sparkles} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import {useAuth} from "../context/auth";
import toast from "react-hot-toast";
import {
    getAllPosts,
    addLike,
    removeLike,
    addComment,
    deletePost,
} from "../api/skillSharingAPI";
import useConfirmModal from "../hooks/useConfirmModal";
import CreatePostForm from "../components/CreateSkillPostModal";
import Comment, {CommentForm} from "../components/CommentComponent";
import EditPostModal from "../components/EditSkillPostModal";
import ConfirmModal from "../components/ConfirmModal";
import SkillSharingCard from "../components/SkillSharingCard";
import {Link} from "react-router-dom";
import { getUsersById } from "../api/profileAPI";

const SkillSharingFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState({});
    const [editingPost, setEditingPost] = useState(null);
    const [filterOption, setFilterOption] = useState("latest");
    const {modalState, openModal, closeModal} = useConfirmModal();
    const [followingIds, setFollowingIds] = useState([]);

    const {currentUser} = useAuth();

    useEffect(() => {
        // fetch all posts and following list when component mounts
        fetchFollowingAndPosts();
    }, []);

    const fetchFollowingAndPosts = async () => {
        setLoading(true);
        try {
            // Fetch following list (assuming currentUser.followingUsers is available)
            const following = currentUser?.followingUsers || [];
            setFollowingIds(following);
            // Fetch all posts
            const response = await getAllPosts(currentUser?.token);
            // Filter posts to only those from following
            const filteredPosts = (response.data || []).filter(post => following.includes(post.userId));
            setPosts(filteredPosts);
        } catch (error) {
            console.error("Error fetching posts or following:", error);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = () => {
        fetchFollowingAndPosts();
    };

    const handlePostUpdated = () => {
        fetchFollowingAndPosts();
        setEditingPost(null);
    };

    const handleDeletePost = async (postId, isUpdate = false) => {
        if (isUpdate) {
            // This is just a post update, refresh the feed
            fetchFollowingAndPosts();
            return;
        }

        try {
            await deletePost(postId, currentUser?.token);
            setPosts(posts.filter((post) => post.id !== postId));
            toast.success("Post deleted successfully");
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post");
        }

    };

    const handleLike = async (postId) => {
        const post = posts.find((p) => p.id === postId);
        const isLiked = post?.likes?.some(
            (like) => like.userId === currentUser?.id
        );

        const originalPosts = [...posts];

        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    if (isLiked) {
                        return {
                            ...post,
                            likes: post.likes.filter(
                                (like) => like.userId !== currentUser.id
                            ),
                        };
                    } else {
                        return {
                            ...post,
                            likes: [
                                ...(post.likes || []),
                                {userId: currentUser.id, createdAt: new Date()},
                            ],
                        };
                    }
                }
                return post;
            })
        );

        try {
            // Make the API call after UI is already updated
            if (isLiked) {
                await removeLike(postId, currentUser.id, currentUser.token);
            } else {
                const likeData = {userId: currentUser.id};
                await addLike(postId, likeData, currentUser.token);
            }
            // If successful, we keep the UI as is (already updated)
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to process like");

            // Revert to original state if API call fails
            setPosts(originalPosts);
        }
    };

    const toggleComments = (postId) => {
        setShowComments({
            ...showComments,
            [postId]: !showComments[postId],
        });
    };

    const handleAddComment = async (postId, commentData) => {
        try {
            const response = await addComment(postId, commentData, currentUser.token);

            // Update the posts state with the updated post from the response
            setPosts(
                posts.map((post) => (post.id === postId ? response.data : post))
            );

            return response;
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error("Failed to add comment");
            throw error;
        }
    };

    const handleCommentUpdated = (postId, commentId, newContent) => {
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.map((comment) => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    content: newContent,
                                    updatedAt: new Date(),
                                };
                            }
                            return comment;
                        }),
                    };
                }
                return post;
            })
        );
    };

    const handleCommentDeleted = (postId, commentId) => {
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(
                            (comment) => comment.id !== commentId
                        ),
                    };
                }
                return post;
            })
        );
    };

    // Filter and sort posts based on selected option
    const getFilteredPosts = () => {
        if (!posts.length) return [];

        let filteredPosts = [...posts];

        switch (filterOption) {
            case 'trending':
                // Sort by most likes
                filteredPosts.sort((a, b) =>
                    (b.likes?.length || 0) - (a.likes?.length || 0)
                );
                break;
            case 'popular':
                // Sort by most comments
                filteredPosts.sort((a, b) =>
                    (b.comments?.length || 0) - (a.comments?.length || 0)
                );
                break;
            case 'latest':
            default:
                // Sort by most recent
                filteredPosts.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                break;
        }

        return filteredPosts;
    };

    useEffect(() => {
        const filteredPosts = getFilteredPosts();
        setPosts(filteredPosts);
    }, [filterOption]);

    return (
        <div className="space-y-6">
            {/* Create Post Component */}
            <motion.div
                className="bg-black rounded-xl shadow-lg overflow-hidden border border-gray-800"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
            >
                <div className="p-4">
                    <CreatePostForm onPostCreated={handlePostCreated}/>
                </div>
            </motion.div>

            {/* Filter Controls */}
            <motion.div
                className="bg-black rounded-xl p-2 flex justify-between items-center shadow-lg border border-gray-800"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3, delay: 0.1}}
            >
                <div className="flex items-center space-x-1">
          <span className="text-gray-400 px-2 hidden sm:inline">
            <Filter size={16}/>
          </span>
                    <span className="text-gray-400 text-sm">Following Feed</span>
                </div>
            </motion.div>

            {/* Posts List */}
            {loading ? (
                <div className="text-center text-gray-400 py-10">Loading...</div>
            ) : posts.length === 0 ? (
                <motion.div
                    className="bg-[#041409] rounded-xl p-8 text-center shadow-lg border border-gray-800"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.2}}
                >
                    <div className="mb-4 flex justify-center">
                        <div className="relative w-16 h-16">
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 80 80"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M40 12L69.3 28V60L40 76L10.7 60V28L40 12Z"
                                    fill="#F5D13B"
                                    fillOpacity="0.2"
                                    stroke="#F5D13B"
                                    strokeWidth="2"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-yellow-400">
                                <MessageSquare size={24}/>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        No posts to show
                    </h3>
                    <p className="text-gray-400">
                        You are not following anyone or none of your following have posted yet.
                    </p>
                </motion.div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-6">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{opacity: 0, y: 50}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: index * 0.1}}
                            >
                                <SkillSharingCard
                                    post={post}
                                    currentUser={currentUser}
                                    onLike={handleLike}
                                    onDelete={handleDeletePost}
                                    onComment={handleAddComment}
                                    onCommentUpdated={handleCommentUpdated}
                                    onCommentDeleted={handleCommentDeleted}
                                    token={currentUser.token}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default SkillSharingFeed;
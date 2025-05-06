import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import LearningPlanCard from "../components/LearningPlanCard";
import EditLearningPlanModal from "../components/EditLearningPlanModal";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "../components/ConfirmModal";
import {
  createLearningPlan,
  getAllLearningPlans,
  deleteLearningPlan,
  addLike,
  removeLike,
  addComment,
  updateLearningPlanComment,
  deleteLearningPlanComment,
} from "../api/learningPlanAPI";
import {
  Book,
  LinkIcon,
  Plus,
  X,
  Filter,
  Bookmark,
  TrendingUp,
  CalendarDays
} from "lucide-react";

const LearningPlanPage = () => {
  const { currentUser } = useAuth();
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const { modalState, openModal, closeModal } = useConfirmModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      topics: "",
      resources: "",
    },
  });

  useEffect(() => {
    fetchLearningPlans();
  }, []);

  const fetchLearningPlans = async () => {
    setLoading(true);
    try {
      const response = await getAllLearningPlans(currentUser?.token);
      setLearningPlans(response.data);
    } catch (error) {
      console.error("Error fetching learning plans:", error);
      toast.error("Failed to load learning plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (data) => {
    if (!currentUser) {
      toast.error("You must be logged in to share a learning plan");
      return;
    }

    if (!data.title.trim() || !data.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const planData = {
        userId: currentUser.id,
        userName: currentUser.name,
        userProfileImage: currentUser.profileImage,
        ...data,
      };

      const response = await createLearningPlan(
          currentUser.id,
          planData,
          currentUser.token
      );

      toast.success("Learning plan shared successfully");
      setLearningPlans([response.data, ...learningPlans]);
      reset();
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating learning plan:", error);
      toast.error("Failed to share learning plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (planId) => {
    if (!currentUser) {
      toast.error("You must be logged in to like this plan");
      return;
    }

    try {
      const isLiked = learningPlans
          .find((p) => p.id === planId)
          ?.likes?.some((like) => like.userId === currentUser.id);

      if (isLiked) {
        // Unlike
        await removeLike(planId, currentUser.id, currentUser.token);

        // Update state
        setLearningPlans(
            learningPlans.map((plan) => {
              if (plan.id === planId) {
                return {
                  ...plan,
                  likes: plan.likes.filter(
                      (like) => like.userId !== currentUser.id
                  ),
                };
              }
              return plan;
            })
        );
      } else {
        // Like
        const likeData = { userId: currentUser.id, userName: currentUser.name };
        const response = await addLike(planId, likeData, currentUser.token);

        // Update state
        setLearningPlans(
            learningPlans.map((plan) => {
              if (plan.id === planId) {
                return response.data;
              }
              return plan;
            })
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to process like");
    }
  };

  const handleAddComment = async (planId, commentData) => {
    if (!currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const response = await addComment(planId, commentData, currentUser.token);

      // Update state
      setLearningPlans(
          learningPlans.map((plan) => {
            if (plan.id === planId) {
              return response.data;
            }
            return plan;
          })
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      throw error;
    }
  };

  const handleUpdateComment = async (planId, commentId, updatedContent) => {
    setLearningPlans(
        learningPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              comments: plan.comments.map((comment) => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    content: updatedContent,
                    updatedAt: new Date(),
                  };
                }
                return comment;
              }),
            };
          }
          return plan;
        })
    );
  };

  const handleDeleteComment = async (planId, commentId) => {
    setLearningPlans(
        learningPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              comments: plan.comments.filter(
                  (comment) => comment.id !== commentId
              ),
            };
          }
          return plan;
        })
    );
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
  };

  const handlePlanUpdated = async () => {
    await fetchLearningPlans();
    setEditingPlan(null);
  };

  const handleDelete = (planId) => {
    openModal({
      title: "Delete Learning Plan",
      message:
          "Are you sure you want to delete this learning plan? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteLearningPlan(planId, currentUser.token);
          setLearningPlans(learningPlans.filter((plan) => plan.id !== planId));
          toast.success("Learning plan deleted");
        } catch (error) {
          console.error("Error deleting learning plan:", error);
          toast.error("Failed to delete learning plan");
        }
      },
    });
  };

  // Get filtered learning plans
  const getFilteredPlans = () => {
    if (filterType === 'all') return learningPlans;

    // For now, we'll just filter by the existence of certain fields
    // In a real application, you might have better categorization
    switch (filterType) {
      case 'topics':
        return learningPlans.filter(plan => plan.topics && plan.topics.trim() !== '');
      case 'resources':
        return learningPlans.filter(plan => plan.resources && plan.resources.trim() !== '');
      case 'newest':
        return [...learningPlans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return learningPlans;
    }
  };

  return (
      <div className="max-w-2xl mx-auto pb-10">
        {/* Create Learning Plan Button/Form */}
        <motion.div
            className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 mb-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          {showCreateForm ? (
              <div>
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Book size={20} className="text-yellow-400 mr-2" />
                    Share Your Learning Plan
                  </h2>
                  <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                    onSubmit={handleSubmit(handlePlanSubmit)}
                    className="p-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Title*
                    </label>
                    <input
                        type="text"
                        {...register("title", { required: "Title is required" })}
                        placeholder="Give your learning plan a clear title"
                        className={`w-full p-2 bg-gray-800 rounded-lg border ${
                            errors.title ? "border-red-500" : "border-gray-700"
                        } text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none`}
                        disabled={isSubmitting}
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.title.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description*
                    </label>
                    <textarea
                        {...register("description", {
                          required: "Description is required",
                        })}
                        placeholder="Describe your learning plan in detail"
                        rows="4"
                        className={`w-full p-2 bg-gray-800 rounded-lg border ${
                            errors.description ? "border-red-500" : "border-gray-700"
                        } text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none`}
                        disabled={isSubmitting}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.description.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                      <Book size={14} className="text-yellow-400 mr-1.5" />
                      Topics (comma-separated)
                    </label>
                    <input
                        type="text"
                        {...register("topics")}
                        placeholder="e.g., JavaScript, React, UI Design"
                        className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add the topics you'll be covering in this learning plan
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                      <LinkIcon size={14} className="text-yellow-400 mr-1.5" />
                      Resources (comma-separated)
                    </label>
                    <textarea
                        {...register("resources")}
                        placeholder="e.g., https://example.com/tutorial, Book: JavaScript Basics"
                        rows="3"
                        className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                        disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add links to articles, books, courses, or other resources
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <motion.button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isSubmitting}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-yellow-900 disabled:text-gray-500 flex items-center cursor-pointer"
                        whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                        disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sharing..." : (
                          <>
                            <Plus size={16} className="mr-1.5" />
                            Share Plan
                          </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
          ) : (
              <button
                  onClick={() => setShowCreateForm(true)}
                  className="p-4 w-full flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center">
                  <Plus className="text-yellow-400" size={20} />
                </div>
                <span className="text-white font-medium">Share Your Learning Plan</span>
              </button>
          )}
        </motion.div>

        {/* Filter Controls */}
        <motion.div
            className="bg-gray-900 rounded-xl p-2 flex justify-between items-center shadow-lg border border-gray-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-1">
          <span className="text-gray-400 px-2 hidden sm:inline">
            <Filter size={16} />
          </span>
            <span className="text-gray-300 font-medium hidden sm:inline">Filter:</span>
          </div>

          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
                onClick={() => setFilterType('all')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    filterType === 'all'
                        ? 'bg-black text-yellow-400'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
              <span className="sm:hidden">All</span>
              <span className="hidden sm:inline">All Plans</span>
            </button>

            <button
                onClick={() => setFilterType('topics')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    filterType === 'topics'
                        ? 'bg-black text-yellow-400'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
              <Book size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">With Topics</span>
            </button>

            <button
                onClick={() => setFilterType('resources')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    filterType === 'resources'
                        ? 'bg-black text-yellow-400'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
              <LinkIcon size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">With Resources</span>
            </button>

            <button
                onClick={() => setFilterType('newest')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    filterType === 'newest'
                        ? 'bg-black text-yellow-400'
                        : 'text-gray-400 hover:text-white'
                }`}
            >
              <CalendarDays size={14} className="sm:mr-1" />
              <span className="hidden sm:inline">Newest</span>
            </button>
          </div>
        </motion.div>

        {/* Learning Plans Feed */}
        {loading ? (
            <div className="flex justify-center items-center my-12">
              <motion.div
                  className="relative w-12 h-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0">
                  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin">
                    <path
                        d="M40 8L73.3 26V62L40 80L6.7 62V26L40 8Z"
                        fill="none"
                        stroke="#F5D13B"
                        strokeWidth="4"
                        strokeDasharray="200"
                        strokeDashoffset="150"
                        strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-500 opacity-70 rounded-sm rotate-45"></div>
                </div>
              </motion.div>
            </div>
        ) : getFilteredPlans().length === 0 ? (
            <motion.div
                className="bg-gray-900 rounded-xl p-8 text-center shadow-lg border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
                    <Book size={24} />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filterType === 'all'
                    ? 'No learning plans yet'
                    : `No learning plans with ${filterType === 'newest' ? 'recent activity' : filterType}`}
              </h3>
              <p className="text-gray-400 mb-4">
                Be the first to share your learning journey with the community!
              </p>
              <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Create a Learning Plan
              </button>
            </motion.div>
        ) : (
            <AnimatePresence>
              <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
              >
                {getFilteredPlans().map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        layout
                    >
                      <LearningPlanCard
                          plan={plan}
                          currentUser={currentUser}
                          onLike={handleLike}
                          onComment={handleAddComment}
                          onDeleteComment={handleDeleteComment}
                          onUpdateComment={handleUpdateComment}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          token={currentUser?.token}
                      />
                    </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
        )}

        {/* Edit Plan Modal */}
        {editingPlan && (
            <EditLearningPlanModal
                plan={editingPlan}
                onClose={() => setEditingPlan(null)}
                onPlanUpdated={handlePlanUpdated}
                token={currentUser?.token}
            />
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onConfirm={modalState.onConfirm}
            title={modalState.title}
            message={modalState.message}
            confirmText={modalState.confirmText}
            cancelText={modalState.cancelText}
            confirmButtonClass={modalState.confirmButtonClass}
            type={modalState.type}
        />
      </div>
  );
};

export default LearningPlanPage;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { deleteComment, updateComment } from "../api/skillSharingAPI";
import toast from "react-hot-toast";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import {
  deleteLearningProgressComment,
  updateLearningProgressComment,
} from "../api/learningProgressAPI";
import {
  deleteLearningPlanComment,
  updateLearningPlanComment,
} from "../api/learningPlanAPI";
import UserAvatar from "./UserAvatar";

export const CommentForm = ({ postId, onAddComment, currentUser }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      commentText: "",
    },
  });

  const onSubmit = async (data) => {
    if (!data.commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const commentData = {
        userId: currentUser.id,
        userName: currentUser.name,
        content: data.commentText,
      };

      await onAddComment(postId, commentData);
      reset();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
        <div className="relative flex-shrink-0">
          <UserAvatar
              src={currentUser.profileImage}
              alt={currentUser.name}
              name={currentUser.name}
              size="h-8 w-8"
          />
        </div>
        <div className="flex-grow flex items-center relative">
          <input
              type="text"
              placeholder="Add a comment..."
              className={`w-full px-4 py-2 pr-10 rounded-lg border-0 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 ${
                  errors.commentText ? "focus:ring-red-500" : ""
              } focus:outline-none`}
              {...register("commentText", { required: true })}
              disabled={isSubmitting}
          />
          <motion.button
              type="submit"
              className="absolute right-3 text-red-500 hover:text-red-400 disabled:text-gray-600 cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isSubmitting}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </form>
  );
};

// Comment component
const Comment = ({
                   comment,
                   postId,
                   currentUser,
                   postUserId,
                   onCommentUpdated,
                   onCommentDeleted,
                   token,
                   commentType,
                 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { modalState, openModal, closeModal } = useConfirmModal();

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      updatedContent: comment.content,
    },
  });

  React.useEffect(() => {
    setValue("updatedContent", comment.content);
  }, [comment.content, setValue]);

  const handleDelete = async () => {
    openModal({
      title: "Delete Comment",
      message:
          "Are you sure you want to delete this comment? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          setIsDeleting(true);

          if (commentType === "SKILL_SHARING") {
            await deleteComment(postId, comment.id, currentUser.id, token);
          } else if (commentType === "LEARNING_PROGRESS") {
            await deleteLearningProgressComment(
                postId,
                comment.id,
                currentUser.id,
                token
            );
          } else if (commentType === "LEARNING_PLANS") {
            await deleteLearningPlanComment(
                postId,
                comment.id,
                currentUser.id,
                token
            );
          } else {
            toast.error("Invalid comment type");
            return;
          }

          onCommentDeleted(postId, comment.id);
          toast.success("Comment deleted");
        } catch (error) {
          console.error("Error deleting comment:", error);
          toast.error("Failed to delete comment");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleUpdate = async (data) => {
    if (!data.updatedContent.trim()) return;

    try {
      const updatedComment = {
        ...comment,
        content: data.updatedContent,
        updatedAt: new Date(),
      };

      if (commentType === "SKILL_SHARING") {
        await updateComment(postId, comment.id, updatedComment, token);
      } else if (commentType === "LEARNING_PROGRESS") {
        await updateLearningProgressComment(
            postId,
            comment.id,
            updatedComment,
            token
        );
      } else if (commentType === "LEARNING_PLANS") {
        await updateLearningPlanComment(
            postId,
            comment.id,
            updatedComment,
            token
        );
      } else {
        toast.error("Invalid comment type");
        return;
      }

      onCommentUpdated(postId, comment.id, data.updatedContent);
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  return (
      <>
        <motion.div
            className="flex space-x-2 rounded-lg bg-gray-800/50 p-2.5 hover:bg-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
          <div className="flex-shrink-0">
            <UserAvatar
                src={comment.userProfileImage}
                alt={comment.userName}
                name={comment.userName}
                size="h-7 w-7"
            />
          </div>

          <div className="flex-grow">
            {isEditing ? (
                <form onSubmit={handleSubmit(handleUpdate)} className="mt-1">
                  <div className="flex flex-col space-y-2">
                    <input
                        type="text"
                        className="w-full text-sm px-3 py-2 rounded-lg border-0 bg-gray-900 text-white focus:ring-2 focus:ring-red-500"
                        {...register("updatedContent", { required: true })}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="text-xs px-2 py-1 text-gray-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                          type="submit"
                          className="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
            ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {comment.userName}
                      </p>
                      <p className="text-sm text-gray-300 mt-0.5">{comment.content}</p>
                    </div>

                    {(comment.userId === currentUser?.id ||
                        postUserId === currentUser?.id) && (
                        <div className="flex space-x-1 ml-2 mt-0.5">
                          {comment.userId === currentUser?.id && (
                              <motion.button
                                  onClick={() => setIsEditing(true)}
                                  className="text-xs text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  disabled={isEditing || isDeleting}
                              >
                                <Edit size={12} />
                              </motion.button>
                          )}
                          <motion.button
                              onClick={handleDelete}
                              className="text-xs text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isEditing || isDeleting}
                          >
                            <Trash size={12} />
                          </motion.button>
                        </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.updatedAt &&
                        comment.updatedAt !== comment.createdAt &&
                        " (edited)"}
                  </p>
                </>
            )}
          </div>
        </motion.div>

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
      </>
  );
};

export default Comment;
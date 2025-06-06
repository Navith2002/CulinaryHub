import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X, Book, LinkIcon, Pencil, Save } from "lucide-react";
import { updateLearningPlan } from "../api/learningPlanAPI";
import toast from "react-hot-toast";

const EditLearningPlanModal = ({ plan, onClose, onPlanUpdated, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: plan?.title || "",
      description: plan?.description || "",
      topics: plan?.topics || "",
      resources: plan?.resources || "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!data.title.trim() || !data.description.trim()) {
        toast.error("Title and description are required");
        setIsSubmitting(false);
        return;
      }

      const updatedData = {
        ...data,
      };

      await updateLearningPlan(plan.id, updatedData, token);
      toast.success("Learning plan updated successfully");
      onPlanUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating learning plan:", error);
      toast.error("Failed to update learning plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black opacity-75"></div>
        </div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-black rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                    <Pencil size={20} className="text-yellow-400 mr-2" />
                    Edit Learning Plan
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      {...register("title", { required: "Title is required" })}
                      className={`w-full p-2 bg-black rounded-lg border ${
                        errors.title ? "border-red-500" : "border-gray-500"
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
                      rows="4"
                      className={`w-full p-2 bg-black rounded-lg border ${
                        errors.description ? "border-red-500" : "border-gray-500"
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
                      className="w-full p-2 bg-gray-800 rounded-lg border border-gray-500 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
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
                      className="w-full p-2 bg-gray-800 rounded-lg border border-gray-500 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add links to articles, books, courses, or other resources
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <motion.button
                      type="button"
                      onClick={onClose}
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
                      {isSubmitting ? (
                        "Updating..."
                      ) : (
                        <>
                          <Save size={16} className="mr-1.5" />
                          Update Plan
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLearningPlanModal;

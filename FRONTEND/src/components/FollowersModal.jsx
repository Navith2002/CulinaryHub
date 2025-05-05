import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, UserMinus, Search, Hexagon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getUsersById, followUser, unfollowUser } from "../api/profileAPI";
import UserAvatar from "./UserAvatar";

const FollowersModal = ({
                          isOpen,
                          onClose,
                          title,
                          users = [],
                          currentUser,
                          token,
                        }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [followStates, setFollowStates] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      if (!users.length) {
        setLoading(false);
        setUsersList([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedUsers = await getUsersById(users, token);
        setUsersList(fetchedUsers || []);

        // Initialize follow states
        const initialFollowStates = {};
        fetchedUsers.forEach((user) => {
          initialFollowStates[user.id] =
              currentUser?.followingUsers?.includes(user.id) || false;
        });
        setFollowStates(initialFollowStates);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [users, isOpen, token, currentUser]);

  const handleFollowToggle = async (userId) => {
    if (!currentUser) {
      toast.error("You must be logged in to follow users");
      navigate("/login");
      return;
    }

    try {
      if (followStates[userId]) {
        await unfollowUser(userId, token);
        toast.success("Unfollowed user");
      } else {
        await followUser(userId, token);
        toast.success("Now following user");
      }

      // Toggle follow state
      setFollowStates({
        ...followStates,
        [userId]: !followStates[userId],
      });
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Failed to update follow status");
    }
  };

  const filteredUsers = usersList.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
              <motion.div
                  className="bg-gray-900 rounded-xl shadow-lg w-full max-w-md m-4 overflow-hidden border border-gray-800"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  onClick={handleModalClick}
              >
                {/* Header with hexagon pattern background */}
                <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 py-4 px-5 border-b border-gray-800">
                  {/* Honeycomb Pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23F5D13B' fill-opacity='0.2'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }}></div>

                  <div className="flex justify-between items-center relative">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <Hexagon size={18} className="text-yellow-500 mr-2 opacity-70" />
                      {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-800">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent focus:outline-none text-white placeholder-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* User List */}
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {loading ? (
                      <div className="flex justify-center items-center py-10">
                        <motion.div
                            className="relative w-10 h-10"
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
                                  strokeDasharray="180"
                                  strokeDashoffset="120"
                                  strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-3 w-3 bg-yellow-500 opacity-70 rounded-sm rotate-45"></div>
                          </div>
                        </motion.div>
                      </div>
                  ) : filteredUsers.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <UserPlus size={24} className="text-yellow-500 opacity-70" />
                        </div>
                        <p className="text-gray-400">
                          {searchQuery
                              ? "No users match your search."
                              : users.length > 0
                                  ? "No user information available."
                                  : `No ${title.toLowerCase()} yet.`}
                        </p>
                      </div>
                  ) : (
                      filteredUsers.map((user) => (
                          <motion.div
                              key={user.id}
                              className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                          >
                            <Link
                                to={`/profile/${user.id}`}
                                className="p-4 flex items-center justify-between w-full"
                                onClick={onClose}
                            >
                              <div className="flex items-center space-x-3 flex-grow">
                                <div className="relative">
                                  <UserAvatar
                                      src={user.profileImage}
                                      alt={user.name}
                                      name={user.name}
                                      size="h-12 w-12"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-white">
                                    {user.name}
                                  </h4>
                                  {user.skills && user.skills.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {user.skills.slice(0, 2).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-yellow-400"
                                            >
                                  {skill}
                                </span>
                                        ))}
                                        {user.skills.length > 2 && (
                                            <span className="text-xs text-gray-500">
                                  +{user.skills.length - 2} more
                                </span>
                                        )}
                                      </div>
                                  )}
                                </div>
                              </div>

                                {currentUser && currentUser.id !== user.id && followStates[user.id] && (
                                    <motion.button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleFollowToggle(user.id);
                                        }}
                                        className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors cursor-pointer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <UserMinus size={16} />
                                    </motion.button>
                                )}
                            </Link>
                          </motion.div>
                      ))
                  )}
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default FollowersModal;
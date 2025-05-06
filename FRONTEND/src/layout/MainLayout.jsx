import React, { useState, useEffect } from "react";
import { User, Bookmark, Bell, Settings, Hash, Users, Compass, PlusCircle, Sparkles, TrendingUp, BookCheck, BrickWallFire, NotebookPen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/auth/useAuth";
import UserAvatar from "../components/UserAvatar";

const suggestedUsers = [
  {
    id: 1,
    name: "Emma Wilson",
    bio: "UI/UX Designer",
    skills: ["Design", "Figma"],
  },
  {
    id: 2,
    name: "Michael Chen",
    bio: "Full Stack Developer",
    skills: ["React", "Node.js"],
  },
  {
    id: 3,
    name: "Sarah Johnson",
    bio: "Data Scientist",
    skills: ["Python", "ML"],
  },
];

const trendingTopics = [
  { id: 1, name: "React Hooks", count: 342 },
  { id: 2, name: "CSS Grid", count: 275 },
  { id: 3, name: "UX Design", count: 189 },
  { id: 4, name: "Python", count: 156 },
];

const MainLayout = ({ children, activeTab }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { id: "feed", name: "Skill Sharing", icon: <BookCheck size={20}/>, path: "/" },
    { id: "progress", name: "Learning Progress", icon: <BrickWallFire size={20}/>, path: "/progress" },
    { id: "plans", name: "Learning Plans", icon: <NotebookPen size={20}/>, path: "/plans" },
    { id: "communities", name: "Communities", icon: <Users size={20}/>, path: "/communities" },
  ];

  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
    } else {
      setIsLoaded(true);
    }
  }, [currentUser]);

  return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background image and overlay (fixed) */}
        <div className="fixed inset-0 w-full h-full z-0">
          <img
            src="https://img.freepik.com/free-photo/spices-tomatoes-near-spaghetti-garlic_23-2147849739.jpg?t=st=1746542655~exp=1746546255~hmac=7ec12f8c38f7af341412612c9c2c54bb637ae8a08af552e49cf4e32a3f467d95&w=1380"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        {/* Header */}
        <div className="relative z-10">
          <Header activeTab={activeTab} />
        </div>
        {/* Main content with side columns */}
        <div className="relative z-10 pt-20 pb-10 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <motion.div
                className="hidden lg:block lg:col-span-3 space-y-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                transition={{ duration: 0.5 }}
            >
              {/* User Profile Card */}
              <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                {/* Cover Image */}
                <div className="h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 relative">
                  {/* Honeycomb Pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill-rule='evenodd' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px'
                  }}></div>
                </div>

                {/* Profile Details */}
                <div className="p-4 relative">
                  <div className="absolute -top-10 left-4 border-4 border-gray-900 rounded-full">
                    <UserAvatar
                        src={currentUser?.profileImage}
                        alt={currentUser?.name}
                        name={currentUser?.name}
                        size="h-16 w-16"
                    />
                  </div>

                  <div className="ml-16 mt-2 mb-4">
                    <h3 className="font-bold text-lg text-white truncate">
                      {currentUser?.name || "User Name"}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {currentUser?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                <div className="p-2">
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === item.id
                            ? "bg-gray-800 text-yellow-400"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="col-span-1 lg:col-span-6 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Render the specific tab content */}
              {children}
            </motion.div>

            {/* Right Sidebar */}
            <motion.div
                className="hidden lg:block lg:col-span-3 space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
            
            </motion.div>
          </div>
        </div>
      </div>
  );
};

export default MainLayout;
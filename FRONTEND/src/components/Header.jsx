import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  X,
  Search,
  MessageSquare,
  Home,
  FileText,
  Activity,
  Settings,
  BookCheck,
  BrickWallFire,
  NotebookPen,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/auth/useAuth";
import toast from "react-hot-toast";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("feed"); // Default to feed tab
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notificationRef = useRef(null);
  const profileDropdownRef = useRef(null);

  //get the auth status
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    //set current active tab based on current route
    const path = window.location.pathname;
    if (path.includes("progress")) {
      setActiveTab("progress");
    } else if (path.includes("plans")) {
      setActiveTab("plans");
    } else if (path.includes("communities")) {
      setActiveTab("communities");
    } else {
      setActiveTab("feed");
    }

    // This would be replaced with an actual API call
    // Simulating unread notifications
    setUnreadCount(3);
    setNotifications([
      {
        id: 1,
        message: "John Doe liked your post",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        message: "Jane Smith commented on your learning plan",
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        message: "Your progress update received 5 likes",
        read: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);

    //click outside to close dropdown handlers
    const handleClickOutside = (event) => {
      if (
          notificationRef.current &&
          !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
          profileDropdownRef.current &&
          !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    //animation state
    setIsLoaded(true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      //logout the user
      logout();
    } catch (error) {
      toast.error("Logout failed:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id) => {
    setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
    // For now, just clear the search
    setSearchQuery("");
  };

  const navigateToProfile = () => {
    setShowProfileDropdown(false);
    navigate(`/profile/${currentUser?.id}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    //navigate to the corresponding route
    if (tab === "feed") {
      navigate("/");
    } else if (tab === "communities") {
      navigate("/communities");
    } else {
      navigate(`/${tab}`);
    }
  };

  //tabs arrayyy
  const tabItems = [
    { id: "feed", name: "Skill Sharing", icon: <BookCheck size={20}/> },
    { id: "progress", name: "Learning Progress", icon: <BrickWallFire size={20}/> },
    { id: "plans", name: "Learning Plans", icon: <NotebookPen size={20} /> },
    { id: "communities", name: "Communities", icon: <Users size={20} /> },
  ];

  return (
      <header className="relative w-full z-50 bg-white shadow-lg  ">
        <div className="relative w-full">
          {/* Header Image Full Width */}
          <img src="https://img.freepik.com/free-photo/vegetables-with-salt-corn-cob_1220-688.jpg?t=st=1746524894~exp=1746528494~hmac=5347abec2a2c06e82f15a2fd4a229ef31e112a8e00232f888b2702a0c012c6fd&w=1380" alt="Header" className="h-52 w-screen object-cover shadow-lg mx-auto rounded-none" />
          {/* Overlayed Logo and Profile Icon */}
          <div className="absolute top-0 left-0 w-full flex justify-between items-center px-8 pt-4 rounded-2xl ">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center cursor-pointer"
            >
              <div className="mt-15 ml-15">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  Cullinary<span className="text-yellow-400">Hub</span>
                </h1>
                <p className="text-white/50 text-base mb-8 mt-5">
                Pairing flavors, creating memories | Food aficionado
                </p>
              </div>

              
            </motion.div>
            <div className="relative" ref={profileDropdownRef}>
              <motion.button
                className="flex items-center space-x-1 rounded-full hover:bg-gray-800 transition-colors p-1 cursor-pointer"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-15 w-15 rounded-full overflow-hidden border-2 border-red-700 cursor-pointer ">
                  <UserAvatar
                    src={currentUser?.profileImage}
                    alt={currentUser?.name}
                    name={currentUser?.name}
                    size="h-15 w-15"
                  />
                </div>
              </motion.button>
              <AnimatePresence>
                {showProfileDropdown && (
                    <motion.div
                        className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-800"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 border-b border-gray-800">
                        <p className="font-medium text-white truncate">
                          {currentUser?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {currentUser?.email || ""}
                        </p>
                      </div>
                      <div className="py-1">
                        <motion.button
                          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-900 hover:text-yellow-400 transition-colors cursor-pointer"
                          onClick={navigateToProfile}
                          whileHover={{ x: 5 }}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </motion.button>
                        <div className="border-t border-gray-800 my-1"></div>
                        <motion.button
                          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-900 hover:text-red-400 transition-colors cursor-pointer"
                          onClick={handleLogout}
                          whileHover={{ x: 5 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
  );
};

export default Header;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Lock, Unlock, UserCheck, UserPlus, UserMinus } from "lucide-react";
import { joinCommunity, leaveCommunity, isMember } from "../api/communityAPI";
import toast from "react-hot-toast";

const CommunityCard = ({ community, currentUser, onJoin, onLeave }) => {
  const [isUserMember, setIsUserMember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkMembership = async () => {
      if (currentUser && community) {
        try {
          const response = await isMember(community.id, currentUser.id, currentUser.token);
          setIsUserMember(response.data);
        } catch (error) {
          console.error("Error checking membership:", error);
        }
      }
    };

    checkMembership();
  }, [community, currentUser]);

  const handleJoin = async () => {
    if (!currentUser) {
      toast.error("Please log in to join communities");
      return;
    }

    setLoading(true);
    try {
      await joinCommunity(community.id, currentUser.id, currentUser.token);
      setIsUserMember(true);
      toast.success(`You've joined ${community.name}`);
      if (onJoin) onJoin(community.id);
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error("Failed to join community");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await leaveCommunity(community.id, currentUser.id, currentUser.token);
      setIsUserMember(false);
      toast.success(`You've left ${community.name}`);
      if (onLeave) onLeave(community.id);
    } catch (error) {
      console.error("Error leaving community:", error);
      toast.error("Failed to leave community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/communities/${community.id}`} className="hover:underline">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{community.name}</h3>
          </Link>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-1" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {community.memberIds?.length || 0} members
            </span>
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          {community.isPrivate ? (
            <Lock className="h-4 w-4 text-amber-500 mr-1" />
          ) : (
            <Unlock className="h-4 w-4 text-green-500 mr-1" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {community.isPrivate ? "Private community" : "Public community"}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {community.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {community.category}
          </span>
          
          {isUserMember ? (
            <button
              onClick={handleLeave}
              disabled={loading}
              className="flex items-center text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md transition-colors duration-200"
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Leave
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="flex items-center text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
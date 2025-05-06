import axios from "axios";

//create axios instance with default config
const createApiClient = (token) => {
  const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 60000, // 60 seconds
  });

  return apiClient;
};

// Get all communities
export const getAllCommunities = async (token) => {
  const apiClient = createApiClient(token);
  return apiClient.get("/communities");
};

// Get public communities
export const getPublicCommunities = async (token) => {
  const apiClient = createApiClient(token);
  return apiClient.get("/communities/public");
};

// Get community by ID
export const getCommunityById = async (communityId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/${communityId}`);
};

// Get communities by creator
export const getCommunitiesByCreator = async (creatorId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/creator/${creatorId}`);
};

// Get communities by member
export const getCommunitiesByMember = async (memberId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/member/${memberId}`);
};

// Get communities by admin
export const getCommunitiesByAdmin = async (adminId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/admin/${adminId}`);
};

// Get communities by category
export const getCommunitiesByCategory = async (category, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/category/${category}`);
};

// Create a new community
export const createCommunity = async (communityData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post("/communities", communityData);
};

// Update a community
export const updateCommunity = async (communityId, communityData, token) => {
  const apiClient = createApiClient(token);
  return apiClient.put(`/communities/${communityId}`, communityData);
};

// Delete a community
export const deleteCommunity = async (communityId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/communities/${communityId}`);
};

// Join a community
export const joinCommunity = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/communities/${communityId}/join/${userId}`);
};

// Leave a community
export const leaveCommunity = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/communities/${communityId}/leave/${userId}`);
};

// Add admin to a community
export const addAdmin = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.post(`/communities/${communityId}/admin/${userId}`);
};

// Remove admin from a community
export const removeAdmin = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.delete(`/communities/${communityId}/admin/${userId}`);
};

// Check if user is a member of a community
export const isMember = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/${communityId}/member/${userId}`);
};

// Check if user is an admin of a community
export const isAdmin = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/${communityId}/admin/${userId}`);
};

// Check if user is the creator of a community
export const isCreator = async (communityId, userId, token) => {
  const apiClient = createApiClient(token);
  return apiClient.get(`/communities/${communityId}/creator/${userId}`);
};

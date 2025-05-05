package com.example.Backend.service;

import com.example.Backend.model.Community;
import com.example.Backend.repository.CommunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CommunityService {
    @Autowired
    private CommunityRepository communityRepository;

    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    public List<Community> getPublicCommunities() {
        return communityRepository.findPublicCommunities();
    }

    public Community getCommunityById(String id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Community not found"));
    }

    public List<Community> getCommunitiesByCreator(String creatorId) {
        return communityRepository.findByCreatorId(creatorId);
    }

    public List<Community> getCommunitiesByMember(String memberId) {
        return communityRepository.findByMemberId(memberId);
    }

    public List<Community> getCommunitiesByAdmin(String adminId) {
        return communityRepository.findByAdminId(adminId);
    }

    public List<Community> getCommunitiesByCategory(String category) {
        return communityRepository.findByCategory(category);
    }

    public Community createCommunity(Community community) {
        community.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        community.setUpdatedAt(community.getCreatedAt());
        community.getMemberIds().add(community.getCreatorId());
        community.getAdminIds().add(community.getCreatorId());
        return communityRepository.save(community);
    }

    public Community updateCommunity(String id, Community updatedCommunity) {
        Community existingCommunity = getCommunityById(id);

        // Security check: Only creator or admin should be able to update
        String requestUserId = updatedCommunity.getCreatorId(); // Assuming this is the current user's ID
        if (!isCreator(id, requestUserId) && !isAdmin(id, requestUserId)) {
            throw new RuntimeException("Unauthorized: Only community creator or admin can update the community");
        }

        existingCommunity.setName(updatedCommunity.getName());
        existingCommunity.setDescription(updatedCommunity.getDescription());
        existingCommunity.setCategory(updatedCommunity.getCategory());
        existingCommunity.setPrivate(updatedCommunity.isPrivate());
        existingCommunity.setUpdatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return communityRepository.save(existingCommunity);
    }

    public void deleteCommunity(String id) {
        // Note: In a real application, you would need to pass the user ID of the requester
        // and check if they are the creator or an admin before allowing deletion
        // For example:
        // if (!isCreator(id, requestUserId)) {
        //     throw new RuntimeException("Unauthorized: Only community creator can delete the community");
        // }

        communityRepository.deleteById(id);
    }

    public Community joinCommunity(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        community.getMemberIds().add(userId);
        return communityRepository.save(community);
    }

    public Community leaveCommunity(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        community.getMemberIds().remove(userId);
        community.getAdminIds().remove(userId);
        return communityRepository.save(community);
    }

    public Community addAdmin(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        community.getAdminIds().add(userId);
        return communityRepository.save(community);
    }

    public Community removeAdmin(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        community.getAdminIds().remove(userId);
        return communityRepository.save(community);
    }

    public boolean isMember(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        return community.getMemberIds().contains(userId);
    }

    public boolean isAdmin(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        return community.getAdminIds().contains(userId);
    }

    public boolean isCreator(String communityId, String userId) {
        Community community = getCommunityById(communityId);
        return community.getCreatorId().equals(userId);
    }
}
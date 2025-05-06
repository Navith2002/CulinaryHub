package com.example.Backend.repository;

import com.example.Backend.model.Community;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface CommunityRepository extends MongoRepository<Community, String> {
    List<Community> findByCreatorId(String creatorId);
    
    @Query("{ 'memberIds': ?0 }")
    List<Community> findByMemberId(String memberId);
    
    @Query("{ 'adminIds': ?0 }")
    List<Community> findByAdminId(String adminId);
    
    List<Community> findByCategory(String category);
    
    @Query("{ 'isPrivate': false }")
    List<Community> findPublicCommunities();
} 
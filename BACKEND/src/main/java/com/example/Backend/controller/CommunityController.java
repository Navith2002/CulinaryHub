package com.example.Backend.controller;

import com.example.Backend.model.Community;
import com.example.Backend.service.CommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/communities")
@CrossOrigin(origins = "*")
public class CommunityController {
    @Autowired
    private CommunityService communityService;

    @GetMapping
    public ResponseEntity<List<Community>> getAllCommunities() {
        return ResponseEntity.ok(communityService.getAllCommunities());
    }

    @GetMapping("/public")
    public ResponseEntity<List<Community>> getPublicCommunities() {
        return ResponseEntity.ok(communityService.getPublicCommunities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Community> getCommunityById(@PathVariable String id) {
        return ResponseEntity.ok(communityService.getCommunityById(id));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<Community>> getCommunitiesByCreator(@PathVariable String creatorId) {
        return ResponseEntity.ok(communityService.getCommunitiesByCreator(creatorId));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Community>> getCommunitiesByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(communityService.getCommunitiesByMember(memberId));
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Community>> getCommunitiesByAdmin(@PathVariable String adminId) {
        return ResponseEntity.ok(communityService.getCommunitiesByAdmin(adminId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Community>> getCommunitiesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(communityService.getCommunitiesByCategory(category));
    }

    @PostMapping
    public ResponseEntity<Community> createCommunity(@RequestBody Community community) {
        return ResponseEntity.ok(communityService.createCommunity(community));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCommunity(@PathVariable String id, @RequestBody Community community) {
        try {
            return ResponseEntity.ok(communityService.updateCommunity(id, community));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(403).body(e.getMessage());
            }
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunity(@PathVariable String id) {
        communityService.deleteCommunity(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{communityId}/join/{userId}")
    public ResponseEntity<Community> joinCommunity(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.joinCommunity(communityId, userId));
    }

    @PostMapping("/{communityId}/leave/{userId}")
    public ResponseEntity<Community> leaveCommunity(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.leaveCommunity(communityId, userId));
    }

    @PostMapping("/{communityId}/admin/{userId}")
    public ResponseEntity<Community> addAdmin(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.addAdmin(communityId, userId));
    }

    @DeleteMapping("/{communityId}/admin/{userId}")
    public ResponseEntity<Community> removeAdmin(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.removeAdmin(communityId, userId));
    }

    @GetMapping("/{communityId}/member/{userId}")
    public ResponseEntity<Boolean> isMember(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.isMember(communityId, userId));
    }

    @GetMapping("/{communityId}/admin/{userId}")
    public ResponseEntity<Boolean> isAdmin(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.isAdmin(communityId, userId));
    }

    @GetMapping("/{communityId}/creator/{userId}")
    public ResponseEntity<Boolean> isCreator(@PathVariable String communityId, @PathVariable String userId) {
        return ResponseEntity.ok(communityService.isCreator(communityId, userId));
    }
}
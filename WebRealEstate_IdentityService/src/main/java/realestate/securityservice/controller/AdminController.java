package realestate.securityservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import realestate.securityservice.constant.Role;
import realestate.securityservice.dto.respone.BaseResponse;
import realestate.securityservice.dto.respone.ResponseFactory;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.service.AgentApprovalService;
import realestate.securityservice.service.UserService;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AgentApprovalService agentApprovalService;
    private final UserService userService;

    @GetMapping("/pending-agents")
    public ResponseEntity<BaseResponse<List<UserResponse>>> getPendingAgents() {
        return ResponseFactory.ok(agentApprovalService.getPendingAgents());
    }

    @PutMapping("/{userId}/approve")
    public ResponseEntity<BaseResponse<UserResponse>> approveAgent(@PathVariable String userId) {
        return ResponseFactory.ok(agentApprovalService.approveAgent(userId));
    }

    @PutMapping("/{userId}/reject")
    public ResponseEntity<BaseResponse<UserResponse>> rejectAgent(@PathVariable String userId) {
        return ResponseFactory.ok(agentApprovalService.rejectAgent(userId));
    }
    @GetMapping("/count")
    public ResponseEntity<BaseResponse<Integer>> getPendingAgentCount() {
        return ResponseFactory.ok(userService.countUsers());
    }
    @GetMapping("/count/{role}")
    public ResponseEntity<BaseResponse<Integer>> getPendingAgentCountByRole(@PathVariable String role) {
        try {
            Role enumRole = Role.valueOf(role.toUpperCase());
            Set<Role> roles = Set.of(enumRole);
            return ResponseFactory.ok(userService.countUsersByRole(roles));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new BaseResponse<>());
        }
    }
}

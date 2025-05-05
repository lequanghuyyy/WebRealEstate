package realestate.securityservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import realestate.securityservice.dto.respone.BaseResponse;
import realestate.securityservice.dto.respone.ResponseFactory;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.service.AgentApprovalService;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AgentApprovalService agentApprovalService;

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
}

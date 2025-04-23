package realestate.securityservice.service;

import realestate.securityservice.dto.respone.UserResponse;

import java.util.List;

public interface AgentApprovalService {
    List<UserResponse> getPendingAgents();
    UserResponse approveAgent(String agentId);
    UserResponse rejectAgent(String agentId);
}

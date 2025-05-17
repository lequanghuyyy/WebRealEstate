package realestate.securityservice.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import realestate.securityservice.constant.Role;
import realestate.securityservice.constant.UserStatus;
import realestate.securityservice.dto.respone.UserResponse;
import realestate.securityservice.entity.RoleEntity;
import realestate.securityservice.entity.UserEntity;
import realestate.securityservice.exception.NotFoundException;
import realestate.securityservice.mapper.UserMapper;
import realestate.securityservice.repository.RoleRepository;
import realestate.securityservice.repository.UserRepository;
import realestate.securityservice.service.AgentApprovalService;
import realestate.securityservice.service.EmailService;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentApprovalServiceImpl implements AgentApprovalService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final EmailService emailService;

    @Override
    public List<UserResponse> getPendingAgents() {
        return userRepository.findByStatus(UserStatus.PENDING_APPROVAL)
                .stream()
                .map(userMapper::convertToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse approveAgent(String agentId) {
        UserEntity agent = userRepository.findById(agentId)
                .orElseThrow(() -> new NotFoundException("User", "UserId", agentId));
    
        if (agent.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("User is not pending approval");
        }

        // Update status to ACTIVE
        agent.setStatus(UserStatus.ACTIVE);

        // Ensure the user has the AGENT role
        Set<RoleEntity> roles = agent.getRoles();
        Optional<RoleEntity> agentRole = roleRepository.findByRoleName(Role.AGENT);
        if (agentRole.isEmpty()) {
            throw new NotFoundException("Role", "roleName", "AGENT");
        }
        if (roles == null) {
            roles = new HashSet<>();
        }
        roles.add(agentRole.get());
        agent.setRoles(roles);

        UserEntity savedAgent = userRepository.save(agent);

        // Send approval email
        sendApprovalEmail(savedAgent);

        return userMapper.convertToUserResponse(savedAgent);
    }

    @Override
    @Transactional
    public UserResponse rejectAgent(String agentId) {
        UserEntity agent = userRepository.findById(agentId)
                .orElseThrow(() -> new NotFoundException("User", "UserId", agentId));

        if (agent.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("User is not pending approval");
        }

        // Update status to REJECTED
        agent.setStatus(UserStatus.REJECTED);
        UserEntity savedAgent = userRepository.save(agent);

        // Send rejection email
        sendRejectionEmail(savedAgent);

        return userMapper.convertToUserResponse(savedAgent);
    }

    private void sendApprovalEmail(UserEntity agent) {
        String subject = "Your Agent Account Has Been Approved";
        String message = String.format(
                "Dear %s %s,\n\n" +
                        "Congratulations! Your agent account on RealEstate has been approved. " +
                        "You can now log in and start listing properties.\n\n" +
                        "Thank you for joining our platform!\n\n" +
                        "Best Regards,\n" +
                        "The RealEstate Team",
                agent.getFirstName(), agent.getLastName());

        emailService.sendSimpleMessage(agent.getEmail(), subject, message);
    }

    private void sendRejectionEmail(UserEntity agent) {
        String subject = "Update on Your Agent Registration";
        String message = String.format(
                "Dear %s %s,\n\n" +
                        "We regret to inform you that your application to become an agent on our platform " +
                        "has been declined at this time. " +
                        "Please contact our support team for more information.\n\n" +
                        "Thank you for your interest in our platform.\n\n" +
                        "Best Regards,\n" +
                        "The RealEstate Team",
                agent.getFirstName(), agent.getLastName());

        emailService.sendSimpleMessage(agent.getEmail(), subject, message);
    }
}

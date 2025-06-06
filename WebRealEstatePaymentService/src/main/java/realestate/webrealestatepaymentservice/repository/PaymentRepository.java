package realestate.webrealestatepaymentservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import realestate.webrealestatepaymentservice.constant.TransactionStyle;
import realestate.webrealestatepaymentservice.entity.PaymentEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {
    Optional<PaymentEntity> findByTransactionId(String transactionId);
    Page<PaymentEntity> findByAgentId(String agentId, Pageable pageable);
    List<PaymentEntity> findByTransactionStyle(TransactionStyle transactionStyle);
}

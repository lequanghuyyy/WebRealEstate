package realestate.webrealestatesaleservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import realestate.webrealestatesaleservice.entity.SalesTransactionEntity;

import java.util.List;

@Repository
public interface SalesTransactionRepository extends JpaRepository<SalesTransactionEntity, String> {
    List<SalesTransactionEntity> findByBuyerId(String buyerId);
    List<SalesTransactionEntity> findByAgentId(String agentId);
}

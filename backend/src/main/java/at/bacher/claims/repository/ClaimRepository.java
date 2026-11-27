package at.bacher.claims.repository;

import at.bacher.claims.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Optional<Claim> findByClaimNumber(String claimNumber);

    List<Claim> findByPolicyNumber(String policyNumber);

    List<Claim> findByStatus(String status);
}

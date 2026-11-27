package at.bacher.claims.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_number", unique = true, nullable = false)
    private String claimNumber;

    @NotBlank(message = "Policy number is required")
    @Column(name = "policy_number", nullable = false)
    private String policyNumber;

    @NotBlank(message = "Claimant name is required")
    @Column(name = "claimant_name", nullable = false)
    private String claimantName;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be positive")
    @Column(name = "claim_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal claimAmount;

    @Column(name = "status", nullable = false)
    private String status = "SUBMITTED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Claim() {
    }

    public Claim(String policyNumber, String claimantName, String description, BigDecimal claimAmount) {
        this.policyNumber = policyNumber;
        this.claimantName = claimantName;
        this.description = description;
        this.claimAmount = claimAmount;
        this.status = "SUBMITTED";
    }

    public Claim(String claimNumber, String policyNumber, String claimantName, String description, BigDecimal claimAmount, String status) {
        this.claimNumber = claimNumber;
        this.policyNumber = policyNumber;
        this.claimantName = claimantName;
        this.description = description;
        this.claimAmount = claimAmount;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null || this.status.isBlank()) {
            this.status = "SUBMITTED";
        }
        if (this.claimNumber == null || this.claimNumber.isBlank()) {
            this.claimNumber = "CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public String getClaimantName() {
        return claimantName;
    }

    public void setClaimantName(String claimantName) {
        this.claimantName = claimantName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getClaimAmount() {
        return claimAmount;
    }

    public void setClaimAmount(BigDecimal claimAmount) {
        this.claimAmount = claimAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Claim claim = (Claim) o;
        return Objects.equals(id, claim.id) || (claimNumber != null && Objects.equals(claimNumber, claim.claimNumber));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, claimNumber);
    }

    @Override
    public String toString() {
        return "Claim{" +
                "id=" + id +
                ", claimNumber='" + claimNumber + '\'' +
                ", policyNumber='" + policyNumber + '\'' +
                ", claimantName='" + claimantName + '\'' +
                ", claimAmount=" + claimAmount +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}

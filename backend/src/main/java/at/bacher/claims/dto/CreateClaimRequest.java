package at.bacher.claims.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateClaimRequest(
    @NotBlank(message = "Policy number is required")
    String policyNumber,

    @NotBlank(message = "Claimant name is required")
    String claimantName,

    @NotBlank(message = "Description is required")
    String description,

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be positive")
    BigDecimal claimAmount
) {}

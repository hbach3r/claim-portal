package at.bacher.claims.controller;

import at.bacher.claims.dto.CreateClaimRequest;
import at.bacher.claims.model.Claim;
import at.bacher.claims.repository.ClaimRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimRepository claimRepository;

    public ClaimController(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    @GetMapping
    public ResponseEntity<List<Claim>> getAllClaims(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(claimRepository.findByStatus(status.toUpperCase()));
        }
        return ResponseEntity.ok(claimRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
        return claimRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Claim> createClaim(@Valid @RequestBody CreateClaimRequest request) {
        Claim claim = new Claim(
                request.policyNumber(),
                request.claimantName(),
                request.description(),
                request.claimAmount()
        );

        Claim savedClaim = claimRepository.save(claim);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(savedClaim.getId())
                .toUri();

        return ResponseEntity.created(location).body(savedClaim);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        if (!claimRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        claimRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

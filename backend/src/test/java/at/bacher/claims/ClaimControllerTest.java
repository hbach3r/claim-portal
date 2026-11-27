package at.bacher.claims;

import at.bacher.claims.controller.ClaimController;
import at.bacher.claims.dto.CreateClaimRequest;
import at.bacher.claims.model.Claim;
import at.bacher.claims.repository.ClaimRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClaimController.class)
class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClaimRepository claimRepository;

    @Test
    @DisplayName("GET /api/claims should return list of claims with 200 OK")
    void getAllClaims_shouldReturnListAnd200() throws Exception {
        Claim claim = new Claim("CLM-1001", "POL-987", "Anna Schmidt", "Water damage in apartment", new BigDecimal("1250.00"), "SUBMITTED");
        claim.setId(1L);
        claim.setCreatedAt(LocalDateTime.now());

        when(claimRepository.findAll()).thenReturn(List.of(claim));

        mockMvc.perform(get("/api/claims"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].claimNumber", is("CLM-1001")))
                .andExpect(jsonPath("$[0].claimantName", is("Anna Schmidt")))
                .andExpect(jsonPath("$[0].claimAmount", is(1250.00)));

        verify(claimRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("GET /api/claims/{id} when found should return claim and 200 OK")
    void getClaimById_whenExists_shouldReturnClaimAnd200() throws Exception {
        Claim claim = new Claim("CLM-1002", "POL-123", "Max Meier", "Car accident scratch", new BigDecimal("650.50"), "APPROVED");
        claim.setId(2L);
        claim.setCreatedAt(LocalDateTime.now());

        when(claimRepository.findById(2L)).thenReturn(Optional.of(claim));

        mockMvc.perform(get("/api/claims/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.claimNumber", is("CLM-1002")))
                .andExpect(jsonPath("$.policyNumber", is("POL-123")))
                .andExpect(jsonPath("$.claimantName", is("Max Meier")))
                .andExpect(jsonPath("$.status", is("APPROVED")));

        verify(claimRepository, times(1)).findById(2L);
    }

    @Test
    @DisplayName("GET /api/claims/{id} when not found should return 404 Not Found")
    void getClaimById_whenNotFound_shouldReturn404() throws Exception {
        when(claimRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/claims/999"))
                .andExpect(status().isNotFound());

        verify(claimRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("POST /api/claims with valid payload should return 201 Created and saved claim")
    void createClaim_whenValidPayload_shouldReturn201Created() throws Exception {
        CreateClaimRequest request = new CreateClaimRequest(
                "POL-555",
                "Thomas Huber",
                "Broken window during storm",
                new BigDecimal("450.00")
        );

        Claim savedClaim = new Claim("CLM-8888", "POL-555", "Thomas Huber", "Broken window during storm", new BigDecimal("450.00"), "SUBMITTED");
        savedClaim.setId(10L);
        savedClaim.setCreatedAt(LocalDateTime.now());

        when(claimRepository.save(any(Claim.class))).thenReturn(savedClaim);

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/claims/10")))
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.claimNumber", is("CLM-8888")))
                .andExpect(jsonPath("$.claimantName", is("Thomas Huber")))
                .andExpect(jsonPath("$.claimAmount", is(450.00)));

        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    @DisplayName("POST /api/claims with invalid payload should return 400 Bad Request")
    void createClaim_whenInvalidPayload_shouldReturn400BadRequest() throws Exception {
        CreateClaimRequest invalidRequest = new CreateClaimRequest(
                "", // Blank policy number
                "", // Blank claimant name
                "", // Blank description
                new BigDecimal("-50.00") // Negative amount
        );

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(claimRepository, never()).save(any());
    }

    @Test
    @DisplayName("DELETE /api/claims/{id} when exists should return 204 No Content")
    void deleteClaim_whenExists_shouldReturn204NoContent() throws Exception {
        when(claimRepository.existsById(1L)).thenReturn(true);
        doNothing().when(claimRepository).deleteById(1L);

        mockMvc.perform(delete("/api/claims/1"))
                .andExpect(status().isNoContent());

        verify(claimRepository, times(1)).existsById(1L);
        verify(claimRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("DELETE /api/claims/{id} when not found should return 404 Not Found")
    void deleteClaim_whenNotFound_shouldReturn404() throws Exception {
        when(claimRepository.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/claims/999"))
                .andExpect(status().isNotFound());

        verify(claimRepository, times(1)).existsById(999L);
        verify(claimRepository, never()).deleteById(anyLong());
    }
}

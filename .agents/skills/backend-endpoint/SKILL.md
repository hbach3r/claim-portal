---
name: backend-endpoint
description: Skill für das Erstellen und Erweitern von REST-Endpunkten im Spring Boot 3 Backend inkl. DTOs, Validierung und JUnit-Tests
---

# Backend Endpoint Skill

Dieser Skill leitet Entwickler und Coding-Agents an, wie neue REST-Endpunkte im `backend/`-Modul nach den Best Practices des Projekts erstellt werden.

## Kontext & Technologien
- **Framework:** Spring Boot 3 (Java 21)
- **Persistenz:** Spring Data JPA (`ClaimRepository`)
- **Validierung:** Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Positive`)
- **Testing:** JUnit 5, Spring Boot Test, MockMvc

---

## Workflow: Neuen Endpunkt erstellen

### Schritt 1: DTO erstellen oder anpassen (`src/main/java/at/bacher/claims/dto/`)
- Verwende Java 21 `record` für unveränderliche Request-/Response-DTOs.
- Versehen von Feldern mit Validierungs-Annotationen (`jakarta.validation.constraints.*`).
- Beispiel:
  ```java
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
      @Positive(message = "Claim amount must be greater than zero")
      BigDecimal claimAmount
  ) {}
  ```

### Schritt 2: Domain-Modell & Repository prüfen (`model/` & `repository/`)
- Falls neue Felder oder Abfragen erforderlich sind, aktualisiere die Entity `Claim.java`.
- Erweitere `ClaimRepository.java` um abgeleitete Query-Methoden (z. B. `findByStatus`, `findByClaimNumber`).

### Schritt 3: Controller implementieren (`controller/ClaimController.java`)
- Annotation `@RestController` und `@RequestMapping("/api/claims")`.
- CORS aktivieren via `@CrossOrigin`.
- Nutze `@Valid` vor `@RequestBody` für automatisches Auslösen der Validierung.
- Rückgabe von standardisierten HTTP Status-Codes:
  - `ResponseEntity.ok(body)` für GET/PUT
  - `ResponseEntity.status(HttpStatus.CREATED).body(body)` für POST
  - `ResponseEntity.noContent().build()` für DELETE
  - `ResponseEntity.notFound().build()` wenn eine Entität per ID nicht gefunden wird.

### Schritt 4: Tests schreiben (`src/test/java/at/bacher/claims/ClaimControllerTest.java`)
- Jeder neue Endpunkt MUSS durch mindestens zwei MockMvc-Tests abgedeckt werden:
  1. **Positiv-Test (Erfolgsfall):** Korrekter Status-Code (200 / 201 / 204) und JSON-Response.
  2. **Negativ-Test (Validierung oder 404):** z. B. HTTP 400 Bad Request bei ungültigem DTO oder 404 bei unbekannter ID.
- Beispiel:
  ```java
  @Test
  void createClaim_withInvalidPayload_shouldReturn400() throws Exception {
      String invalidJson = """
          {
              "policyNumber": "",
              "claimantName": "Max Mustermann",
              "claimAmount": -10.0
          }
          """;

      mockMvc.perform(post("/api/claims")
              .contentType(MediaType.APPLICATION_JSON)
              .content(invalidJson))
          .andExpect(status().isBadRequest());
  }
  ```

---

## Checkliste vor Abschluss
- [ ] DTOs sind typisiert und validiert (`@Valid`).
- [ ] Keine Entitäten direkt als Request-Payload exponiert.
- [ ] Entsprechende Methoden im `ClaimRepository` vorhanden.
- [ ] Passende HTTP Status Codes verwendet.
- [ ] Unit-/Integrationstest in `ClaimControllerTest.java` implementiert und grün.

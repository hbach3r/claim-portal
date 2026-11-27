package at.bacher.claims;

import at.bacher.claims.model.Claim;
import at.bacher.claims.repository.ClaimRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication
public class ClaimPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClaimPortalApplication.class, args);
    }

    @Bean
    public CommandLineRunner initSampleClaims(ClaimRepository claimRepository) {
        return args -> {
            if (claimRepository.count() == 0) {
                claimRepository.saveAll(List.of(
                        new Claim("CLM-1001", "POL-98711", "Anna Schmidt", "Pipe burst causing water damage in residential kitchen", new BigDecimal("1250.00"), "SUBMITTED"),
                        new Claim("CLM-1002", "POL-12345", "Max Meier", "Rear bumper scratch from parking lot collision", new BigDecimal("650.50"), "APPROVED"),
                        new Claim("CLM-1003", "POL-44129", "Sophie Gruber", "Hailstorm shattered skylight and roof tiles", new BigDecimal("3800.00"), "IN_REVIEW"),
                        new Claim("CLM-1004", "POL-88302", "Markus Weber", "Commercial warehouse inventory fire damage", new BigDecimal("14500.00"), "IN_REVIEW"),
                        new Claim("CLM-1005", "POL-55018", "Elena Wagner", "Theft of camera equipment during vacation", new BigDecimal("2100.00"), "SETTLED"),
                        new Claim("CLM-1006", "POL-33901", "David Fischer", "Smartphone dropped from balcony - pre-existing defect", new BigDecimal("490.00"), "REJECTED"),
                        new Claim("CLM-1007", "POL-67210", "Julia Hofer", "Basement flooding after heavy torrential rain", new BigDecimal("7400.00"), "APPROVED"),
                        new Claim("CLM-1008", "POL-91402", "Florian Pichler", "Windshield rock strike on highway", new BigDecimal("820.00"), "SETTLED")
                ));
            }
        };
    }
}

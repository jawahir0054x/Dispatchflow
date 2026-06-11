package com.dispatchflow.config;

import com.dispatchflow.entity.User;
import com.dispatchflow.enums.Role;
import com.dispatchflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin.enabled:true}")
    private boolean seedAdminEnabled;

    @Value("${app.seed-admin.email:admin@dispatchflow.com}")
    private String adminEmail;

    @Value("${app.seed-admin.password:admin12345}")
    private String adminPassword;

    @Value("${app.seed-admin.first-name:System}")
    private String adminFirstName;

    @Value("${app.seed-admin.last-name:Admin}")
    private String adminLastName;

    @Override
    public void run(String... args) {
        if (!seedAdminEnabled) {
            return;
        }

        if (userRepository.existsByEmail(adminEmail.toLowerCase())) {
            return;
        }

        User admin = User.builder()
                .email(adminEmail.toLowerCase().trim())
                .password(passwordEncoder.encode(adminPassword))
                .firstName(adminFirstName)
                .lastName(adminLastName)
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("Seeded default admin user: {}", adminEmail);
    }
}

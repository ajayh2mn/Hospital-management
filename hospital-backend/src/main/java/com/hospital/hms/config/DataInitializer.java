package com.hospital.hms.config;

import com.hospital.hms.entity.Role;
import com.hospital.hms.entity.User;
import com.hospital.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * DataInitializer — runs once when the application starts.
 * Creates the default admin account if it doesn't exist.
 *
 * CommandLineRunner.run() is called by Spring Boot after the app is fully started.
 * This is how you seed initial data.
 *
 * Default credentials:
 *   Username: admin
 *   Password: Admin@123
 *   Role: ROLE_ADMIN
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@hospital.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .roles(Set.of(Role.ROLE_ADMIN))
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created — username: admin, password: Admin@123");
        }
    }
}

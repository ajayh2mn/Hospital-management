package com.hospital.hms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Hospital Management System backend.
 *
 * @EnableJpaAuditing here (not in AppConfig) avoids conflicts with Spring Security context.
 */
@SpringBootApplication
@EnableScheduling
@EnableJpaAuditing
public class HmsApplication {

    public static void main(String[] args) {
        // This line boots up the entire Spring application
        SpringApplication.run(HmsApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Hospital Management System - STARTED");
        System.out.println("  Swagger UI: http://localhost:8080/swagger-ui.html");
        System.out.println("==============================================");
    }
}

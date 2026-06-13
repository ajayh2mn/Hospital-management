package com.hospital.hms.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AppConfig — application-wide bean definitions.
 * Note: @EnableJpaAuditing has been moved to HmsApplication.java
 */
@Configuration
public class AppConfig {

    /**
     * ModelMapper — converts between Entity and DTO objects automatically.
     *
     * Why DTOs? We never expose entities directly to the frontend because:
     * 1. Security: entities might have sensitive fields (password hash)
     * 2. Flexibility: we can shape the response differently from the DB structure
     * 3. Validation: we can validate input on DTOs before touching the database
     *
     * Example: StaffEntity has a User field. StaffResponseDTO just has userId.
     */
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        // STRICT matching: only maps fields with exactly matching names
        // Prevents accidental wrong mappings
        mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        return mapper;
    }
}

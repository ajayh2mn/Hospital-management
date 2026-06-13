package com.hospital.hms.config;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * JacksonConfig — customizes Spring Boot's default Jackson ObjectMapper.
 *
 * IMPORTANT: Use modulesToInstall() NOT modules().
 * - modules() REPLACES the entire module list and disables auto-discovery of
 *   JavaTimeModule (LocalDateTime support), breaking date serialization.
 * - modulesToInstall() ADDS to existing modules without touching auto-discovery.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> {
            // Hibernate6Module: serializes lazy-loaded JPA proxies as null instead of erroring
            Hibernate6Module hibernateModule = new Hibernate6Module();
            hibernateModule.disable(Hibernate6Module.Feature.USE_TRANSIENT_ANNOTATION);

            // JavaTimeModule: handles LocalDate, LocalDateTime, LocalTime serialization.
            // Explicitly registered here because modulesToInstall() bypasses Spring Boot's
            // well-known-module auto-discovery that would normally add it.
            JavaTimeModule javaTimeModule = new JavaTimeModule();

            // modulesToInstall ADDS these modules on top of existing auto-configured ones
            builder.modulesToInstall(hibernateModule, javaTimeModule);

            // Dates as "2024-01-15T10:30:00" strings, not as numeric arrays [2024,1,15,...]
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            // Allow enum deserialization to be case-insensitive.
            // Also configures the mapper via postConfigurer to treat empty string ""
            // as null for enum fields — so optional enum fields left blank by the
            // frontend don't crash with InvalidFormatException.
            builder.featuresToEnable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS);
            builder.postConfigurer(mapper ->
                mapper.coercionConfigDefaults()
                    .setCoercion(
                        com.fasterxml.jackson.databind.cfg.CoercionInputShape.EmptyString,
                        com.fasterxml.jackson.databind.cfg.CoercionAction.AsNull
                    )
            );
        };
    }
}

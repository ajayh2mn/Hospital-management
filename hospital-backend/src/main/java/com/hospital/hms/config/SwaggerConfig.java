package com.hospital.hms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SwaggerConfig — configures the OpenAPI documentation UI.
 *
 * After running the app, visit: http://localhost:8080/swagger-ui.html
 * You'll see all endpoints, can test them, and authorize with your JWT token.
 *
 * The "bearerAuth" security scheme tells Swagger: "these endpoints need a JWT token".
 * You paste your token in the Authorize button at the top of Swagger UI.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hospital Management System API")
                        .description("Complete REST API for Hospital Management System")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("HMS Team")
                                .email("admin@hospital.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste your JWT token here")));
    }
}

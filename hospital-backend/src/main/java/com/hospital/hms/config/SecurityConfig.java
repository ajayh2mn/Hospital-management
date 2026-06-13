package com.hospital.hms.config;

import com.hospital.hms.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — the central security configuration for the entire application.
 *
 * Key concepts:
 * - CORS: Allows React (port 3000) to call the Spring backend (port 8080)
 * - CSRF: Disabled because we use JWT (stateless), not session cookies
 * - Stateless session: No server-side session stored — JWT carries all auth info
 * - Method security: @PreAuthorize("hasRole('ADMIN')") on service/controller methods
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // Enables @PreAuthorize annotations
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /**
     * SecurityFilterChain defines the HTTP security rules.
     * Think of it as the list of rules the security guard follows.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with our custom config (allows React frontend to connect)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Disable CSRF — not needed for REST APIs with JWT
            .csrf(AbstractHttpConfigurer::disable)

            // URL-level rules: public vs authenticated only.
            // Fine-grained role checks live in @PreAuthorize on each controller method.
            // Keeping role checks out of URL patterns avoids Ant-matcher bugs where
            // "/api/staff/**" does NOT match the bare "/api/staff" path in Spring Security 6.
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no login required
                .requestMatchers(
                    "/api/auth/**",          // Login, register
                    "/swagger-ui/**",        // Swagger UI pages
                    "/swagger-ui.html",
                    "/api-docs/**",          // OpenAPI JSON
                    "/v3/api-docs/**"
                ).permitAll()

                // All other requests require a valid JWT token.
                // The actual role check (@PreAuthorize) runs inside the controller method.
                .anyRequest().authenticated()
            )

            // Stateless — don't create HTTP sessions (JWT replaces sessions)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Use our custom authentication provider
            .authenticationProvider(authenticationProvider())

            // Add JWT filter BEFORE the default username/password filter
            // This ensures JWT is checked first on every request
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS config — allows the React app at localhost:3000 to call our API.
     * Without this, the browser blocks the requests (same-origin policy).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * AuthenticationProvider — knows how to authenticate a user.
     * DaoAuthenticationProvider:
     *   1. Loads user from DB using UserDetailsService
     *   2. Checks password using BCryptPasswordEncoder
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * BCryptPasswordEncoder — one-way hashing for passwords.
     * BCrypt is intentionally slow to make brute-force attacks impractical.
     * Strength 12 = 2^12 = 4096 iterations (more secure than default 10).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * AuthenticationManager — used by the login controller to authenticate users.
     * Spring provides this from AuthenticationConfiguration automatically.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}

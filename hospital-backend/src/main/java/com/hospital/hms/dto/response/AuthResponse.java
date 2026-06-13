package com.hospital.hms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * AuthResponse DTO — what the backend sends back after successful login.
 * The frontend stores the token and uses it for all future API calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;           // JWT token
    private String tokenType;       // Always "Bearer"
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;      // User's roles: ["ROLE_ADMIN", "ROLE_HR"]
    private String message;
}

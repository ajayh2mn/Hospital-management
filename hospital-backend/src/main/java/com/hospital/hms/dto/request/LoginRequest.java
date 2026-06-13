package com.hospital.hms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * LoginRequest DTO — what the frontend sends when a user logs in.
 *
 * @NotBlank: Validation annotation — field cannot be null, empty, or whitespace.
 * If validation fails, Spring returns a 400 Bad Request automatically.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;
}

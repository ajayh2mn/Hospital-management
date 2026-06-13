package com.hospital.hms.controller;

import com.hospital.hms.dto.request.LoginRequest;
import com.hospital.hms.dto.request.RegisterRequest;
import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.dto.response.AuthResponse;
import com.hospital.hms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — handles user registration and login.
 *
 * @RestController = @Controller + @ResponseBody (auto-converts to JSON)
 * @RequestMapping("/api/auth") = base path for all endpoints in this controller
 * @Tag: Swagger documentation grouping label
 *
 * Endpoints:
 *   POST /api/auth/register  → create a new account
 *   POST /api/auth/login     → get a JWT token
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and Registration endpoints")
public class AuthController {

    private final AuthService authService;

    /**
     * @PostMapping: Handles HTTP POST requests
     * @Valid: Triggers validation of RegisterRequest fields (@NotBlank, @Email, etc.)
     * ResponseEntity: Lets us control the HTTP status code returned
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate and receive JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}

package com.hospital.hms.service;

import com.hospital.hms.dto.request.LoginRequest;
import com.hospital.hms.dto.request.RegisterRequest;
import com.hospital.hms.dto.response.AuthResponse;
import com.hospital.hms.entity.Role;
import com.hospital.hms.entity.User;
import com.hospital.hms.exception.DuplicateResourceException;
import com.hospital.hms.repository.UserRepository;
import com.hospital.hms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * AuthService — handles user registration and login.
 *
 * @Service: Marks this as a Spring service bean
 * @Transactional: Wraps methods in a database transaction.
 *   If any step fails, the whole transaction rolls back (no partial data).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user.
     * Steps:
     * 1. Check for duplicate username/email
     * 2. Hash the password
     * 3. Save user to database
     * 4. Generate JWT token
     * 5. Return token + user info
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check duplicates
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        // Set default role if none provided
        Set<Role> roles = (request.getRoles() != null && !request.getRoles().isEmpty())
                ? request.getRoles()
                : Set.of(Role.ROLE_RECEPTIONIST);

        // Create and save the user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // HASH the password!
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .roles(roles)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getUsername());

        // Generate JWT for immediate login after registration
        UserDetails userDetails = loadUserDetails(savedUser);
        String token = jwtUtil.generateToken(userDetails);

        return buildAuthResponse(savedUser, token, "User registered successfully");
    }

    /**
     * Login an existing user.
     * Steps:
     * 1. AuthenticationManager verifies username/password
     * 2. If correct, generate JWT token
     * 3. Return token + user info
     */
    public AuthResponse login(LoginRequest request) {
        // This throws BadCredentialsException if wrong password — caught by GlobalExceptionHandler
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        // Authentication succeeded — get the user
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsernameOrEmail(
                userDetails.getUsername(), userDetails.getUsername())
                .orElseThrow();

        String token = jwtUtil.generateToken(userDetails);
        log.info("User logged in: {}", user.getUsername());

        return buildAuthResponse(user, token, "Login successful");
    }

    private UserDetails loadUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.name()))
                        .collect(Collectors.toSet()))
                .build();
    }

    private AuthResponse buildAuthResponse(User user, String token, String message) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(Role::name).collect(Collectors.toSet()))
                .message(message)
                .build();
    }
}

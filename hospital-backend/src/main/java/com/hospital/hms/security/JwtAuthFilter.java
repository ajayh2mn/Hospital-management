package com.hospital.hms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthFilter — intercepts EVERY HTTP request before it reaches a controller.
 *
 * Flow:
 *   1. Extract JWT from "Authorization: Bearer <token>" header
 *   2. Parse the token to get the username
 *   3. Load user details from database
 *   4. Validate the token
 *   5. If valid: tell Spring Security "this user is authenticated"
 *   6. Continue to the actual controller
 *
 * OncePerRequestFilter: guarantees this filter runs exactly once per request.
 * @RequiredArgsConstructor: Lombok creates a constructor for all final fields.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Get the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // If no Authorization header or doesn't start with "Bearer ", skip JWT check
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 2: Extract the token (remove "Bearer " prefix)
        final String jwt = authHeader.substring(7);

        try {
            // Step 3: Extract username from the token
            final String username = jwtUtil.extractUsername(jwt);

            // Step 4: Only proceed if username found AND user not already authenticated
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Step 5: Load full user details (including roles) from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Step 6: Validate token
                if (jwtUtil.validateToken(jwt, userDetails)) {

                    // Step 7: Create authentication object with user's roles
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,                          // No password needed here
                                    userDetails.getAuthorities()  // User's roles/permissions
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Step 8: Tell Spring Security: "This user is authenticated"
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        // Continue to next filter / controller
        filterChain.doFilter(request, response);
    }
}

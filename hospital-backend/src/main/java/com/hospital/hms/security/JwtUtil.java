package com.hospital.hms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtUtil — utility class for creating and validating JWT tokens.
 *
 * A JWT token has 3 parts separated by dots:
 *   Header.Payload.Signature
 *   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.xyz
 *
 * - Header: algorithm used (HS256)
 * - Payload: data stored in the token (username, roles, expiry)
 * - Signature: HMAC hash to verify the token wasn't tampered with
 *
 * @Component: Spring manages this as a singleton bean
 * @Slf4j: Lombok injects a logger (log.info, log.error)
 */
@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * Generate a JWT token for a successfully authenticated user.
     * The token embeds the username — that's how we identify the user later.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)                          // Who this token belongs to
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())                 // Sign with secret key
                .compact();
    }

    /**
     * Convert the secret string to a cryptographic key.
     * Keys.hmacShaKeyFor creates an HMAC-SHA key for signing/verifying.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Extract the username (subject) from the token */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extract the expiration date from the token */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /** Generic method to extract any claim from the token */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /** Parse and verify the token — throws exception if invalid/expired */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Check if the token is expired */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate the token: check that it belongs to the right user and isn't expired.
     * Called by JwtAuthFilter for every incoming request.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}

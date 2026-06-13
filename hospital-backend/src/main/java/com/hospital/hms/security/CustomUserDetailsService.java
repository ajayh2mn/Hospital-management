package com.hospital.hms.security;

import com.hospital.hms.entity.User;
import com.hospital.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * CustomUserDetailsService — Spring Security calls this to load a user by username.
 *
 * When JwtAuthFilter extracts a username from the token, it calls
 * loadUserByUsername() here to get the full user (with roles) from the database.
 *
 * Spring Security's UserDetails interface is what Spring understands.
 * We convert our User entity into a UserDetails object here.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Look up user by username OR email (flexible login)
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username or email: " + username));

        // Convert our User entity to Spring Security's UserDetails
        // SimpleGrantedAuthority wraps each role string (e.g., "ROLE_ADMIN")
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())  // BCrypt-hashed password
                .authorities(user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.name()))
                        .collect(Collectors.toSet()))
                .accountExpired(false)
                .accountLocked(!user.isEnabled())
                .credentialsExpired(false)
                .disabled(!user.isEnabled())
                .build();
    }
}

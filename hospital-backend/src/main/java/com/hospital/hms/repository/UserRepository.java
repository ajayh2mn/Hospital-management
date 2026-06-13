package com.hospital.hms.repository;

import com.hospital.hms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository — database access for the users table.
 *
 * JpaRepository<User, Long> gives us for free:
 *   save(), findById(), findAll(), deleteById(), count(), existsById(), etc.
 *
 * Custom methods below: Spring reads the method name and generates SQL.
 * findByUsernameOrEmail → SELECT * FROM users WHERE username=? OR email=?
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used for login — user can log in with username OR email
    java.util.Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}

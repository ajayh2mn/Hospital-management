package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"password"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @EqualsAndHashCode.Include
    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    // @JsonIgnore: NEVER send the password hash in any API response
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<Role> roles;
}

package com.hospital.hms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * BaseEntity — parent class for all entities.
 * Automatically fills createdAt and updatedAt timestamps.
 *
 * Two mechanisms work together for reliability:
 *  1. @CreatedDate / @LastModifiedDate — Spring Data JPA auditing (primary)
 *  2. @PrePersist / @PreUpdate         — JPA lifecycle hooks (fallback)
 *
 * If auditing somehow doesn't fire, the @PrePersist fallback ensures
 * createdAt is never null, preventing database constraint violations.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Fallback: runs just before INSERT — guarantees createdAt is never null
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    // Fallback: runs just before UPDATE
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "ticket_comments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"ticket", "commentedBy"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class TicketComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @JsonIgnore on ticket prevents: Comment → ticket → comments → Comment → ticket → loop
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commented_by_user_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "hibernateLazyInitializer"})
    private User commentedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;
}

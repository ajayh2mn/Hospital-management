package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"raisedBy", "assignedTo", "comments"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class SupportTicket extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @EqualsAndHashCode.Include
    @Column(name = "ticket_number", unique = true, nullable = false)
    private String ticketNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_user_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "hibernateLazyInitializer"})
    private User raisedBy;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    @JsonIgnoreProperties({"password", "roles", "hibernateLazyInitializer"})
    private User assignedTo;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    // Skip ticket back-reference inside each comment to avoid loops
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"ticket"})
    private List<TicketComment> comments;
}

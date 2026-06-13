package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "queue")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"appointment", "doctor"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Queue extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "patient", "doctor"})
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    @JsonIgnoreProperties({"attendanceList", "payrolls", "user", "hibernateLazyInitializer"})
    private Staff doctor;

    @Column(nullable = false)
    private LocalDate queueDate;

    @EqualsAndHashCode.Include
    @Column(nullable = false)
    private Integer tokenNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QueueStatus status = QueueStatus.WAITING;

    private LocalTime calledAt;
    private LocalTime completedAt;
    private Integer estimatedWaitMinutes;
}

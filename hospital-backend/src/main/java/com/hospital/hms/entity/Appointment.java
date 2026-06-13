package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"patient", "doctor"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Appointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @EqualsAndHashCode.Include
    @Column(name = "appointment_number", unique = true, nullable = false)
    private String appointmentNumber;

    // Skip patient's appointments list to avoid Patient → appointments → Appointment → patient → loop
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"appointments", "hibernateLazyInitializer"})
    private Patient patient;

    // Skip staff's attendanceList and payrolls to avoid similar loops
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnoreProperties({"attendanceList", "payrolls", "user", "hibernateLazyInitializer"})
    private Staff doctor;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column(nullable = false)
    private LocalTime appointmentTime;

    @Enumerated(EnumType.STRING)
    private Department department;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String reasonForVisit;

    @Column(columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(columnDefinition = "TEXT")
    private String prescription;

    private String diagnosis;
    private String followUpDate;

    @Column(name = "token_number")
    private Integer tokenNumber;
}

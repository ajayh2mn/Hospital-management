package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "patients")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"appointments"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Patient extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @EqualsAndHashCode.Include
    @Column(name = "patient_id", unique = true, nullable = false)
    private String patientId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;
    private String city;
    private String state;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String chronicConditions;

    @Column(columnDefinition = "TEXT")
    private String currentMedications;

    private String insuranceProvider;
    private String insurancePolicyNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PatientStatus status = PatientStatus.ACTIVE;

    // @JsonIgnore prevents: Patient → appointments → Appointment → patient → appointments → loop
    @JsonIgnore
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;
}

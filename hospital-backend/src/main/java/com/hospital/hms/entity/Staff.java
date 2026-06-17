package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "staff")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"attendanceList", "payrolls", "user"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Staff extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @EqualsAndHashCode.Include
    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Department department;

    @Enumerated(EnumType.STRING)
    private Designation designation;

    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;
    private String address;
    private String gender;

    @Column(precision = 15, scale = 2)
    private BigDecimal basicSalary;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StaffStatus status = StaffStatus.ACTIVE;

    private String profileImageUrl;

    // @JsonIgnoreProperties: when serializing User inside Staff,
    // skip these fields to avoid circular loops and hide sensitive data
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnoreProperties({"password", "roles", "enabled", "createdAt", "updatedAt"})
    private User user;

    // @JsonIgnore: do NOT include these collections in the JSON response.
    // Without this, Jackson follows Staff → attendanceList → Attendance → staff → attendanceList → ... forever
    @JsonIgnore
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attendance> attendanceList;

    @JsonIgnore
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payroll> payrolls;
}

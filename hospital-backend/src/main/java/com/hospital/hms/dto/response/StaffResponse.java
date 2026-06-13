package com.hospital.hms.dto.response;

import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Designation;
import com.hospital.hms.entity.StaffStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * StaffResponse DTO — what we send back to the frontend.
 * Note: We do NOT include password or sensitive info here.
 */
@Data
public class StaffResponse {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;  // Computed: firstName + " " + lastName
    private String email;
    private String phone;
    private Department department;
    private Designation designation;
    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;
    private String address;
    private String gender;
    private BigDecimal basicSalary;
    private StaffStatus status;
    private String profileImageUrl;
    private LocalDateTime createdAt;
}

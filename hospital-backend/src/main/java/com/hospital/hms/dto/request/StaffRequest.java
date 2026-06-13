package com.hospital.hms.dto.request;

import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Designation;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class StaffRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    @NotNull(message = "Department is required")
    private Department department;

    @NotNull(message = "Designation is required")
    private Designation designation;

    private LocalDate dateOfJoining;
    private LocalDate dateOfBirth;
    private String address;
    private String gender;

    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal basicSalary;

    // Optional: create a login account for this staff member
    private String username;
    private String password;
}

package com.hospital.hms.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
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
    private String allergies;
    private String chronicConditions;
    private String currentMedications;
    private String insuranceProvider;
    private String insurancePolicyNumber;
}

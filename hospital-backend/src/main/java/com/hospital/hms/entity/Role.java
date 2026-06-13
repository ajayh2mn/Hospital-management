package com.hospital.hms.entity;

/**
 * Role enum defines every type of user in the hospital system.
 * Spring Security uses these roles to restrict access to endpoints.
 *
 * Example: Only ADMIN can access /api/admin/**
 *          DOCTOR and NURSE can access /api/patients/**
 */
public enum Role {
    ROLE_ADMIN,         // Hospital administrator — full access
    ROLE_DOCTOR,        // Can view/manage patients, appointments
    ROLE_NURSE,         // Can manage patient care, attendance
    ROLE_RECEPTIONIST,  // Can manage appointments, queue
    ROLE_PHARMACIST,    // Can view prescriptions
    ROLE_ACCOUNTANT,    // Can manage payroll, payslips
    ROLE_HR             // Can manage staff, attendance
}

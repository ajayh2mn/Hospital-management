package com.hospital.hms.entity;

public enum PayrollStatus {
    PENDING,    // Not yet processed
    PROCESSED,  // Calculated but not paid
    PAID,       // Payment done
    CANCELLED   // Cancelled payroll
}

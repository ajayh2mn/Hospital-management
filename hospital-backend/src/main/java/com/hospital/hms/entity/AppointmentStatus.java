package com.hospital.hms.entity;

public enum AppointmentStatus {
    SCHEDULED,    // Booked but not yet checked in
    CONFIRMED,    // Confirmed by receptionist
    IN_QUEUE,     // Patient arrived, waiting in queue
    IN_PROGRESS,  // Doctor is currently seeing the patient
    COMPLETED,    // Appointment done
    CANCELLED,    // Cancelled by patient or doctor
    NO_SHOW       // Patient didn't show up
}

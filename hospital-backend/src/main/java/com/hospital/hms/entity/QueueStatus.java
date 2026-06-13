package com.hospital.hms.entity;

public enum QueueStatus {
    WAITING,      // In the queue
    CALLED,       // Receptionist called their token
    IN_PROGRESS,  // Doctor is seeing them
    COMPLETED,    // Done
    SKIPPED       // Didn't respond when called
}

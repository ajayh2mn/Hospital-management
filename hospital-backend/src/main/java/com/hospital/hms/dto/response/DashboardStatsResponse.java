package com.hospital.hms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DashboardStatsResponse — summary statistics for the Admin Dashboard.
 * The frontend displays these as cards at the top of the dashboard.
 */
@Data
@Builder
public class DashboardStatsResponse {

    // Staff stats
    private long totalStaff;
    private long activeStaff;

    // Patient stats
    private long totalPatients;
    private long activePatients;

    // Appointment stats
    private long todayAppointments;
    private long pendingAppointments;

    // Financial stats
    private BigDecimal monthlyPayroll;

    // Queue stats
    private long currentQueueSize;

    // Ticket stats
    private long openTickets;

    // Department breakdown: {"CARDIOLOGY": 5, "NEUROLOGY": 3}
    private Map<String, Long> staffByDepartment;
}

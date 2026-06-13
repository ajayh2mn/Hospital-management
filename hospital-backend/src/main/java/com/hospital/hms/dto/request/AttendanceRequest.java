package com.hospital.hms.dto.request;

import com.hospital.hms.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceRequest {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Date is required")
    private LocalDate attendanceDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private String remarks;
    private Double overtimeHours;
}

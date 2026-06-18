package com.hospital.hms.dto.request;

import lombok.Data;

@Data
public class AttendanceSessionRequest {
    private Double latitude;
    private Double longitude;
    private Double distanceMeters;
}

package com.hospital.hms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "hospital.location")
@Data
public class HospitalProperties {
    private String name = "Hospital";
    private double latitude = 0.0;
    private double longitude = 0.0;
    private double fenceRadiusMeters = 200.0;
}

package com.hospital.hms.controller;

import com.hospital.hms.config.HospitalProperties;
import com.hospital.hms.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final HospitalProperties hospitalProperties;

    @GetMapping("/hospital-location")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHospitalLocation() {
        Map<String, Object> location = Map.of(
            "name",              hospitalProperties.getName(),
            "latitude",          hospitalProperties.getLatitude(),
            "longitude",         hospitalProperties.getLongitude(),
            "fenceRadiusMeters", hospitalProperties.getFenceRadiusMeters()
        );
        return ResponseEntity.ok(ApiResponse.success("Hospital location", location));
    }
}

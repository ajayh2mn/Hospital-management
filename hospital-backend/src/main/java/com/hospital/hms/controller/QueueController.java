package com.hospital.hms.controller;

import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.entity.Queue;
import com.hospital.hms.service.QueueService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
@Tag(name = "Queue Management")
@SecurityRequirement(name = "bearerAuth")
public class QueueController {

    private final QueueService queueService;

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Queue>>> getDoctorQueue(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queueDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(queueService.getDoctorQueue(doctorId, queueDate)));
    }

    @GetMapping("/waiting")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Queue>>> getWaitingQueue() {
        return ResponseEntity.ok(ApiResponse.success(queueService.getTodayWaitingQueue()));
    }

    @PutMapping("/{id}/call")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<ApiResponse<Queue>> callPatient(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Patient called", queueService.callNextPatient(id)));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<ApiResponse<Queue>> completeConsultation(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Consultation completed", queueService.completeConsultation(id)));
    }

    @PutMapping("/{id}/skip")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Queue>> skipPatient(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Patient skipped", queueService.skipPatient(id)));
    }
}

package com.hospital.hms.controller;

import com.hospital.hms.dto.request.AppointmentRequest;
import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.entity.Appointment;
import com.hospital.hms.entity.AppointmentStatus;
import com.hospital.hms.service.AppointmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment Management")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        Appointment appointment = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked", appointment));
    }

    @GetMapping("/today")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Appointment>>> getTodayAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getTodayAppointments()));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorAppointments(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByDoctor(doctorId)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Appointment>>> getPatientAppointments(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getPatientAppointments(patientId)));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Appointment>> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Patient checked in", appointmentService.checkIn(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Appointment>> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Status updated", appointmentService.updateStatus(id, status)));
    }
}

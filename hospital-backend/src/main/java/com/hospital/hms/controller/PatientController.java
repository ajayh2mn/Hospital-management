package com.hospital.hms.controller;

import com.hospital.hms.dto.request.PatientRequest;
import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.service.PatientService;
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
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patient Management")
@SecurityRequirement(name = "bearerAuth")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<ApiResponse<Patient>> registerPatient(
            @Valid @RequestBody PatientRequest request) {
        Patient patient = patientService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered", patient));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<Patient>>> getAllPatients() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getAllPatients()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    @GetMapping("/pid/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Patient>> getByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientByPatientId(patientId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'NURSE')")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(
            @PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Patient updated", patientService.updatePatient(id, request)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<Patient>>> searchPatients(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(patientService.searchPatients(keyword)));
    }
}

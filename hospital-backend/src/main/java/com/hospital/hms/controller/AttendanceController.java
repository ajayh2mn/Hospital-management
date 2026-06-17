package com.hospital.hms.controller;

import com.hospital.hms.dto.request.AttendanceRequest;
import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.entity.Attendance;
import com.hospital.hms.entity.AttendanceStatus;
import com.hospital.hms.service.AttendanceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hospital.hms.service.StaffService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance Management")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StaffService staffService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'NURSE')")
    public ResponseEntity<ApiResponse<Attendance>> markAttendance(
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Attendance marked", attendanceService.markAttendance(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Attendance>> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Attendance updated", attendanceService.updateAttendance(id, request)));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAttendanceByDate(date)));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getStaffAttendance(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                ApiResponse.success(attendanceService.getStaffAttendance(staffId, from, to)));
    }

    @GetMapping("/staff/{staffId}/monthly-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Map<AttendanceStatus, Long>>> getMonthlySummary(
            @PathVariable Long staffId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(
                ApiResponse.success(attendanceService.getMonthlySummary(staffId, month, year)));
    }

    // ── Employee self-service endpoints ──

    @PostMapping("/me/mark")
    public ResponseEntity<ApiResponse<Attendance>> markMyAttendance(
            @Valid @RequestBody AttendanceRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long staffId = staffService.getStaffEntityByUsername(auth.getName()).getId();
        request.setStaffId(staffId);
        return ResponseEntity.ok(
                ApiResponse.success("Attendance marked", attendanceService.markAttendance(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Attendance>>> getMyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long staffId = staffService.getStaffEntityByUsername(auth.getName()).getId();
        return ResponseEntity.ok(
                ApiResponse.success(attendanceService.getStaffAttendance(staffId, from, to)));
    }

    @GetMapping("/me/monthly-summary")
    public ResponseEntity<ApiResponse<Map<AttendanceStatus, Long>>> getMyMonthlySummary(
            @RequestParam int month, @RequestParam int year) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long staffId = staffService.getStaffEntityByUsername(auth.getName()).getId();
        return ResponseEntity.ok(
                ApiResponse.success(attendanceService.getMonthlySummary(staffId, month, year)));
    }

    @PostMapping("/bulk-mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<Void>> bulkMark(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam AttendanceStatus status) {
        attendanceService.bulkMarkAttendance(date, status);
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance marked", null));
    }
}

package com.hospital.hms.controller;

import com.hospital.hms.dto.request.AttendanceSessionRequest;
import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.dto.response.AttendanceSessionSummary;
import com.hospital.hms.entity.AttendanceSession;
import com.hospital.hms.entity.Staff;
import com.hospital.hms.service.AttendanceSessionService;
import com.hospital.hms.service.StaffService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance/me/session")
@RequiredArgsConstructor
@Tag(name = "Attendance Work Sessions")
@SecurityRequirement(name = "bearerAuth")
public class AttendanceSessionController {

    private final AttendanceSessionService sessionService;
    private final StaffService staffService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<AttendanceSession>> start(@RequestBody AttendanceSessionRequest request) {
        Staff staff = currentStaff();
        AttendanceSession session = sessionService.startSession(
                staff, request.getLatitude(), request.getLongitude(), request.getDistanceMeters());
        return ResponseEntity.ok(ApiResponse.success("Session started", session));
    }

    @PostMapping("/end")
    public ResponseEntity<ApiResponse<AttendanceSession>> end(@RequestBody AttendanceSessionRequest request) {
        Staff staff = currentStaff();
        AttendanceSession session = sessionService.endSession(
                staff, request.getLatitude(), request.getLongitude(), request.getDistanceMeters());
        return ResponseEntity.ok(ApiResponse.success("Session ended", session));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceSessionSummary>> today() {
        Staff staff = currentStaff();
        return ResponseEntity.ok(ApiResponse.success(sessionService.getTodaySummary(staff)));
    }

    private Staff currentStaff() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return staffService.getStaffEntityByUsername(auth.getName());
    }
}

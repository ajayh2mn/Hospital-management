package com.hospital.hms.controller;

import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.dto.response.DashboardStatsResponse;
import com.hospital.hms.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AdminController — admin dashboard endpoints.
 *
 * @PreAuthorize("hasRole('ADMIN')"): Only users with ROLE_ADMIN can access these.
 *   If a non-admin tries to access → 403 Forbidden.
 *
 * @SecurityRequirement: Tells Swagger UI that this endpoint needs a JWT token.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Admin-only endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }
}

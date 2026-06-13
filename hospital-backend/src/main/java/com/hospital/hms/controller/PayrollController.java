package com.hospital.hms.controller;

import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.entity.Payroll;
import com.hospital.hms.service.PayrollService;
import com.hospital.hms.service.PayslipPdfService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll Management")
@SecurityRequirement(name = "bearerAuth")
public class PayrollController {

    private final PayrollService payrollService;
    private final PayslipPdfService payslipPdfService;

    @PostMapping("/generate/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'HR')")
    public ResponseEntity<ApiResponse<Payroll>> generatePayroll(
            @PathVariable Long staffId,
            @RequestParam int month,
            @RequestParam int year) {
        Payroll payroll = payrollService.generatePayroll(staffId, month, year);
        return ResponseEntity.ok(ApiResponse.success("Payroll generated", payroll));
    }

    @GetMapping("/month")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'HR')")
    public ResponseEntity<ApiResponse<List<Payroll>>> getMonthlyPayroll(
            @RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getPayrollByMonth(month, year)));
    }

    @GetMapping("/staff/{staffId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'HR')")
    public ResponseEntity<ApiResponse<List<Payroll>>> getStaffPayrollHistory(
            @PathVariable Long staffId) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getStaffPayrollHistory(staffId)));
    }

    @PutMapping("/{payrollId}/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<Payroll>> markAsPaid(@PathVariable Long payrollId) {
        return ResponseEntity.ok(
                ApiResponse.success("Payroll marked as paid", payrollService.markAsPaid(payrollId)));
    }

    /**
     * PDF download endpoint.
     * Returns the PDF as binary content, not JSON.
     * The browser will trigger a file download.
     */
    @GetMapping("/{payrollId}/payslip")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long payrollId) throws Exception {
        byte[] pdfBytes = payslipPdfService.generatePayslip(payrollId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "payslip-" + payrollId + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}

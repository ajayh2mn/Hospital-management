package com.hospital.hms.controller;

import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.service.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @Data
    public static class SendEmailRequest {
        @NotBlank(message = "Recipient email is required")
        @Email(message = "Invalid email address")
        private String to;

        @NotBlank(message = "Subject is required")
        private String subject;

        @NotBlank(message = "Message body is required")
        private String body;
    }

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse<String>> sendEmail(@Valid @RequestBody SendEmailRequest req) {
        emailService.sendEmail(req.getTo(), req.getSubject(), req.getBody());
        return ResponseEntity.ok(ApiResponse.success(
            "Email queued successfully (log-only mode — configure SMTP to send real emails)",
            "sent"
        ));
    }
}

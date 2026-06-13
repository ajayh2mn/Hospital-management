package com.hospital.hms.controller;

import com.hospital.hms.dto.request.SupportTicketRequest;
import com.hospital.hms.dto.response.ApiResponse;
import com.hospital.hms.entity.SupportTicket;
import com.hospital.hms.entity.TicketStatus;
import com.hospital.hms.service.SupportTicketService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Support Ticket System")
@SecurityRequirement(name = "bearerAuth")
public class SupportTicketController {

    private final SupportTicketService ticketService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            @Valid @RequestBody SupportTicketRequest request,
            Authentication auth) {  // Spring injects the current logged-in user
        SupportTicket ticket = ticketService.createTicket(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created", ticket));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getAllTickets()));
    }

    @GetMapping("/my-tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getMyTickets(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getUserTickets(auth.getName())));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SupportTicket>> addComment(
            @PathVariable Long id,
            @RequestParam String comment,
            Authentication auth) {
        return ResponseEntity.ok(
                ApiResponse.success("Comment added", ticketService.addComment(id, comment, auth.getName())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupportTicket>> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String resolution) {
        return ResponseEntity.ok(
                ApiResponse.success("Ticket updated", ticketService.updateStatus(id, status, resolution)));
    }
}

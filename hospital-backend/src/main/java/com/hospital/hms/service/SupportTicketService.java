package com.hospital.hms.service;

import com.hospital.hms.dto.request.SupportTicketRequest;
import com.hospital.hms.entity.*;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.SupportTicketRepository;
import com.hospital.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public SupportTicket createTicket(SupportTicketRequest request, String username) {
        User raisedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        String ticketNumber = generateTicketNumber();

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .raisedBy(raisedBy)
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .build();

        return ticketRepository.save(ticket);
    }

    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<SupportTicket> getUserTickets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return ticketRepository.findByRaisedByOrderByCreatedAtDesc(user);
    }

    @Transactional
    public SupportTicket addComment(Long ticketId, String comment, String username) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        TicketComment ticketComment = TicketComment.builder()
                .ticket(ticket)
                .commentedBy(user)
                .comment(comment)
                .build();

        ticket.getComments().add(ticketComment);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public SupportTicket updateStatus(Long ticketId, TicketStatus status, String resolution) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));
        ticket.setStatus(status);
        if (resolution != null) {
            ticket.setResolution(resolution);
        }
        return ticketRepository.save(ticket);
    }

    private String generateTicketNumber() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = ticketRepository.count() + 1;
        return String.format("TKT-%s-%03d", dateStr, count);
    }
}

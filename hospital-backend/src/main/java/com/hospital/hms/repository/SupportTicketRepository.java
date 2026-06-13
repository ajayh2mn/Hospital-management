package com.hospital.hms.repository;

import com.hospital.hms.entity.SupportTicket;
import com.hospital.hms.entity.TicketStatus;
import com.hospital.hms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByRaisedBy(User user);

    List<SupportTicket> findByAssignedTo(User user);

    List<SupportTicket> findByStatus(TicketStatus status);

    List<SupportTicket> findByRaisedByOrderByCreatedAtDesc(User user);

    long countByStatus(TicketStatus status);
}

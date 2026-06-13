package com.hospital.hms.service;

import com.hospital.hms.dto.response.DashboardStatsResponse;
import com.hospital.hms.entity.*;
import com.hospital.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PayrollRepository payrollRepository;
    private final QueueRepository queueRepository;
    private final SupportTicketRepository ticketRepository;

    public DashboardStatsResponse getStats() {
        LocalDate today = LocalDate.now();

        // Staff counts
        long totalStaff = staffRepository.count();
        long activeStaff = staffRepository.findByStatus(StaffStatus.ACTIVE).size();

        // Patient counts
        long totalPatients = patientRepository.count();
        long activePatients = patientRepository.countByStatus(PatientStatus.ACTIVE);

        // Appointment counts
        long todayAppointments = appointmentRepository.countByAppointmentDate(today);
        long pendingAppointments = appointmentRepository.countByStatus(AppointmentStatus.SCHEDULED);

        // Payroll stats
        var monthlyPayroll = payrollRepository.totalPayrollForMonth(today.getMonthValue(), today.getYear());

        // Queue stats
        long currentQueueSize = queueRepository.findByQueueDateAndStatus(today, QueueStatus.WAITING).size();

        // Ticket stats
        long openTickets = ticketRepository.countByStatus(TicketStatus.OPEN);

        // Staff by department breakdown
        List<Object[]> deptCounts = staffRepository.countByDepartment();
        Map<String, Long> staffByDepartment = new HashMap<>();
        for (Object[] row : deptCounts) {
            staffByDepartment.put(row[0].toString(), (Long) row[1]);
        }

        return DashboardStatsResponse.builder()
                .totalStaff(totalStaff)
                .activeStaff(activeStaff)
                .totalPatients(totalPatients)
                .activePatients(activePatients)
                .todayAppointments(todayAppointments)
                .pendingAppointments(pendingAppointments)
                .monthlyPayroll(monthlyPayroll)
                .currentQueueSize(currentQueueSize)
                .openTickets(openTickets)
                .staffByDepartment(staffByDepartment)
                .build();
    }
}

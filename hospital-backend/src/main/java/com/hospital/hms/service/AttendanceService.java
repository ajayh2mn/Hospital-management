package com.hospital.hms.service;

import com.hospital.hms.dto.request.AttendanceRequest;
import com.hospital.hms.entity.Attendance;
import com.hospital.hms.entity.AttendanceStatus;
import com.hospital.hms.entity.Staff;
import com.hospital.hms.exception.BusinessException;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.AttendanceRepository;
import com.hospital.hms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StaffRepository staffRepository;

    @Transactional
    public Attendance markAttendance(AttendanceRequest request) {
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", request.getStaffId()));

        // Check if attendance already marked for this date
        if (attendanceRepository.findByStaffAndAttendanceDate(staff, request.getAttendanceDate()).isPresent()) {
            throw new BusinessException("Attendance already marked for " + staff.getFirstName() +
                    " on " + request.getAttendanceDate());
        }

        Attendance attendance = Attendance.builder()
                .staff(staff)
                .attendanceDate(request.getAttendanceDate())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .status(request.getStatus())
                .remarks(request.getRemarks())
                .overtimeHours(request.getOvertimeHours())
                .build();

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", id));

        attendance.setCheckInTime(request.getCheckInTime());
        attendance.setCheckOutTime(request.getCheckOutTime());
        attendance.setStatus(request.getStatus());
        attendance.setRemarks(request.getRemarks());
        attendance.setOvertimeHours(request.getOvertimeHours());

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    public List<Attendance> getStaffAttendance(Long staffId, LocalDate from, LocalDate to) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));
        return attendanceRepository.findByStaffAndAttendanceDateBetween(staff, from, to);
    }

    /** Bulk mark attendance for all active staff on a date */
    @Transactional
    public void bulkMarkAttendance(LocalDate date, AttendanceStatus defaultStatus) {
        List<Staff> allActiveStaff = staffRepository.findByStatus(com.hospital.hms.entity.StaffStatus.ACTIVE);

        for (Staff staff : allActiveStaff) {
            boolean alreadyMarked = attendanceRepository
                    .findByStaffAndAttendanceDate(staff, date).isPresent();

            if (!alreadyMarked) {
                Attendance attendance = Attendance.builder()
                        .staff(staff)
                        .attendanceDate(date)
                        .status(defaultStatus)
                        .build();
                attendanceRepository.save(attendance);
            }
        }
    }

    /** Monthly summary for a staff member — used in payroll calculation */
    public Map<AttendanceStatus, Long> getMonthlySummary(Long staffId, int month, int year) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        List<Attendance> records = attendanceRepository
                .findByStaffAndAttendanceDateBetween(staff, from, to);

        return records.stream()
                .collect(Collectors.groupingBy(Attendance::getStatus, Collectors.counting()));
    }
}

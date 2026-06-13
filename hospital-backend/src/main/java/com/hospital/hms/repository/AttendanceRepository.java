package com.hospital.hms.repository;

import com.hospital.hms.entity.Attendance;
import com.hospital.hms.entity.AttendanceStatus;
import com.hospital.hms.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Get one specific attendance record (one staff, one date)
    Optional<Attendance> findByStaffAndAttendanceDate(Staff staff, LocalDate date);

    // All attendance for a staff member in a date range (for payroll)
    List<Attendance> findByStaffAndAttendanceDateBetween(Staff staff, LocalDate from, LocalDate to);

    // All attendance for a specific date (daily report)
    List<Attendance> findByAttendanceDate(LocalDate date);

    // Count how many PRESENT days a staff had in a month
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.staff.id = :staffId " +
           "AND a.status = :status AND MONTH(a.attendanceDate) = :month " +
           "AND YEAR(a.attendanceDate) = :year")
    Long countByStaffAndStatusAndMonth(Long staffId, AttendanceStatus status, int month, int year);
}

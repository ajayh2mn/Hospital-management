package com.hospital.hms.repository;

import com.hospital.hms.entity.AttendanceSession;
import com.hospital.hms.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    // The one currently-open session for a staff member, regardless of date
    Optional<AttendanceSession> findByStaffAndCheckOutTimeIsNull(Staff staff);

    // All of today's sessions, used for the live work-timer summary
    List<AttendanceSession> findByStaffAndAttendanceDateOrderByCheckInTimeAsc(Staff staff, LocalDate date);
}

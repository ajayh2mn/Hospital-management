package com.hospital.hms.service;

import com.hospital.hms.dto.response.AttendanceSessionSummary;
import com.hospital.hms.entity.Attendance;
import com.hospital.hms.entity.AttendanceSession;
import com.hospital.hms.entity.AttendanceStatus;
import com.hospital.hms.entity.Staff;
import com.hospital.hms.repository.AttendanceRepository;
import com.hospital.hms.repository.AttendanceSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceSessionService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public AttendanceSession startSession(Staff staff, Double lat, Double lon, Double dist) {
        LocalDate today = LocalDate.now();

        Optional<AttendanceSession> openOpt = sessionRepository.findByStaffAndCheckOutTimeIsNull(staff);
        if (openOpt.isPresent()) {
            AttendanceSession open = openOpt.get();
            if (open.getAttendanceDate().isEqual(today)) {
                // Already inside today — GPS fires repeatedly, don't create duplicates
                return open;
            }
            // Stale session left open from a previous day — close it before starting a new one
            open.setCheckOutTime(LocalDateTime.of(open.getAttendanceDate(), LocalTime.of(23, 59, 59)));
            sessionRepository.save(open);
        }

        AttendanceSession session = AttendanceSession.builder()
                .staff(staff)
                .attendanceDate(today)
                .checkInTime(LocalDateTime.now())
                .checkInLatitude(lat)
                .checkInLongitude(lon)
                .checkInDistanceMeters(dist)
                .build();
        session = sessionRepository.save(session);

        autoMarkPresent(staff, today, lat, lon, dist);

        return session;
    }

    @Transactional
    public AttendanceSession endSession(Staff staff, Double lat, Double lon, Double dist) {
        Optional<AttendanceSession> openOpt = sessionRepository.findByStaffAndCheckOutTimeIsNull(staff);
        if (openOpt.isEmpty()) {
            return null; // nothing to end — idempotent against GPS boundary jitter
        }

        AttendanceSession session = openOpt.get();
        session.setCheckOutTime(LocalDateTime.now());
        session.setCheckOutLatitude(lat);
        session.setCheckOutLongitude(lon);
        session.setCheckOutDistanceMeters(dist);
        session = sessionRepository.save(session);

        attendanceRepository.findByStaffAndAttendanceDate(staff, session.getAttendanceDate())
                .ifPresent(att -> {
                    att.setCheckOutTime(LocalTime.now());
                    attendanceRepository.save(att);
                });

        return session;
    }

    public AttendanceSessionSummary getTodaySummary(Staff staff) {
        List<AttendanceSession> sessions =
                sessionRepository.findByStaffAndAttendanceDateOrderByCheckInTimeAsc(staff, LocalDate.now());

        long totalSeconds = 0;
        AttendanceSession active = null;
        for (AttendanceSession s : sessions) {
            if (s.getCheckOutTime() != null) {
                totalSeconds += Duration.between(s.getCheckInTime(), s.getCheckOutTime()).getSeconds();
            } else {
                active = s;
                totalSeconds += Duration.between(s.getCheckInTime(), LocalDateTime.now()).getSeconds();
            }
        }

        return AttendanceSessionSummary.builder()
                .sessions(sessions)
                .totalSecondsToday(totalSeconds)
                .activeSession(active)
                .build();
    }

    private void autoMarkPresent(Staff staff, LocalDate today, Double lat, Double lon, Double dist) {
        Attendance attendance = attendanceRepository.findByStaffAndAttendanceDate(staff, today).orElse(null);

        if (attendance == null) {
            attendance = Attendance.builder()
                    .staff(staff)
                    .attendanceDate(today)
                    .checkInTime(LocalTime.now())
                    .status(AttendanceStatus.PRESENT)
                    .checkInLatitude(lat)
                    .checkInLongitude(lon)
                    .checkInDistanceMeters(dist)
                    .build();
            attendanceRepository.save(attendance);
        } else if (attendance.getStatus() != AttendanceStatus.PRESENT) {
            attendance.setStatus(AttendanceStatus.PRESENT);
            attendanceRepository.save(attendance);
        }
    }
}

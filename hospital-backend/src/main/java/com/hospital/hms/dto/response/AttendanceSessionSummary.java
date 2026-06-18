package com.hospital.hms.dto.response;

import com.hospital.hms.entity.AttendanceSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionSummary {
    private List<AttendanceSession> sessions;
    private long totalSecondsToday;
    private AttendanceSession activeSession;
}

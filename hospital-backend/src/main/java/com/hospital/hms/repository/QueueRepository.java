package com.hospital.hms.repository;

import com.hospital.hms.entity.Queue;
import com.hospital.hms.entity.QueueStatus;
import com.hospital.hms.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {

    List<Queue> findByDoctorAndQueueDateOrderByTokenNumber(Staff doctor, LocalDate date);

    List<Queue> findByQueueDateAndStatus(LocalDate date, QueueStatus status);

    @Query("SELECT MAX(q.tokenNumber) FROM Queue q WHERE q.doctor.id = :doctorId AND q.queueDate = :date")
    Optional<Integer> findMaxTokenByDoctorAndDate(Long doctorId, LocalDate date);

    Optional<Queue> findByAppointmentId(Long appointmentId);
}

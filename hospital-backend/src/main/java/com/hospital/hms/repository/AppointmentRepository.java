package com.hospital.hms.repository;

import com.hospital.hms.entity.Appointment;
import com.hospital.hms.entity.AppointmentStatus;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByDoctor(Staff doctor);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByDoctorAndAppointmentDate(Staff doctor, LocalDate date);

    List<Appointment> findByStatus(AppointmentStatus status);

    // How many tokens were assigned today for a doctor (for auto-numbering)
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    Long countByDoctorAndDate(Long doctorId, LocalDate date);

    long countByStatus(AppointmentStatus status);

    long countByAppointmentDate(LocalDate date);
}

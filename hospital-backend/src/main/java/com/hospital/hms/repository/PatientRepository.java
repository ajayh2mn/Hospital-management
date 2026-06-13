package com.hospital.hms.repository;

import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.PatientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientId(String patientId);

    Optional<Patient> findByEmail(String email);

    List<Patient> findByStatus(PatientStatus status);

    @Query("SELECT p FROM Patient p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR p.phone LIKE CONCAT('%', :keyword, '%') " +
           "OR p.patientId LIKE CONCAT('%', :keyword, '%')")
    List<Patient> searchPatients(String keyword);

    boolean existsByEmail(String email);

    long countByStatus(PatientStatus status);
}

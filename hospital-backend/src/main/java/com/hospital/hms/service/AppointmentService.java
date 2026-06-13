package com.hospital.hms.service;

import com.hospital.hms.dto.request.AppointmentRequest;
import com.hospital.hms.entity.*;
import com.hospital.hms.exception.BusinessException;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.AppointmentRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.QueueRepository;
import com.hospital.hms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final StaffRepository staffRepository;
    private final QueueRepository queueRepository;

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        Staff doctor = staffRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        String appointmentNumber = generateAppointmentNumber(request.getAppointmentDate());

        Appointment appointment = Appointment.builder()
                .appointmentNumber(appointmentNumber)
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .department(request.getDepartment())
                .reasonForVisit(request.getReasonForVisit())
                .status(AppointmentStatus.SCHEDULED)
                .build();

        return appointmentRepository.save(appointment);
    }

    /** Patient arrived — move to IN_QUEUE and assign token */
    @Transactional
    public Appointment checkIn(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED &&
                appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BusinessException("Cannot check in: appointment status is " + appointment.getStatus());
        }

        // Assign next token number for this doctor today
        int nextToken = queueRepository
                .findMaxTokenByDoctorAndDate(appointment.getDoctor().getId(), LocalDate.now())
                .orElse(0) + 1;

        appointment.setStatus(AppointmentStatus.IN_QUEUE);
        appointment.setTokenNumber(nextToken);

        // Add to queue
        Queue queue = Queue.builder()
                .appointment(appointment)
                .doctor(appointment.getDoctor())
                .queueDate(LocalDate.now())
                .tokenNumber(nextToken)
                .status(QueueStatus.WAITING)
                .build();
        queueRepository.save(queue);

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getTodayAppointments() {
        return appointmentRepository.findByAppointmentDate(LocalDate.now());
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        Staff doctor = staffRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        return appointmentRepository.findByDoctor(doctor);
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        return appointmentRepository.findByPatient(patient);
    }

    @Transactional
    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    private String generateAppointmentNumber(LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = appointmentRepository.countByAppointmentDate(date) + 1;
        return String.format("APT-%s-%03d", dateStr, count);
    }
}

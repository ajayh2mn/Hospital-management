package com.hospital.hms.service;

import com.hospital.hms.dto.request.PatientRequest;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.PatientStatus;
import com.hospital.hms.exception.DuplicateResourceException;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    @Transactional
    public Patient registerPatient(PatientRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Patient with email " + request.getEmail() + " already exists");
        }

        String patientId = generatePatientId();

        Patient patient = Patient.builder()
                .patientId(patientId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .emergencyContactRelation(request.getEmergencyContactRelation())
                .allergies(request.getAllergies())
                .chronicConditions(request.getChronicConditions())
                .currentMedications(request.getCurrentMedications())
                .insuranceProvider(request.getInsuranceProvider())
                .insurancePolicyNumber(request.getInsurancePolicyNumber())
                .status(PatientStatus.ACTIVE)
                .build();

        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
    }

    public Patient getPatientByPatientId(String patientId) {
        return patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", patientId));
    }

    @Transactional
    public Patient updatePatient(Long id, PatientRequest request) {
        Patient patient = getPatientById(id);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setCity(request.getCity());
        patient.setState(request.getState());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setAllergies(request.getAllergies());
        patient.setChronicConditions(request.getChronicConditions());
        patient.setCurrentMedications(request.getCurrentMedications());
        return patientRepository.save(patient);
    }

    public List<Patient> searchPatients(String keyword) {
        return patientRepository.searchPatients(keyword);
    }

    private String generatePatientId() {
        long count = patientRepository.count() + 1;
        return String.format("PAT-%04d", count);  // PAT-0001
    }
}

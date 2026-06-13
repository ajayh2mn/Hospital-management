package com.hospital.hms.service;

import com.hospital.hms.dto.request.StaffRequest;
import com.hospital.hms.dto.response.StaffResponse;
import com.hospital.hms.entity.*;
import com.hospital.hms.exception.DuplicateResourceException;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.StaffRepository;
import com.hospital.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StaffResponse createStaff(StaffRequest request) {
        if (staffRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Staff with email " + request.getEmail() + " already exists");
        }

        // Auto-generate Employee ID: EMP-001, EMP-002, ...
        String employeeId = generateEmployeeId();

        // Optionally create a login account for this staff member
        User user = null;
        if (request.getUsername() != null && request.getPassword() != null) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new DuplicateResourceException("Username already taken");
            }

            // Determine role based on designation
            Role role = mapDesignationToRole(request.getDesignation());

            user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFirstName() + " " + request.getLastName())
                    .roles(Set.of(role))
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
        }

        Staff staff = Staff.builder()
                .employeeId(employeeId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .dateOfJoining(request.getDateOfJoining())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .gender(request.getGender())
                .basicSalary(request.getBasicSalary())
                .status(StaffStatus.ACTIVE)
                .user(user)
                .build();

        Staff savedStaff = staffRepository.save(staff);
        log.info("Staff created: {} - {}", savedStaff.getEmployeeId(), savedStaff.getEmail());
        return toResponse(savedStaff);
    }

    public List<StaffResponse> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public StaffResponse getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));
        return toResponse(staff);
    }

    @Transactional
    public StaffResponse updateStaff(Long id, StaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));

        staff.setFirstName(request.getFirstName());
        staff.setLastName(request.getLastName());
        staff.setPhone(request.getPhone());
        staff.setDepartment(request.getDepartment());
        staff.setDesignation(request.getDesignation());
        staff.setDateOfJoining(request.getDateOfJoining());
        staff.setAddress(request.getAddress());
        staff.setGender(request.getGender());
        staff.setBasicSalary(request.getBasicSalary());

        return toResponse(staffRepository.save(staff));
    }

    @Transactional
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff", "id", id);
        }
        staffRepository.deleteById(id);
    }

    public List<StaffResponse> searchStaff(String keyword) {
        return staffRepository.searchStaff(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private String generateEmployeeId() {
        long count = staffRepository.count() + 1;
        return String.format("EMP-%03d", count);  // EMP-001
    }

    private Role mapDesignationToRole(Designation designation) {
        return switch (designation) {
            case SENIOR_DOCTOR, JUNIOR_DOCTOR, CHIEF_MEDICAL_OFFICER -> Role.ROLE_DOCTOR;
            case HEAD_NURSE, STAFF_NURSE -> Role.ROLE_NURSE;
            case RECEPTIONIST -> Role.ROLE_RECEPTIONIST;
            case PHARMACIST -> Role.ROLE_PHARMACIST;
            case ACCOUNTANT -> Role.ROLE_ACCOUNTANT;
            case HR_MANAGER -> Role.ROLE_HR;
            default -> Role.ROLE_RECEPTIONIST;
        };
    }

    // Convert Staff entity to StaffResponse DTO
    public StaffResponse toResponse(Staff staff) {
        StaffResponse resp = new StaffResponse();
        resp.setId(staff.getId());
        resp.setEmployeeId(staff.getEmployeeId());
        resp.setFirstName(staff.getFirstName());
        resp.setLastName(staff.getLastName());
        resp.setFullName(staff.getFirstName() + " " + staff.getLastName());
        resp.setEmail(staff.getEmail());
        resp.setPhone(staff.getPhone());
        resp.setDepartment(staff.getDepartment());
        resp.setDesignation(staff.getDesignation());
        resp.setDateOfJoining(staff.getDateOfJoining());
        resp.setDateOfBirth(staff.getDateOfBirth());
        resp.setAddress(staff.getAddress());
        resp.setGender(staff.getGender());
        resp.setBasicSalary(staff.getBasicSalary());
        resp.setStatus(staff.getStatus());
        resp.setCreatedAt(staff.getCreatedAt());
        return resp;
    }
}

package com.hospital.hms.repository;

import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Staff;
import com.hospital.hms.entity.StaffStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByEmployeeId(String employeeId);

    Optional<Staff> findByEmail(String email);

    List<Staff> findByDepartment(Department department);

    List<Staff> findByStatus(StaffStatus status);

    List<Staff> findByDepartmentAndStatus(Department department, StaffStatus status);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    // Custom JPQL query — counts staff per department
    @Query("SELECT s.department, COUNT(s) FROM Staff s WHERE s.status = 'ACTIVE' GROUP BY s.department")
    List<Object[]> countByDepartment();

    Optional<Staff> findByUserUsername(String username);

    // Full-text search across name and email
    @Query("SELECT s FROM Staff s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Staff> searchStaff(String keyword);
}

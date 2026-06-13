package com.hospital.hms.repository;

import com.hospital.hms.entity.Payroll;
import com.hospital.hms.entity.PayrollStatus;
import com.hospital.hms.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByStaffAndPayMonthAndPayYear(Staff staff, int month, int year);

    List<Payroll> findByStaff(Staff staff);

    List<Payroll> findByPayMonthAndPayYear(int month, int year);

    List<Payroll> findByStatus(PayrollStatus status);

    @Query("SELECT SUM(p.netSalary) FROM Payroll p WHERE p.payMonth = :month AND p.payYear = :year AND p.status = 'PAID'")
    BigDecimal totalPayrollForMonth(int month, int year);
}

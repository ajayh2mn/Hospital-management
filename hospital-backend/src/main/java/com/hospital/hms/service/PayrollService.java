package com.hospital.hms.service;

import com.hospital.hms.entity.*;
import com.hospital.hms.exception.BusinessException;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.AttendanceRepository;
import com.hospital.hms.repository.PayrollRepository;
import com.hospital.hms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * PayrollService — calculates monthly salary for each staff member.
 *
 * Payroll calculation formula:
 *   Gross = Basic + HRA (40% of Basic) + Medical (₹1500) + Transport (₹1000) + Overtime + Bonus
 *   PF = 12% of Basic
 *   Tax = based on annual gross (simplified)
 *   Leave Penalty = (BasicSalary / workingDays) * excessAbsences
 *   Net = Gross - PF - Tax - Leave Penalty - Other Deductions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final StaffRepository staffRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public Payroll generatePayroll(Long staffId, int month, int year) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        // Check if payroll already generated for this month
        if (payrollRepository.findByStaffAndPayMonthAndPayYear(staff, month, year).isPresent()) {
            throw new BusinessException("Payroll already generated for " + staff.getFirstName() +
                    " for " + month + "/" + year);
        }

        // Get attendance data for this month
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        List<Attendance> attendanceList = attendanceRepository
                .findByStaffAndAttendanceDateBetween(staff, from, to);

        // Count attendance statuses
        long presentDays = attendanceList.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long halfDays = attendanceList.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY).count();
        long absentDays = attendanceList.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long leaveDays = attendanceList.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.ON_LEAVE).count();
        double overtimeHours = attendanceList.stream()
                .mapToDouble(a -> a.getOvertimeHours() != null ? a.getOvertimeHours() : 0)
                .sum();

        BigDecimal basic = staff.getBasicSalary();
        int workingDays = to.getDayOfMonth();  // Total days in month

        // === Allowances ===
        BigDecimal hra = basic.multiply(new BigDecimal("0.40")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal medical = new BigDecimal("1500.00");
        BigDecimal transport = new BigDecimal("1000.00");

        // Overtime: hourly rate = (basic / 26 days / 8 hours) * 1.5
        BigDecimal hourlyRate = basic.divide(new BigDecimal("208"), 4, RoundingMode.HALF_UP);
        BigDecimal overtimePay = hourlyRate.multiply(new BigDecimal("1.5"))
                .multiply(BigDecimal.valueOf(overtimeHours))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal grossSalary = basic.add(hra).add(medical).add(transport).add(overtimePay);

        // === Deductions ===
        // PF: 12% of basic
        BigDecimal pf = basic.multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);

        // Income tax: simplified — 10% if annual gross > 5 lakh
        BigDecimal annualGross = grossSalary.multiply(new BigDecimal("12"));
        BigDecimal tax = annualGross.compareTo(new BigDecimal("500000")) > 0
                ? grossSalary.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Leave penalty: deduct for absences beyond 2 allowed
        int allowedAbsences = 2;
        long excessAbsences = Math.max(0, absentDays - allowedAbsences);
        BigDecimal dailyRate = basic.divide(BigDecimal.valueOf(workingDays), 4, RoundingMode.HALF_UP);
        BigDecimal leavePenalty = dailyRate.multiply(BigDecimal.valueOf(excessAbsences))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalDeductions = pf.add(tax).add(leavePenalty);
        BigDecimal netSalary = grossSalary.subtract(totalDeductions).setScale(2, RoundingMode.HALF_UP);

        Payroll payroll = Payroll.builder()
                .staff(staff)
                .payMonth(month)
                .payYear(year)
                .basicSalary(basic)
                .houseRentAllowance(hra)
                .medicalAllowance(medical)
                .transportAllowance(transport)
                .overtimePay(overtimePay)
                .bonus(BigDecimal.ZERO)
                .providentFund(pf)
                .incomeTax(tax)
                .leavePenalty(leavePenalty)
                .otherDeductions(BigDecimal.ZERO)
                .grossSalary(grossSalary)
                .totalDeductions(totalDeductions)
                .netSalary(netSalary)
                .presentDays((int) presentDays)
                .absentDays((int) absentDays)
                .leaveDays((int) leaveDays)
                .status(PayrollStatus.PROCESSED)
                .build();

        return payrollRepository.save(payroll);
    }

    public List<Payroll> getPayrollByMonth(int month, int year) {
        return payrollRepository.findByPayMonthAndPayYear(month, year);
    }

    public List<Payroll> getStaffPayrollHistory(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));
        return payrollRepository.findByStaff(staff);
    }

    @Transactional
    public Payroll markAsPaid(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));
        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaymentDate(LocalDate.now());
        return payrollRepository.save(payroll);
    }
}

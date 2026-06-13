package com.hospital.hms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll",
        uniqueConstraints = @UniqueConstraint(columnNames = {"staff_id", "pay_month", "pay_year"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"staff"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Payroll extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnoreProperties({"attendanceList", "payrolls", "user", "hibernateLazyInitializer"})
    private Staff staff;

    @EqualsAndHashCode.Include
    @Column(name = "pay_month", nullable = false)
    private Integer payMonth;

    @Column(name = "pay_year", nullable = false)
    private Integer payYear;

    @Column(precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal houseRentAllowance;

    @Column(precision = 10, scale = 2)
    private BigDecimal medicalAllowance;

    @Column(precision = 10, scale = 2)
    private BigDecimal transportAllowance;

    @Column(precision = 10, scale = 2)
    private BigDecimal overtimePay;

    @Column(precision = 10, scale = 2)
    private BigDecimal bonus;

    @Column(precision = 10, scale = 2)
    private BigDecimal providentFund;

    @Column(precision = 10, scale = 2)
    private BigDecimal incomeTax;

    @Column(precision = 10, scale = 2)
    private BigDecimal otherDeductions;

    @Column(precision = 10, scale = 2)
    private BigDecimal leavePenalty;

    @Column(precision = 10, scale = 2)
    private BigDecimal grossSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalDeductions;

    @Column(precision = 10, scale = 2)
    private BigDecimal netSalary;

    private Integer presentDays;
    private Integer absentDays;
    private Integer leaveDays;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.PENDING;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    private String remarks;
}

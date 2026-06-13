package com.hospital.hms.service;

import com.hospital.hms.entity.Payroll;
import com.hospital.hms.exception.ResourceNotFoundException;
import com.hospital.hms.repository.PayrollRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

/**
 * PayslipPdfService — generates a PDF payslip for a staff member.
 *
 * Uses iText library to create a professional-looking PDF.
 * The PDF is returned as a byte array, which Spring sends as a
 * downloadable file response (Content-Type: application/pdf).
 */
@Service
@RequiredArgsConstructor
public class PayslipPdfService {

    private final PayrollRepository payrollRepository;

    public byte[] generatePayslip(Long payrollId) throws DocumentException {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", payrollId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        document.open();

        // === Header ===
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.DARK_GRAY);
        Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);

        Paragraph title = new Paragraph("HOSPITAL MANAGEMENT SYSTEM", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("EMPLOYEE PAYSLIP", headerFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);

        document.add(new Paragraph("Month: " + payroll.getPayMonth() + "/" + payroll.getPayYear(), normalFont));
        document.add(Chunk.NEWLINE);

        // === Employee Details ===
        PdfPTable empTable = new PdfPTable(2);
        empTable.setWidthPercentage(100);
        addTableRow(empTable, "Employee ID:", payroll.getStaff().getEmployeeId(), boldFont, normalFont);
        addTableRow(empTable, "Employee Name:",
                payroll.getStaff().getFirstName() + " " + payroll.getStaff().getLastName(),
                boldFont, normalFont);
        addTableRow(empTable, "Department:", payroll.getStaff().getDepartment().name(), boldFont, normalFont);
        addTableRow(empTable, "Designation:", payroll.getStaff().getDesignation().name(), boldFont, normalFont);
        document.add(empTable);
        document.add(Chunk.NEWLINE);

        // === Earnings Table ===
        Paragraph earningsTitle = new Paragraph("EARNINGS", headerFont);
        document.add(earningsTitle);

        PdfPTable earningsTable = new PdfPTable(2);
        earningsTable.setWidthPercentage(100);
        addTableRow(earningsTable, "Basic Salary", "₹" + payroll.getBasicSalary(), boldFont, normalFont);
        addTableRow(earningsTable, "House Rent Allowance (HRA)", "₹" + payroll.getHouseRentAllowance(), boldFont, normalFont);
        addTableRow(earningsTable, "Medical Allowance", "₹" + payroll.getMedicalAllowance(), boldFont, normalFont);
        addTableRow(earningsTable, "Transport Allowance", "₹" + payroll.getTransportAllowance(), boldFont, normalFont);
        addTableRow(earningsTable, "Overtime Pay", "₹" + payroll.getOvertimePay(), boldFont, normalFont);
        addTableRow(earningsTable, "Bonus", "₹" + payroll.getBonus(), boldFont, normalFont);

        Font grossFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.DARK_GRAY);
        addTableRow(earningsTable, "GROSS SALARY", "₹" + payroll.getGrossSalary(), grossFont, grossFont);
        document.add(earningsTable);
        document.add(Chunk.NEWLINE);

        // === Deductions Table ===
        Paragraph deductionsTitle = new Paragraph("DEDUCTIONS", headerFont);
        document.add(deductionsTitle);

        PdfPTable deductionsTable = new PdfPTable(2);
        deductionsTable.setWidthPercentage(100);
        addTableRow(deductionsTable, "Provident Fund (12%)", "₹" + payroll.getProvidentFund(), boldFont, normalFont);
        addTableRow(deductionsTable, "Income Tax", "₹" + payroll.getIncomeTax(), boldFont, normalFont);
        addTableRow(deductionsTable, "Leave Penalty", "₹" + payroll.getLeavePenalty(), boldFont, normalFont);
        addTableRow(deductionsTable, "Other Deductions", "₹" + payroll.getOtherDeductions(), boldFont, normalFont);

        Font deductFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.RED);
        addTableRow(deductionsTable, "TOTAL DEDUCTIONS", "₹" + payroll.getTotalDeductions(), deductFont, deductFont);
        document.add(deductionsTable);
        document.add(Chunk.NEWLINE);

        // === Net Salary ===
        Font netFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(0, 128, 0));
        Paragraph netPay = new Paragraph("NET SALARY: ₹" + payroll.getNetSalary(), netFont);
        netPay.setAlignment(Element.ALIGN_RIGHT);
        document.add(netPay);

        // === Attendance Summary ===
        document.add(Chunk.NEWLINE);
        Paragraph attTitle = new Paragraph("ATTENDANCE SUMMARY", headerFont);
        document.add(attTitle);

        PdfPTable attTable = new PdfPTable(3);
        attTable.setWidthPercentage(60);
        addTableCell(attTable, "Present Days", boldFont);
        addTableCell(attTable, "Absent Days", boldFont);
        addTableCell(attTable, "Leave Days", boldFont);
        addTableCell(attTable, String.valueOf(payroll.getPresentDays()), normalFont);
        addTableCell(attTable, String.valueOf(payroll.getAbsentDays()), normalFont);
        addTableCell(attTable, String.valueOf(payroll.getLeaveDays()), normalFont);
        document.add(attTable);

        document.add(Chunk.NEWLINE);
        document.add(new Paragraph("This is a system-generated payslip.", normalFont));

        document.close();
        return baos.toByteArray();
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.BOTTOM);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "-", valueFont));
        valueCell.setBorder(Rectangle.BOTTOM);
        valueCell.setPadding(4);
        table.addCell(valueCell);
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }
}

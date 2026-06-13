package com.hospital.hms.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * EmailService — sends emails via SMTP.
 *
 * Currently runs in "log-only" mode because mail auto-configuration is disabled.
 * To enable real emails:
 *   1. Set up a Gmail App Password
 *   2. Remove the autoconfigure.exclude line from application.yml
 *   3. Fill in the mail.username and mail.password fields
 *   4. Uncomment the JavaMailSender injection below
 */
@Service
@Slf4j
public class EmailService {

    public void sendEmail(String to, String subject, String body) {
        // Logs the email instead of sending — safe placeholder until mail is configured
        log.info("EMAIL (not sent — mail disabled) | To: {} | Subject: {}", to, subject);
    }

    public void sendAppointmentConfirmation(String patientEmail, String patientName,
                                             String doctorName, String date, String time,
                                             String tokenNumber) {
        log.info("Appointment confirmation email for {} scheduled with Dr. {} on {}",
                patientName, doctorName, date);
    }

    public void sendPayslipNotification(String staffEmail, String staffName, int month, int year) {
        log.info("Payslip notification for {} — {}/{}", staffName, month, year);
    }

    public void sendTicketAcknowledgment(String userEmail, String userName,
                                          String ticketNumber, String subject) {
        log.info("Ticket acknowledgment for {} — {}", userName, ticketNumber);
    }
}

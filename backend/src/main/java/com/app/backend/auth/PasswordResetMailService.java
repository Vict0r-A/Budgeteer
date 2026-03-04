package com.app.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailService {

    private final JavaMailSender mailSender;
    private final String mailHost;
    private final String fromAddress;
    private final String frontendUrl;

    public PasswordResetMailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.mail.from:no-reply@budgeteer.local}") String fromAddress,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.mailSender = mailSender;
        this.mailHost = mailHost == null ? "" : mailHost.trim();
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        if (mailHost.isBlank()) {
            throw new IllegalStateException("Mail server is not configured");
        }

        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Budgeteer password reset");
        message.setText(
                "You requested a password reset for your Budgeteer account.\n\n" +
                "Use this link within 30 minutes:\n" +
                resetUrl + "\n\n" +
                "If you did not request this, you can ignore this email."
        );

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new IllegalStateException("Could not send password reset email");
        }
    }
}

package com.app.backend.auth.dto;

public class AuthResponses {

    public record UserResponse(Long id, String email, String displayName) {}

    public record AuthResponse(String token, UserResponse user) {}

    public record MessageResponse(String message) {}

    public record ForgotPasswordResponse(String message, String resetToken) {}
}

package com.app.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequests {

    public static class RegisterRequest {
        @Email
        @NotBlank
        public String email;

        @NotBlank
        @Size(min = 8, max = 72)
        public String password;

        @NotBlank
        @Size(max = 80)
        public String displayName;
    }

    public static class LoginRequest {
        @Email
        @NotBlank
        public String email;

        @NotBlank
        public String password;
    }

    public static class ForgotPasswordRequest {
        @Email
        @NotBlank
        public String email;
    }

    public static class ResetPasswordRequest {
        @NotBlank
        public String token;

        @NotBlank
        @Size(min = 8, max = 72)
        public String newPassword;
    }

    public static class UpdateProfileRequest {
        @Email
        @NotBlank
        public String email;

        @NotBlank
        @Size(max = 80)
        public String displayName;
    }

    public static class ChangePasswordRequest {
        @NotBlank
        public String currentPassword;

        @NotBlank
        @Size(min = 8, max = 72)
        public String newPassword;
    }

    public static class DeleteAccountRequest {
        @NotBlank
        public String password;
    }
}

package com.app.backend.auth;

import com.app.backend.auth.dto.AuthRequests;
import com.app.backend.auth.dto.AuthResponses;
import com.app.backend.security.CurrentUser;
import com.app.backend.user.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponses.AuthResponse> register(@Valid @RequestBody AuthRequests.RegisterRequest req) {
        User user = authService.register(req);
        String token = authService.issueToken(user);
        return ResponseEntity.ok(new AuthResponses.AuthResponse(
                token,
                new AuthResponses.UserResponse(user.getId(), user.getEmail(), user.getDisplayName())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponses.AuthResponse> login(@Valid @RequestBody AuthRequests.LoginRequest req) {
        User user = authService.login(req);
        String token = authService.issueToken(user);
        return ResponseEntity.ok(new AuthResponses.AuthResponse(
                token,
                new AuthResponses.UserResponse(user.getId(), user.getEmail(), user.getDisplayName())
        ));
    }

    @GetMapping("/me")
    public AuthResponses.UserResponse me() {
        User user = CurrentUser.require();
        return new AuthResponses.UserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }

    @PostMapping("/forgot-password")
    public AuthResponses.ForgotPasswordResponse forgotPassword(@Valid @RequestBody AuthRequests.ForgotPasswordRequest req) {
        String token = authService.createForgotPasswordToken(req);
        return new AuthResponses.ForgotPasswordResponse(
                "Password reset email sent.",
                token
        );
    }

    @PostMapping("/reset-password")
    public AuthResponses.AuthResponse resetPassword(@Valid @RequestBody AuthRequests.ResetPasswordRequest req) {
        User user = authService.resetPassword(req);
        String token = authService.issueToken(user);
        return new AuthResponses.AuthResponse(
                token,
                new AuthResponses.UserResponse(user.getId(), user.getEmail(), user.getDisplayName())
        );
    }

    @PutMapping("/profile")
    public AuthResponses.AuthResponse updateProfile(@Valid @RequestBody AuthRequests.UpdateProfileRequest req) {
        User user = CurrentUser.require();
        User updated = authService.updateProfile(user, req);
        // Return a fresh token so frontend state stays aligned with user data.
        String token = authService.issueToken(updated);
        return new AuthResponses.AuthResponse(
                token,
                new AuthResponses.UserResponse(updated.getId(), updated.getEmail(), updated.getDisplayName())
        );
    }

    @PutMapping("/password")
    public AuthResponses.AuthResponse changePassword(@Valid @RequestBody AuthRequests.ChangePasswordRequest req) {
        User user = CurrentUser.require();
        User updated = authService.changePassword(user, req);
        String token = authService.issueToken(updated);
        return new AuthResponses.AuthResponse(
                token,
                new AuthResponses.UserResponse(updated.getId(), updated.getEmail(), updated.getDisplayName())
        );
    }

    @DeleteMapping("/me")
    public AuthResponses.MessageResponse deleteAccount(@Valid @RequestBody AuthRequests.DeleteAccountRequest req) {
        User user = CurrentUser.require();
        authService.deleteAccount(user, req);
        return new AuthResponses.MessageResponse("Account deleted successfully");
    }
}

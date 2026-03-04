package com.app.backend.auth;

import com.app.backend.auth.dto.AuthRequests;
import com.app.backend.expense.ExpenseRepository;
import com.app.backend.user.User;
import com.app.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordResetMailService passwordResetMailService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                expenseRepository,
                passwordResetTokenRepository,
                passwordResetMailService,
                passwordEncoder,
                jwtService,
                true
        );
    }

    @Test
    void registerNormalisesEmailAndHashesPassword() {
        AuthRequests.RegisterRequest req = new AuthRequests.RegisterRequest();
        req.email = "  TEST@Example.com ";
        req.password = "password123";
        req.displayName = "  Victor ";

        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = authService.register(req);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User persisted = userCaptor.getValue();

        assertThat(persisted.getEmail()).isEqualTo("test@example.com");
        assertThat(persisted.getDisplayName()).isEqualTo("Victor");
        assertThat(persisted.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void loginLocksForThreeMinutesAfterFiveFailures() {
        AuthRequests.LoginRequest req = new AuthRequests.LoginRequest();
        req.email = "missing@example.com";
        req.password = "wrong";

        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        // First five attempts still look like a normal bad login.
        for (int i = 0; i < 5; i++) {
            assertThatThrownBy(() -> authService.login(req))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Invalid email or password");
        }

        // Sixth attempt should hit the temporary lock.
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Too many failed login attempts");
    }

    @Test
    void changePasswordRejectsWhenNewPasswordMatchesCurrentPassword() {
        User user = new User("user@example.com", "old-hash", "User");
        setId(user, 99L);

        AuthRequests.ChangePasswordRequest req = new AuthRequests.ChangePasswordRequest();
        req.currentPassword = "same-password";
        req.newPassword = "same-password";

        // Both checks return true: the current password is correct and the new one is identical.
        when(userRepository.findById(99L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("same-password", "old-hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.changePassword(user, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("New password must be different from your current password");
    }

    @Test
    void updateProfilePersistsManagedUserChanges() {
        User principalUser = new User("old@example.com", "hash", "Old Name");
        setId(principalUser, 15L);
        User managedUser = new User("old@example.com", "hash", "Old Name");
        setId(managedUser, 15L);

        AuthRequests.UpdateProfileRequest req = new AuthRequests.UpdateProfileRequest();
        req.email = "new@example.com";
        req.displayName = "New Name";

        when(userRepository.findById(15L)).thenReturn(Optional.of(managedUser));
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("new@example.com", 15L)).thenReturn(false);
        when(userRepository.save(managedUser)).thenReturn(managedUser);

        User updated = authService.updateProfile(principalUser, req);

        assertThat(updated.getEmail()).isEqualTo("new@example.com");
        assertThat(updated.getDisplayName()).isEqualTo("New Name");
        verify(userRepository).save(managedUser);
    }

    @Test
    void changePasswordPersistsManagedUserAndBumpsTokenVersion() {
        User principalUser = new User("user@example.com", "old-hash", "User");
        setId(principalUser, 21L);
        User managedUser = new User("user@example.com", "old-hash", "User");
        setId(managedUser, 21L);

        AuthRequests.ChangePasswordRequest req = new AuthRequests.ChangePasswordRequest();
        req.currentPassword = "old-password";
        req.newPassword = "new-password";

        when(userRepository.findById(21L)).thenReturn(Optional.of(managedUser));
        when(passwordEncoder.matches("old-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "old-hash")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");
        when(userRepository.save(managedUser)).thenReturn(managedUser);

        User updated = authService.changePassword(principalUser, req);

        assertThat(updated.getPasswordHash()).isEqualTo("new-hash");
        assertThat(updated.getTokenVersion()).isEqualTo(1);
        verify(userRepository).save(managedUser);
    }

    @Test
    void forgotPasswordFallsBackToTokenWhenMailSendingFails() {
        User user = new User("mailfail@example.com", "hash", "Mail Fail");
        setId(user, 77L);

        AuthRequests.ForgotPasswordRequest req = new AuthRequests.ForgotPasswordRequest();
        req.email = "mailfail@example.com";

        when(userRepository.findByEmailIgnoreCase("mailfail@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        org.mockito.Mockito.doThrow(new IllegalStateException("SMTP unavailable"))
                .when(passwordResetMailService)
                .sendPasswordResetEmail(org.mockito.ArgumentMatchers.eq("mailfail@example.com"), org.mockito.ArgumentMatchers.anyString());

        String token = authService.createForgotPasswordToken(req);

        assertThat(token).isNotBlank();
    }

    @Test
    void forgotPasswordRejectsUnknownEmail() {
        AuthRequests.ForgotPasswordRequest req = new AuthRequests.ForgotPasswordRequest();
        req.email = "missing@example.com";

        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.createForgotPasswordToken(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email does not exist");
    }

    @Test
    void forgotPasswordThrowsWhenMailFailsAndTokenExposureIsDisabled() {
        AuthService strictAuthService = new AuthService(
                userRepository,
                expenseRepository,
                passwordResetTokenRepository,
                passwordResetMailService,
                passwordEncoder,
                jwtService,
                false
        );

        User user = new User("mailfail2@example.com", "hash", "Mail Fail 2");
        setId(user, 78L);

        AuthRequests.ForgotPasswordRequest req = new AuthRequests.ForgotPasswordRequest();
        req.email = "mailfail2@example.com";

        when(userRepository.findByEmailIgnoreCase("mailfail2@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        org.mockito.Mockito.doThrow(new IllegalStateException("Mail server is not configured"))
                .when(passwordResetMailService)
                .sendPasswordResetEmail(org.mockito.ArgumentMatchers.eq("mailfail2@example.com"), org.mockito.ArgumentMatchers.anyString());

        assertThatThrownBy(() -> strictAuthService.createForgotPasswordToken(req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Password reset email could not be sent. Please try again later.");
    }

    @Test
    void resetPasswordReturnsUpdatedUserAndMarksTokenUsed() {
        User user = new User("reset@example.com", "old-hash", "Reset User");
        setId(user, 31L);
        PasswordResetToken resetToken = new PasswordResetToken(user, "valid-token", Instant.now().plusSeconds(900));

        AuthRequests.ResetPasswordRequest req = new AuthRequests.ResetPasswordRequest();
        req.token = "valid-token";
        req.newPassword = "new-password-123";

        when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("new-password-123")).thenReturn("new-hash");
        when(userRepository.save(user)).thenReturn(user);

        User updated = authService.resetPassword(req);

        assertThat(updated.getPasswordHash()).isEqualTo("new-hash");
        assertThat(updated.getTokenVersion()).isEqualTo(1);
        assertThat(resetToken.isUsed()).isTrue();
        verify(userRepository).save(user);
    }

    @Test
    void deleteAccountRejectsWhenPasswordIsIncorrect() {
        User principalUser = new User("user@example.com", "stored-hash", "User");
        setId(principalUser, 41L);
        User managedUser = new User("user@example.com", "stored-hash", "User");
        setId(managedUser, 41L);

        AuthRequests.DeleteAccountRequest req = new AuthRequests.DeleteAccountRequest();
        req.password = "wrong-password";

        when(userRepository.findById(41L)).thenReturn(Optional.of(managedUser));
        when(passwordEncoder.matches("wrong-password", "stored-hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.deleteAccount(principalUser, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Incorrect password");
        verify(expenseRepository, never()).deleteAllForUser(any());
        verify(passwordResetTokenRepository, never()).deleteByUser(any());
        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteAccountRemovesExpensesTokensAndUserWhenPasswordMatches() {
        User principalUser = new User("user@example.com", "stored-hash", "User");
        setId(principalUser, 42L);
        User managedUser = new User("user@example.com", "stored-hash", "User");
        setId(managedUser, 42L);

        AuthRequests.DeleteAccountRequest req = new AuthRequests.DeleteAccountRequest();
        req.password = "correct-password";

        when(userRepository.findById(42L)).thenReturn(Optional.of(managedUser));
        when(passwordEncoder.matches("correct-password", "stored-hash")).thenReturn(true);
        when(userRepository.deleteByIdAndEmail(42L, "user@example.com")).thenReturn(1);

        authService.deleteAccount(principalUser, req);

        verify(expenseRepository).deleteAllForUser(42L);
        verify(passwordResetTokenRepository).deleteByUser(managedUser);
        verify(userRepository).deleteByIdAndEmail(42L, "user@example.com");
    }

    @Test
    void deleteAccountFailsIfTargetRowWasNotDeleted() {
        User principalUser = new User("user@example.com", "stored-hash", "User");
        setId(principalUser, 43L);
        User managedUser = new User("user@example.com", "stored-hash", "User");
        setId(managedUser, 43L);

        AuthRequests.DeleteAccountRequest req = new AuthRequests.DeleteAccountRequest();
        req.password = "correct-password";

        when(userRepository.findById(43L)).thenReturn(Optional.of(managedUser));
        when(passwordEncoder.matches("correct-password", "stored-hash")).thenReturn(true);
        when(userRepository.deleteByIdAndEmail(43L, "user@example.com")).thenReturn(0);

        assertThatThrownBy(() -> authService.deleteAccount(principalUser, req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Could not delete account");
    }

    private static void setId(User user, Long id) {
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException("Could not set user id in test", ex);
        }
    }
}

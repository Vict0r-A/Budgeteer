package com.app.backend.auth;

import com.app.backend.auth.dto.AuthRequests;
import com.app.backend.expense.ExpenseRepository;
import com.app.backend.user.User;
import com.app.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 3;
    private static final long RESET_TTL_MINUTES = 30;

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordResetMailService passwordResetMailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final boolean exposeResetToken;
    private final Map<String, Integer> failedAttemptsByEmail = new ConcurrentHashMap<>();
    private final Map<String, Instant> lockedUntilByEmail = new ConcurrentHashMap<>();

    public AuthService(
            UserRepository userRepository,
            ExpenseRepository expenseRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordResetMailService passwordResetMailService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.auth.expose-reset-token:true}") boolean exposeResetToken
    ) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordResetMailService = passwordResetMailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.exposeResetToken = exposeResetToken;
    }

    @Transactional
    public User register(AuthRequests.RegisterRequest req) {
        // Keep stored email shape consistent for checks/login.
        String email = req.email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        String hash = passwordEncoder.encode(req.password);
        User user = new User(email, hash, req.displayName.trim());
        return userRepository.save(user);
    }

    public User login(AuthRequests.LoginRequest req) {
        String email = req.email.trim().toLowerCase();

        Instant now = Instant.now();
        Instant lockedUntil = lockedUntilByEmail.get(email);
        if (lockedUntil != null && now.isBefore(lockedUntil)) {
            throw new IllegalArgumentException("Too many failed login attempts. Try again in 3 minutes.");
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            registerFailedAttempt(email, now);
            throw new IllegalArgumentException("Invalid email or password");
        }

        boolean ok = passwordEncoder.matches(req.password, user.getPasswordHash());
        if (!ok) {
            registerFailedAttempt(email, now);
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Successful login clears lock/attempt counters.
        failedAttemptsByEmail.remove(email);
        lockedUntilByEmail.remove(email);
        return user;
    }

    public String issueToken(User user) {
        return jwtService.createToken(user.getId(), user.getEmail(), user.getTokenVersion());
    }

    @Transactional
    public String createForgotPasswordToken(AuthRequests.ForgotPasswordRequest req) {
        String email = req.email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Email does not exist"));

        // Only keep one active token per user for a simple reset flow.
        passwordResetTokenRepository.deleteByUser(user);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(UUID.randomUUID().toString().getBytes());
        Instant expiresAt = Instant.now().plus(RESET_TTL_MINUTES, ChronoUnit.MINUTES);
        passwordResetTokenRepository.save(new PasswordResetToken(user, token, expiresAt));
        try {
            passwordResetMailService.sendPasswordResetEmail(user.getEmail(), token);
            return exposeResetToken ? token : null;
        } catch (IllegalStateException ex) {
            // Local/dev fallback only. In production mode, report delivery failures.
            if (exposeResetToken) {
                return token;
            }
            throw new IllegalStateException("Password reset email could not be sent. Please try again later.");
        }
    }

    @Transactional
    public User resetPassword(AuthRequests.ResetPasswordRequest req) {
        PasswordResetToken reset = passwordResetTokenRepository.findByToken(req.token.trim())
                .orElseThrow(() -> new IllegalArgumentException("Reset token is invalid"));
        if (reset.isUsed() || Instant.now().isAfter(reset.getExpiresAt())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = reset.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword));
        user.bumpTokenVersion();
        reset.markUsed();
        return userRepository.save(user);
    }

    @Transactional
    public User updateProfile(User user, AuthRequests.UpdateProfileRequest req) {
        User managedUser = requireManagedUser(user.getId());
        String nextEmail = req.email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(nextEmail, managedUser.getId())) {
            throw new IllegalArgumentException("Email already registered");
        }
        managedUser.setEmail(nextEmail);
        managedUser.setDisplayName(req.displayName.trim());
        return userRepository.save(managedUser);
    }

    @Transactional
    public User changePassword(User user, AuthRequests.ChangePasswordRequest req) {
        User managedUser = requireManagedUser(user.getId());
        if (!passwordEncoder.matches(req.currentPassword, managedUser.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (passwordEncoder.matches(req.newPassword, managedUser.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from your current password");
        }
        // Bump token version so old sessions are invalidated after password change.
        managedUser.setPasswordHash(passwordEncoder.encode(req.newPassword));
        managedUser.bumpTokenVersion();
        return userRepository.save(managedUser);
    }

    @Transactional
    public void deleteAccount(User user, AuthRequests.DeleteAccountRequest req) {
        User managedUser = requireManagedUser(user.getId());
        if (!passwordEncoder.matches(req.password, managedUser.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password");
        }
        expenseRepository.deleteAllForUser(managedUser.getId());
        passwordResetTokenRepository.deleteByUser(managedUser);
        int deleted = userRepository.deleteByIdAndEmail(managedUser.getId(), managedUser.getEmail());
        if (deleted != 1) {
            throw new IllegalStateException("Could not delete account");
        }
    }

    private void registerFailedAttempt(String email, Instant now) {
        // Simple local lockout for brute-force protection in this project.
        int attempts = failedAttemptsByEmail.merge(email, 1, Integer::sum);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            lockedUntilByEmail.put(email, now.plus(LOCK_MINUTES, ChronoUnit.MINUTES));
            failedAttemptsByEmail.remove(email);
        }
    }

    private User requireManagedUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}

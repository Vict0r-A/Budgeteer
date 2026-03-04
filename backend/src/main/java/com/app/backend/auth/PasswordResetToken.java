package com.app.backend.auth;

import com.app.backend.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "password_reset_token", indexes = {
        @Index(name = "idx_reset_token_token", columnList = "token", unique = true),
        @Index(name = "idx_reset_token_user", columnList = "user_id")
})
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    protected PasswordResetToken() {}

    public PasswordResetToken(User user, String token, Instant expiresAt) {
        this.user = user;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public User getUser() {
        return user;
    }

    public String getToken() {
        return token;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void markUsed() {
        this.used = true;
    }
}


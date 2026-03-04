package com.app.backend.user;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "app_user", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_email", columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(nullable = false, length = 72)
    private String passwordHash;

    @Column(nullable = false, length = 80)
    private String displayName;

    // Bumped when sensitive account changes happen (for example password reset).
    @Column(nullable = false)
    private Integer tokenVersion = 0;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected User() {}

    public User(String email, String passwordHash, String displayName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Integer getTokenVersion() {
        return tokenVersion;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void bumpTokenVersion() {
        this.tokenVersion = this.tokenVersion + 1;
    }
}

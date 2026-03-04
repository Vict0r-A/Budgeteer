package com.app.backend.expense;

import com.app.backend.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "expense", indexes = {
        @Index(name = "idx_expense_user_date", columnList = "user_id, date"),
        @Index(name = "idx_expense_user_category", columnList = "user_id, category")
})
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 140)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Expense() {}

    public Expense(User user, String description, BigDecimal amount, LocalDate date, String category) {
        this.user = user;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getCategory() {
        return category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}

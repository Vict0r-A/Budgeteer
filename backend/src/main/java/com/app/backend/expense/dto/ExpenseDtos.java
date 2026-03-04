package com.app.backend.expense.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseDtos {

    public record ExpenseResponse(
            Long id,
            String description,
            BigDecimal amount,
            LocalDate date,
            String category
    ) {}

    public static class ExpenseUpsertRequest {
        @NotBlank
        @Size(max = 140)
        public String description;

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 10, fraction = 2)
        public BigDecimal amount;

        @NotNull
        @PastOrPresent(message = "Date cannot be in the future")
        public LocalDate date;

        @NotBlank
        @Size(max = 60)
        public String category;
    }
}

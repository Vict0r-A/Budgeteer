package com.app.backend.expense;

import com.app.backend.expense.dto.ExpenseDtos;
import com.app.backend.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    private ExpenseService expenseService;

    @BeforeEach
    void setUp() {
        expenseService = new ExpenseService(expenseRepository);
    }

    @Test
    void listAppliesStartEndAndCategoryFilters() {
        User owner = userWithId(1L);
        Expense food = expense(owner, "Lunch", "Food", "12.50", LocalDate.of(2026, 2, 10));
        Expense transport = expense(owner, "Train", "Transport", "8.10", LocalDate.of(2026, 2, 12));
        Expense rent = expense(owner, "Rent", "Rent", "700.00", LocalDate.of(2026, 1, 31));

        when(expenseRepository.findByUserIdOrderByDateDescIdDesc(1L)).thenReturn(List.of(transport, food, rent));

        List<Expense> filtered = expenseService.list(
                owner,
                LocalDate.of(2026, 2, 1),
                LocalDate.of(2026, 2, 28),
                "Transport"
        );

        assertThat(filtered).containsExactly(transport);
    }

    @Test
    void updateRejectsWhenExpenseBelongsToDifferentUser() {
        User currentUser = userWithId(1L);
        User differentOwner = userWithId(99L);
        Expense existing = expense(differentOwner, "Bike", "Transport", "40.00", LocalDate.of(2026, 2, 11));
        setId(existing, 55L);

        when(expenseRepository.findById(55L)).thenReturn(Optional.of(existing));

        ExpenseDtos.ExpenseUpsertRequest req = new ExpenseDtos.ExpenseUpsertRequest();
        req.description = "Bike repair";
        req.amount = new BigDecimal("42.00");
        req.date = LocalDate.of(2026, 2, 11);
        req.category = "Transport";

        assertThatThrownBy(() -> expenseService.update(currentUser, 55L, req))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Not allowed");
    }

    private static Expense expense(User user, String description, String category, String amount, LocalDate date) {
        return new Expense(user, description, new BigDecimal(amount), date, category);
    }

    private static User userWithId(Long id) {
        User user = new User("user" + id + "@example.com", "hash", "User " + id);
        setId(user, id);
        return user;
    }

    private static void setId(Object target, Long id) {
        try {
            Field field = target.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(target, id);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException("Could not set test id", ex);
        }
    }
}

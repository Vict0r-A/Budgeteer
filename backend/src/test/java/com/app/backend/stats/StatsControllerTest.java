package com.app.backend.stats;

import com.app.backend.expense.Expense;
import com.app.backend.expense.ExpenseService;
import com.app.backend.stats.dto.StatsDto;
import com.app.backend.user.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class StatsControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getStatsGroupsValuesByCategoryAndDay() {
        ExpenseService expenseService = mock(ExpenseService.class);
        StatsController controller = new StatsController(expenseService);

        User user = userWithId(7L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of())
        );

        Expense e1 = new Expense(user, "Lunch", new BigDecimal("12.50"), LocalDate.of(2026, 2, 10), "Food");
        Expense e2 = new Expense(user, "Dinner", new BigDecimal("9.50"), LocalDate.of(2026, 2, 10), "Food");
        Expense e3 = new Expense(user, "Train", new BigDecimal("6.00"), LocalDate.of(2026, 2, 11), "Transport");
        when(expenseService.list(user, null, null, null)).thenReturn(List.of(e1, e2, e3));

        StatsDto dto = controller.getStats(null, null, null);

        assertThat(dto.by_category().labels()).containsExactly("Food", "Transport");
        assertThat(dto.by_category().values()).containsExactly(new BigDecimal("22.00"), new BigDecimal("6.00"));
        assertThat(dto.by_day().labels()).containsExactly("2026-02-10", "2026-02-11");
        assertThat(dto.by_day().values()).containsExactly(new BigDecimal("22.00"), new BigDecimal("6.00"));
    }

    private static User userWithId(Long id) {
        User user = new User("stats@example.com", "hash", "Stats User");
        try {
            Field field = User.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(user, id);
        } catch (ReflectiveOperationException ex) {
            throw new RuntimeException("Could not set test user id", ex);
        }
        return user;
    }
}

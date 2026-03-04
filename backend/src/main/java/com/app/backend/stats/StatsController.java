package com.app.backend.stats;

import com.app.backend.expense.Expense;
import com.app.backend.expense.ExpenseService;
import com.app.backend.security.CurrentUser;
import com.app.backend.stats.dto.StatsDto;
import com.app.backend.user.User;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final ExpenseService expenseService;

    public StatsController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public StatsDto getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String category
    ) {
        User user = CurrentUser.require();
        List<Expense> filtered = expenseService.list(user, start, end, category);

        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        Map<String, BigDecimal> byDay = new LinkedHashMap<>();
        for (Expense e : filtered) {
            byCategory.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
            byDay.merge(e.getDate().toString(), e.getAmount(), BigDecimal::add);
        }

        List<String> catLabels = new ArrayList<>(byCategory.keySet());
        List<BigDecimal> catValues = new ArrayList<>(byCategory.values());

        List<String> dayLabels = new ArrayList<>(byDay.keySet());
        List<BigDecimal> dayValues = new ArrayList<>(byDay.values());

        return new StatsDto(
                new StatsDto.ByGroup(catLabels, catValues),
                new StatsDto.ByGroup(dayLabels, dayValues)
        );
    }
}

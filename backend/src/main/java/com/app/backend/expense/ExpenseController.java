package com.app.backend.expense;

import com.app.backend.expense.dto.ExpenseDtos;
import com.app.backend.security.CurrentUser;
import com.app.backend.user.User;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<ExpenseDtos.ExpenseResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String category
    ) {
        User user = CurrentUser.require();
        return expenseService.list(user, start, end, category).stream()
                .map(e -> new ExpenseDtos.ExpenseResponse(
                        e.getId(), e.getDescription(), e.getAmount(), e.getDate(), e.getCategory()
                ))
                .toList();
    }

    @PostMapping
    public ExpenseDtos.ExpenseResponse create(@Valid @RequestBody ExpenseDtos.ExpenseUpsertRequest req) {
        User user = CurrentUser.require();
        Expense e = expenseService.create(user, req);
        return new ExpenseDtos.ExpenseResponse(
                e.getId(), e.getDescription(), e.getAmount(), e.getDate(), e.getCategory()
        );
    }

    @PutMapping("/{id}")
    public ExpenseDtos.ExpenseResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseDtos.ExpenseUpsertRequest req
    ) {
        User user = CurrentUser.require();
        Expense e = expenseService.update(user, id, req);
        return new ExpenseDtos.ExpenseResponse(
                e.getId(), e.getDescription(), e.getAmount(), e.getDate(), e.getCategory()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = CurrentUser.require();
        expenseService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}

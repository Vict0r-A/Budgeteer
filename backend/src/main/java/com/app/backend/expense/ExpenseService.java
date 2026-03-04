package com.app.backend.expense;

import com.app.backend.expense.dto.ExpenseDtos;
import com.app.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> list(User user, LocalDate start, LocalDate end, String category) {
        String cat = (category == null || category.isBlank()) ? null : category.trim();
        // We filter in Java to avoid nullable-parameter SQL edge cases in PostgreSQL.
        return expenseRepository.findByUserIdOrderByDateDescIdDesc(user.getId()).stream()
                .filter(e -> start == null || !e.getDate().isBefore(start))
                .filter(e -> end == null || !e.getDate().isAfter(end))
                .filter(e -> cat == null || e.getCategory().equals(cat))
                .toList();
    }

    @Transactional
    public Expense create(User user, ExpenseDtos.ExpenseUpsertRequest req) {
        Expense e = new Expense(user, req.description.trim(), req.amount, req.date, req.category.trim());
        return expenseRepository.save(e);
    }

    @Transactional
    public Expense update(User user, Long id, ExpenseDtos.ExpenseUpsertRequest req) {
        Expense e = expenseRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        if (!e.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Not allowed");
        }
        e.setDescription(req.description.trim());
        e.setAmount(req.amount);
        e.setDate(req.date);
        e.setCategory(req.category.trim());
        return e;
    }

    @Transactional
    public void delete(User user, Long id) {
        Expense e = expenseRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        if (!e.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Not allowed");
        }
        expenseRepository.delete(e);
    }
}

package com.app.backend.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByDateDescIdDesc(Long userId);

    @Modifying
    @org.springframework.data.jpa.repository.Query("delete from Expense e where e.user.id = :userId")
    void deleteAllForUser(@Param("userId") Long userId);
}

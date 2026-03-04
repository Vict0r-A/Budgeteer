import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExpenseTable from "../src/components/table/ExpenseTable";

describe("ExpenseTable", () => {
  it("shows an empty-state message when no expenses match filters", () => {
    render(
      <ExpenseTable
        isLoggedIn
        expenses={[]}
        totalLabel="£0.00"
        onEditClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    expect(
      screen.getByText("No expenses available for this period. Try Reset to view all entries.")
    ).toBeInTheDocument();
  });
});

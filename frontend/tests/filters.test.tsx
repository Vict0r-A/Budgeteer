import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Filters from "../src/components/expenses/Filters";

function renderFilters(isLoggedIn: boolean) {
  const onApply = vi.fn();
  render(
    <Filters
      isLoggedIn={isLoggedIn}
      start=""
      end=""
      category=""
      total="£0.00"
      onStartChange={vi.fn()}
      onEndChange={vi.fn()}
      onCategoryChange={vi.fn()}
      onApply={onApply}
      onReset={vi.fn()}
      onExport={vi.fn()}
    />
  );
  return { onApply };
}

describe("Filters", () => {
  it("submits apply callback for logged-in users", () => {
    const { onApply } = renderFilters(true);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("opens login modal for logged-out users", () => {
    renderFilters(false);
    const button = screen.getByRole("button", { name: "Apply" });
    expect(button).toHaveAttribute("data-bs-target", "#loginModal");
    expect(button).toHaveAttribute("type", "button");
  });
});

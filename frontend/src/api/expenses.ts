import { request } from "./http";
import { toQuery } from "./query";
import type { Expense, ExpensePayload, ExpenseQuery } from "./types";

export async function getExpenses(params?: ExpenseQuery): Promise<Expense[]> {
  return request<Expense[]>(`/api/expenses${toQuery(params)}`, { auth: true });
}

export async function createExpense(payload: ExpensePayload): Promise<Expense> {
  return request<Expense>("/api/expenses", { method: "POST", body: payload, auth: true });
}

export async function updateExpense(id: number, payload: ExpensePayload): Promise<Expense> {
  return request<Expense>(`/api/expenses/${id}`, {
    method: "PUT",
    body: payload,
    auth: true,
  });
}

export async function deleteExpense(id: number): Promise<void> {
  await request(`/api/expenses/${id}`, { method: "DELETE", auth: true });
}

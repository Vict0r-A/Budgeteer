import type { ExpenseQuery } from "./types";

export function toQuery(params?: ExpenseQuery): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (params.category) search.set("category", params.category);
  const q = search.toString();
  return q ? `?${q}` : "";
}

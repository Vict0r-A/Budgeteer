import { request } from "./http";
import { toQuery } from "./query";
import type { ExpenseQuery, StatsResponse } from "./types";

export async function getStats(params?: ExpenseQuery): Promise<StatsResponse> {
  return request<StatsResponse>(`/api/stats${toQuery(params)}`, { auth: true });
}

export type AuthedUser = {
  id: number;
  email: string;
  displayName: string;
};

export type AuthResponse = {
  token: string;
  user: AuthedUser;
};

export type MessageResponse = {
  message: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken: string | null;
};

export type Expense = {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
};

export type ExpensePayload = {
  description: string;
  amount: number;
  date: string;
  category: string;
};

export type ExpenseQuery = {
  start?: string;
  end?: string;
  category?: string;
};

export type StatsResponse = {
  by_category: { labels: string[]; values: number[] };
  by_day: { labels: string[]; values: number[] };
};

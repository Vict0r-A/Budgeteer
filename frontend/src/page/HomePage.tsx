import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/header/header";
import Filters from "../components/expenses/Filters";
import ExpenseTable from "../components/table/ExpenseTable";
import DoughnutChart from "../components/charts/DoughnutChart";
import PieChart from "../components/charts/PieChart";
import AddExpenseModal from "../components/modals/AddExpenseModal";
import EditExpenseModal from "../components/modals/EditExpenseModal";
import DeleteExpenseModal from "../components/modals/DeleteExpenseModal";
import LogoutModal from "../components/modals/LogoutModal";
import LoginModal from "../components/modals/LoginModal";
import SignupModal from "../components/modals/SignupModal";
import ForgotPasswordModal from "../components/modals/ForgotPasswordModal";
import SettingsModal from "../components/modals/SettingsModal";
import Footer from "../components/footer/Footer";
import {
  type AuthedUser,
  type Expense,
  changePassword,
  clearAuth,
  createExpense,
  deleteMyAccount,
  deleteExpense,
  forgotPassword,
  getExpenses,
  getMe,
  getToken,
  getStats,
  login,
  logout,
  register,
  updateProfile,
  updateExpense,
} from "../api";
import { getTodayLocalIso } from "../date";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;

function HomePage() {
  // Used to ignore stale async responses after a newer request started.
  const refreshRequestIdRef = useRef(0);
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [stats, setStats] = useState<{ by_category: { labels: string[]; values: number[] }; by_day: { labels: string[]; values: number[] } }>({
    by_category: { labels: [], values: [] },
    by_day: { labels: [], values: [] },
  });
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [category, setCategory] = useState("");

  const isLoggedIn = !!user;

  const totalValue = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

    const totalLabel = useMemo(
    () => totalValue.toLocaleString("en-GB", { style: "currency", currency: "GBP" }),
    [totalValue]
    );


  const demoCategoryStats = useMemo(
    () => ({
      labels: ["Food", "Transport", "Utilities", "Rent"],
      values: [420, 180, 130, 900],
    }),
    []
  );

  const demoDayStats = useMemo(
    () => ({
      labels: ["2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23", "2026-02-24", "2026-02-25"],
      values: [35, 82, 47, 120, 66, 94, 58],
    }),
    []
  );

  function currentQuery() {
    return {
      start: start || undefined,
      end: end || undefined,
      category: category || undefined,
    };
  }

  async function refreshDashboard(override?: { start?: string; end?: string; category?: string }) {
    if (!isLoggedIn) return;
    const query = override ?? currentQuery();
    // Fetch table + chart data together so the dashboard stays in sync.
    const [expenseData, statData] = await Promise.all([getExpenses(query), getStats(query)]);
    setExpenses(expenseData);
    setStats(statData);
  }

  function handleAuthFailure(message = "Session expired. Please login again.") {
    clearAuth();
    setUser(null);
    setExpenses([]);
    setStats({ by_category: { labels: [], values: [] }, by_day: { labels: [], values: [] } });
    toast.error(message);
  }

  async function runDashboardRefresh(override?: { start?: string; end?: string; category?: string }) {
    const requestId = ++refreshRequestIdRef.current;
    try {
      await refreshDashboard(override);
    } catch (err: any) {
      // Ignore stale request errors when a newer refresh already started.
      if (requestId !== refreshRequestIdRef.current) {
        return;
      }
      // Filter refresh should never hard-logout the user.
      if (err?.status === 401) {
        toast.error("Session looks invalid. Please log in again if this continues.");
        return;
      }
      toast.error(err?.message ?? "Could not refresh data");
    }
  }

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    }
    bootstrapAuth();
  }, []);

  useEffect(() => {
    runDashboardRefresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Track the user's last activity while logged in.
    let lastActivityAt = Date.now();
    const updateActivity = () => {
      lastActivityAt = Date.now();
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, updateActivity, { passive: true }));

    const intervalId = window.setInterval(() => {
      if (Date.now() - lastActivityAt >= INACTIVITY_LIMIT_MS) {
        handleLogout(false);
        toast.info("You were signed out after 10 minutes of inactivity.");
      }
    }, 15_000);

    return () => {
      window.clearInterval(intervalId);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, updateActivity));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  async function handleLogin(payload: { email: string; password: string }) {
    // Invalidate old pending refresh calls to prevent stale 401 toasts after login.
    refreshRequestIdRef.current++;
    const res = await login(payload);
    setUser(res.user);
    toast.success("Logged in successfully");
    runDashboardRefresh().catch(() => undefined);
  }

  async function handleSignup(payload: { displayName: string; email: string; password: string }) {
    // Invalidate old pending refresh calls to prevent stale 401 toasts after signup.
    refreshRequestIdRef.current++;
    const res = await register(payload);
    setUser(res.user);
    toast.success("Account created");
    runDashboardRefresh().catch(() => undefined);
  }

  function handleLogout(showToast = true) {
    logout();
    setUser(null);
    setExpenses([]);
    setStats({ by_category: { labels: [], values: [] }, by_day: { labels: [], values: [] } });
    if (showToast) {
      toast.success("Logged out");
    }
  }

  async function handleForgotPassword(payload: { email: string }) {
    return forgotPassword(payload);
  }

  async function handleUpdateProfile(payload: { displayName: string; email: string }) {
    const tokenAtRequestStart = getToken();
    try {
      const res = await updateProfile(payload);
      setUser(res.user);
    } catch (err: any) {
      if (err?.status === 401 && tokenAtRequestStart && tokenAtRequestStart === getToken()) {
        handleAuthFailure();
        return;
      }
      throw err;
    }
  }

  async function handleChangePassword(payload: { currentPassword: string; newPassword: string }) {
    const tokenAtRequestStart = getToken();
    try {
      const res = await changePassword(payload);
      setUser(res.user);
      toast.success("Password changed");
    } catch (err: any) {
      if (err?.status === 401 && tokenAtRequestStart && tokenAtRequestStart === getToken()) {
        handleAuthFailure();
        return;
      }
      throw err;
    }
  }

  async function handleDeleteAccount(payload: { password: string }) {
    const tokenAtRequestStart = getToken();
    try {
      await deleteMyAccount(payload);
      toast.success("Account deleted successfully");
      handleLogout(false);
    } catch (err: any) {
      if (err?.status === 401 && tokenAtRequestStart && tokenAtRequestStart === getToken()) {
        handleAuthFailure();
        return;
      }
      throw err;
    }
  }

  async function handleAddExpense(payload: { description: string; amount: number; date: string; category: string }) {
    const tokenAtRequestStart = getToken();
    try {
      await createExpense(payload);
      toast.success("Expense added");
    } catch (err: any) {
      if (err?.status === 401 && tokenAtRequestStart && tokenAtRequestStart === getToken()) {
        handleAuthFailure();
      }
      // Let the modal show a single clear error message.
      throw err;
    }

    try {
      await runDashboardRefresh();
    } catch {
      // runDashboardRefresh handles its own toasts
    }
  }

  async function handleEditExpense(id: number, payload: { description: string; amount: number; date: string; category: string }) {
    const tokenAtRequestStart = getToken();
    try {
      await updateExpense(id, payload);
      setSelectedExpense(null);
      toast.success("Expense updated");
    } catch (err: any) {
      if (err?.status === 401 && tokenAtRequestStart && tokenAtRequestStart === getToken()) {
        handleAuthFailure();
      }
      throw err;
    }

    try {
      await runDashboardRefresh();
    } catch {
      // runDashboardRefresh handles its own toasts
    }
  }

  async function handleDeleteExpense(id: number) {
    const tokenAtRequestStart = getToken();
    try {
      await deleteExpense(id);
      setSelectedExpense(null);
      toast.success("Expense deleted");
    } catch (err: any) {
      if (err?.status === 401 && tokenAtRequestStart && tokenAtRequestStart === getToken()) {
        handleAuthFailure();
      }
      throw err;
    }

    try {
      await runDashboardRefresh();
    } catch {
      // runDashboardRefresh handles its own toasts
    }
  }

  function handleExportCsv() {
    if (!expenses.length) {
      toast.info("No expenses to export");
      return;
    }
    const headers = ["id", "date", "description", "category", "amount"];
    const rows = expenses.map((e) => [String(e.id), e.date, e.description, e.category, String(e.amount)]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "budgeteer-expenses.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (!authReady) {
    return (
      <main className="budget-page d-flex align-items-center justify-content-center">
        <div className="text-muted-custom">Loading Budgeteer...</div>
      </main>
    );
  }

  const categoryChartData = isLoggedIn ? stats.by_category : demoCategoryStats;
  const dayChartData = isLoggedIn ? stats.by_day : demoDayStats;
  const todayIso = getTodayLocalIso();

  return (
    <main className="budget-page">
      <div className="container py-4 py-md-5">
        <Header isLoggedIn={isLoggedIn} displayName={user?.displayName} />

        <div className="row g-3 g-md-4 align-items-stretch">
          <Filters
            isLoggedIn={isLoggedIn}
            start={start}
            end={end}
            category={category}
            total={totalLabel}
            onStartChange={setStart}
            onEndChange={setEnd}
            onCategoryChange={setCategory}
            onApply={() => {
              // Keep filter dates realistic and prevent future ranges.
              if ((start && start > todayIso) || (end && end > todayIso)) {
                toast.error("Filter dates cannot be in the future.");
                return;
              }
              if (start && end && start > end) {
                toast.error("Start date cannot be after end date.");
                return;
              }
              runDashboardRefresh().catch(() => undefined);
            }}
            onReset={() => {
              setStart("");
              setEnd("");
              setCategory("");
              runDashboardRefresh({}).catch(() => undefined);
            }}
            onExport={handleExportCsv}
          />
        </div>

        <ExpenseTable
          isLoggedIn={isLoggedIn}
          expenses={expenses}
          totalLabel={totalLabel}
          onEditClick={setSelectedExpense}
          onDeleteClick={setSelectedExpense}
        />

        <section className="row g-3 g-md-4 mt-1">
          <DoughnutChart labels={categoryChartData.labels} values={categoryChartData.values} />
          <PieChart labels={dayChartData.labels} values={dayChartData.values} />
        </section>
      </div>
      <footer><Footer /></footer>

      <AddExpenseModal onAdd={handleAddExpense} />
      <EditExpenseModal selected={selectedExpense} onSave={handleEditExpense} />
      <DeleteExpenseModal selected={selectedExpense} onDelete={handleDeleteExpense} />
      <LogoutModal onConfirmLogout={() => handleLogout()} />
      <LoginModal onLogin={handleLogin} />
      <SignupModal onSignup={handleSignup} />
      <ForgotPasswordModal onRequestReset={handleForgotPassword} />
      <SettingsModal
        user={user}
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={handleChangePassword}
        onDeleteAccount={handleDeleteAccount}
      />
      <ToastContainer autoClose={3000} closeButton />
    </main>
  );
}

export default HomePage;

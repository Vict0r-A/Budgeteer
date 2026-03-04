import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Reset token is required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: token.trim(), newPassword });
      toast.success("Password reset successful. You are now logged in.");
      window.setTimeout(() => navigate("/"), 800);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="budget-page d-flex align-items-center justify-content-center">
      <div className="panel p-4" style={{ width: "100%", maxWidth: 520 }}>
        <h1 className="h4 mb-2">Reset Password</h1>
        <p className="text-muted-custom small mb-4">Enter your token and choose a new password.</p>

        <form className="d-grid gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="form-label small text-muted-custom">Reset Token</label>
            <input
              className="form-control field-control"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label small text-muted-custom">New Password</label>
            <input
              type="password"
              minLength={8}
              className="form-control field-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label small text-muted-custom">Confirm New Password</label>
            <input
              type="password"
              minLength={8}
              className="form-control field-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-brand" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <Link to="/" className="btn btn-slate text-decoration-none text-center">
            Back to Login
          </Link>
        </form>
      </div>
      <ToastContainer autoClose={3000} closeButton />
    </main>
  );
}

export default ResetPasswordPage;

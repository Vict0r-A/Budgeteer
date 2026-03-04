import { useEffect, useState } from "react";

type LoginModalProps = {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
};

function LoginModal({ onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const modalEl = document.getElementById("loginModal");
    if (!modalEl) return;

    // Reset form state each time the modal is opened/closed.
    const resetState = () => {
      setError("");
      setLoading(false);
    };

    modalEl.addEventListener("show.bs.modal", resetState);
    modalEl.addEventListener("hidden.bs.modal", resetState);
    return () => {
      modalEl.removeEventListener("show.bs.modal", resetState);
      modalEl.removeEventListener("hidden.bs.modal", resetState);
    };
  }, []);

  function hideModal() {
    const modalEl = document.getElementById("loginModal");
    // Click the header close button to avoid triggering modal-switch links.
    const dismissButton = modalEl?.querySelector(".modal-header .btn-close") as HTMLButtonElement | null;
    dismissButton?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin({ email: email.trim(), password });
      setPassword("");
      hideModal();
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="loginModal"
      tabIndex={-1}
      aria-labelledby="loginModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-budget">
          <div className="modal-header border-slate">
            <h2 className="modal-title fs-5" id="loginModalLabel">
              Log In
            </h2>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              {error ? <div className="text-danger small">{error}</div> : null}
              <div>
                <label className="form-label small text-muted-custom">Email</label>
                <input
                  type="email"
                  className="form-control field-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label small text-muted-custom">Password</label>
                <input
                  type="password"
                  className="form-control field-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="d-none" />
            </form>
          </div>

          <div className="modal-footer border-slate d-flex justify-content-between">
            <div className="d-flex flex-column align-items-start gap-1">
              <button
                type="button"
                className="btn btn-link text-link p-0"
                data-bs-target="#signupModal"
                data-bs-toggle="modal"
                data-bs-dismiss="modal"
              >
                Need an account? Sign up
              </button>
              <button
                type="button"
                className="btn btn-link text-link p-0"
                data-bs-target="#forgotPasswordModal"
                data-bs-toggle="modal"
                data-bs-dismiss="modal"
              >
                Forgot your password?
              </button>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-slate" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" className="btn btn-brand" onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector("#loginModal form") as HTMLFormElement | null;
                form?.requestSubmit();
              }} disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;

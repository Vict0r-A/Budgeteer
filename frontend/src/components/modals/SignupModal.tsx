import { useEffect, useState } from "react";

type SignupModalProps = {
  onSignup: (payload: { displayName: string; email: string; password: string }) => Promise<void>;
};

function SignupModal({ onSignup }: SignupModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const modalEl = document.getElementById("signupModal");
    if (!modalEl) return;

    // Clear old error/loading state on each open/close.
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
    const modalEl = document.getElementById("signupModal");
    // Click the header close button to avoid triggering modal-switch links.
    const dismissButton = modalEl?.querySelector(".modal-header .btn-close") as HTMLButtonElement | null;
    dismissButton?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSignup({ displayName: displayName.trim(), email: email.trim(), password });
      setPassword("");
      hideModal();
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="signupModal"
      tabIndex={-1}
      aria-labelledby="signupModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-budget">
          <div className="modal-header border-slate">
            <h2 className="modal-title fs-5" id="signupModalLabel">
              Sign Up
            </h2>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              {error ? <div className="text-danger small">{error}</div> : null}
              <div>
                <label className="form-label small text-muted-custom">Display Name</label>
                <input
                  className="form-control field-control"
                  placeholder="e.g. Sam"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
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
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="d-none" />
            </form>
          </div>

          <div className="modal-footer border-slate d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-link text-link p-0"
              data-bs-target="#loginModal"
              data-bs-toggle="modal"
              data-bs-dismiss="modal"
            >
              Already have an account? Log in
            </button>
            <div>
              <button type="button" className="btn btn-slate" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-brand ms-2"
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.querySelector("#signupModal form") as HTMLFormElement | null;
                  form?.requestSubmit();
                }}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;

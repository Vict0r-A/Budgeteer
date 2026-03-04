import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type ForgotPasswordModalProps = {
  onRequestReset: (payload: { email: string }) => Promise<{ message: string; resetToken: string | null }>;
};

function ForgotPasswordModal({ onRequestReset }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const modalEl = document.getElementById("forgotPasswordModal");
    if (!modalEl) return;

    // Reset stale state whenever the modal opens/closes.
    const resetState = () => {
      setError("");
      setLoadingRequest(false);
    };

    modalEl.addEventListener("show.bs.modal", resetState);
    modalEl.addEventListener("hidden.bs.modal", resetState);
    return () => {
      modalEl.removeEventListener("show.bs.modal", resetState);
      modalEl.removeEventListener("hidden.bs.modal", resetState);
    };
  }, []);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoadingRequest(true);
    try {
      const res = await onRequestReset({ email: email.trim() });
      toast.success(res.message);
      if (res.resetToken) {
        // Optional dev helper if backend exposes token.
        toast.info(`Development reset token: ${res.resetToken}`);
      }
      toast.info("Check your email for a reset link.");
    } catch (err: any) {
      setError(err?.message ?? "Could not request password reset");
    } finally {
      setLoadingRequest(false);
    }
  }

  return (
    <div
      className="modal fade"
      id="forgotPasswordModal"
      tabIndex={-1}
      aria-labelledby="forgotPasswordModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-budget">
          <div className="modal-header border-slate">
            <h2 className="modal-title fs-5" id="forgotPasswordModalLabel">
              Forgot Password
            </h2>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            {error ? <div className="text-danger small mb-2">{error}</div> : null}

            <form className="d-grid gap-2 mb-3" onSubmit={handleRequestReset}>
              <label className="form-label small text-muted-custom mb-0">Email</label>
              <input
                type="email"
                className="form-control field-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-slate mt-2" disabled={loadingRequest}>
                {loadingRequest ? "Sending..." : "Request Reset Token"}
              </button>
            </form>
            <p className="small text-muted-custom mb-0">
              The reset link in your email opens the password reset page directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;

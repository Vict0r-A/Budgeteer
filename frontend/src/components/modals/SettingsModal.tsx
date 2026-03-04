import { useEffect, useState } from "react";
import type { AuthedUser } from "../../api";
import { toast } from "react-toastify";

type SettingsModalProps = {
  user: AuthedUser | null;
  onUpdateProfile: (payload: { displayName: string; email: string }) => Promise<void>;
  onChangePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  onDeleteAccount: (payload: { password: string }) => Promise<void>;
};

function SettingsModal({ user, onUpdateProfile, onChangePassword, onDeleteAccount }: SettingsModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmError, setDeleteConfirmError] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setEmail(user.email);
  }, [user]);

  useEffect(() => {
    const modalEl = document.getElementById("settingsModal");
    if (!modalEl) return;

    // Keep modal state clean each time settings is opened.
    const resetState = () => {
      setError("");
      setDeleteConfirmError("");
      setLoadingProfile(false);
      setLoadingPassword(false);
      setLoadingDelete(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setDeletePassword("");
      if (user) {
        setDisplayName(user.displayName);
        setEmail(user.email);
      }
    };

    modalEl.addEventListener("show.bs.modal", resetState);
    return () => {
      modalEl.removeEventListener("show.bs.modal", resetState);
    };
  }, [user]);

  function hideModal() {
    const modalEl = document.getElementById("settingsModal");
    const dismissButton = modalEl?.querySelector(".modal-header .btn-close") as HTMLButtonElement | null;
    dismissButton?.click();
  }

  function hideDeleteConfirmModal() {
    const modalEl = document.getElementById("deleteAccountConfirmModal");
    const dismissButton = modalEl?.querySelector(".modal-header .btn-close") as HTMLButtonElement | null;
    dismissButton?.click();
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoadingProfile(true);
    try {
      await onUpdateProfile({ displayName: displayName.trim(), email: email.trim() });
      toast.success("Profile updated");
    } catch (err: any) {
      setError(err?.message ?? "Could not update profile");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm new password must match.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }
    setLoadingPassword(true);
    try {
      await onChangePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Could not change password");
    } finally {
      setLoadingPassword(false);
    }
  }

  async function handleDeleteConfirm() {
    setError("");
    setDeleteConfirmError("");
    setLoadingDelete(true);
    try {
      await onDeleteAccount({ password: deletePassword });
      setDeletePassword("");
      hideDeleteConfirmModal();
      hideModal();
    } catch (err: any) {
      const message = err?.message ?? "Could not delete account";
      setDeleteConfirmError(message);
      toast.error(message);
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <>
      <div className="modal fade" id="settingsModal" tabIndex={-1} aria-labelledby="settingsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content modal-budget">
            <div className="modal-header border-slate">
              <h2 className="modal-title fs-5" id="settingsModalLabel">
                Account Settings
              </h2>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
            </div>

            <div className="modal-body d-grid gap-4">
              {error ? <div className="text-danger small">{error}</div> : null}

              <form className="d-grid gap-2 panel p-3" onSubmit={handleProfileSubmit}>
                <h3 className="h6 mb-1">Profile</h3>
                <label className="form-label small text-muted-custom mb-0">Display Name</label>
                <input
                  className="form-control field-control"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
                <label className="form-label small text-muted-custom mb-0 mt-1">Email</label>
                <input
                  type="email"
                  className="form-control field-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn btn-brand mt-2" type="submit" disabled={loadingProfile}>
                  {loadingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>

              <form className="d-grid gap-2 panel p-3" onSubmit={handlePasswordSubmit}>
                <h3 className="h6 mb-1">Change Password</h3>
                <label className="form-label small text-muted-custom mb-0">Current Password</label>
                <input
                  type="password"
                  className="form-control field-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <label className="form-label small text-muted-custom mb-0 mt-1">New Password</label>
                <input
                  type="password"
                  minLength={8}
                  className="form-control field-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <label className="form-label small text-muted-custom mb-0 mt-1">Confirm New Password</label>
                <input
                  type="password"
                  minLength={8}
                  className="form-control field-control"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <button className="btn btn-brand mt-2" type="submit" disabled={loadingPassword}>
                  {loadingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>

              <form className="d-grid gap-2 panel p-3 border border-danger-subtle" onSubmit={(e) => e.preventDefault()}>
                <h3 className="h6 mb-1 text-danger">Delete Account</h3>
                <p className="small text-muted-custom mb-0">This permanently removes your account and all expenses.</p>
                <label className="form-label small text-muted-custom mb-0 mt-1">Confirm Password</label>
                <input
                  type="password"
                  className="form-control field-control"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
                <button
                  className="btn btn-delete mt-2"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteAccountConfirmModal"
                  disabled={loadingDelete || !deletePassword.trim()}
                >
                  Delete My Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteAccountConfirmModal"
        tabIndex={-1}
        aria-labelledby="deleteAccountConfirmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-budget">
            <div className="modal-header border-slate">
              <h2 className="modal-title fs-5" id="deleteAccountConfirmModalLabel">
                Are you sure?
              </h2>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {deleteConfirmError ? <div className="text-danger small mb-2">{deleteConfirmError}</div> : null}
              This will permanently delete your Budgeteer account and all your expenses.
            </div>
            <div className="modal-footer border-slate">
              <button type="button" className="btn btn-slate" data-bs-dismiss="modal" disabled={loadingDelete}>
                Cancel
              </button>
              <button type="button" className="btn btn-delete" onClick={handleDeleteConfirm} disabled={loadingDelete}>
                {loadingDelete ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsModal;

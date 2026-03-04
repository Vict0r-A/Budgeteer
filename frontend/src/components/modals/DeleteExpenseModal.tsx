import type { Expense } from "../../api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type DeleteExpenseModalProps = {
  selected: Expense | null;
  onDelete: (id: number) => Promise<void>;
};

function DeleteExpenseModal({ selected, onDelete }: DeleteExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const modalEl = document.getElementById("deleteExpenseModal");
    if (!modalEl) return;

    // Clear old errors/loading each time the modal opens/closes.
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
    const modalEl = document.getElementById("deleteExpenseModal");
    // Use a native dismiss click so Bootstrap handles backdrop/focus cleanly.
    const dismissButton = modalEl?.querySelector(".modal-header .btn-close") as HTMLButtonElement | null;
    dismissButton?.click();
  }

  async function handleDelete() {
    if (!selected) return;
    setError("");
    setLoading(true);
    let isSuccess = false;
    try {
      await onDelete(selected.id);
      isSuccess = true;
    } catch (err: any) {
      // Keep feedback in toast so the modal does not keep old errors.
      toast.error(err?.message ?? "Could not delete expense");
    } finally {
      setLoading(false);
      if (isSuccess) {
        hideModal();
      }
    }
  }

  return (
    <div
      className="modal fade"
      id="deleteExpenseModal"
      tabIndex={-1}
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-budget">
          <div className="modal-header border-slate">
            <h2 className="modal-title fs-5" id="deleteModalLabel">
              Delete Expense
            </h2>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div className="modal-body">
            {error ? <div className="text-danger small mb-2">{error}</div> : null}
            Are you sure you want to delete{" "}
            <strong>{selected ? `"${selected.description}"` : "this expense"}</strong>?
          </div>
          <div className="modal-footer border-slate">
            <button type="button" className="btn btn-slate" data-bs-dismiss="modal">
              No
            </button>
            <button type="button" className="btn btn-delete" onClick={handleDelete} disabled={loading || !selected}>
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DeleteExpenseModal;

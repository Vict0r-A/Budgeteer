import { useEffect, useState } from "react";
import type { Expense, ExpensePayload } from "../../api";
import { toast } from "react-toastify";
import { getTodayLocalIso } from "../../date";

type EditExpenseModalProps = {
  selected: Expense | null;
  onSave: (id: number, payload: ExpensePayload) => Promise<void>;
};

function EditExpenseModal({ selected, onSave }: EditExpenseModalProps) {
  const todayIso = getTodayLocalIso();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Food");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const modalEl = document.getElementById("editExpenseModal");
    if (!modalEl) return;

    // Reset old state when reopening the modal.
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

  useEffect(() => {
    if (!selected) return;
    setDescription(selected.description);
    setAmount(String(selected.amount));
    setDate(selected.date);
    setCategory(selected.category);
  }, [selected]);

  function hideModal() {
    const modalEl = document.getElementById("editExpenseModal");
    // Use a native dismiss click so Bootstrap handles backdrop/focus cleanly.
    const dismissButton = modalEl?.querySelector(".modal-header .btn-close") as HTMLButtonElement | null;
    dismissButton?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    if (date > todayIso) {
      toast.error("Date cannot be in the future.");
      return;
    }
    setLoading(true);
    let isSuccess = false;
    try {
      await onSave(selected.id, {
        description: description.trim(),
        amount: Number(amount),
        date,
        category,
      });
      isSuccess = true;
    } catch (err: any) {
      // We use toasts for operation results.
      toast.error(err?.message ?? "Could not save changes");
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
      id="editExpenseModal"
      tabIndex={-1}
      aria-labelledby="editExpenseModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-budget">
          <div className="modal-header border-slate">
            <h2 className="modal-title fs-5" id="editExpenseModalLabel">
              Edit Expense
            </h2>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              {error ? <div className="text-danger small">{error}</div> : null}
              <div>
                <label className="form-label small text-muted-custom">Description</label>
                <input
                  className="form-control field-control"
                  placeholder="e.g., Groceries"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small text-muted-custom">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-control field-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted-custom">Date</label>
                  <input
                    type="date"
                    className="form-control field-control"
                    value={date}
                    max={todayIso}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label small text-muted-custom">Category</label>
                <select
                  className="form-select field-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Rent</option>
                  <option>Utilities</option>
                </select>
              </div>
              <button type="submit" className="d-none" />
            </form>
          </div>

          <div className="modal-footer border-slate">
            <button type="button" className="btn btn-slate" data-bs-dismiss="modal">
              Close
            </button>
            <button
              type="button"
              className="btn btn-brand"
              onClick={(e) => {
                e.preventDefault();
                const form = document.querySelector("#editExpenseModal form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              disabled={loading || !selected}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditExpenseModal;

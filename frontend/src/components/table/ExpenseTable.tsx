import type { Expense } from "../../api";

type ExpenseTableProps = {
  isLoggedIn: boolean;
  expenses: Expense[];
  onEditClick: (expense: Expense) => void;
  onDeleteClick: (expense: Expense) => void;
  totalLabel: string;
};

function ExpenseTable({ isLoggedIn, expenses, onEditClick, onDeleteClick, totalLabel }: ExpenseTableProps) {
  return (
    <>
      <div className="mt-4 mt-md-5 mb-3">
        <span className="small text-muted-custom me-2">Total:</span>
        <span className="pill">{totalLabel}</span>
      </div>

      <section className="panel p-0">
        <div className="px-3 px-md-4 py-3 border-bottom border-slate">
          <h2 className="section-title mb-0">Expenses</h2>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-budget mb-0">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-end">
                  Amount
                </th>
                <th scope="col" className="text-end">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td className="text-end">
                    {expense.amount.toLocaleString("en-GB", { style: "currency", currency: "GBP" })}
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-edit btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={isLoggedIn ? "#editExpenseModal" : "#loginModal"}
                        onClick={() => onEditClick(expense)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target={isLoggedIn ? "#deleteExpenseModal" : "#loginModal"}
                        className="btn btn-delete btn-sm"
                        onClick={() => onDeleteClick(expense)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted-custom py-4">
                    No expenses available for this period. Try Reset to view all entries.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default ExpenseTable;

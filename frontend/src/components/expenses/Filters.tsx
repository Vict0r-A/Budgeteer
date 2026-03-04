import { getTodayLocalIso } from "../../date";

type FiltersProps = {
  isLoggedIn: boolean;
  start: string;
  end: string;
  category: string;
  total: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onExport: () => void;
};

function Filters({
  isLoggedIn,
  start,
  end,
  category,
  total,
  onStartChange,
  onEndChange,
  onCategoryChange,
  onApply,
  onReset,
  onExport,
}: FiltersProps) {
  const todayIso = getTodayLocalIso();

  return (
    <>
      <section className="col-12 col-lg-8">
        <div className="panel p-3 p-md-4 h-100">
          <h2 className="section-title mb-3">Filters</h2>

          <form
            className="row g-3 align-items-end"
            onSubmit={(e) => {
              e.preventDefault();
              onApply();
            }}
          >
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted-custom">Start</label>
              <input
                type="date"
                className="form-control field-control"
                value={start}
                max={todayIso}
                onChange={(e) => onStartChange(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label small text-muted-custom">End</label>
              <input
                type="date"
                className="form-control field-control"
                value={end}
                max={todayIso}
                onChange={(e) => onEndChange(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small text-muted-custom">Category</label>
              <select
                className="form-select field-control"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <option value="">All</option>
                <option>Food</option>
                <option>Transport</option>
                <option>Rent</option>
                <option>Utilities</option>
                <option>Other</option>
              </select>
            </div>

            <div className="col-12 col-md-2 d-flex gap-2">
              {isLoggedIn ? (
                <button className="btn btn-brand flex-fill" type="submit">
                  Apply
                </button>
              ) : (
                <button
                  className="btn btn-brand flex-fill"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                >
                  Apply
                </button>
              )}

            </div>
          </form>

          <div className="mt-4 small text-muted-custom d-flex justify-content-between">
            <div>
            <span className="me-2">Total:</span>
            <span className="pill">{total}</span>
            </div>
            <div className="col-3 col-md-2 d-flex gap-2">
                      <button type="button" className="btn btn-slate flex-fill" onClick={onReset}>
                Reset
              </button></div>
          </div>

          <div className="mt-3">
            {isLoggedIn ? (
              <button type="button" className="btn btn-link small text-link p-0" onClick={onExport}>
                Export CSV (current filter)
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-link small text-link p-0"
                data-bs-toggle="modal"
                data-bs-target="#loginModal"
              >
                Export CSV (login required)
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="col-12 col-lg-4">
        <div className="panel p-3 p-md-4 h-100 d-flex flex-column justify-content-center">

          <button
            className="btn btn-brand w-100"
            type="button"
            data-bs-toggle="modal"
            data-bs-target={isLoggedIn ? "#addExpenseModal" : "#loginModal"}
          >
            {isLoggedIn ? "Add Expense" : "Login to Add Expense"}
          </button>
        </div>
      </section>
    </>
  );
}

export default Filters;

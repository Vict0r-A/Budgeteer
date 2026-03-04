type LogoutModalProps = {
  onConfirmLogout: () => void;
};

function LogoutModal({ onConfirmLogout }: LogoutModalProps) {
  return (
    <div
      className="modal fade"
      id="logoutModal"
      tabIndex={-1}
      aria-labelledby="logoutModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-budget">
          <div className="modal-header border-slate">
            <h2 className="modal-title fs-5" id="logoutModalLabel">
              Log Out
            </h2>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            Are you sure you want to log out?
          </div>

          <div className="modal-footer border-slate">
            <button type="button" className="btn btn-slate" data-bs-dismiss="modal">
              No
            </button>
            <button type="button" className="btn btn-delete" data-bs-dismiss="modal" onClick={onConfirmLogout}>
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;

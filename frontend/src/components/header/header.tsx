type HeaderProps = {
  isLoggedIn: boolean;
  displayName?: string;
};

function Header({ isLoggedIn, displayName }: HeaderProps) {
  return (
    <>
      <div className="d-flex justify-content-end align-items-center gap-2">
        {isLoggedIn ? (
          <>
            <button type="button" className="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#settingsModal">
              Settings
            </button>
            <button type="button" className="btn btn-slate" data-bs-toggle="modal" data-bs-target="#logoutModal">
              Logout
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#loginModal">
              Login
            </button>
            <button type="button" className="btn btn-info" data-bs-toggle="modal" data-bs-target="#signupModal">
              Sign Up
            </button>
          </>
        )}
      </div>
      <div className="pt-3">
        <header className="mb-4 mb-md-5">
          <h1 className="text-center page-title mb-2">Budgeteer</h1>
          <p className="text-center page-subtitle mb-0">
            Welcome to Budgeteer! The worlds best personal expenses tracker!.
          </p>
          {isLoggedIn ? (
            <p className="text-center text-muted-custom mt-2 mb-0 small">
              Signed in as {displayName ?? "User"}
            </p>
          ) : null}
        </header>
      </div>
    </>
  );
}

export default Header;

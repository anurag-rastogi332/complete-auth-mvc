import { Link, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="page">
      <nav className="navbar">
        <Link to="/" className="logo">Auth System</Link>

        <div className="nav-links">
          {token ? (
            <>
              <Link to="/profile">Profile</Link>
              {user?.role === "admin" && <Link to="/admin">Admin</Link>}
              <button onClick={logout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <main className="hero">
        <div className="hero-card">
          <p className="small-title">FULL STACK AUTHENTICATION</p>

          <h1>
            Simple Authentication
            <br />
            with React and Node.js
          </h1>

          <p className="description">
            Learn registration, email OTP, password hashing,
            JWT authentication, protected routes and password recovery.
          </p>

          <div className="hero-buttons">
            {token ? (
              <button
                className="primary-button"
                onClick={() => navigate("/profile")}
              >
                Open Profile
              </button>
            ) : (
              <>
                <button
                  className="primary-button"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </button>

                <button
                  className="secondary-button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

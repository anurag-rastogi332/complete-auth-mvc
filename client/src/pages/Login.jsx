import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/login", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/profile");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to your account.</p>

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={change}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            placeholder="Your password"
            required
          />

          <Link className="forgot-link" to="/forgot-password">
            Forgot Password?
          </Link>

          <button className="primary-button full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p className="message error">{message}</p>}

        <p className="bottom-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;

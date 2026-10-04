import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function ResetPassword() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail");

  const [form, setForm] = useState({
    otp: "",
    password: "",
    confirmPassword: ""
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

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await API.post("/auth/reset-password", {
        email,
        otp: form.otp,
        password: form.password
      });

      sessionStorage.removeItem("resetEmail");
      navigate("/login");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Reset session not found</h2>
          <button
            className="primary-button full"
            onClick={() => navigate("/forgot-password")}
          >
            Start Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">{email}</p>

        <form onSubmit={submit}>
          <label>OTP</label>
          <input
            name="otp"
            value={form.otp}
            onChange={change}
            placeholder="000000"
            maxLength="6"
            required
          />

          <label>New Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            minLength="6"
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={change}
            minLength="6"
            required
          />

          <button className="primary-button full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && <p className="message error">{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/forgot-password", {
        email
      });

      sessionStorage.setItem("resetEmail", response.data.email);
      navigate("/reset-password");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and we will send a reset OTP.
        </p>

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <button className="primary-button full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset OTP"}
          </button>
        </form>

        {message && <p className="message error">{message}</p>}

        <button
          className="text-button"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

    setMessage("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const cleanForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      };

      const response = await API.post(
        "/auth/send-otp",
        cleanForm
      );

      sessionStorage.setItem(
        "registerEmail",
        response.data.email
      );

      setMessage("OTP sent successfully");

      setTimeout(() => {
        navigate("/verify-otp");
      }, 500);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2>Create Account</h2>

        <p className="auth-subtitle">
          Verify your email to register.
        </p>

        <form onSubmit={submit}>

          <label>Name</label>

          <input
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Your name"
            required
          />

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
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />

          <button
            type="submit"
            className="primary-button full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        <p className="bottom-text">
          Already registered?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await API.put(
        "/user/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message);

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not change password"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Change Password</h2>
        <p className="auth-subtitle">
          Your current password is required.
        </p>

        <form onSubmit={submit}>
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={change}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={change}
            minLength="6"
            required
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={change}
            minLength="6"
            required
          />

          <button className="primary-button full">
            Change Password
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <button
          className="text-button"
          onClick={() => navigate("/profile")}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;

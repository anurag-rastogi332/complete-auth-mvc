import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(response.data.user);
      setName(response.data.user.name);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await API.put(
        "/user/profile",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setMessage("Profile updated");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Update failed"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <h1>{user?.name}</h1>
        <p className="profile-email">{user?.email}</p>

        <div className="profile-info">
          <div>
            <span>Email status</span>
            <strong>{user?.isEmailVerified ? "Verified" : "Not verified"}</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>

          <div>
            <span>Account created</span>
            <strong>
              {new Date(user?.createdAt).toLocaleDateString()}
            </strong>
          </div>
        </div>

        <form onSubmit={update}>
          <label>Change Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button className="primary-button full">
            Update Profile
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <Link className="secondary-button full button-link" to="/change-password">
          Change Password
        </Link>

        {user?.role === "admin" && (
          <Link className="secondary-button full button-link" to="/admin">
            Admin Panel
          </Link>
        )}

        <button
          className="danger-button full"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/user/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(response.data.users);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load users"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/user/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage("User deleted");
      load();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not delete user"
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <p className="small-title">ADMIN</p>
            <h1>User Management</h1>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="user-list">
          {users.map((user) => (
            <div className="user-row" key={user._id}>
              <div>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>

              <div className="user-status">
                <span>{user.role}</span>
                <span>
                  {user.isEmailVerified ? "Verified" : "Unverified"}
                </span>
              </div>

              <button
                className="danger-small"
                onClick={() => remove(user._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;

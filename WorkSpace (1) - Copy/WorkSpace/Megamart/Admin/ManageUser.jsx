import React, { useState, useEffect } from "react";
import "./ManageUser.css";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", username: "", mobilenumber: "", password: "" });

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/users");
      const text = await res.text();
      let data;

      
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        throw new Error("Backend not responding. Run 'npm run dev' from Megamart to start both frontend and server.");
      }


      if (!res.ok) throw new Error(data?.error || "Failed to fetch users");
      setUsers(Array.isArray(data) ? data : []);
    } 
    
    
    catch (err) 
    
    {
      setError(err.message || "Could not load users");
      setUsers([]);
    } finally 
    {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message || "Could not delete user");
    }
  }

  function openEdit(user) {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      username: user.username || "",
      mobilenumber: user.mobilenumber || "",
      password: "",
    });
  }

  function closeEdit() {
    setEditingUser(null);
    setEditForm({ name: "", username: "", mobilenumber: "", password: "" });
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload = {
        name: editForm.name,
        username: editForm.username,
        mobilenumber: editForm.mobilenumber,
      };
      if (editForm.password) payload.password = editForm.password;

      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? { ...u, ...data.user } : u))
      );
      closeEdit();
    } catch (err) {
      alert(err.message || "Could not update user");
    }
  }

  return (
    <div className="container">
      <h2>Manage Users</h2>

      {loading && <p className="manage-user-loading">Loading users...</p>}
      {error && <p className="manage-user-error">{error}</p>}

      {!loading && !error && users.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.mobilenumber}</td>
                <td>
                  <button onClick={() => openEdit(u)}>Edit</button>
                  <button onClick={() => deleteUser(u._id)} className="btn-delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="manage-user-empty">No users yet. Sign up from the Signup page to add users.</p>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <form onSubmit={saveEdit}>
              <label>Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <label>Email</label>
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                required
              />
              <label>Mobile Number</label>
              <input
                type="text"
                value={editForm.mobilenumber}
                onChange={(e) => setEditForm((f) => ({ ...f, mobilenumber: e.target.value }))}
                required
              />
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Optional"
              />
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={closeEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUser;

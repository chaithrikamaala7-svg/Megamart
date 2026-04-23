import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const ADMIN_USERNAME = "chaithrika";
  const ADMIN_PASSWORD = "chaithrika@7";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setMessage("Admin login successful!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } 
    else 
    {
      setMessage("Invalid admin credentials");
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      
      <form onSubmit={handleSubmit}>

        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />

        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Login</button>

      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AdminLogin;
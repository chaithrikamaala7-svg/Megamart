import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { apiUrl } from "./apiBase";


function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return setMessage("Enter username and password");
    try {
      setIsLoading(true);
      setMessage("");
      const resp = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await resp.json();
      if (resp.ok && data && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login successful!");
        setTimeout(() => {
          navigate("/Home");
        }, 1000);
      } else {
        setMessage((data && data.error) || "Login failed");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    if (!forgotEmail) return setForgotMsg("Enter your registered email");
    try {
      setForgotMsg("Sending reset link...");
      const resp = await fetch(apiUrl("/api/users/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await resp.json();
      if (resp.ok && data && data.success) {
        setForgotMsg("Reset link sent to your email.");
      } else {
        setForgotMsg((data && data.error) || "Failed to send reset link");
      }
    } catch (err) {
      setForgotMsg(err.message);
    }
  };

  return (
    <center>
      <div className="container">
        <div className="main-box">
          <div className="left">
            <img src="/images/img.png" alt="image" />
          </div>
          <div className="right">
            <div className="form login">
              <form onSubmit={handleLogin}>
                <center>
                  <h2>Login</h2>
                </center>
                <br />
                <label htmlFor="username">Email</label>
                <br />
                <input
                  type="email"
                  id="username"
                  name="username"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <br />
                <br />
                <label htmlFor="password">Password</label>
                <br />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <br />
                <br />
                <button className="button" type="submit" disabled={isLoading}>
                  {isLoading ? "LOGGING IN..." : "LOGIN"}
                </button>
                <div style={{ marginTop: 10, textAlign: "right" }}>
                  <span
                    style={{ color: "#1976d2", cursor: "pointer", fontSize: 14 }}
                    onClick={() => setShowForgot((v) => !v)}
                  >
                    Forgot Password?
                  </span>
                </div>
                {showForgot && (
                  <form onSubmit={handleForgot} style={{ marginTop: 12, textAlign: "left" }}>
                    <label htmlFor="forgotEmail">Enter your registered email:</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      style={{ width: "100%", margin: "8px 0", padding: 6 }}
                      required
                    />
                    <button type="submit" className="button" style={{ width: "100%", marginBottom: 6 }}>
                      Send Reset Link
                    </button>
                    {forgotMsg && <div style={{ color: forgotMsg.startsWith("Reset link") ? "green" : "red", fontSize: 13 }}>{forgotMsg}</div>}
                  </form>
                )}
                <p style={{ marginTop: 16 }}>
                  Don&apos;t have an account?{" "}
                  <Link to="/signup">
                    <u>Sign Up</u>
                  </Link>
                </p>
                {message && (
                  <p
                    style={{
                      color: message.startsWith("Login success") ? "green" : "red",
                      marginTop: 8,
                    }}
                  >
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </center>
  );
}

export default Login;

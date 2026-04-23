import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return setMessage("Enter username and password");
    try {
      setIsLoading(true);
      setMessage("");
      const resp = await fetch("/api/login", {
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
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
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

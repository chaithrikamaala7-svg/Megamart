import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { apiUrl } from "./apiBase";

function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [dialCode, setDialCode] = useState("+91");
  const [mobilenumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isSuccessMessage = message.toLowerCase().includes("account created");

  const getNormalizedInputs = () => {
    const email = String(username).trim().toLowerCase();
    const phone = String(mobilenumber).replace(/\D/g, "");
    return { email, phone };
  };

  const validateOtpFields = () => {
    if (!name || !username || !mobilenumber) {
      setMessage("Name, email and mobile number are required");
      return null;
    }
    const { email, phone } = getNormalizedInputs();
    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address");
      return null;
    }
    if (phone.length !== 10) {
      setMessage("Enter valid 10-digit mobile number");
      return null;
    }
    return { email, phone };
  };

  const validateBaseFields = () => {
    if (!name || !username || !mobilenumber || !password || !confirmPassword) {
      setMessage("All fields are required");
      return null;
    }
    const { email, phone } = getNormalizedInputs();
    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address");
      return null;
    }
    if (phone.length !== 10) {
      setMessage("Enter valid 10-digit mobile number");
      return null;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return null;
    }
    return { email, phone };
  };

  const handleSendOtp = async () => {
    const valid = validateOtpFields();
    if (!valid) return;
    try {
      setIsSendingOtp(true);
      setMessage("");
      setOtpVerified(false);
      const resp = await fetch(apiUrl("/api/signup-otp/request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: valid.email, mobilenumber: valid.phone, dialCode }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        const devOtpSuffix = data.devOtp ? ` OTP: ${data.devOtp}` : "";
        setMessage(`OTP sent successfully.${devOtpSuffix}`);
      } else {
        setMessage(data?.error || "Failed to send OTP");
      }
    } catch (err) {
      setMessage(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const valid = validateOtpFields();
    if (!valid) return;
    if (!otp) {
      setMessage("Enter OTP");
      return;
    }
    try {
      setIsVerifyingOtp(true);
      setMessage("");
      const resp = await fetch(apiUrl("/api/signup-otp/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: valid.email, mobilenumber: valid.phone, otp }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success) {
        setOtpVerified(true);
        setMessage("OTP verified. You can now sign up.");
      } else {
        setOtpVerified(false);
        if (resp.status === 401) {
          setMessage("Wrong OTP");
        } else {
          setMessage(data?.error || "OTP verification failed");
        }
      }
    } catch (err) {
      setOtpVerified(false);
      setMessage(err.message || "OTP verification failed");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const valid = validateBaseFields();
    if (!valid) return;
    if (!otpVerified) {
      setMessage("Verify OTP before signup");
      return;
    }
    try {
      setIsLoading(true);
      setMessage("");
      const resp = await fetch(apiUrl("/api/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: valid.email,
          password,
          mobilenumber: valid.phone,
          confirmPassword,
        }),
      });
      let data;
      try {
        data = await resp.json();
      } catch {
        setMessage("Server error – make sure the backend is running on port 3001");
        return;
      }
      if (resp.ok && data && data.success) {
        setMessage("Account created! You can now login.");
      } else {
        setMessage((data && data.error) || "Signup failed");
      }
    } catch (err) {
      setMessage(err.message || "Cannot reach server. Is it running on port 3001?");
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
              <form onSubmit={handleSignup}>
                <center>
                  <h2>Sign Up</h2>
                </center>
                <br />
                <label htmlFor="name">Name</label>
                <br />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <br />
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
                <label htmlFor="mobilenumber">Mobile Number</label>
                <br />
                <div className="dial-code-input">
                  <input
                    type="text"
                    className="dial-code dial-code-edit"
                    value={dialCode}
                    onChange={(e) => {
                      const next = e.target.value.replace(/[^\d+]/g, "");
                      setDialCode(next.startsWith("+") ? next : `+${next.replace(/\+/g, "")}`);
                      setOtpVerified(false);
                    }}
                    maxLength={5}
                    aria-label="Dial code"
                  />
                  <input
                    type="tel"
                    id="mobilenumber"
                    name="mobilenumber"
                    placeholder="Enter mobile number"
                    value={mobilenumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setOtpVerified(false);
                    }}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
                <br />
                <br />
                <label htmlFor="signup-otp">OTP</label>
                <br />
                <input
                  type="text"
                  id="signup-otp"
                  name="signup-otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpVerified(false);
                  }}
                  inputMode="numeric"
                  maxLength={6}
                />
                <br />
                <br />
                <button
                  className="button"
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? "SENDING OTP..." : "SEND OTP"}
                </button>
                <br />
                <br />
                <button
                  className="button"
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                >
                  {isVerifyingOtp ? "VERIFYING..." : "VERIFY OTP"}
                </button>
                <br />
                <br />
                <label htmlFor="password">Password</label>
                <br />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <br />
                <br />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <br />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <br />
                <br />
                <button className="button" type="submit" disabled={isLoading}>
                  {isLoading ? "SIGNING UP..." : "SIGN UP"}
                </button>
                <p style={{ marginTop: 16 }}>
                  Already have an account?{" "}
                  <Link to="/login">
                    <u>Login</u>
                  </Link>
                </p>
                <div className="message-area">
                  {message && (
                    <p style={{ color: isSuccessMessage ? "green" : "red", margin: 0 }}>
                      {message}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </center>
  );
}

export default Signup;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Signup() {
  const [name, setName] = useState("");

  const [username, setUsername] = useState("");

  const [mobilenumber, setMobileNumber] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);


  const handleSignup = async (e) => {

    e.preventDefault();


    if (!name || !username || !mobilenumber || !password || !confirmPassword) 
    {
      return setMessage("All fields are required");
    }


    if (password !== confirmPassword) 
    {
      return setMessage("Passwords do not match");
    }

    try {
      setIsLoading(true);
      setMessage("");
      const resp = await fetch("/api/signup", 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          password,
          mobilenumber,
          confirmPassword
        })
      });
      let data;


      try 
      {
        data = await resp.json();
      }
      catch 
      {
        setMessage("Server error – make sure the backend is running on port 3001");
        return;
      }
      if (resp.ok && data && data.success) 
      {
        setMessage("Account created! You can now login.");
      } 
      
      else 
      {
        setMessage((data && data.error) || "Signup failed");
      }
    }

    catch (err) 
    {
      
      setMessage(err.message || "Cannot reach server. Is it running on port 3001?");
    }

    
    finally 
    {
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
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <br />
                <br />



                <label htmlFor="mobilenumber">Mobile Number</label>
                <br />


                <input
                  type="text"
                  id="mobilenumber"
                  name="mobilenumber"
                  placeholder="Enter your mobile number"
                  value={mobilenumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
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
                  Already have an account? <Link to="/login"><u>Login</u></Link>
                </p>

                <div className="message-area">
                  {
                  message && (
                    <p style={{ color: message.includes("created") ? "green" : "red", margin: 0 }}>{message}</p>
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

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/auth.css";

const Signup = ({ switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful");
      switchToLogin();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h2>Sign Up</h2>
        <p>Create your account</p>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSignup}>Sign up</button>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={switchToLogin}>Login</span>
        </p>
      </div>

      <div className="auth-right">
        <h1>Welcome to</h1>
        <h2>student portal</h2>
        <p>Create account to get started</p>
      </div>
    </div>
  );
};

export default Signup;

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";

const Login = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h2>Login</h2>
        <p>Enter your account details</p>

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

        <button onClick={handleLogin}>Login</button>

        <p className="switch-text">
          Don’t have an account?{" "}
          <span onClick={switchToSignup}>Sign up</span>
        </p>
      </div>

      <div className="auth-right">
        <h1>Welcome to</h1>
        <h2>student portal</h2>
        <p>Login to access your account</p>
      </div>
    </div>
  );
};

export default Login;

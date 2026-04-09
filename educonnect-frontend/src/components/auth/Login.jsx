import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getFirebaseAuthErrorMessage } from "../../utils/firebaseAuthError";

const Login = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Backend error");
    }

    console.log("User saved:", data);
    alert("Login successful & synced with DB");

  } catch (error) {
    console.error("Login error:", error);
    alert(getFirebaseAuthErrorMessage(error));
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

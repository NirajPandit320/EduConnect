import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getFirebaseAuthErrorMessage } from "../../utils/firebaseAuthError";
import { useNavigate } from "react-router-dom";

const Login = ({ switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setIsLoading(true);

    try {
      // STEP 1: Try admin login first
      console.log("Attempting admin login...");
      const adminResponse = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const adminData = await adminResponse.json();

      // STEP 2: If admin login succeeds
      if (adminResponse.ok && adminData.success === true) {
        console.log("Admin login successful");
        localStorage.setItem("admin", "true");
        localStorage.setItem("adminEmail", email);
        alert("Admin login successful!");
        navigate("/admin");
        setIsLoading(false);
        return;
      }

      // STEP 3: Admin login failed - continue with user login
      console.log("Admin login failed, trying user login...");
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
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      alert(getFirebaseAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

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

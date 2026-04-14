import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { getFirebaseAuthErrorMessage } from "../../utils/firebaseAuthError";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../utils/adminHelper";
import { API_BASE_URL } from "../../utils/apiConfig";

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
      try {
        const adminData = await loginAdmin(email, password);

        if (adminData.success === true) {
          console.log("Admin login successful");
          console.log("Admin login response:", adminData);
          alert("Admin login successful!");
          navigate("/admin");
          return;
        }
      } catch (adminError) {
        if (adminError.message !== "Invalid admin credentials") {
          throw adminError;
        }

        console.log("Admin login failed, trying user login...");
      }

      // STEP 2: Admin login failed - continue with user login
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

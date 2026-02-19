import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";

const Signup = ({ switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSignup = async () => {
  try {
    // 1️⃣ Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    // 2️⃣ Send user profile to backend
    await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        name: "Temporary Name",
        email: firebaseUser.email,
        sapId: Math.floor(Math.random() * 1000000000),
        branch: "Computer Engineering",
        year: 3,
        role: "student",
      }),
    });

    alert("Signup successful & profile saved!");
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

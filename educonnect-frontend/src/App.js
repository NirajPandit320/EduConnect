import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "./firebase";
import SignupPage from "./Signup";
import LoginPage from "./Login";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const auth = getAuth(app);

  const signupUser = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Signup successful");
        console.log("UID:", userCredential.user.uid);
      })
      .catch((error) => alert(error.message));
  };

  const loginUser = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Login successful");
        console.log("UID:", userCredential.user.uid);
      })
      .catch((error) => alert(error.message));
  };

  return (
    <div>
      {showLogin ? (
        <>
          <LoginPage
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            onLogin={loginUser}
          />
          <p onClick={() => setShowLogin(false)}>New user? Sign up</p>
        </>
      ) : (
        <>
          <SignupPage
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            onSignup={signupUser}
          />
          <p onClick={() => setShowLogin(true)}>If you have an Account? Login</p>
        </>
      )}
    </div>
  );
}

export default App;

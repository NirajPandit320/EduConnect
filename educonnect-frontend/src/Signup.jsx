import React from "react";

const SignupPage = ({ email, password, setEmail, setPassword, onSignup }) => {
  return (
    <div className="signup-page">
      <label>Email</label>
      <input
        type="email"
        required
        placeholder="Enter your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        required
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={onSignup}>Sign Up</button>
    </div>
  );
};

export default SignupPage;

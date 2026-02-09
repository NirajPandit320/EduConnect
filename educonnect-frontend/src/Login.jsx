import React from "react";

const LoginPage = ({ email, password, setEmail, setPassword, onLogin }) => {
  return (
    <div className="login-page">
      <h2>Login</h2>

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

      <button onClick={onLogin}>Login</button>
    </div>
  );
};

export default LoginPage;

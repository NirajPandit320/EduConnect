import { useState } from "react";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    isLogin ? (
      <Login switchToSignup={() => setIsLogin(false)} />
    ) : (
      <Signup switchToLogin={() => setIsLogin(true)} />
    )
  );
};

export default AuthPage;